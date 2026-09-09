export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const REQUEST_TIMEOUT_MS = 12000;

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export type RiskPoint = {
  id: string; name: string; state: string; lat: number; lng: number;
  risk: 'LOW'|'MEDIUM'|'HIGH'|null; risk_color?: string; risk_score?: number|null; risk_components?: {rainfall_trigger?: number|null; soil_saturation?: number|null; historical_exposure_prior?: number|null}; risk_note?: string; historical_exposure_note?: string;
  rainfall_24h_mm?: number|null; soil_moisture_vol_frac?: number|null;
  temperature_c?: number|null; dew_point_c?: number|null; humidity_pct?: number|null;
  rainfall_source?: string; soil_moisture_source?: string; status: string;
  government_rainfall?: { rainfall_mm:number; date:string; age_hours:number; source:string }|null;
  updated_at?: string;
  source_observed_at?: string;
  data_quality?: string;
  model_version?: string;
  region?: string;
  coordinate_type?: string;
};

export type RiskResponse = { points: RiskPoint[]; count:number; live_count:number; high_count?:number; medium_count?:number; low_count?:number; updated_at:string; region?:string; state?:string|null; sources:Record<string,string> };

export async function getRiskMap(region='all', state=''): Promise<RiskResponse> {
  const params = new URLSearchParams({ region });
  if (state) params.set('state', state);
  const r = await fetchWithTimeout(`${API_BASE}/api/map/risk?${params.toString()}`, { cache:'no-store' });
  if (!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json();
}

export async function getDistrictRisk(id:string): Promise<RiskPoint> {
  const r=await fetchWithTimeout(`${API_BASE}/api/district/${encodeURIComponent(id)}`, {cache:'no-store'});
  if(!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json();
}

export async function getTimeseries(id:string, hours=24) {
  const r=await fetchWithTimeout(`${API_BASE}/api/district/${encodeURIComponent(id)}/timeseries?hours=${hours}`, {cache:'no-store'});
  if(!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json();
}

export async function submitGroundReport(payload:Record<string,unknown>) {
  const r=await fetchWithTimeout(`${API_BASE}/api/reports`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json();
}

export async function getHotspots(limit=10) {
  const r=await fetchWithTimeout(`${API_BASE}/api/hotspots?limit=${limit}`, {cache:'no-store'});
  if(!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json() as Promise<{hotspots: RiskPoint[]; count:number; generated_at:string}>;
}

export async function getReports() {
  const r=await fetchWithTimeout(`${API_BASE}/api/reports`, {cache:"no-store"});
  if(!r.ok) throw new Error(`Backend returned ${r.status}`);
  return r.json() as Promise<{reports: any[]}>;
}
