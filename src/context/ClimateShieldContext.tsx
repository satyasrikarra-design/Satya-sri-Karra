import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  InfrastructureAsset,
  EmergencyIncident,
  UserRole,
  SystemHealthState,
  CircuitBreakerState,
  IncidentStatus,
  HazardThresholds,
  TelemetryEvent,
  RiskLevel,
} from '../types';
import { INITIAL_ASSETS, INITIAL_INCIDENTS } from '../data/mockInitialData';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
  read: boolean;
  assetId?: string;
}

interface ClimateShieldContextType {
  // State
  assets: InfrastructureAsset[];
  incidents: EmergencyIncident[];
  userRole: UserRole;
  activeTab: 'dashboard' | 'assets' | 'incidents' | 'observability' | 'billing';
  systemHealth: SystemHealthState;
  selectedAssetId: string | null;
  notifications: NotificationItem[];
  recentTelemetryEvents: TelemetryEvent[];
  deadLetterEvents: TelemetryEvent[];
  isStreamPaused: boolean;

  // Actions
  setUserRole: (role: UserRole) => void;
  setActiveTab: (tab: 'dashboard' | 'assets' | 'incidents' | 'observability' | 'billing') => void;
  setSelectedAssetId: (id: string | null) => void;
  addAsset: (asset: Omit<InfrastructureAsset, 'id' | 'lastUpdated'>) => void;
  updateAssetThresholds: (assetId: string, thresholds: Partial<HazardThresholds>) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus, notes?: string) => void;
  assignIncident: (id: string, assignee: string) => void;
  escalateIncident: (id: string, newLevel: 1 | 2 | 3, notes?: string) => void;
  createManualIncident: (incident: Partial<EmergencyIncident>) => void;
  setCircuitBreakerManual: (state: CircuitBreakerState) => void;
  toggleCircuitBreakerState: () => void;
  triggerTelemetryBurst: () => void;
  toggleDowntimeFallback: () => void;
  setIsStreamPaused: (paused: boolean | ((prev: boolean) => boolean)) => void;
  markNotificationsAsRead: () => void;
  clearDeadLetterQueue: () => void;
  replayDeadLetterQueue: () => void;
}

const ClimateShieldContext = createContext<ClimateShieldContextType | undefined>(undefined);

export const ClimateShieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>(INITIAL_ASSETS);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(INITIAL_INCIDENTS);
  const [userRole, setUserRole] = useState<UserRole>('city_operator');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'incidents' | 'observability' | 'billing'>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);

  const [systemHealth, setSystemHealth] = useState<SystemHealthState>({
    circuitBreaker: 'CLOSED',
    circuitBreakerTrippedAt: null,
    failureRatePercent: 0.8,
    eventProcessingLatencyMs: 14,
    queueBacklog: 42,
    ingestionRatePerSec: 1420,
    alertDeliveryRatePercent: 99.8,
    staleSensorsCount: 3,
    duplicatesFiltered: 148,
    deadLetterQueueCount: 4,
    activeGatewayStatus: 'nominal',
    isSimulatingBurst: false,
    isDowntimeFallbackActive: false,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Critical Heat Inversion',
      message: 'Substation Delta-4 (Grid 4) reported 41.2°C ambient temperature.',
      time: '2m ago',
      type: 'critical',
      read: false,
      assetId: 'asset-grid-4',
    },
    {
      id: 'notif-2',
      title: 'Runoff Sump Warning',
      message: 'Riverfront Wastewater exceeded waterlogging threshold by 24%.',
      time: '7m ago',
      type: 'critical',
      read: false,
      assetId: 'asset-water-east',
    },
    {
      id: 'notif-3',
      title: 'Hydrologic Edge Gateway Synced',
      message: 'Mesh node RTU-88 completed deduplication check; 12 duplicate packets dropped.',
      time: '14m ago',
      type: 'info',
      read: true,
    },
  ]);

  const [recentTelemetryEvents, setRecentTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [deadLetterEvents, setDeadLetterEvents] = useState<TelemetryEvent[]>([
    {
      eventId: 'dlq-9912',
      assetId: 'asset-port-terminal',
      timestamp: '09:12:04',
      metrics: {
        ambientTempC: 32.1,
        wetBulbGlobeTempC: 28.0,
        heatIndexC: 34.0,
        rainfallRateMmHr: 39.0,
        waterloggingDepthCm: 16.0,
        floodInundationIndex: 72,
        aqi: 999, // Malformed corrupt reading
        pm25: 12.0,
        windSpeedKmh: 45.0,
        relativeHumidity: 90,
      },
      sourceGateway: 'GATEWAY-HARBOR-EAST',
      isDuplicate: false,
    },
    {
      eventId: 'dlq-9913',
      assetId: 'asset-metro-2',
      timestamp: '09:14:55',
      metrics: {
        ambientTempC: -99.0, // Sensor open-circuit failure
        wetBulbGlobeTempC: 22.0,
        heatIndexC: 24.0,
        rainfallRateMmHr: 45.0,
        waterloggingDepthCm: 15.0,
        floodInundationIndex: 75,
        aqi: 50,
        pm25: 10.0,
        windSpeedKmh: 30.0,
        relativeHumidity: 95,
      },
      sourceGateway: 'GATEWAY-METRO-UNDERPASS',
      isDuplicate: true,
    },
  ]);

  // Compute risk level dynamically based on asset metrics and thresholds
  const calculateRisk = useCallback((telemetry: InfrastructureAsset['lastTelemetry'], thresholds: HazardThresholds): RiskLevel => {
    let breachCount = 0;
    let criticalBreach = false;

    if (telemetry.ambientTempC >= thresholds.heatMaxC * 1.05) criticalBreach = true;
    else if (telemetry.ambientTempC >= thresholds.heatMaxC) breachCount++;

    if (telemetry.floodInundationIndex >= thresholds.floodMaxIndex * 1.15) criticalBreach = true;
    else if (telemetry.floodInundationIndex >= thresholds.floodMaxIndex) breachCount++;

    if (telemetry.waterloggingDepthCm >= thresholds.waterloggingMaxCm * 1.2) criticalBreach = true;
    else if (telemetry.waterloggingDepthCm >= thresholds.waterloggingMaxCm) breachCount++;

    if (telemetry.rainfallRateMmHr >= thresholds.rainfallMaxMmHr) breachCount++;
    if (telemetry.aqi >= thresholds.aqiMax) breachCount++;

    if (criticalBreach || breachCount >= 3) return 'critical';
    if (breachCount >= 2) return 'high';
    if (breachCount === 1) return 'moderate';
    return 'low';
  }, []);

  // Update asset thresholds
  const updateAssetThresholds = useCallback((assetId: string, thresholds: Partial<HazardThresholds>) => {
    setAssets(prev =>
      prev.map(asset => {
        if (asset.id !== assetId) return asset;
        const newThresholds = { ...asset.thresholds, ...thresholds };
        const newRisk = calculateRisk(asset.lastTelemetry, newThresholds);
        return {
          ...asset,
          thresholds: newThresholds,
          currentRisk: newRisk,
          status: newRisk === 'critical' ? 'critical' : newRisk === 'high' ? 'warning' : 'nominal',
          lastUpdated: 'Just now',
        };
      })
    );
  }, [calculateRisk]);

  // Add new asset
  const addAsset = useCallback((newAssetData: Omit<InfrastructureAsset, 'id' | 'lastUpdated'>) => {
    const id = `asset-${Date.now()}`;
    const newRisk = calculateRisk(newAssetData.lastTelemetry, newAssetData.thresholds);
    const asset: InfrastructureAsset = {
      ...newAssetData,
      id,
      currentRisk: newRisk,
      status: newRisk === 'critical' ? 'critical' : newRisk === 'high' ? 'warning' : 'nominal',
      lastUpdated: 'Just now',
    };
    setAssets(prev => [asset, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Asset Commissioned',
        message: `${asset.name} (${asset.zone}) integrated into resilience monitoring grid.`,
        time: 'Just now',
        type: 'info',
        read: false,
        assetId: asset.id,
      },
      ...prev,
    ]);
  }, [calculateRisk]);

  // Update incident status
  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus, notes?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id) return inc;
        const auditEntry = {
          id: `aud-${Date.now()}`,
          timestamp: timeStr,
          actor: userRole === 'city_operator' ? 'City Operator' : userRole === 'first_responder' ? 'First Responder' : 'Facility Lead',
          role: userRole.replace('_', ' ').toUpperCase(),
          action: `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
          details: notes || `Operational status transitioned to ${status}.`,
        };
        return {
          ...inc,
          status,
          auditTrail: [auditEntry, ...inc.auditTrail],
        };
      })
    );
  }, [userRole]);

  // Assign incident
  const assignIncident = useCallback((id: string, assignee: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id) return inc;
        const auditEntry = {
          id: `aud-${Date.now()}`,
          timestamp: timeStr,
          actor: userRole === 'city_operator' ? 'City Operator' : 'Disaster Command',
          role: userRole.replace('_', ' ').toUpperCase(),
          action: 'Team Assigned',
          details: `Assigned response jurisdiction to: ${assignee}.`,
        };
        return {
          ...inc,
          assignedTo: assignee,
          status: inc.status === 'triggered' ? 'assigned' : inc.status,
          auditTrail: [auditEntry, ...inc.auditTrail],
        };
      })
    );
  }, [userRole]);

  // Escalate incident
  const escalateIncident = useCallback((id: string, newLevel: 1 | 2 | 3, notes?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== id) return inc;
        const auditEntry = {
          id: `aud-${Date.now()}`,
          timestamp: timeStr,
          actor: userRole.replace('_', ' ').toUpperCase(),
          role: userRole.replace('_', ' ').toUpperCase(),
          action: `Incident Escalation to Tier ${newLevel}`,
          details: notes || `Escalation tier increased. Response window tightened.`,
        };
        return {
          ...inc,
          escalationLevel: newLevel,
          status: 'escalated',
          severity: newLevel === 3 ? 'critical' : 'high',
          slaDeadlineMinutes: Math.max(15, inc.slaDeadlineMinutes - 15),
          auditTrail: [auditEntry, ...inc.auditTrail],
        };
      })
    );
  }, [userRole]);

  // Manual incident creation
  const createManualIncident = useCallback((partial: Partial<EmergencyIncident>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newInc: EmergencyIncident = {
      id: `INC-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId: partial.assetId || 'asset-grid-4',
      assetName: partial.assetName || 'Municipal Power Grid 4',
      hazardType: partial.hazardType || 'extreme_heat',
      severity: partial.severity || 'high',
      status: 'triggered',
      title: partial.title || 'Manual Hazard Alert Declared',
      summary: partial.summary || 'Operational dispatch initiated manually via command interface.',
      triggeredAt: `${now.toISOString().slice(0, 10)} ${timeStr}`,
      escalationLevel: 1,
      slaDeadlineMinutes: 45,
      elapsedMinutes: 0,
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: timeStr,
          actor: 'Manual Dispatch Operator',
          role: userRole.toUpperCase(),
          action: 'Incident Created Manually',
          details: 'Direct intervention from resilience room.',
        },
      ],
    };
    setIncidents(prev => [newInc, ...prev]);
  }, [userRole]);

  // Circuit Breaker controls
  const setCircuitBreakerManual = useCallback((state: CircuitBreakerState) => {
    setSystemHealth(prev => ({
      ...prev,
      circuitBreaker: state,
      circuitBreakerTrippedAt: state === 'OPEN' ? new Date().toLocaleTimeString() : null,
      activeGatewayStatus: state === 'OPEN' ? 'degraded' : state === 'HALF_OPEN' ? 'failover_active' : 'nominal',
    }));
  }, []);

  const toggleCircuitBreakerState = useCallback(() => {
    setSystemHealth(prev => {
      let nextState: CircuitBreakerState = 'CLOSED';
      if (prev.circuitBreaker === 'CLOSED') nextState = 'OPEN';
      else if (prev.circuitBreaker === 'OPEN') nextState = 'HALF_OPEN';
      else nextState = 'CLOSED';

      return {
        ...prev,
        circuitBreaker: nextState,
        circuitBreakerTrippedAt: nextState === 'OPEN' ? new Date().toLocaleTimeString() : null,
        activeGatewayStatus: nextState === 'OPEN' ? 'degraded' : nextState === 'HALF_OPEN' ? 'failover_active' : 'nominal',
      };
    });
  }, []);

  // Telemetry burst simulation
  const triggerTelemetryBurst = useCallback(() => {
    setSystemHealth(prev => ({
      ...prev,
      isSimulatingBurst: true,
      ingestionRatePerSec: 6420,
      queueBacklog: prev.queueBacklog + 250,
      eventProcessingLatencyMs: 86,
    }));

    setTimeout(() => {
      setSystemHealth(prev => ({
        ...prev,
        isSimulatingBurst: false,
        ingestionRatePerSec: 1540,
        queueBacklog: Math.max(20, prev.queueBacklog - 210),
        eventProcessingLatencyMs: 16,
      }));
    }, 4500);
  }, []);

  // Downtime fallback toggle
  const toggleDowntimeFallback = useCallback(() => {
    setSystemHealth(prev => ({
      ...prev,
      isDowntimeFallbackActive: !prev.isDowntimeFallbackActive,
      activeGatewayStatus: !prev.isDowntimeFallbackActive ? 'failover_active' : 'nominal',
    }));
  }, []);

  // Dead Letter Queue operations
  const clearDeadLetterQueue = useCallback(() => {
    setDeadLetterEvents([]);
    setSystemHealth(prev => ({ ...prev, deadLetterQueueCount: 0 }));
  }, []);

  const replayDeadLetterQueue = useCallback(() => {
    if (deadLetterEvents.length === 0) return;
    setDeadLetterEvents([]);
    setSystemHealth(prev => ({
      ...prev,
      deadLetterQueueCount: 0,
      duplicatesFiltered: prev.duplicatesFiltered + 1,
      queueBacklog: prev.queueBacklog + deadLetterEvents.length,
    }));
  }, [deadLetterEvents]);

  // Notifications
  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Live IoT telemetry streamer simulation
  useEffect(() => {
    if (isStreamPaused) return;

    const interval = setInterval(() => {
      const isBreakerOpen = systemHealth.circuitBreaker === 'OPEN';

      // Pick a random asset to update telemetry
      setAssets(currentAssets => {
        if (currentAssets.length === 0) return currentAssets;
        const targetIndex = Math.floor(Math.random() * currentAssets.length);
        const target = currentAssets[targetIndex];

        // Random subtle fluctuation
        const tempDelta = (Math.random() - 0.48) * 0.8;
        const rainDelta = (Math.random() - 0.49) * 2.5;
        const waterDelta = (Math.random() - 0.48) * 0.9;
        const aqiDelta = (Math.random() - 0.48) * 3;

        const newAmbient = Math.max(18, Math.min(48, parseFloat((target.lastTelemetry.ambientTempC + tempDelta).toFixed(1))));
        const newRain = Math.max(0, Math.min(95, parseFloat((target.lastTelemetry.rainfallRateMmHr + rainDelta).toFixed(1))));
        const newWater = Math.max(0, Math.min(40, parseFloat((target.lastTelemetry.waterloggingDepthCm + waterDelta).toFixed(1))));
        const newAqi = Math.max(20, Math.min(300, Math.round(target.lastTelemetry.aqi + aqiDelta)));
        const newFloodIndex = Math.max(5, Math.min(98, Math.round(target.lastTelemetry.floodInundationIndex + (newWater > 15 ? 1.5 : -0.8))));

        const updatedTelemetry = {
          ...target.lastTelemetry,
          ambientTempC: newAmbient,
          wetBulbGlobeTempC: parseFloat((newAmbient * 0.82).toFixed(1)),
          rainfallRateMmHr: newRain,
          waterloggingDepthCm: newWater,
          floodInundationIndex: newFloodIndex,
          aqi: newAqi,
          pm25: parseFloat((newAqi * 0.38).toFixed(1)),
        };

        const updatedRisk = calculateRisk(updatedTelemetry, target.thresholds);

        const updatedAsset: InfrastructureAsset = {
          ...target,
          lastTelemetry: updatedTelemetry,
          currentRisk: updatedRisk,
          status: updatedRisk === 'critical' ? 'critical' : updatedRisk === 'high' ? 'warning' : 'nominal',
          lastUpdated: 'Just now',
        };

        const updatedList = [...currentAssets];
        updatedList[targetIndex] = updatedAsset;
        return updatedList;
      });

      // Update system metrics
      setSystemHealth(prev => {
        const backlogDelta = isBreakerOpen ? Math.floor(Math.random() * 8) + 2 : (Math.random() > 0.6 ? -2 : 1);
        const newBacklog = Math.max(5, prev.queueBacklog + backlogDelta);
        const jitterLatency = isBreakerOpen ? 120 : Math.floor(12 + Math.random() * 8);

        return {
          ...prev,
          queueBacklog: newBacklog,
          eventProcessingLatencyMs: jitterLatency,
          duplicatesFiltered: prev.duplicatesFiltered + (Math.random() > 0.8 ? 1 : 0),
        };
      });

    }, 3200);

    return () => clearInterval(interval);
  }, [isStreamPaused, systemHealth.circuitBreaker, calculateRisk]);

  const value = useMemo(() => ({
    assets,
    incidents,
    userRole,
    activeTab,
    systemHealth,
    selectedAssetId,
    notifications,
    recentTelemetryEvents,
    deadLetterEvents,
    isStreamPaused,
    setUserRole,
    setActiveTab,
    setSelectedAssetId,
    addAsset,
    updateAssetThresholds,
    updateIncidentStatus,
    assignIncident,
    escalateIncident,
    createManualIncident,
    setCircuitBreakerManual,
    toggleCircuitBreakerState,
    triggerTelemetryBurst,
    toggleDowntimeFallback,
    setIsStreamPaused,
    markNotificationsAsRead,
    clearDeadLetterQueue,
    replayDeadLetterQueue,
  }), [
    assets,
    incidents,
    userRole,
    activeTab,
    systemHealth,
    selectedAssetId,
    notifications,
    recentTelemetryEvents,
    deadLetterEvents,
    isStreamPaused,
    addAsset,
    updateAssetThresholds,
    updateIncidentStatus,
    assignIncident,
    escalateIncident,
    createManualIncident,
    setCircuitBreakerManual,
    toggleCircuitBreakerState,
    triggerTelemetryBurst,
    toggleDowntimeFallback,
    markNotificationsAsRead,
    clearDeadLetterQueue,
    replayDeadLetterQueue,
  ]);

  return (
    <ClimateShieldContext.Provider value={value}>
      {children}
    </ClimateShieldContext.Provider>
  );
};

export const useClimateShield = () => {
  const context = useContext(ClimateShieldContext);
  if (!context) {
    throw new Error('useClimateShield must be used within a ClimateShieldProvider');
  }
  return context;
};
