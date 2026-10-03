import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Square,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  Waves,
  Zap,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface BottomActionPanelProps {
  locationName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  onNavigateToIncidents?: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  category: 'heat' | 'flood' | 'grid';
  priority: 'urgent' | 'high' | 'routine';
  completed: boolean;
}

export const BottomActionPanel: React.FC<BottomActionPanelProps> = ({
  locationName,
  riskLevel,
  onNavigateToIncidents,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act-1',
      title: 'Deploy mobile diesel dewatering pumps to low-lying drainage canals',
      category: 'flood',
      priority: 'urgent',
      completed: false,
    },
    {
      id: 'act-2',
      title: 'Activate designated municipal air-conditioned cooling centers',
      category: 'heat',
      priority: 'urgent',
      completed: false,
    },
    {
      id: 'act-3',
      title: 'Enact automated phase cooling & load diversion on local substations',
      category: 'grid',
      priority: 'high',
      completed: true,
    },
    {
      id: 'act-4',
      title: 'Deploy automated pneumatic flood barrier gates along riverfront sector',
      category: 'flood',
      priority: 'high',
      completed: false,
    },
    {
      id: 'act-5',
      title: 'Transmit cell-broadcast heat & flash flood advisory to vulnerable wards',
      category: 'heat',
      priority: 'routine',
      completed: true,
    },
  ]);

  const toggleAction = (id: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const completedCount = actions.filter(a => a.completed).length;

  return (
    <div className="absolute bottom-24 left-4 z-20 pointer-events-auto max-w-sm sm:max-w-md w-full">
      {/* Drawer Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 bg-[#0b0f17]/90 backdrop-blur-xl border border-slate-800/90 rounded-t-xl hover:bg-slate-900/90 transition-colors flex items-center justify-between shadow-2xl text-xs text-white"
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              riskLevel === 'critical'
                ? 'bg-rose-500 animate-ping'
                : riskLevel === 'high'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="font-bold text-xs">Tactical Response & Mitigation Actions</span>
          <span className="text-[11px] font-mono text-cyan-400">
            ({completedCount}/{actions.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 hover:text-white">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Minimize' : 'Expand Checklist'}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Drawer Content */}
      {isOpen && (
        <div className="bg-[#0b0f17]/95 backdrop-blur-2xl border-x border-b border-slate-800/90 rounded-b-xl p-3.5 space-y-3.5 text-xs shadow-2xl animate-in slide-in-from-bottom-2 duration-150 max-h-80 overflow-y-auto">
          {/* Active Alerts Strip */}
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Active Sector Advisories: {locationName}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-rose-900/70 text-rose-200 px-1.5 py-0.2 rounded font-bold">
                {riskLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Wet-bulb temperature and storm runoff vectors exceed Tier 2 municipal thresholds. Execute the standard operational protocol below.
            </p>
          </div>

          {/* Recommended Actions Checklist */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              <span>Standard Operational Response Protocol</span>
              <span className="text-cyan-400 font-sans">Municipal SOP</span>
            </div>

            <div className="space-y-1.5">
              {actions.map(action => (
                <div
                  key={action.id}
                  onClick={() => toggleAction(action.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                    action.completed
                      ? 'bg-slate-950/40 border-slate-800 text-slate-400 line-through'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:border-cyan-500'
                  }`}
                >
                  <button className="mt-0.5 text-cyan-400 shrink-0">
                    {action.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 text-xs">
                    <span>{action.title}</span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono not-italic">
                      <span
                        className={`px-1 rounded ${
                          action.priority === 'urgent'
                            ? 'text-rose-400 bg-rose-950/80'
                            : 'text-amber-400 bg-amber-950/80'
                        }`}
                      >
                        {action.priority.toUpperCase()}
                      </span>
                      <span className="text-slate-400">Category: {action.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick link to full incident room */}
          {onNavigateToIncidents && (
            <button
              onClick={onNavigateToIncidents}
              className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-cyan-300 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open Emergency Operations Room &rarr;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
