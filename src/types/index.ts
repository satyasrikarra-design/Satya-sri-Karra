export type UserRole = 'city_operator' | 'first_responder' | 'facility_manager';

export type HazardType = 'extreme_heat' | 'flash_flood' | 'waterlogging' | 'air_quality' | 'severe_rainfall';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface HazardMetrics {
  ambientTempC: number;
  wetBulbGlobeTempC: number;
  heatIndexC: number;
  rainfallRateMmHr: number;
  waterloggingDepthCm: number;
  floodInundationIndex: number; // 0 - 100
  aqi: number;
  pm25: number;
  windSpeedKmh: number;
  relativeHumidity: number;
}

export interface HazardThresholds {
  heatMaxC: number;
  rainfallMaxMmHr: number;
  floodMaxIndex: number;
  aqiMax: number;
  waterloggingMaxCm: number;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  code: string;
  category: 'power_grid' | 'transit' | 'healthcare' | 'water_facility' | 'education' | 'logistics';
  zone: 'Downtown Core' | 'Riverfront Basin' | 'Industrial District' | 'North Suburbs' | 'Harbor Logistics';
  coordinates: { lat: number; lng: number; mapX: number; mapY: number };
  criticality: 'tier_1' | 'tier_2' | 'tier_3';
  currentRisk: RiskLevel;
  vulnerabilityScore: number; // 0 - 100
  resilienceRating: number; // 0 - 100
  lastTelemetry: HazardMetrics;
  thresholds: HazardThresholds;
  activeSensors: number;
  status: 'nominal' | 'warning' | 'critical' | 'offline';
  lastUpdated: string;
  mitigationMeasures: string[];
}

export type IncidentStatus = 'triggered' | 'assigned' | 'in_progress' | 'escalated' | 'resolved';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
}

export interface EmergencyIncident {
  id: string;
  assetId: string;
  assetName: string;
  hazardType: HazardType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  summary: string;
  triggeredAt: string;
  assignedTo?: string;
  escalationLevel: 1 | 2 | 3;
  slaDeadlineMinutes: number;
  elapsedMinutes: number;
  auditTrail: AuditLogEntry[];
}

export interface TelemetryEvent {
  eventId: string;
  assetId: string;
  timestamp: string;
  metrics: HazardMetrics;
  isDuplicate?: boolean;
  isStale?: boolean;
  sourceGateway: string;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface SystemHealthState {
  circuitBreaker: CircuitBreakerState;
  circuitBreakerTrippedAt: string | null;
  failureRatePercent: number;
  eventProcessingLatencyMs: number;
  queueBacklog: number;
  ingestionRatePerSec: number;
  alertDeliveryRatePercent: number;
  staleSensorsCount: number;
  duplicatesFiltered: number;
  deadLetterQueueCount: number;
  activeGatewayStatus: 'nominal' | 'degraded' | 'failover_active';
  isSimulatingBurst: boolean;
  isDowntimeFallbackActive: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  tagline: string;
  basePriceMonthly: number;
  perAssetMonthly: number;
  features: string[];
  slaGuarantee: string;
  apiCallsLimit: number;
}

export interface ESGSummaryReport {
  generatedAt: string;
  complianceFramework: 'TCFD' | 'CSRD' | 'ISO 14090';
  cityResilienceScore: number;
  totalAssetsProtected: number;
  estimatedDamageAvoidedUsd: number;
  averageResponseTimeMinutes: number;
  criticalHeatAlertsHandled: number;
  floodInundationsMitigated: number;
  carbonOffsetFromOptimizedPumpsTonnes: number;
}
