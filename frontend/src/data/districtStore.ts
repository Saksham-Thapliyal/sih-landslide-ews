import { DistrictTelemetry } from '../types';
import { DISTRICT_REGISTRY } from './districtRegistry';

export const DISTRICTS_DATA: Record<string, DistrictTelemetry> = Object.fromEntries(
  DISTRICT_REGISTRY.map((d) => [d.id, {
    id: d.id,
    name: d.name,
    state: d.state,
    zone: d.region,
    riskScore: 0,
    riskLevel: 'low',
    population: 'Live data not loaded',
    headquarters: d.name,
    keyInfrastructure: 'Live infrastructure layer not configured',
    monitoredSlopes: { high: 0, med: 0, total: 0 },
    hotline: 'Verify with local authorities',
    lastUpdated: 'Awaiting live feed',
    coordinates: { lat: d.lat, lng: d.lng },
    conditions: {
      rainfall24h: 0, rainfall24hTrend: 'LIVE', rainfall24hStatus: 'Awaiting government rainfall',
      rainfall7d: 0, rainfall7dTrend: '—', rainfall7dStatus: 'Not configured',
      soilMoisture: 0, soilMoistureTrend: 'LIVE', soilMoistureStatus: 'Awaiting live soil moisture',
      avgSlope: 0, avgSlopeStatus: 'Not configured', temperature: 0, dewPoint: 0,
      landCover: 'Not configured', landCoverCohesion: 'Not configured', porePressure: 0,
    },
    factors: { rainfall24h: 0, soilMoisture: 0, slope: 0, historicalEvents: 0, landCover: 0 },
    aiAlert: { confidence: 0, message: 'Waiting for live environmental data.', criticalCorridor: 'Not configured' },
    topographyNotes: 'Static terrain layers can be added from official geospatial sources.',
    activeScarpObserved: 'No field observation recorded.',
  }])
);
