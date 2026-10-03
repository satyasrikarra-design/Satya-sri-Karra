import React, { useState } from 'react';
import { useClimateShield } from '../context/ClimateShieldContext';
import { UserRole } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface TopNavProps {
  onOpenEarthGis?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenEarthGis }) => {
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    notifications,
    markNotificationsAsRead,
    isStreamPaused,
    setIsStreamPaused,
    triggerTelemetryBurst,
    systemHealth,
  } = useClimateShield();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; desc: string }> = {
    city_operator: { label: 'City Operator', desc: 'Municipal Admin & Grid Control' },
    first_responder: { label: 'First Responder', desc: 'Field Disaster Management' },
    facility_manager: { label: 'Facility Manager', desc: 'Asset Thresholds & Mitigation' },
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Center' },
    { id: 'assets', label: 'Assets & Hazards' },
    { id: 'incidents', label: 'Incident Room' },
    { id: 'observability', label: 'Observability' },
    { id: 'billing', label: 'Billing & ESG' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f17]/95 backdrop-blur border-b border-slate-800/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-sm shadow-cyan-500/20">
              CS
            </div>
            <span>ClimateShield</span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive GIS Map switch button */}
          {onOpenEarthGis && (
            <button
              onClick={onOpenEarthGis}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 rounded-md transition-colors shadow-sm"
              title="Switch to Interactive GIS Map"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Interactive GIS Map</span>
            </button>
          )}

          {/* Telemetry Stream Control */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
            <button
              onClick={() => setIsStreamPaused(p => !p)}
              title={isStreamPaused ? 'Resume live IoT stream' : 'Pause live IoT stream'}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1"
            >
              {isStreamPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-amber-400 font-mono text-[11px]">Stream Paused</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xl:inline text-emerald-400 font-mono text-[11px]">Stream Active</span>
                </>
              )}
            </button>

            <button
              onClick={triggerTelemetryBurst}
              disabled={systemHealth.isSimulatingBurst}
              title="Inject sudden 5,000 evt/s telemetry surge"
              className={`p-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1 border ${
                systemHealth.isSimulatingBurst
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${systemHealth.isSimulatingBurst ? 'animate-pulse text-amber-400' : ''}`} />
              <span className="hidden xl:inline text-[11px]">
                {systemHealth.isSimulatingBurst ? 'Surge Active...' : 'Simulate Surge'}
              </span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{roleLabels[userRole].label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-800 rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Operational Role
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map(roleKey => (
                  <button
                    key={roleKey}
                    onClick={() => {
                      setUserRole(roleKey);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex flex-col gap-0.5 ${
                      userRole === roleKey
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{roleLabels[roleKey].label}</span>
                    <span className="text-[11px] text-slate-400">{roleLabels[roleKey].desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertDrawer(!showAlertDrawer)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-md transition-colors relative"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showAlertDrawer && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f172a] border border-slate-800 rounded-lg shadow-2xl p-3 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowAlertDrawer(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Incident Notifications</span>
                    <span className="text-[11px] font-mono text-cyan-400">({notifications.length})</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-md text-xs border transition-colors ${
                        n.type === 'critical'
                          ? 'border-rose-900/60 bg-rose-950/20'
                          : 'border-slate-800 bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-medium text-slate-100">
                          {n.type === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          <span className="truncate">{n.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Simulated Kafka topic: alerts.broadcast</span>
                  <button
                    onClick={() => {
                      setActiveTab('incidents');
                      setShowAlertDrawer(false);
                    }}
                    className="text-cyan-400 hover:underline"
                  >
                    Open Incident Room &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
