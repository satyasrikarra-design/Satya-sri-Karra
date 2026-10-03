import React, { useState } from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import { BILLING_PLANS, INITIAL_ESG_REPORT } from '../../data/mockInitialData';
import {
  CreditCard,
  Download,
  Check,
  TrendingUp,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const BillingEsgView: React.FC = () => {
  const { assets } = useClimateShield();

  const [activePlanId, setActivePlanId] = useState<string>('plan-smart-city');
  const [complianceFramework, setComplianceFramework] = useState<'TCFD' | 'CSRD' | 'ISO 14090'>('TCFD');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const selectedPlan = BILLING_PLANS.find(p => p.id === activePlanId) || BILLING_PLANS[1];

  // Calculate bill based on monitored assets count
  const assetCount = assets.length;
  const totalMonthlyPrice = selectedPlan.basePriceMonthly + assetCount * selectedPlan.perAssetMonthly;

  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const csvContent =
        `ClimateShield ESG & Resilience Disclosure Report\n` +
        `Framework,${complianceFramework}\n` +
        `Generated,${new Date().toISOString()}\n` +
        `Protected Assets,${assetCount}\n` +
        `Estimated Damage Avoided,USD 14250000\n` +
        `City Resilience Rating,84.6/100\n` +
        `Carbon Offset,412.8 Tonnes CO2e\n` +
        `Flood Inundations Mitigated,19\n` +
        `Heat Inversions Managed,34\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ClimateShield_${complianceFramework}_Resilience_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`Exported ${complianceFramework} compliance disclosure`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Licensing, Usage & ESG Disclosures</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            SaaS subscription tiers, per-node metering, and TCFD/CSRD urban climate resilience auditing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/40"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Compiling Report...' : `Export ${complianceFramework} Audit`}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-700/80 rounded-lg text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess} successfully downloaded to your device.</span>
        </div>
      )}

      {/* Section 1: ESG Resilience Compliance Summary */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-bold text-white">Urban Climate ESG Disclosure Summary</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable sustainability impact & insured asset protection metrics
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Framework:</span>
            <div className="flex p-0.5 bg-slate-950 border border-slate-800 rounded">
              {(['TCFD', 'CSRD', 'ISO 14090'] as const).map(fw => (
                <button
                  key={fw}
                  onClick={() => setComplianceFramework(fw)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    complianceFramework === fw ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ESG Numbers Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-950/60 rounded border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">City Resilience Index</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {INITIAL_ESG_REPORT.cityResilienceScore}/100
            </div>
            <div className="text-[10px] text-slate-400">+4.2 pts since Q2 baseline</div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Estimated Damage Avoided</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              $14.25M
            </div>
            <div className="text-[10px] text-slate-400">Validated actuarial estimate</div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Flood Inundations Defended</div>
            <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
              19
            </div>
            <div className="text-[10px] text-slate-400">Zero uncontained sewer spills</div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Pump Energy Carbon Offset</div>
            <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
              412.8t
            </div>
            <div className="text-[10px] text-slate-400">CO2e eliminated via load shedding</div>
          </div>
        </div>
      </div>

      {/* Section 2: Enterprise Licensing Tiers */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-white">Enterprise Licensing & Subscription Tiers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent municipal consumption model based on registered infrastructure assets
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {BILLING_PLANS.map(plan => {
            const isSelected = activePlanId === plan.id;
            const projectedPrice = plan.basePriceMonthly + assetCount * plan.perAssetMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-lg p-5 flex flex-col justify-between border transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-slate-900 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      {plan.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                        Current Active Plan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{plan.tagline}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-3xl font-bold text-white">${plan.basePriceMonthly.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">/mo base</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      + ${plan.perAssetMonthly} per monitored asset / mo
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80 mb-4 text-xs font-mono">
                    <div className="text-slate-400 text-[11px] font-sans">Projected With Your {assetCount} Assets:</div>
                    <div className="text-lg font-bold text-cyan-300 mt-0.5">
                      ${projectedPrice.toLocaleString()} / month
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Capabilities Included:
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400">
                    SLA: <span className="text-slate-200">{plan.slaGuarantee}</span>
                  </div>
                  <button
                    onClick={() => setActivePlanId(plan.id)}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded transition-colors ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? 'Current Active Tier' : 'Upgrade to This Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Live API Usage & Quota Meter */}
      <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Municipal API Usage & Ingestion Quota</h3>
            <p className="text-xs text-slate-400">Telemetry endpoints consumption this monthly cycle</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            1,420,890 / {selectedPlan.apiCallsLimit.toLocaleString()} Calls (28.4%)
          </span>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[28.4%]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 font-mono">
            <div className="text-slate-400 text-[11px] font-sans">Remaining Headroom</div>
            <div className="text-white font-semibold mt-0.5">3,579,110 calls</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 font-mono">
            <div className="text-slate-400 text-[11px] font-sans">SLA Compliance Rate</div>
            <div className="text-emerald-400 font-semibold mt-0.5">99.994% Uptime</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 font-mono">
            <div className="text-slate-400 text-[11px] font-sans">Next Invoice Date</div>
            <div className="text-slate-300 font-semibold mt-0.5">Nov 1, 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};
