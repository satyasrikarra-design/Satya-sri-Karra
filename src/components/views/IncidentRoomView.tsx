import React, { useState } from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { EmergencyIncident, IncidentStatus, IncidentSeverity } from '../../types';
import {
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  TrendingUp,
  FileText,
  Plus,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export const IncidentRoomView: React.FC = () => {
  const {
    incidents,
    assets,
    updateIncidentStatus,
    assignIncident,
    escalateIncident,
    createManualIncident,
    userRole,
  } = useClimateShield();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // New incident state form
  const [manualAssetId, setManualAssetId] = useState(assets[0]?.id || '');
  const [manualTitle, setManualTitle] = useState('');
  const [manualHazard, setManualHazard] = useState<EmergencyIncident['hazardType']>('extreme_heat');
  const [manualSeverity, setManualSeverity] = useState<IncidentSeverity>('high');
  const [manualSummary, setManualSummary] = useState('');

  const filteredIncidents = incidents.filter(i => {
    if (filterStatus === 'active') return i.status !== 'resolved';
    if (filterStatus === 'resolved') return i.status === 'resolved';
    return true;
  });

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || filteredIncidents[0];

  const handleAddAuditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !activeIncident) return;
    updateIncidentStatus(activeIncident.id, activeIncident.status, newNoteInput.trim());
    setNewNoteInput('');
  };

  const handleCreateManualIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find(a => a.id === manualAssetId);
    createManualIncident({
      assetId: manualAssetId,
      assetName: asset ? asset.name : 'Municipal Asset',
      title: manualTitle || 'Manual Hazard Alert',
      summary: manualSummary || 'Operational dispatch initiated manually via command interface.',
      hazardType: manualHazard,
      severity: manualSeverity,
    });
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualSummary('');
  };

  const statusSteps: IncidentStatus[] = ['triggered', 'assigned', 'in_progress', 'escalated', 'resolved'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Emergency Incident & Response Operations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active crisis workflows, escalation matrices, responder dispatch, and tamper-evident audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-md text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterStatus === 'active' ? 'bg-slate-800 text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({incidents.filter(i => i.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterStatus === 'resolved' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved ({incidents.filter(i => i.status === 'resolved').length})
            </button>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Incidents List (Left) & Active Workflow Triage Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incidents Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Incident Triage Queue</span>
            <span className="font-mono text-[11px]">{filteredIncidents.length} shown</span>
          </div>

          <div className="space-y-2.5">
            {filteredIncidents.map(inc => {
              const isSelected = activeIncident?.id === inc.id;
              const isCritical = inc.severity === 'critical';
              const isResolved = inc.status === 'resolved';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-cyan-500 bg-slate-900 shadow-md ring-1 ring-cyan-500'
                      : isResolved
                      ? 'border-slate-800 bg-slate-900/40 opacity-75 hover:opacity-100 hover:border-slate-700'
                      : isCritical
                      ? 'border-rose-900/60 bg-slate-900/70 hover:border-rose-700'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">{inc.id}</span>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          : isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{inc.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{inc.summary}</p>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{inc.elapsedMinutes}m / {inc.slaDeadlineMinutes}m SLA</span>
                    </span>
                    <span className="text-slate-300">{inc.assetName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Incident Command Deck (7 Cols) */}
        {activeIncident ? (
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{activeIncident.id}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{activeIncident.assetName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono uppercase font-bold px-2.5 py-0.5 rounded ${
                      activeIncident.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {activeIncident.severity} · Escalation Tier {activeIncident.escalationLevel}
                  </span>
                </div>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{activeIncident.title}</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeIncident.summary}</p>
            </div>

            {/* Workflow Progression Stepper */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Operational Lifecycle Transition
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {statusSteps.map((step, idx) => {
                  const currentIdx = statusSteps.indexOf(activeIncident.status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = activeIncident.status === step;

                  return (
                    <button
                      key={step}
                      onClick={() => updateIncidentStatus(activeIncident.id, step)}
                      className={`py-2 px-1 rounded text-center text-[10px] font-medium transition-all flex flex-col items-center justify-center gap-1 border ${
                        isCurrent
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold ring-1 ring-cyan-500/50'
                          : isDone
                          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="capitalize">{step.replace('_', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit Assignment */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Assigned Task Force</span>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {activeIncident.assignedTo || 'Unassigned — Needs Responder'}
                </div>
                <div className="flex gap-2 pt-1">
                  <select
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    onChange={e => {
                      if (e.target.value) assignIncident(activeIncident.id, e.target.value);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Reassign Responder Crew...</option>
                    <option value="Rapid Thermal Shedding Crew (Unit Alpha)">Rapid Thermal Shedding Crew (Unit Alpha)</option>
                    <option value="Municipal Storm Response Battalions 3 & 4">Storm Response Battalions 3 & 4</option>
                    <option value="Transit Hydraulic Pump Team">Transit Hydraulic Pump Team</option>
                    <option value="City Facility Engineering Battalion">City Facility Engineering Battalion</option>
                  </select>
                </div>
              </div>

              {/* Escalation Matrix */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span>Escalation Protocol</span>
                </div>
                <div className="text-xs text-slate-300">
                  Current Level: <span className="font-mono font-bold text-rose-400">Tier {activeIncident.escalationLevel}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => escalateIncident(activeIncident.id, 2, 'Escalated to Tier 2 Municipal Emergency')}
                    disabled={activeIncident.escalationLevel >= 2}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-xs rounded border border-slate-800 text-slate-200 transition-colors"
                  >
                    Level 2 (Metro)
                  </button>
                  <button
                    onClick={() => escalateIncident(activeIncident.id, 3, 'Escalated to Tier 3 State Civil Defense')}
                    disabled={activeIncident.escalationLevel >= 3}
                    className="flex-1 py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 disabled:opacity-50 text-xs rounded border border-rose-800 text-rose-200 transition-colors"
                  >
                    Level 3 (State)
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Trail & Live Log Entries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Tamper-Evident Operational Audit Trail</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{activeIncident.auditTrail.length} entries</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
                {activeIncident.auditTrail.map(log => (
                  <div key={log.id} className="p-2.5 bg-slate-950/80 rounded border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">{log.timestamp}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-200">{log.actor}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.role})</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{log.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-2 border-l border-slate-800">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <form onSubmit={handleAddAuditNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Record operational update or dispatch note..."
                  value={newNoteInput}
                  onChange={e => setNewNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newNoteInput.trim()}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-lg p-12 text-center text-slate-400 text-xs">
            No incident selected. Select one from the queue or declare a new incident.
          </div>
        )}
      </div>

      {/* Manual Incident Declaration Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Declare Emergency Incident</h2>
                  <p className="text-xs text-slate-400">Dispatch immediate response workflow</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateManualIncident} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Infrastructure Asset</label>
                <select
                  value={manualAssetId}
                  onChange={e => setManualAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Severe Sump Overflow at Substation"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hazard Category</label>
                  <select
                    value={manualHazard}
                    onChange={e => setManualHazard(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="extreme_heat">Extreme Heat</option>
                    <option value="flash_flood">Flash Flood</option>
                    <option value="waterlogging">Waterlogging</option>
                    <option value="severe_rainfall">Severe Rainfall</option>
                    <option value="air_quality">Air Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Severity</label>
                  <select
                    value={manualSeverity}
                    onChange={e => setManualSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="critical">Critical (Immediate Hazard)</option>
                    <option value="high">High (Elevated Threat)</option>
                    <option value="medium">Medium (Standby Alert)</option>
                    <option value="low">Low (Precautionary)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Situation Summary</label>
                <textarea
                  rows={3}
                  placeholder="Provide preliminary sensor readings or field observations..."
                  value={manualSummary}
                  onChange={e => setManualSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded transition-colors"
                >
                  Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
