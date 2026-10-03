import React from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { GeospatialMap } from '../common/GeospatialMap';
import {
  Flame,
  Droplets,
  Wind,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Radio,
  Timer,
  CheckCircle,
} from 'lucide-react';

export const CommandCenterView: React.FC = () => {
  const {
    assets,
    incidents,
    setActiveTab,
    setSelectedAssetId,
    triggerTelemetryBurst,
    createManualIncident,
    userRole,
  } = useClimateShield();

  const criticalIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const highCount = incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length;

  // Compute aggregate real-time averages
  const avgTemp = (assets.reduce((acc, a) => acc + a.lastTelemetry.ambientTempC, 0) / assets.length).toFixed(1);
  const maxRain = Math.max(...assets.map(a => a.lastTelemetry.rainfallRateMmHr)).toFixed(1);
  const maxFlood = Math.max(...assets.map(a => a.lastTelemetry.floodInundationIndex));
  const avgAqi = Math.round(assets.reduce((acc, a) => acc + a.lastTelemetry.aqi, 0) / assets.length);

  const zones = [
    { name: 'Downtown Core', risk: 'Critical', hazard: 'Severe Urban Heat & Grid Load', count: 2 },
    { name: 'Riverfront Basin', risk: 'Critical', hazard: 'Severe Flood Runoff & Sump Inundation', count: 2 },
    { name: 'Harbor Logistics', risk: 'High', hazard: 'Tidal Storm Surge & High Wind', count: 1 },
    { name: 'North Suburbs', risk: 'Moderate', hazard: 'Elevated Ambient Heat Index', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Ticker: Real-time Emergency Feed */}
      {criticalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-rose-950/40 border border-rose-800/70 rounded-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-200">
              <span className="uppercase tracking-wider font-mono text-[11px] text-rose-400">URGENT HAZARD ALERT</span>
              <span className="text-slate-400">·</span>
              <span>{criticalCount} Critical & {highCount} High Priority Incidents Require Immediate Response</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('incidents')}
            className="self-start sm:self-auto text-xs font-medium px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors flex items-center gap-1.5"
          >
            <span>Open Incident Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Protected Infrastructure</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-white tabular-nums">
              {assets.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">Nodes Online</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-mono font-medium">100%</span>
            <span>telemetry uptime today</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-rose-400 tabular-nums">
              {criticalIncidents.length}
            </span>
            <span className="text-xs text-rose-400/80 font-mono">In Workflow</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-rose-400 font-mono font-medium">{criticalCount} critical</span>
            <span>·</span>
            <span className="font-mono">{highCount} high</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Response SLA Average</span>
            <Timer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-cyan-300 tabular-nums">
              11.4
            </span>
            <span className="text-xs text-slate-400 font-mono">Minutes</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-cyan-400 font-mono font-medium">&lt; 15m</span>
            <span>target SLA threshold</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mesh Telemetry Stream</span>
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold font-mono text-blue-300 tabular-nums">
              1,420
            </span>
            <span className="text-xs text-slate-400 font-mono">Events/sec</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-mono font-medium">14ms</span>
            <span>pipeline latency</span>
          </div>
        </div>
      </div>

      {/* Main Geospatial Intelligence & Environmental Hazard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GIS Map Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">Metropolitan Spatial Risk Grid</h2>
              <span className="text-xs text-slate-400">· Real-time Vector & Satellite Overlays</span>
            </div>
            <button
              onClick={() => setActiveTab('assets')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Asset Registry ({assets.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <GeospatialMap />

          {/* Environmental Hazard Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Avg Ambient Heat</div>
                <div className="text-sm font-bold font-mono text-white tabular-nums">{avgTemp}°C</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Peak Rainfall Rate</div>
                <div className="text-sm font-bold font-mono text-white tabular-nums">{maxRain} mm/h</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Max Flood Risk</div>
                <div className="text-sm font-bold font-mono text-rose-400 tabular-nums">{maxFlood}/100</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">City AQI Mean</div>
                <div className="text-sm font-bold font-mono text-white tabular-nums">{avgAqi} AQI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operational Incident Feed & Rapid Dispatch (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Active Incident Queue</h2>
            <span className="text-xs font-mono text-slate-400">{criticalIncidents.length} active</span>
          </div>

          <div className="space-y-3">
            {criticalIncidents.slice(0, 3).map(incident => (
              <div
                key={incident.id}
                className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-cyan-400">{incident.id}</span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        incident.severity === 'critical'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {incident.severity} · Tier {incident.escalationLevel}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-1">{incident.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{incident.summary}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-400">
                    Assigned: <span className="text-slate-200">{incident.assignedTo || 'Unassigned'}</span>
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('incidents');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Zone Vulnerability Summary */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Zone Vulnerability Matrix
            </h3>
            <div className="space-y-2 text-xs">
              {zones.map(z => (
                <div key={z.name} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <div>
                    <div className="font-medium text-slate-200">{z.name}</div>
                    <div className="text-[10px] text-slate-400">{z.hazard}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        z.risk === 'Critical'
                          ? 'text-rose-400'
                          : z.risk === 'High'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {z.risk}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">{z.count} assets</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Municipal Overrides / Drills */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between gap-2">
            <div className="text-xs">
              <div className="font-medium text-slate-200">Resilience Scenario Drill</div>
              <div className="text-[11px] text-slate-400">Inject simulated atmospheric storm surge</div>
            </div>
            <button
              onClick={() => {
                triggerTelemetryBurst();
                createManualIncident({
                  title: 'Emergency Drill: Simulated Convective Downpour',
                  summary: 'Drill scenario testing multi-agency pump mobilization under 60mm/hr rainfall.',
                  hazardType: 'severe_rainfall',
                  severity: 'high',
                });
              }}
              className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors whitespace-nowrap"
            >
              Trigger Drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
