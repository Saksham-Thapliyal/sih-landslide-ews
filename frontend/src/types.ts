export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface DistrictTelemetry {
  id: string;
  name: string;
  state: string;
  zone: string;
  riskScore: number; // 0.00 to 1.00 live risk index
  riskLevel: SeverityLevel;
  population: string;
  headquarters: string;
  keyInfrastructure: string;
  monitoredSlopes: {
    high: number;
    med: number;
    total: number;
  };
  hotline: string;
  lastUpdated: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  conditions: {
    rainfall24h: number; // mm
    rainfall24hTrend: string; // "+65%"
    rainfall24hStatus: string;
    rainfall7d: number; // mm
    rainfall7dTrend: string;
    rainfall7dStatus: string;
    soilMoisture: number; // %
    soilMoistureTrend: string;
    soilMoistureStatus: string;
    avgSlope: number; // deg
    avgSlopeStatus: string;
    temperature: number; // deg C
    dewPoint: number; // deg C
    landCover: string;
    landCoverCohesion: string;
    porePressure: number; // kPa
  };
  factors: {
    rainfall24h: number; // percentage
    soilMoisture: number;
    slope: number;
    historicalEvents: number;
    landCover: number;
  };
  aiAlert: {
    confidence: number;
    message: string;
    criticalCorridor: string;
  };
  topographyNotes: string;
  activeScarpObserved: string;
}

export interface EarlyWarningAlert {
  id: string;
  capId: string;
  title: string;
  severity: SeverityLevel;
  level: 'red' | 'amber' | 'yellow';
  affectedRegion: string;
  location: string;
  state: string;
  districtId: string;
  issuedAt: string;
  validUntil: string;
  headline: string;
  description: string;
  recommendedAction: string;
  emergencyContact: string;
  evacuationStatus: string;
  evacuationAdvised: boolean;
  affectedArea: string;
  monitoredRidges: number;
  rainGauges: number;
  seocStatus: string;
}

export interface GroundReport {
  id: string;
  timestamp: string;
  reporterName?: string;
  phone?: string;
  reporterPhone?: string;
  district: string;
  state?: string;
  location: string;
  locationDetails?: string;
  latitude?: number;
  longitude?: number;
  hazardType: string;
  severity: SeverityLevel;
  observations?: string[];
  notes?: string;
  status: 'Under Review' | 'Verified by SEOC' | 'Field Team Dispatched' | 'Resolved' | 'reviewing' | 'verified' | 'action-taken';
  imageUrl?: string;
  verifiedByGeologist?: boolean;
}

export interface TelemetryTimeSeriesPoint {
  date: string;
  rainfall24h: number;
  rainfallCumulative7d: number;
  soilMoisture: number;
  porePressure: number;
  criticalThreshold: number;
}

export interface TimeSeriesHourlyPoint {
  time: string;
  rainfall: number;
  soilMoisture: number;
  porePressure: number;
  displacement: number;
}

export interface NdmaProtocolPhase {
  id: string;
  phase: string;
  title: string;
  description: string;
  steps: string[];
}
