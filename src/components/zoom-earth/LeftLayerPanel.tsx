import React, { useState } from 'react';
import {
  Layers,
  Satellite,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Flame,
  Waves,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sliders,
} from 'lucide-react';

export type BaseMapType = 'satellite' | 'dark' | 'topo';
export type LiveWeatherLayer = 'radar' | 'wind' | 'precipitation' | 'temperature' | 'humidity' | 'pressure' | 'clouds';
export type RiskOverlayType = 'heat' | 'flood' | 'aqi' | 'combined';

interface LeftLayerPanelProps {
  baseMap: BaseMapType;
  onChangeBaseMap: (map: BaseMapType) => void;
  activeWeatherLayers: Record<LiveWeatherLayer, boolean>;
  onToggleWeatherLayer: (layer: LiveWeatherLayer) => void;
  activeRiskOverlays: Record<RiskOverlayType, boolean>;
  onToggleRiskOverlay: (overlay: RiskOverlayType) => void;
  layerOpacity: number;
  onChangeOpacity: (opacity: number) => void;
}

export const LeftLayerPanel: React.FC<LeftLayerPanelProps> = ({
  baseMap,
  onChangeBaseMap,
  activeWeatherLayers,
  onToggleWeatherLayer,
  activeRiskOverlays,
  onToggleRiskOverlay,
  layerOpacity,
  onChangeOpacity,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`absolute top-20 left-4 z-20 transition-all duration-300 pointer-events-auto ${
        isCollapsed ? 'w-10' : 'w-72 sm:w-80'
      }`}
    >
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 shadow-2xl transition-colors flex items-center justify-center"
          title="Open Layers & Overlays"
        >
          <Layers className="w-5 h-5 text-cyan-400" />
        </button>
      ) : (
        <div className="bg-[#0b0f17]/85 backdrop-blur-xl border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-160px)] flex flex-col">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white tracking-wide">Map Layers & Hazard Overlays</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/60 transition-colors"
              title="Collapse Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-5 overflow-y-auto pr-2 text-xs">
            {/* Section 1: Base Map Style */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Satellite Imagery Base
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-lg border border-slate-800/80">
                <button
                  onClick={() => onChangeBaseMap('satellite')}
                  className={`py-1.5 px-2 rounded font-medium text-[11px] transition-all flex flex-col items-center gap-1 ${
                    baseMap === 'satellite'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Satellite className="w-3.5 h-3.5" />
                  <span>Satellite HD</span>
                </button>

                <button
                  onClick={() => onChangeBaseMap('dark')}
                  className={`py-1.5 px-2 rounded font-medium text-[11px] transition-all flex flex-col items-center gap-1 ${
                    baseMap === 'dark'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Dark GIS</span>
                </button>

                <button
                  onClick={() => onChangeBaseMap('topo')}
                  className={`py-1.5 px-2 rounded font-medium text-[11px] transition-all flex flex-col items-center gap-1 ${
                    baseMap === 'topo'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Hybrid Topo</span>
                </button>
              </div>
            </div>

            {/* Section 2: Live Weather Overlays (Zoom Earth Inspired) */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Live Weather Maps</span>
                <span className="text-[10px] text-cyan-400 font-sans">Real-time</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'radar' as LiveWeatherLayer, label: 'Radar', icon: CloudRain, color: 'text-blue-400' },
                  { id: 'wind' as LiveWeatherLayer, label: 'Wind Stream', icon: Wind, color: 'text-teal-400' },
                  { id: 'precipitation' as LiveWeatherLayer, label: 'Precipitation', icon: Droplets, color: 'text-cyan-400' },
                  { id: 'temperature' as LiveWeatherLayer, label: 'Temperature', icon: Thermometer, color: 'text-rose-400' },
                  { id: 'humidity' as LiveWeatherLayer, label: 'Humidity', icon: Waves, color: 'text-indigo-400' },
                  { id: 'pressure' as LiveWeatherLayer, label: 'Isobar Pressure', icon: Gauge, color: 'text-amber-400' },
                ].map(item => {
                  const isActive = activeWeatherLayers[item.id];
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onToggleWeatherLayer(item.id)}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                        isActive
                          ? 'bg-slate-900 border-cyan-500/80 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : 'text-slate-500'}`} />
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Urban Climate Risk Overlays */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Resilience Risk Layers</span>
                <span className="text-[10px] text-rose-400 font-sans">Threshold Alerts</span>
              </div>

              <div className="space-y-1.5">
                {[
                  {
                    id: 'heat' as RiskOverlayType,
                    label: 'Heat Risk & Urban Island (UHI)',
                    desc: 'Thermal hot spots & wet-bulb danger',
                    icon: Flame,
                    activeClass: 'border-rose-500/80 bg-rose-950/40 text-rose-200',
                    dotColor: 'bg-rose-500',
                  },
                  {
                    id: 'flood' as RiskOverlayType,
                    label: 'Flood Inundation & Sump Vectors',
                    desc: 'Runoff velocity & low-elevation basins',
                    icon: Waves,
                    activeClass: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-200',
                    dotColor: 'bg-cyan-400',
                  },
                  {
                    id: 'aqi' as RiskOverlayType,
                    label: 'Air Quality & Wildfire Smoke',
                    desc: 'PM2.5 particulate concentration plume',
                    icon: Wind,
                    activeClass: 'border-purple-500/80 bg-purple-950/40 text-purple-200',
                    dotColor: 'bg-purple-400',
                  },
                  {
                    id: 'combined' as RiskOverlayType,
                    label: 'Combined Composite Risk Index',
                    desc: 'Integrated hazard score & critical zoning',
                    icon: Sparkles,
                    activeClass: 'border-amber-500/80 bg-amber-950/40 text-amber-200',
                    dotColor: 'bg-amber-400',
                  },
                ].map(overlay => {
                  const isActive = activeRiskOverlays[overlay.id];
                  const Icon = overlay.icon;
                  return (
                    <button
                      key={overlay.id}
                      onClick={() => onToggleRiskOverlay(overlay.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                        isActive
                          ? `${overlay.activeClass} shadow-md ring-1 ring-white/10`
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>{overlay.label}</span>
                          {isActive && <span className={`w-1.5 h-1.5 rounded-full ${overlay.dotColor} animate-pulse`} />}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{overlay.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layer Opacity Slider */}
            <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 font-mono">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  <span>Overlay Opacity</span>
                </span>
                <span className="font-mono text-cyan-300">{Math.round(layerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={layerOpacity}
                onChange={e => onChangeOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-slate-800 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
