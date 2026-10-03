import React, { useState } from 'react';
import { ClimateShieldProvider, useClimateShield } from './context/ClimateShieldContext';
import { TopNav } from './components/TopNav';
import { CommandCenterView } from './components/views/CommandCenterView';
import { AssetManagerView } from './components/views/AssetManagerView';
import { IncidentRoomView } from './components/views/IncidentRoomView';
import { ObservabilityView } from './components/views/ObservabilityView';
import { BillingEsgView } from './components/views/BillingEsgView';
import { ZoomEarthGIS } from './components/zoom-earth/ZoomEarthGIS';

const MainContent: React.FC = () => {
  const { activeTab, systemHealth, assets, incidents } = useClimateShield();
  const [viewMode, setViewMode] = useState<'earth_gis' | 'enterprise'>('earth_gis');

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;

  if (viewMode === 'earth_gis') {
    return <ZoomEarthGIS onSwitchToEnterprise={() => setViewMode('enterprise')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100">
      <TopNav onOpenEarthGis={() => setViewMode('earth_gis')} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <CommandCenterView />}
        {activeTab === 'assets' && <AssetManagerView />}
        {activeTab === 'incidents' && <IncidentRoomView />}
        {activeTab === 'observability' && <ObservabilityView />}
        {activeTab === 'billing' && <BillingEsgView />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#080c14] py-4 text-xs text-slate-400">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ClimateShield Resilience Platform</span>
            <span>·</span>
            <span>Urban Climate Risk Engine</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">{assets.length} Assets Monitored</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setViewMode('earth_gis')}
              className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-sans"
            >
              <span>Switch to Interactive GIS Map &rarr;</span>
            </button>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.circuitBreaker === 'CLOSED'
                    ? 'bg-emerald-400'
                    : systemHealth.circuitBreaker === 'HALF_OPEN'
                    ? 'bg-amber-400'
                    : 'bg-rose-400 animate-pulse'
                }`}
              />
              <span>Circuit: {systemHealth.circuitBreaker}</span>
            </span>
            <span>·</span>
            <span>Active Incidents: {activeIncidentsCount}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClimateShieldProvider>
      <MainContent />
    </ClimateShieldProvider>
  );
}
