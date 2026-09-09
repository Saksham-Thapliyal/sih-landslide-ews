import { DISTRICTS_DATA } from '../data/districtStore';
import type { RiskPoint } from './api';

export function applyLiveRiskPoints(points: RiskPoint[]) {
  for (const point of points) {
    const existing = DISTRICTS_DATA[point.id];
    if (!existing) continue;

    // Never turn missing live data into a fake 0% / LOW assessment.
    if (point.risk_score == null || !point.risk) continue;
    const riskScore = point.risk_score;
    const riskLevel = point.risk === 'HIGH' ? 'critical' : point.risk === 'MEDIUM' ? 'moderate' : 'low';

    existing.name = point.name;
    existing.state = point.state;
    existing.zone = point.region || existing.zone;
    existing.coordinates = { lat: point.lat, lng: point.lng };
    existing.riskScore = riskScore;
    existing.riskLevel = riskLevel;
    existing.lastUpdated = point.updated_at ? new Date(point.updated_at).toLocaleString() : 'Live feed';

    if (point.rainfall_24h_mm != null) {
      existing.conditions.rainfall24h = point.rainfall_24h_mm;
      existing.conditions.rainfall24hTrend = 'LIVE';
      existing.conditions.rainfall24hStatus = point.rainfall_source || 'Government rainfall';
    }
    if (point.soil_moisture_vol_frac != null) {
      existing.conditions.soilMoisture = point.soil_moisture_vol_frac * 100;
      existing.conditions.soilMoistureTrend = 'LIVE';
      existing.conditions.soilMoistureStatus = point.soil_moisture_source || 'Live soil moisture';
    }
    if (point.temperature_c != null) existing.conditions.temperature = point.temperature_c;
    if (point.dew_point_c != null) existing.conditions.dewPoint = point.dew_point_c;

    existing.aiAlert = {
      ...existing.aiAlert,
      confidence: riskScore * 100,
      message: point.risk
        ? `Live risk assessment: ${point.risk} based on ${point.rainfall_24h_mm?.toFixed(1) ?? 'N/A'} mm daily rainfall and ${point.soil_moisture_vol_frac?.toFixed(3) ?? 'N/A'} volumetric soil moisture.`
        : 'Live environmental data is incomplete; no current risk classification is available.',
    };
  }
}
