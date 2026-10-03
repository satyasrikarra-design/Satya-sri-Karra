import React, { useState } from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { InfrastructureAsset } from '../../types';
import { X, Plus, ShieldCheck } from 'lucide-react';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({ isOpen, onClose }) => {
  const { addAsset } = useClimateShield();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<InfrastructureAsset['category']>('power_grid');
  const [zone, setZone] = useState<InfrastructureAsset['zone']>('Downtown Core');
  const [criticality, setCriticality] = useState<InfrastructureAsset['criticality']>('tier_1');
  const [vulnerabilityScore, setVulnerabilityScore] = useState(65);
  const [resilienceRating, setResilienceRating] = useState(70);
  const [heatMaxC, setHeatMaxC] = useState(38.0);
  const [rainfallMaxMmHr, setRainfallMaxMmHr] = useState(40.0);
  const [floodMaxIndex, setFloodMaxIndex] = useState(65);
  const [waterloggingMaxCm, setWaterloggingMaxCm] = useState(14.0);
  const [aqiMax, setAqiMax] = useState(130);
  const [mitigationInput, setMitigationInput] = useState('Automated sump pumps, Backup diesel generation');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    // Pick random coordinate within zone
    const zoneCoords: Record<string, { lat: number; lng: number; mapX: number; mapY: number }> = {
      'Downtown Core': { lat: 37.7749, lng: -122.4194, mapX: 44, mapY: 38 },
      'Riverfront Basin': { lat: 37.7850, lng: -122.4050, mapX: 70, mapY: 62 },
      'Industrial District': { lat: 37.7600, lng: -122.4000, mapX: 58, mapY: 72 },
      'North Suburbs': { lat: 37.8050, lng: -122.4300, mapX: 30, mapY: 22 },
      'Harbor Logistics': { lat: 37.7500, lng: -122.3800, mapX: 80, mapY: 80 },
    };

    const coord = zoneCoords[zone] || { lat: 37.77, lng: -122.41, mapX: 50, mapY: 50 };

    addAsset({
      name,
      code: code.toUpperCase(),
      category,
      zone,
      criticality,
      coordinates: coord,
      currentRisk: 'low',
      vulnerabilityScore,
      resilienceRating,
      activeSensors: Math.floor(40 + Math.random() * 80),
      status: 'nominal',
      thresholds: {
        heatMaxC,
        rainfallMaxMmHr,
        floodMaxIndex,
        waterloggingMaxCm,
        aqiMax,
      },
      lastTelemetry: {
        ambientTempC: 28.5,
        wetBulbGlobeTempC: 24.0,
        heatIndexC: 30.0,
        rainfallRateMmHr: 4.0,
        waterloggingDepthCm: 1.0,
        floodInundationIndex: 22,
        aqi: 65,
        pm25: 18.0,
        windSpeedKmh: 14.0,
        relativeHumidity: 60,
      },
      mitigationMeasures: mitigationInput.split(',').map(s => s.trim()).filter(Boolean),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Register Infrastructure Asset</h2>
              <p className="text-xs text-slate-400">Commission new facility into the resilience telemetry mesh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Asset Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Central Desalination Substation"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Asset Code</label>
              <input
                type="text"
                required
                placeholder="e.g., WTR-DESAL-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="power_grid">Power Grid</option>
                <option value="transit">Transit & Rail</option>
                <option value="healthcare">Healthcare</option>
                <option value="water_facility">Water Facility</option>
                <option value="education">Education</option>
                <option value="logistics">Logistics Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Geographic Zone</label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Downtown Core">Downtown Core</option>
                <option value="Riverfront Basin">Riverfront Basin</option>
                <option value="Industrial District">Industrial District</option>
                <option value="North Suburbs">North Suburbs</option>
                <option value="Harbor Logistics">Harbor Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Criticality Tier</label>
              <select
                value={criticality}
                onChange={e => setCriticality(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="tier_1">Tier 1 (Life Critical)</option>
                <option value="tier_2">Tier 2 (Essential)</option>
                <option value="tier_3">Tier 3 (Standard)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Hazard Threshold Setup */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Dynamic Hazard Threshold Triggers</span>
              <span className="text-[11px] text-slate-400 font-normal">Automated breach alarms</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Heat Breach Alert (°C)</span>
                  <span className="font-mono text-rose-400">{heatMaxC}°C</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="50"
                  step="0.5"
                  value={heatMaxC}
                  onChange={e => setHeatMaxC(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Rainfall Intensity (mm/h)</span>
                  <span className="font-mono text-cyan-400">{rainfallMaxMmHr} mm/h</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={rainfallMaxMmHr}
                  onChange={e => setRainfallMaxMmHr(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Flood Inundation Index</span>
                  <span className="font-mono text-blue-400">{floodMaxIndex}/100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="2"
                  value={floodMaxIndex}
                  onChange={e => setFloodMaxIndex(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Waterlogging Runoff (cm)</span>
                  <span className="font-mono text-indigo-400">{waterloggingMaxCm} cm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={waterloggingMaxCm}
                  onChange={e => setWaterloggingMaxCm(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Mitigation Measures */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Active Mitigation Safeguards (comma separated)
            </label>
            <input
              type="text"
              value={mitigationInput}
              onChange={e => setMitigationInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Resilience Scores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Vulnerability Index (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={vulnerabilityScore}
                onChange={e => setVulnerabilityScore(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Resilience Rating (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={resilienceRating}
                onChange={e => setResilienceRating(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Deploy Asset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
