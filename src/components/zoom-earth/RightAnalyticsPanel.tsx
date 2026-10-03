import React, { useState } from 'react';
import {
  Thermometer,
  CloudRain,
  Flame,
  Waves,
  Wind,
  Droplets,
  Gauge,
  Sun,
  CloudLightning,
  Cloud,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { LocationClimateData } from '../../services/geocoding';

interface RightAnalyticsPanelProps {
  data: LocationClimateData;
  onTriggerIncidentForLocation?: () => void;
}

export const RightAnalyticsPanel: React.FC<RightAnalyticsPanelProps> = ({
  data,
  onTriggerIncidentForLocation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isCritical = data.riskLevel === 'critical';
  const isHigh = data.riskLevel === 'high';
  const isModerate = data.riskLevel === 'moderate';

  const riskBadgeColor = isCritical
    ? 'bg-rose-950 text-rose-300 border-rose-800'
    : isHigh
    ? 'bg-amber-950 text-amber-300 border-amber-800'
    : isModerate
    ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
    : 'bg-emerald-950 text-emerald-300 border-emerald-800';

  const renderWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Thunderstorm':
        return <CloudLightning className="w-4 h-4 text-amber-400" />;
      case 'Heavy Rain':
      case 'Rain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'Partly Cloudy':
        return <Cloud className="w-4 h-4 text-slate-300" />;
      case 'Sunny':
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      className={`absolute top-20 right-4 z-20 transition-all duration-300 pointer-events-auto ${
        isCollapsed ? 'w-10' : 'w-80 sm:w-96'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 shadow-2xl transition-colors flex items-center justify-center"
          title="Open Weather & Risk Analytics"
        >
          <Thermometer className="w-5 h-5 text-rose-400" />
        </button>
      ) : (
        <div className="bg-[#0b0f17]/85 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-160px)] flex flex-col">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{data.coordinates.formatted}</span>
                <span>·</span>
                <span className="text-slate-400">{data.elevationMeters}m MSL</span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{data.placeName}</h2>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors shrink-0"
              title="Collapse Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-4 overflow-y-auto pr-2 text-xs">
            {/* Composite Risk Gauge Card */}
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Composite Climate Risk
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`text-3xl font-extrabold font-mono tabular-nums ${
                      isCritical
                        ? 'text-rose-400'
                        : isHigh
                        ? 'text-amber-400'
                        : isModerate
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {data.compositeRiskScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${riskBadgeColor}`}
                  >
                    {data.riskLevel} risk level
                  </span>
                </div>
              </div>

              {/* Circular Radial Gauge */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={isCritical ? '#f43f5e' : isHigh ? '#f59e0b' : '#10b981'}
                    strokeWidth="3.2"
                    strokeDasharray={`${(data.compositeRiskScore / 100) * 94} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-[11px] font-mono font-bold text-slate-200">
                  {data.compositeRiskScore}%
                </div>
              </div>
            </div>

            {/* Heat Risk Module */}
            <div className="p-3 bg-rose-950/20 rounded-lg border border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Extreme Heat & Thermal Stress</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
                  {data.heatMetrics.uhiRating} UHI
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
                <div className="p-2 bg-slate-950/60 rounded border border-rose-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Ambient</div>
                  <div className="text-sm font-bold text-white mt-0.5">{data.heatMetrics.ambientTempC}°C</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-rose-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Wet-Bulb</div>
                  <div className={`text-sm font-bold mt-0.5 ${data.heatMetrics.wetBulbTempC > 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {data.heatMetrics.wetBulbTempC}°C
                  </div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-rose-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Heat Index</div>
                  <div className="text-sm font-bold text-rose-300 mt-0.5">{data.heatMetrics.heatIndexC}°C</div>
                </div>
              </div>
            </div>

            {/* Flood & Hydrology Module */}
            <div className="p-3 bg-cyan-950/20 rounded-lg border border-cyan-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flood Inundation & Sump Risk</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-200">
                  {data.floodMetrics.drainageCapacityRating}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
                <div className="p-2 bg-slate-950/60 rounded border border-cyan-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Rain Rate</div>
                  <div className="text-sm font-bold text-white mt-0.5">{data.floodMetrics.rainfallMmHr} mm/h</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-cyan-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Waterlog</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">{data.floodMetrics.waterloggingCm} cm</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-cyan-900/40">
                  <div className="text-[10px] text-slate-400 font-sans">Inundation</div>
                  <div className={`text-sm font-bold mt-0.5 ${data.floodMetrics.inundationRiskPercent > 60 ? 'text-rose-400' : 'text-blue-400'}`}>
                    {data.floodMetrics.inundationRiskPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Vitals Bar */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Wind Velocity</span>
                <span className="text-slate-200">
                  {data.environmental.windSpeedKmh} km/h {data.environmental.windDirection}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Humidity</span>
                <span className="text-slate-200">{data.environmental.humidityPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Pressure</span>
                <span className="text-slate-200">{data.environmental.pressureHpa} hPa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Air Quality (AQI)</span>
                <span className={data.environmental.aqi > 150 ? 'text-rose-400' : 'text-emerald-400'}>
                  {data.environmental.aqi} AQI
                </span>
              </div>
            </div>

            {/* 5-Day Forecast Strip */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>5-Day Climate Hazard Outlook</span>
                <span className="text-cyan-400 text-[10px] font-sans">Multi-Model</span>
              </div>

              <div className="space-y-1.5">
                {data.forecast5Day.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-950/60 rounded-md border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="w-10 font-bold font-mono text-slate-300">{day.day}</div>
                    <div className="flex items-center gap-1.5 w-24">
                      {renderWeatherIcon(day.condition)}
                      <span className="text-[11px] text-slate-400 truncate">{day.condition}</span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 w-12 text-center">
                      {day.precipChance}% rain
                    </div>
                    <div className="font-mono text-right text-xs">
                      <span className="text-white font-semibold">{day.tempMax}°</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{day.tempMin}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {onTriggerIncidentForLocation && (
              <button
                onClick={onTriggerIncidentForLocation}
                className="w-full py-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/50"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Declare Emergency Incident for this Sector</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
