# Bhoomi Rakshak — Final SIH Demo Build

This build removes the old synthetic Logistic Regression model from production inference and fixes the frontend/backend data architecture so live backend data is the single source of truth for monitored locations.

## Production data flow

```text
Government OGD / NWIC daily district rainfall  ──┐
                                                  ├─> Live Risk Engine ─> GIS / dashboard
Open-Meteo soil moisture + weather fallback      ──┘
                         │
                         └─> SQLite observation history + citizen reports
```

The production risk engine is a transparent **live risk index**, not a fake calibrated probability. It uses current rainfall, soil saturation and a modest state-level historical landslide-exposure prior. The historical prior is based on the published NRSC/ISRO inventory counts and is not used as a district-level event label.

The original synthetic model is intentionally excluded from this release. `backend/experimental/README.md` documents why it was removed from production.

## Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Put your data.gov.in API key in backend/.env
python3 run.py
```

Backend: http://localhost:8000
Swagger: http://localhost:8000/docs

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

Optional `frontend/.env`:
`VITE_API_BASE_URL=http://localhost:8000`

## Data-source behavior

- **OGD/NWIC Daily District-wise Rainfall:** preferred rainfall input when a recent record is available.
- **Open-Meteo:** soil moisture (0–7 cm), temperature and humidity, plus rainfall fallback.
- **SQLite:** every live observation and citizen ground report is persisted locally for audit/history.
- **IMD:** can be added as an independent official-warning/nowcast layer once API access is configured; IMD warnings must remain separate from the Bhoomi Rakshak risk score.

## Scientific boundary

A genuine predictive ML model still requires a real event-labelled landslide inventory with occurrence dates/locations joined to historical rainfall, soil, terrain/geology and other predictors. The package includes the integration point for that future model rather than presenting the synthetic prototype as real-world accuracy.

## Coverage

The map contains 133 Northeast district-headquarter display points plus five extended-region reference locations covering the Western/Eastern Himalayas and Western/Eastern Ghats. These are monitoring/display coordinates, not polygon boundaries or claims of scientific validation for every location.


## GitHub safety
- No API keys or `.env` files are included. Copy `backend/.env.example` to `backend/.env` locally and add your own OGD key.
- Runtime SQLite databases, Python caches, build output, virtual environments and dependency directories are ignored by Git.
- The old synthetic landslide model is not included in this release and is not used by production inference.
- Production risk is an explainable live-data index, not a calibrated probability.
- Coordinates are district-headquarter display points/reference points; they are not exact landslide polygons.


## Troubleshooting live data

If the dashboard stays on “Loading live risk watchlist”, make sure the FastAPI backend is running on port 8000. The live-data pipeline is intentionally fail-fast: unreachable upstream feeds are reported as unavailable rather than being converted into fake zero-risk values. The map can still show monitored district display points while live environmental data reconnects.


### Live-data demo behavior

For reliable demonstrations, the live weather/soil pipeline attempts eight priority Northeast points (one per state) first. Other configured locations remain visible but are explicitly marked unavailable when no live observation is available; no dummy risk values are presented as live data.
