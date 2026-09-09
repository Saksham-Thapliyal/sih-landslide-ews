from __future__ import annotations

import json
import os
import sqlite3
import time
import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .risk_engine import assess_live_risk

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

DB_PATH = Path(os.getenv("DB_PATH", str(BASE_DIR / "bhoomi_rakshak.db")))
if not DB_PATH.is_absolute():
    DB_PATH = BASE_DIR / DB_PATH

DATA_GOV_BASE = "https://api.data.gov.in/resource"
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "").strip()
DATA_GOV_RESOURCE_ID = os.getenv("DATA_GOV_RESOURCE_ID", "6c05cd1b-ed59-40c2-bc31-e314f39c6971").strip()
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "300"))
GOV_STALE_AFTER_HOURS = float(os.getenv("GOV_STALE_AFTER_HOURS", "72"))
HTTP_TIMEOUT_SECONDS = float(os.getenv("HTTP_TIMEOUT_SECONDS", "6"))
RISK_ENGINE_VERSION = os.getenv("RISK_ENGINE_VERSION", "hybrid-live-risk-index-v1")

# The Northeast registry is deliberately data-driven instead of hardcoding six map points.
# Coordinates are district-headquarter display points, not polygon centroids.
REGISTRY_PATH = BASE_DIR / "app" / "data" / "northeast_districts.json"
REGISTRY = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
NORTHEAST_STATES = set(REGISTRY["states"])

# Keep the original non-Northeast demonstration locations available through the API.
EXTENDED_INDIA = [
    {"id": "chamoli", "name": "Chamoli", "state": "Uttarakhand", "lat": 30.4124, "lng": 79.3242, "region": "Western Himalayas", "coordinate_type": "district_hq_approx"},
    {"id": "shimla", "name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lng": 77.1734, "region": "Western Himalayas", "coordinate_type": "district_hq_approx"},
    {"id": "darjeeling", "name": "Darjeeling", "state": "West Bengal", "lat": 27.0410, "lng": 88.2663, "region": "Eastern Himalayas", "coordinate_type": "district_hq_approx"},
    {"id": "wayanad", "name": "Wayanad", "state": "Kerala", "lat": 11.6854, "lng": 76.1320, "region": "Western Ghats", "coordinate_type": "district_hq_approx"},
    {"id": "araku-valley", "name": "Araku Valley", "state": "Andhra Pradesh", "lat": 18.3274, "lng": 82.8794, "region": "Eastern Ghats", "coordinate_type": "regional_reference_point"},
]
DISTRICTS: list[dict[str, Any]] = REGISTRY["districts"] + EXTENDED_INDIA
DISTRICT_BY_ID = {d["id"]: d for d in DISTRICTS}
DISTRICT_ALIASES = {
    "East Khasi Hills": ["East Khasi Hills"],
    "Papum Pare": ["Papum Pare", "Papumpare"],
    "Karimganj": ["Karimganj", "Sribhumi"],
    "Dima Hasao": ["Dima Hasao", "North Cachar Hills"],
}

# Small live subset for demos and degraded networks. These points cover all
# eight Northeast states. The remaining registry locations stay visible but are
# explicitly marked unavailable until their live feed is collected.
PRIORITY_LIVE_IDS = [
    "papum-pare",
    "kamrup-metropolitan-assam",
    "imphal-west-manipur",
    "east-khasi-hills",
    "aizawl-mizoram",
    "kohima-nagaland",
    "gangtok-sikkim",
    "west-tripura-tripura",
]

app = FastAPI(title="Bhoomi Rakshak API", version="4.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache: dict[str, tuple[float, Any]] = {}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def cache_get(key: str):
    item = _cache.get(key)
    if not item:
        return None
    ts, value = item
    if time.time() - ts > CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return value


def cache_set(key: str, value: Any):
    _cache[key] = (time.time(), value)
    return value


def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=20)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=20000")
    conn.execute("""CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        district_id TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        rainfall_24h_mm REAL,
        soil_moisture_vol_frac REAL,
        temperature_c REAL,
        dew_point_c REAL,
        humidity_pct REAL,
        rainfall_source TEXT NOT NULL,
        soil_moisture_source TEXT NOT NULL,
        risk_score REAL,
        risk TEXT,
        status TEXT NOT NULL,
        raw_sources TEXT,
        source_observed_at TEXT,
        model_version TEXT,
        data_quality TEXT
    )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS ground_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        district TEXT NOT NULL,
        location TEXT NOT NULL,
        hazard_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        notes TEXT,
        reporter_name TEXT,
        reporter_phone TEXT,
        latitude REAL,
        longitude REAL,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'reviewing'
    )""")
    # Lightweight migration for databases created by v3.
    existing = {row[1] for row in conn.execute("PRAGMA table_info(observations)").fetchall()}
    for col, definition in {
        "source_observed_at": "TEXT",
        "model_version": "TEXT",
        "data_quality": "TEXT",
    }.items():
        if col not in existing:
            conn.execute(f"ALTER TABLE observations ADD COLUMN {col} {definition}")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_district_time ON observations(district_id, observed_at DESC)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_observations_risk_time ON observations(risk, observed_at DESC)")
    conn.commit()
    return conn


class PredictRequest(BaseModel):
    rainfall_24h_mm: float = Field(ge=0)
    soil_moisture_vol_frac: float = Field(ge=0, le=1)


class GroundReportIn(BaseModel):
    district: str
    location: str
    hazard_type: str
    severity: str
    notes: str | None = None
    reporter_name: str | None = None
    reporter_phone: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    image_url: str | None = None


def predict_values(rainfall: float, soil: float, state: str = "", region: str = "") -> tuple[float, str, dict[str, Any]]:
    assessment = assess_live_risk(
        rainfall_mm=rainfall,
        soil_moisture=soil,
        state=state,
        region=region,
    )
    score = assessment.get("score")
    return (float(score) if score is not None else None, assessment.get("risk"), assessment)


def normalize_number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except Exception:
        return None


def parse_dt(value: Any) -> datetime | None:
    if value is None:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        pass
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
        except Exception:
            continue
    return None


async def fetch_json(client: httpx.AsyncClient, url: str, *, params: dict[str, Any] | None = None, retries: int = 0) -> dict[str, Any] | list[Any]:
    last_error: Exception | None = None
    for attempt in range(retries + 1):
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except (httpx.HTTPError, ValueError) as exc:
            last_error = exc
            if attempt < retries:
                await __import__("asyncio").sleep(0.4 * (2 ** attempt))
    raise last_error or RuntimeError("Request failed")


async def fetch_open_meteo(d: dict, client: httpx.AsyncClient) -> dict:
    cached = cache_get(f"weather:{d['id']}")
    if cached:
        return cached
    params = {
        "latitude": d["lat"], "longitude": d["lng"],
        "hourly": "precipitation,soil_moisture_0_to_7cm,temperature_2m,dew_point_2m,relative_humidity_2m",
        "past_days": 2, "forecast_days": 1, "timezone": "UTC",
    }
    payload = await fetch_json(client, OPEN_METEO_URL, params=params, retries=0)
    return cache_set(f"weather:{d['id']}", parse_open_meteo_payload(payload))


def parse_open_meteo_payload(payload: dict[str, Any]) -> dict[str, Any]:
    hourly = payload.get("hourly", {})
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])
    soil = hourly.get("soil_moisture_0_to_7cm", [])
    temp = hourly.get("temperature_2m", [])
    dew = hourly.get("dew_point_2m", [])
    hum = hourly.get("relative_humidity_2m", [])
    current_time = now_utc()
    cutoff = current_time - timedelta(hours=24)
    recent_indices: list[int] = []
    source_times: list[datetime] = []
    for i, t in enumerate(times):
        dt = parse_dt(t)
        if dt and cutoff <= dt <= current_time:
            recent_indices.append(i)
            source_times.append(dt)
    if not recent_indices:
        recent_indices = list(range(max(0, len(times) - 24), len(times)))
    last_i = recent_indices[-1] if recent_indices else max(0, len(soil) - 1)
    rainfall = sum(float(precip[i] or 0) for i in recent_indices if i < len(precip))
    return {
        "rainfall_24h_mm": round(rainfall, 1),
        "soil_moisture_vol_frac": round(float(soil[last_i]), 3) if last_i < len(soil) and soil[last_i] is not None else None,
        "temperature_c": round(float(temp[last_i]), 1) if last_i < len(temp) and temp[last_i] is not None else None,
        "dew_point_c": round(float(dew[last_i]), 1) if last_i < len(dew) and dew[last_i] is not None else None,
        "humidity_pct": round(float(hum[last_i]), 1) if last_i < len(hum) and hum[last_i] is not None else None,
        "source": "Open-Meteo weather model",
        "observed_at": source_times[-1].isoformat() if source_times else current_time.isoformat(),
    }


async def fetch_open_meteo_batch(districts: list[dict], client: httpx.AsyncClient) -> dict[str, dict[str, Any]]:
    """Fetch many district weather/soil observations in one Open-Meteo request.

    Open-Meteo supports comma-separated multiple coordinates and returns one
    response structure per coordinate, which makes the Northeast-wide map much
    cheaper and faster than 100+ individual requests.
    """
    uncached = [d for d in districts if not cache_get(f"weather:{d['id']}")]
    result: dict[str, dict[str, Any]] = {}
    for d in districts:
        cached = cache_get(f"weather:{d['id']}")
        if cached:
            result[d["id"]] = cached
    if not uncached:
        return result
    # Keep URL length reasonable; 50 coordinates per batch is ample for this registry.
    batches = [uncached[i:i + 50] for i in range(0, len(uncached), 50)]

    async def fetch_batch(batch: list[dict]) -> None:
        params = {
            "latitude": ",".join(str(d["lat"]) for d in batch),
            "longitude": ",".join(str(d["lng"]) for d in batch),
            "hourly": "precipitation,soil_moisture_0_to_7cm,temperature_2m,dew_point_2m,relative_humidity_2m",
            "past_days": 2, "forecast_days": 1, "timezone": "UTC",
        }
        try:
            payload = await fetch_json(client, OPEN_METEO_URL, params=params)
            payloads = payload if isinstance(payload, list) else [payload]
            if len(payloads) != len(batch):
                raise RuntimeError(f"Open-Meteo returned {len(payloads)} locations for {len(batch)} requested")
            for d, item in zip(batch, payloads):
                try:
                    result[d["id"]] = cache_set(f"weather:{d['id']}", parse_open_meteo_payload(item))
                except Exception:
                    pass
            return
        except Exception:
            # Some networks/proxies reject large multi-coordinate requests.
            # Fall back to individual requests so one batch failure does not
            # make the entire map appear empty.
            pass

        async def fetch_one(d: dict) -> None:
            try:
                result[d["id"]] = await fetch_open_meteo(d, client)
            except Exception:
                return

        await asyncio.gather(*(fetch_one(d) for d in batch))

    await asyncio.gather(*(fetch_batch(batch) for batch in batches))
    return result


async def fetch_gov_rainfall(d: dict, client: httpx.AsyncClient) -> dict | None:
    """Fetch the newest daily district record for a single district.

    The map uses the state-level batch cache below to avoid one API request per
    district. This endpoint is kept for district-detail fallbacks.
    """
    if not DATA_GOV_API_KEY or not DATA_GOV_RESOURCE_ID:
        return None
    key = f"gov:{d['id']}"
    cached = cache_get(key)
    if cached:
        return cached
    for district_name in DISTRICT_ALIASES.get(d["name"], [d["name"]]):
        params = {
            "api-key": DATA_GOV_API_KEY, "format": "json", "limit": 100,
            "filters[State]": d["state"], "filters[District]": district_name,
        }
        try:
            payload = await fetch_json(client, f"{DATA_GOV_BASE}/{DATA_GOV_RESOURCE_ID}", params=params, retries=0)
            records = payload.get("records") or [] if isinstance(payload, dict) else []
            parsed = []
            for rec in records:
                value = normalize_number(rec.get("Avg_rainfall")); dt = parse_dt(rec.get("Date"))
                if value is not None and dt: parsed.append((dt, value, rec))
            if parsed:
                dt, value, rec = max(parsed, key=lambda x: x[0])
                result = {"rainfall_mm": round(value,1), "date": dt.isoformat(), "age_hours": round((now_utc()-dt).total_seconds()/3600,1), "source":"Government of India OGD / NWIC Daily District-wise Rainfall", "record":rec}
                return cache_set(key, result)
        except Exception:
            continue
    return None


async def fetch_gov_rainfall_by_state(state: str, client: httpx.AsyncClient) -> dict[str, dict]:
    """Fetch one recent daily OGD batch for a state and index it by district."""
    if not DATA_GOV_API_KEY or not DATA_GOV_RESOURCE_ID:
        return {}
    key = f"gov-state:{state}"
    cached = cache_get(key)
    if cached is not None:
        return cached

    # Try the current date and previous two dates because the OGD daily feed can
    # lag by a reporting day. The data itself remains the source of truth.
    base_date = now_utc().date()
    records: list[dict[str, Any]] = []
    for days_back in range(0, 4):
        date_text = (base_date - timedelta(days=days_back)).isoformat()
        params = {
            "api-key": DATA_GOV_API_KEY, "format": "json", "limit": 5000,
            "filters[State]": state, "filters[Date]": date_text,
        }
        try:
            payload = await fetch_json(client, f"{DATA_GOV_BASE}/{DATA_GOV_RESOURCE_ID}", params=params, retries=0)
            batch = payload.get("records") or [] if isinstance(payload, dict) else []
            if batch:
                records.extend(batch)
                break
        except Exception:
            continue

    indexed: dict[str, dict] = {}
    for rec in records:
        district = str(rec.get("District") or "").strip()
        value = normalize_number(rec.get("Avg_rainfall")); dt = parse_dt(rec.get("Date"))
        if not district or value is None or not dt:
            continue
        result = {"rainfall_mm": round(value,1), "date": dt.isoformat(), "age_hours": round((now_utc()-dt).total_seconds()/3600,1), "source":"Government of India OGD / NWIC Daily District-wise Rainfall", "record":rec}
        for alias, names in DISTRICT_ALIASES.items():
            if district in names:
                indexed[alias.lower()] = result
        indexed[district.lower()] = result
    return cache_set(key, indexed)


async def fetch_gov_rainfall_batch(districts: list[dict], client: httpx.AsyncClient) -> dict[str, dict]:
    by_state: dict[str, list[dict]] = {}
    for d in districts: by_state.setdefault(d["state"], []).append(d)
    results: dict[str, dict] = {}
    state_results = await asyncio.gather(*(fetch_gov_rainfall_by_state(state, client) for state in by_state), return_exceptions=True)
    for state, data in zip(by_state, state_results):
        if isinstance(data, Exception): continue
        for d in by_state[state]:
            for alias in DISTRICT_ALIASES.get(d["name"], [d["name"]]):
                hit = data.get(alias.lower())
                if hit:
                    results[d["id"]] = hit; break
    return results


async def get_environment(d: dict, client: httpx.AsyncClient, *, include_government: bool = True, weather_override: dict | None = None) -> dict:
    weather = weather_override or await fetch_open_meteo(d, client)
    gov = env_gov = (weather_override or {}).get("government_rainfall") if weather_override else None
    if gov is None and include_government:
        gov = await fetch_gov_rainfall(d, client)
    # Government OGD daily district rainfall is the preferred rainfall source.
    # Open-Meteo remains the fallback because it also supplies soil moisture.
    rainfall = gov["rainfall_mm"] if gov and gov.get("age_hours", 9999) <= GOV_STALE_AFTER_HOURS else weather.get("rainfall_24h_mm")
    rainfall_source = "Government of India OGD / NWIC Daily District-wise Rainfall" if gov and gov.get("age_hours", 9999) <= GOV_STALE_AFTER_HOURS else weather.get("source", "Open-Meteo") + " (fallback)"
    status = "LIVE" if weather.get("soil_moisture_vol_frac") is not None and rainfall is not None else "PARTIAL_DATA"
    if gov is None and DATA_GOV_API_KEY:
        status = "LIVE_WITH_WEATHER_FALLBACK" if weather.get("soil_moisture_vol_frac") is not None else "PARTIAL_DATA"
    return {
        **weather,
        "rainfall_24h_mm": rainfall,
        "rainfall_source": rainfall_source,
        "government_rainfall": gov,
        "status": status,
        "data_quality": "GOOD" if weather.get("soil_moisture_vol_frac") is not None and rainfall is not None else "PARTIAL",
    }


def make_point(d: dict, env: dict) -> dict:
    soil = env.get("soil_moisture_vol_frac")
    rainfall = env.get("rainfall_24h_mm")
    score = risk = None
    assessment: dict[str, Any] = {}
    if rainfall is not None and soil is not None:
        score, risk, assessment = predict_values(float(rainfall), float(soil), d.get("state", ""), d.get("region", ""))
    observed = now_utc().isoformat()
    return {
        **d,
        "risk": risk,
        "risk_color": {"HIGH": "#ef4444", "MEDIUM": "#f59e0b", "LOW": "#22c55e"}.get(risk, "#64748b"),
        "risk_score": score,
        "rainfall_24h_mm": rainfall,
        "soil_moisture_vol_frac": soil,
        "temperature_c": env.get("temperature_c"),
        "dew_point_c": env.get("dew_point_c"),
        "humidity_pct": env.get("humidity_pct"),
        "rainfall_source": env.get("rainfall_source"),
        "soil_moisture_source": "Open-Meteo soil moisture (0-7 cm)",
        "source_observed_at": env.get("observed_at"),
        "status": env["status"],
        "data_quality": env.get("data_quality", "UNKNOWN"),
        "government_rainfall": env.get("government_rainfall"),
        "risk_engine": assessment.get("engine", RISK_ENGINE_VERSION),
        "risk_engine_type": assessment.get("engine_type", "deterministic_live_index"),
        "risk_components": assessment.get("components", {}),
        "historical_exposure_note": assessment.get("historical_exposure_note"),
        "risk_note": assessment.get("note", "Live environmental assessment."),
        "model": "hybrid live risk index",
        "model_version": RISK_ENGINE_VERSION,
        "model_features": ["daily_district_rainfall_mm", "soil_moisture_0_7cm", "state_inventory_exposure_prior"],
        "model_training_scope": "No synthetic training labels used in live inference",
        "model_data_note": "Current production risk is a transparent live-data index. A calibrated event-labelled ML model requires ingestion of a real landslide inventory with occurrence dates/locations.",
        "updated_at": observed,
    }


def store_observations(points: list[dict]) -> None:
    rows = []
    for p in points:
        rows.append((
            p["id"], p.get("updated_at") or now_utc().isoformat(), p.get("rainfall_24h_mm"), p.get("soil_moisture_vol_frac"),
            p.get("temperature_c"), p.get("dew_point_c"), p.get("humidity_pct"),
            p.get("rainfall_source") or "unknown", p.get("soil_moisture_source") or "unknown",
            p.get("risk_score"), p.get("risk"), p.get("status") or "UNKNOWN",
            json.dumps({"government": p.get("government_rainfall")}, default=str),
            p.get("source_observed_at"), p.get("model_version"), p.get("data_quality"),
        ))
    if not rows:
        return
    conn = db()
    conn.executemany("""INSERT INTO observations(
        district_id,observed_at,rainfall_24h_mm,soil_moisture_vol_frac,temperature_c,dew_point_c,
        humidity_pct,rainfall_source,soil_moisture_source,risk_score,risk,status,raw_sources,
        source_observed_at,model_version,data_quality
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", rows)
    conn.commit()
    conn.close()


async def build_point(d: dict, client: httpx.AsyncClient, *, include_government: bool = True, weather_override: dict | None = None) -> dict:
    env = await get_environment(d, client, include_government=include_government, weather_override=weather_override)
    point = make_point(d, env)
    store_observations([point])
    return point


def select_districts(region: str, state: str | None = None) -> list[dict]:
    region_norm = region.lower()
    if region_norm in {"northeast", "ner", "north-east"}:
        items = [d for d in DISTRICTS if d["state"] in NORTHEAST_STATES]
    elif region_norm in {"india", "all"}:
        items = DISTRICTS
    elif region_norm in {"extended", "extended-india"}:
        items = [d for d in DISTRICTS if d["region"] != "Northeast India"]
    elif region_norm in {"himalayas", "western-himalayas"}:
        items = [d for d in DISTRICTS if d["region"] in {"Western Himalayas", "Eastern Himalayas"}]
    elif region_norm in {"westernghats", "western-ghats"}:
        items = [d for d in DISTRICTS if d["region"] == "Western Ghats"]
    elif region_norm in {"easternghats", "eastern-ghats"}:
        items = [d for d in DISTRICTS if d["region"] == "Eastern Ghats"]
    elif region_norm in {"easternhimalayas", "eastern-himalayas"}:
        items = [d for d in DISTRICTS if d["region"] == "Eastern Himalayas"]
    else:
        items = [d for d in DISTRICTS if d["region"].lower() == region_norm]
    if state:
        items = [d for d in items if d["state"].lower() == state.lower()]
    return items


@app.get("/api/health")
async def health():
    return {
        "status": "ok", "model_loaded": False, "model_version": RISK_ENGINE_VERSION,
        "database": str(DB_PATH), "districts_total": len(DISTRICTS),
        "northeast_districts": sum(1 for d in DISTRICTS if d["state"] in NORTHEAST_STATES),
        "time": now_utc().isoformat(),
    }


@app.get("/api/data-sources")
async def data_sources():
    return {
        "government_rainfall": {
            "configured": bool(DATA_GOV_API_KEY and DATA_GOV_RESOURCE_ID),
            "provider": "data.gov.in", "resource_id": DATA_GOV_RESOURCE_ID if DATA_GOV_API_KEY else None,
            "preferred": "Government of India OGD / NWIC Daily District-wise Rainfall",
            "stale_after_hours": GOV_STALE_AFTER_HOURS,
            "note": "Daily district rainfall is the primary rainfall input when a recent OGD record is available; the map batches by state. Open-Meteo is retained for soil moisture and fallback weather data.",
        },
        "weather_live": {"configured": True, "provider": "Open-Meteo", "purpose": "soil moisture, temperature, humidity and rainfall fallback"},
        "risk_engine": {"version": RISK_ENGINE_VERSION, "type": "deterministic live risk index", "synthetic_training_labels": False, "note": "No synthetic training labels are used in production inference."},
        "historical_inventory": {"provider": "NRSC/ISRO Landslide Atlas", "period": "1998-2022", "purpose": "coarse state-level historical exposure prior; not a district-level event label"},
        "map": {"provider": "Esri basemap tiles in frontend", "coordinates": "district-headquarter display points", "coverage": "133 configured Northeast monitoring points + 5 extended-region reference locations"},
        "database": {"provider": "SQLite", "path": str(DB_PATH)},
    }


@app.get("/api/districts")
async def districts(region: str = Query("northeast"), state: str | None = None):
    items = select_districts(region, state)
    return {"region": region, "state": state, "districts": items, "count": len(items)}


@app.get("/api/map/risk")
async def map_risk(region: str = Query("northeast"), state: str | None = None):
    cache_key = f"map:risk:{region.lower()}:{(state or '').lower()}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    districts = select_districts(region, state)
    if not districts:
        raise HTTPException(404, "No districts found for the requested region/state")

    # Reliability-first demo strategy: collect live environmental data for a
    # small Northeast subset, then return every requested district with an
    # explicit UNAVAILABLE status when no live observation was obtained.
    district_by_id = {d["id"]: d for d in districts}
    targets = [district_by_id[i] for i in PRIORITY_LIVE_IDS if i in district_by_id]
    if not targets:
        targets = districts[:1]

    points: list[dict] = []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        weather_results = await asyncio.gather(
            *(fetch_open_meteo(d, client) for d in targets),
            return_exceptions=True,
        )
        weather_map: dict[str, dict[str, Any]] = {}
        for d, result in zip(targets, weather_results):
            if not isinstance(result, Exception):
                weather_map[d["id"]] = result

        for d in districts:
            weather = weather_map.get(d["id"])
            if weather:
                try:
                    env = await get_environment(d, client, include_government=False, weather_override=weather)
                    points.append(make_point(d, env))
                except Exception as exc:
                    points.append({**d, "risk": None, "risk_score": None, "status": "DATA_ERROR", "data_quality": "UNAVAILABLE", "error": str(exc), "risk_color": "#64748b", "updated_at": now_utc().isoformat(), "rainfall_source": "Unavailable", "soil_moisture_source": "Unavailable"})
            else:
                points.append({**d, "risk": None, "risk_score": None, "status": "UNAVAILABLE", "data_quality": "UNAVAILABLE", "risk_color": "#64748b", "updated_at": now_utc().isoformat(), "rainfall_source": "Unavailable", "soil_moisture_source": "Unavailable"})

    store_observations(points)
    result = {
        "points": points,
        "count": len(points),
        "live_count": sum(1 for p in points if p.get("status") in {"LIVE", "LIVE_WITH_STALE_GOV_REFERENCE", "LIVE_WITH_WEATHER_FALLBACK"}),
        "high_count": sum(1 for p in points if p.get("risk") == "HIGH"),
        "medium_count": sum(1 for p in points if p.get("risk") == "MEDIUM"),
        "low_count": sum(1 for p in points if p.get("risk") == "LOW"),
        "updated_at": now_utc().isoformat(),
        "region": region,
        "state": state,
        "sources": {"live_weather": "Open-Meteo", "soil_moisture": "Open-Meteo volumetric m³/m³", "government_reference": "data.gov.in / NWIC when configured", "map": "Esri World Street Map / World Imagery"},
        "coverage_note": f"Live environmental data attempted for {len(targets)} priority monitoring points; other locations remain explicitly unavailable until live data is collected.",
    }
    return cache_set(cache_key, result)

@app.get("/api/hotspots")
async def hotspots(limit: int = Query(10, ge=1, le=50), state: str | None = None):
    data = await map_risk(region="northeast", state=state)
    points = [p for p in data["points"] if p.get("risk_score") is not None]
    points.sort(key=lambda p: p["risk_score"], reverse=True)
    return {"hotspots": points[:limit], "count": len(points), "generated_at": now_utc().isoformat()}


@app.get("/api/region/northeast/summary")
async def northeast_summary():
    data = await map_risk(region="northeast")
    by_state: dict[str, dict[str, Any]] = {}
    for p in data["points"]:
        bucket = by_state.setdefault(p["state"], {"state": p["state"], "count": 0, "high": 0, "medium": 0, "low": 0, "average_risk_score": None})
        bucket["count"] += 1
        if p.get("risk") == "HIGH": bucket["high"] += 1
        elif p.get("risk") == "MEDIUM": bucket["medium"] += 1
        elif p.get("risk") == "LOW": bucket["low"] += 1
    for bucket in by_state.values():
        vals = [p["risk_score"] for p in data["points"] if p["state"] == bucket["state"] and p.get("risk_score") is not None]
        bucket["average_risk_score"] = round(sum(vals) / len(vals), 4) if vals else None
    return {"region": "Northeast India", "states": list(by_state.values()), "total_districts": data["count"], "high": data["high_count"], "medium": data["medium_count"], "low": data["low_count"], "updated_at": data["updated_at"]}


@app.get("/api/district/{district_id}")
async def district_detail(district_id: str):
    d = DISTRICT_BY_ID.get(district_id)
    if not d:
        raise HTTPException(404, "Unknown district")
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
        return await build_point(d, client, include_government=True)


@app.get("/api/district/{district_id}/timeseries")
async def district_timeseries(district_id: str, hours: int = Query(24, ge=1, le=168)):
    if district_id not in DISTRICT_BY_ID:
        raise HTTPException(404, "Unknown district")
    conn = db()
    rows = conn.execute(
        "SELECT observed_at,rainfall_24h_mm,soil_moisture_vol_frac,risk_score,risk,status,data_quality FROM observations WHERE district_id=? ORDER BY observed_at DESC LIMIT ?",
        (district_id, hours),
    ).fetchall()
    conn.close()
    rows = list(reversed(rows))
    return {"district_id": district_id, "points": [dict(r) for r in rows], "count": len(rows)}


@app.post("/api/predict")
async def predict(req: PredictRequest):
    score, risk, assessment = predict_values(req.rainfall_24h_mm, req.soil_moisture_vol_frac)
    return {
        "rainfall_24h_mm": req.rainfall_24h_mm,
        "soil_moisture_vol_frac": req.soil_moisture_vol_frac,
        "risk_score": round(score, 4) if score is not None else None,
        "risk_level": risk,
        "risk_engine": RISK_ENGINE_VERSION,
        "risk_engine_type": "deterministic_live_index",
        "components": assessment.get("components", {}),
        "note": assessment.get("note"),
    }


@app.get("/api/reports")
async def reports():
    conn = db(); rows = conn.execute("SELECT * FROM ground_reports ORDER BY id DESC LIMIT 100").fetchall(); conn.close()
    return {"reports": [dict(r) for r in rows]}


@app.post("/api/reports")
async def create_report(report: GroundReportIn):
    conn = db()
    cur = conn.execute(
        "INSERT INTO ground_reports(created_at,district,location,hazard_type,severity,notes,reporter_name,reporter_phone,latitude,longitude,image_url) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (now_utc().isoformat(), report.district, report.location, report.hazard_type, report.severity, report.notes, report.reporter_name, report.reporter_phone, report.latitude, report.longitude, report.image_url),
    )
    conn.commit(); rid = cur.lastrowid; conn.close()
    return {"id": f"rep-{rid}", "status": "reviewing", "message": "Ground report stored in Bhoomi Rakshak database."}


@app.post("/api/refresh")
async def refresh(region: str = Query("northeast"), state: str | None = None):
    _cache.clear()
    return await map_risk(region=region, state=state)


# Initialize DB on import.
db().close()
