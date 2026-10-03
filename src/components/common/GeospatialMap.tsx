import React, { useState } from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { InfrastructureAsset } from '../../types';
import {
  Layers,
  Flame,
  Droplets,
  Wind,
  ShieldAlert,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  Eye,
} from 'lucide-react';

interface GeospatialMapProps {
  onSelectAsset?: (asset: InfrastructureAsset) => void;
  selectedAssetId?: string | null;
  compact?: boolean;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  onSelectAsset,
  selectedAssetId,
  compact = false,
}) => {
  const { assets, setActiveTab, setSelectedAssetId } = useClimateShield();

  const [activeLayer, setActiveLayer] = useState<'all' | 'heat' | 'flood' | 'aqi'>('all');
  const [mapMode, setMapMode] = useState<'vector' | 'satellite' | 'drone'>('vector');
  const [hoveredAsset, setHoveredAsset] = useState<InfrastructureAsset | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const satelliteImage = '/src/assets/images/satellite_urban_heat_map_1791019938674.jpg';
  const droneImage = '/src/assets/images/drone_flood_inundation_1791019951214.jpg';

  const handleAssetClick = (asset: InfrastructureAsset) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
    } else {
      setSelectedAssetId(asset.id);
      setActiveTab('assets');
    }
  };

  return (
    <div className={`relative w-full rounded-lg overflow-hidden border border-slate-800 bg-[#070b12] ${compact ? 'h-[360px]' : 'h-[540px]'}`}>
      {/* Background Image / Vector Mesh */}
      <div
        className="absolute inset-0 transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {mapMode === 'satellite' && (
          <img
            src={satelliteImage}
            alt="Satellite Thermal Urban View"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 mix-blend-screen filter contrast-125"
          />
        )}

        {mapMode === 'drone' && (
          <img
            src={droneImage}
            alt="Drone Inundation Photogrammetry"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 mix-blend-screen filter contrast-125"
          />
        )}

        {/* Vector SVG GIS Base Map */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="riverGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>

            <radialGradient id="heatCoreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#fb923c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="floodBasinGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100" height="100" fill="url(#gridPattern)" />

          {/* Urban Road Network Lines */}
          <path d="M 10,35 Q 40,30 90,38" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="1,1" />
          <path d="M 25,10 Q 30,50 35,90" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="1,1" />
          <path d="M 60,10 Q 65,55 75,90" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="1,1" />
          <path d="M 15,65 Q 50,70 85,60" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="1,1" />

          {/* River Basin Polygon */}
          <path
            d="M 50,0 Q 56,25 68,50 T 80,100 L 92,100 Q 82,50 72,25 T 62,0 Z"
            fill="url(#riverGradient)"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeOpacity="0.7"
          />

          {/* Dynamic Hazard Layers: Heat Islands */}
          {(activeLayer === 'all' || activeLayer === 'heat') && (
            <>
              {/* Downtown Urban Heat Core */}
              <circle cx="48" cy="35" r="18" fill="url(#heatCoreGradient)" className="animate-pulse" />
              <circle cx="34" cy="44" r="12" fill="url(#heatCoreGradient)" opacity="0.8" />
              {/* Heat flow contours */}
              <path
                d="M 35,28 C 45,22 55,28 62,35 C 60,45 45,48 38,44 Z"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="0.4"
                strokeDasharray="2,1"
              />
            </>
          )}

          {/* Dynamic Hazard Layers: Flood Inundation Zones */}
          {(activeLayer === 'all' || activeLayer === 'flood') && (
            <>
              {/* Riverfront Floodplain Basin */}
              <circle cx="72" cy="62" r="16" fill="url(#floodBasinGradient)" className="animate-pulse" />
              <circle cx="62" cy="58" r="11" fill="url(#floodBasinGradient)" opacity="0.9" />
              {/* Flood surge vectors */}
              <path
                d="M 60,52 Q 68,58 75,68"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="0.7"
                strokeDasharray="3,1"
              />
              <path
                d="M 68,60 Q 74,66 82,74"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="0.7"
                strokeDasharray="3,1"
              />
            </>
          )}

          {/* Dynamic Hazard Layers: AQI Plume */}
          {(activeLayer === 'all' || activeLayer === 'aqi') && (
            <ellipse cx="52" cy="38" rx="24" ry="14" fill="#a855f7" fillOpacity="0.12" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1,2" />
          )}

          {/* Zone Outlines & Labels */}
          <text x="32" y="16" fill="#64748b" fontSize="2.8" fontFamily="sans-serif" fontWeight="600" opacity="0.7">
            NORTH SUBURBS
          </text>
          <text x="38" y="32" fill="#94a3b8" fontSize="2.8" fontFamily="sans-serif" fontWeight="600" opacity="0.8">
            DOWNTOWN CORE
          </text>
          <text x="70" y="48" fill="#38bdf8" fontSize="2.8" fontFamily="sans-serif" fontWeight="600" opacity="0.9">
            RIVERFRONT BASIN
          </text>
          <text x="68" y="92" fill="#64748b" fontSize="2.8" fontFamily="sans-serif" fontWeight="600" opacity="0.7">
            HARBOR LOGISTICS
          </text>
        </svg>

        {/* Interactive Asset Pins */}
        {assets.map(asset => {
          const isSelected = selectedAssetId === asset.id;
          const isCritical = asset.currentRisk === 'critical';
          const isHigh = asset.currentRisk === 'high';

          const pinColor = isCritical
            ? 'bg-rose-500 text-rose-100 ring-rose-400'
            : isHigh
            ? 'bg-amber-500 text-amber-100 ring-amber-400'
            : 'bg-emerald-500 text-emerald-100 ring-emerald-400';

          return (
            <div
              key={asset.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 group"
              style={{
                left: `${asset.coordinates.mapX}%`,
                top: `${asset.coordinates.mapY}%`,
              }}
              onClick={() => handleAssetClick(asset)}
              onMouseEnter={() => setHoveredAsset(asset)}
              onMouseLeave={() => setHoveredAsset(null)}
            >
              {/* Radar Pulse Ring for Critical/High */}
              {(isCritical || isHigh) && (
                <div
                  className={`absolute -inset-2 rounded-full animate-ping opacity-40 ${
                    isCritical ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />
              )}

              {/* Pin Marker */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-transform ${
                  isSelected ? 'scale-125 ring-4' : 'scale-100 group-hover:scale-110 ring-2'
                } ${pinColor} w-7 h-7 shadow-lg`}
              >
                <MapPin className="w-4 h-4" />
              </div>

              {/* Compact Floating Label */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity shadow-md">
                {asset.code}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Control Overlay (Top Left: Layer Filters) */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg text-xs">
        <button
          onClick={() => setActiveLayer('all')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            activeLayer === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Composite
        </button>
        <button
          onClick={() => setActiveLayer('heat')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            activeLayer === 'heat'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Heat Island</span>
        </button>
        <button
          onClick={() => setActiveLayer('flood')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            activeLayer === 'flood'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>Flood Inundation</span>
        </button>
        <button
          onClick={() => setActiveLayer('aqi')}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
            activeLayer === 'aqi'
              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
              : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <Wind className="w-3 h-3 text-purple-400" />
          <span>AQI Dispersion</span>
        </button>
      </div>

      {/* Map Style Switcher (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg text-xs">
        <button
          onClick={() => setMapMode('vector')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            mapMode === 'vector' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vector GIS
        </button>
        <button
          onClick={() => setMapMode('satellite')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            mapMode === 'satellite' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite Heat
        </button>
        <button
          onClick={() => setMapMode('drone')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            mapMode === 'drone' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          Drone Inundation
        </button>
      </div>

      {/* Zoom / Navigation Controls (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1">
        <button
          onClick={() => setZoomLevel(z => Math.min(1.6, z + 0.2))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(z => Math.max(0.9, z - 0.2))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hovered / Active Asset Card Overlay (Bottom Left) */}
      {hoveredAsset && (
        <div className="absolute bottom-3 left-3 z-30 max-w-sm bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg p-3 shadow-2xl text-slate-200 animate-in fade-in duration-100">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="text-xs font-bold text-white truncate">{hoveredAsset.name}</div>
            <span
              className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                hoveredAsset.currentRisk === 'critical'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                  : hoveredAsset.currentRisk === 'high'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
              }`}
            >
              {hoveredAsset.currentRisk} risk
            </span>
          </div>

          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1.5">
            <span>{hoveredAsset.zone}</span>
            <span>·</span>
            <span className="font-mono">{hoveredAsset.code}</span>
            <span>·</span>
            <span>{hoveredAsset.activeSensors} sensors</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1.5 px-2 bg-slate-950/60 rounded border border-slate-800/80 font-mono text-[11px] mb-2">
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Ambient</div>
              <div className="text-rose-400 font-semibold">{hoveredAsset.lastTelemetry.ambientTempC}°C</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Rainfall</div>
              <div className="text-cyan-400 font-semibold">{hoveredAsset.lastTelemetry.rainfallRateMmHr} mm/h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Flood Idx</div>
              <div className="text-blue-400 font-semibold">{hoveredAsset.lastTelemetry.floodInundationIndex}/100</div>
            </div>
          </div>

          <button
            onClick={() => handleAssetClick(hoveredAsset)}
            className="w-full py-1 text-center text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Asset Inspection</span>
          </button>
        </div>
      )}

      {/* Map Legend */}
      <div className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 items-center gap-4 px-3 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Nominal (Low)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Elevated (High)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Threshold Breach (Critical)
        </span>
      </div>
    </div>
  );
};
