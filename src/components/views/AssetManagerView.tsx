import React, { useState } from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { InfrastructureAsset } from '../../types';
import { NewAssetModal } from '../modals/NewAssetModal';
import {
  ShieldAlert,
  Sliders,
  Plus,
  Search,
  Filter,
  Flame,
  Droplets,
  Wind,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export const AssetManagerView: React.FC = () => {
  const { assets, updateAssetThresholds, selectedAssetId, setSelectedAssetId, userRole } = useClimateShield();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [editingThresholdsAssetId, setEditingThresholdsAssetId] = useState<string | null>(null);

  // Filtered assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'all' || asset.zone === selectedZone;
    const matchesRisk = selectedRisk === 'all' || asset.currentRisk === selectedRisk;
    return matchesSearch && matchesZone && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Infrastructure Asset & Resilience Registry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-hazard telemetry, vulnerability indices, and dynamic threshold calibration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Infrastructure Asset</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by facility name, code, or zone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Zone:</span>
          </span>
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 shrink-0"
          >
            <option value="all">All Zones</option>
            <option value="Downtown Core">Downtown Core</option>
            <option value="Riverfront Basin">Riverfront Basin</option>
            <option value="Industrial District">Industrial District</option>
            <option value="North Suburbs">North Suburbs</option>
            <option value="Harbor Logistics">Harbor Logistics</option>
          </select>

          <span className="text-slate-400 shrink-0 ml-2">Risk:</span>
          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 shrink-0"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAssets.map(asset => {
          const isSelected = selectedAssetId === asset.id;
          const isEditing = editingThresholdsAssetId === asset.id;
          const isCritical = asset.currentRisk === 'critical';
          const isHigh = asset.currentRisk === 'high';

          return (
            <div
              key={asset.id}
              className={`rounded-lg p-5 flex flex-col justify-between border transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-500 bg-slate-900 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500'
                  : isCritical
                  ? 'border-rose-900/70 bg-slate-900/80 hover:border-rose-700'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-semibold">{asset.code}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-400">{asset.category.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{asset.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                        : isHigh
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                    }`}
                  >
                    {asset.currentRisk} Risk
                  </span>
                </div>

                {/* Subtitle Info */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-3">
                  <span>{asset.zone}</span>
                  <span>·</span>
                  <span>{asset.criticality.replace('_', ' ').toUpperCase()}</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{asset.activeSensors} Sensors</span>
                  <span>·</span>
                  <span className="text-slate-400">Updated {asset.lastUpdated}</span>
                </div>

                {/* Live Telemetry Matrix */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/70 rounded border border-slate-800/80 mb-3 text-xs font-mono">
                  {/* Heat */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Heat / Index</span>
                    </div>
                    <div className="text-white font-semibold">
                      <span className={asset.lastTelemetry.ambientTempC >= asset.thresholds.heatMaxC ? 'text-rose-400' : ''}>
                        {asset.lastTelemetry.ambientTempC}°C
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Max {asset.thresholds.heatMaxC}°C</div>
                  </div>

                  {/* Rainfall / Water */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>Rain Intensity</span>
                    </div>
                    <div className="text-white font-semibold">
                      <span className={asset.lastTelemetry.rainfallRateMmHr >= asset.thresholds.rainfallMaxMmHr ? 'text-cyan-400' : ''}>
                        {asset.lastTelemetry.rainfallRateMmHr} mm/h
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Max {asset.thresholds.rainfallMaxMmHr}</div>
                  </div>

                  {/* Flood Inundation */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <Activity className="w-3 h-3 text-blue-400" />
                      <span>Flood Index</span>
                    </div>
                    <div className="text-white font-semibold">
                      <span className={asset.lastTelemetry.floodInundationIndex >= asset.thresholds.floodMaxIndex ? 'text-rose-400' : ''}>
                        {asset.lastTelemetry.floodInundationIndex}/100
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Max {asset.thresholds.floodMaxIndex}</div>
                  </div>
                </div>

                {/* Vulnerability & Resilience Ratings */}
                <div className="space-y-2 mb-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Vulnerability Index</span>
                      <span className="font-mono text-slate-200">{asset.vulnerabilityScore}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${asset.vulnerabilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Resilience Safeguards</span>
                      <span className="font-mono text-emerald-400">{asset.resilienceRating}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500"
                        style={{ width: `${asset.resilienceRating}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Safeguards Checklist */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                    Mitigation Protocols Active
                  </div>
                  <div className="space-y-1">
                    {asset.mitigationMeasures.slice(0, 2).map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable Threshold Calibration Form */}
                {isEditing && (
                  <div className="p-3 bg-slate-950/80 rounded border border-cyan-800/60 mb-3 space-y-2 text-xs animate-in fade-in">
                    <div className="font-semibold text-cyan-300 flex items-center justify-between">
                      <span>Dynamic Threshold Calibration</span>
                      <span className="text-[10px] text-slate-400 font-normal">Immediate auto-recalc</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Heat Trigger: {asset.thresholds.heatMaxC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="32"
                        max="48"
                        step="0.5"
                        value={asset.thresholds.heatMaxC}
                        onChange={e => updateAssetThresholds(asset.id, { heatMaxC: parseFloat(e.target.value) })}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Rainfall Trigger: {asset.thresholds.rainfallMaxMmHr} mm/h</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        step="2"
                        value={asset.thresholds.rainfallMaxMmHr}
                        onChange={e => updateAssetThresholds(asset.id, { rainfallMaxMmHr: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Flood Inundation Trigger: {asset.thresholds.floodMaxIndex}/100</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="90"
                        step="1"
                        value={asset.thresholds.floodMaxIndex}
                        onChange={e => updateAssetThresholds(asset.id, { floodMaxIndex: parseInt(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingThresholdsAssetId(isEditing ? null : asset.id)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                    isEditing
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Tuning' : 'Calibrate Thresholds'}</span>
                </button>

                <button
                  onClick={() => setSelectedAssetId(isSelected ? null : asset.id)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1"
                >
                  <span>{isSelected ? 'Deselect' : 'Pin on Map'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <NewAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
