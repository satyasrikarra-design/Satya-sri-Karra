import React from 'react';
import { useClimateShield } from '../../context/ClimateShieldContext';
import {
  Activity,
  Zap,
  RotateCcw,
  Trash2,
  AlertOctagon,
  Cpu,
  Layers,
  Database,
  Radio,
  Server,
} from 'lucide-react';

export const ObservabilityView: React.FC = () => {
  const {
    systemHealth,
    setCircuitBreakerManual,
    toggleCircuitBreakerState,
    triggerTelemetryBurst,
    toggleDowntimeFallback,
    deadLetterEvents,
    clearDeadLetterQueue,
    replayDeadLetterQueue,
  } = useClimateShield();

  const isBreakerOpen = systemHealth.circuitBreaker === 'OPEN';
  const isBreakerHalfOpen = systemHealth.circuitBreaker === 'HALF_OPEN';

  const topics = [
    { name: 'telemetry.climate.raw', rate: '920 msg/s', partitions: 8, lag: systemHealth.queueBacklog },
    { name: 'telemetry.hydrology.surge', rate: '380 msg/s', partitions: 6, lag: Math.floor(systemHealth.queueBacklog * 0.4) },
    { name: 'alerts.emergency.broadcast', rate: '12 msg/s', partitions: 3, lag: 0 },
    { name: 'audit.immutable.ledger', rate: '45 msg/s', partitions: 4, lag: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Observability & Resilient Pipeline</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed message queue streaming, circuit breaker orchestration, edge fallbacks & telemetry health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTelemetryBurst}
            disabled={systemHealth.isSimulatingBurst}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 border ${
              systemHealth.isSimulatingBurst
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200'
            }`}
          >
            <Zap className={`w-4 h-4 text-amber-400 ${systemHealth.isSimulatingBurst ? 'animate-bounce' : ''}`} />
            <span>{systemHealth.isSimulatingBurst ? 'Bursting 5,000 evt/s...' : 'Simulate Telemetry Burst'}</span>
          </button>
        </div>
      </div>

      {/* Circuit Breaker Status Banner */}
      <div
        className={`p-4 rounded-lg border transition-all ${
          isBreakerOpen
            ? 'bg-rose-950/40 border-rose-600 text-rose-200'
            : isBreakerHalfOpen
            ? 'bg-amber-950/40 border-amber-600 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded mt-0.5 ${
                isBreakerOpen
                  ? 'bg-rose-500/20 text-rose-400'
                  : isBreakerHalfOpen
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  Circuit Breaker State: <span className="font-mono">{systemHealth.circuitBreaker}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isBreakerOpen
                    ? `Tripped at ${systemHealth.circuitBreakerTrippedAt || 'Just now'}`
                    : isBreakerHalfOpen
                    ? 'Canary trial mode active'
                    : 'Ingestion pipeline healthy'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isBreakerOpen
                  ? 'High error rate threshold exceeded. Ingestion throttled to local edge cache buffers to prevent database cascade failure.'
                  : isBreakerHalfOpen
                  ? 'Routing 10% canary traffic through primary storage to test downstream health.'
                  : 'Normal operational telemetry flowing with sub-20ms SLA latency.'}
              </p>
            </div>
          </div>

          {/* Circuit Breaker Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCircuitBreakerManual('CLOSED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                systemHealth.circuitBreaker === 'CLOSED'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Force CLOSED
            </button>
            <button
              onClick={() => setCircuitBreakerManual('HALF_OPEN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                systemHealth.circuitBreaker === 'HALF_OPEN'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Set HALF-OPEN
            </button>
            <button
              onClick={() => setCircuitBreakerManual('OPEN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                systemHealth.circuitBreaker === 'OPEN'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Trip OPEN
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Processing Latency */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pipeline Latency</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
              {systemHealth.eventProcessingLatencyMs}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-slate-400">P99: 28ms · Target: &lt; 50ms</div>
        </div>

        {/* Metric 2: Queue Backlog */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kafka Backlog</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                systemHealth.queueBacklog > 150 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {systemHealth.queueBacklog}
            </span>
            <span className="text-xs text-slate-400 font-mono">Messages</span>
          </div>
          <div className="text-[11px] text-slate-400">Partitions drained in real time</div>
        </div>

        {/* Metric 3: Duplicates Dropped */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Deduplication Filter</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-purple-300 tabular-nums">
              {systemHealth.duplicatesFiltered}
            </span>
            <span className="text-xs text-slate-400 font-mono">Deduped</span>
          </div>
          <div className="text-[11px] text-slate-400">Bloom filter window: 120s</div>
        </div>

        {/* Metric 4: Dead-Letter Queue */}
        <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dead Letter Queue (DLQ)</span>
            <Database className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                deadLetterEvents.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {deadLetterEvents.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">Poison Pills</span>
          </div>
          <div className="text-[11px] text-slate-400">Awaiting triage / replay</div>
        </div>
      </div>

      {/* Resilient Queues & Fallbacks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Queue Partitions (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Streaming Message Queue Partitions (Kafka Sim)</h2>
              <p className="text-xs text-slate-400">Partition distribution across climate ingestion nodes</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Broker Cluster Healthy</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {topics.map(t => (
              <div key={t.name} className="p-3 bg-slate-950/70 rounded border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono font-semibold text-slate-200">{t.name}</span>
                  </div>
                  <span className="font-mono text-cyan-400">{t.rate}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{t.partitions} Partitions</span>
                  <span>Lag: {t.lag} msgs</span>
                </div>
                {/* Visual partition health bar */}
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  {Array.from({ length: t.partitions }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 ${
                        t.lag > 20 && i === 0 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Fallback Simulation Switch */}
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold text-slate-200">Simulate Cloud API Downtime & Fallback</div>
              <div className="text-[11px] text-slate-400">
                Trigger edge caching & replay buffer when upstream municipal API is unreachable
              </div>
            </div>
            <button
              onClick={toggleDowntimeFallback}
              className={`px-3 py-1.5 rounded font-medium text-xs transition-colors ${
                systemHealth.isDowntimeFallbackActive
                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {systemHealth.isDowntimeFallbackActive ? 'Fallback ACTIVE' : 'Enable Fallback'}
            </button>
          </div>
        </div>

        {/* Right: Dead-Letter Queue Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Dead-Letter Queue Inspector</h2>
              <p className="text-xs text-slate-400">Corrupted packets or sensor telemetry anomalies</p>
            </div>
            {deadLetterEvents.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={replayDeadLetterQueue}
                  title="Re-inject poisoned packets into queue"
                  className="p-1.5 text-xs text-cyan-300 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={clearDeadLetterQueue}
                  title="Purge DLQ"
                  className="p-1.5 text-xs text-rose-400 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {deadLetterEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded border border-slate-800 text-slate-400 text-xs">
              Dead Letter Queue is empty. No malformed packets detected.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {deadLetterEvents.map(evt => (
                <div
                  key={evt.eventId}
                  className="p-3 bg-slate-950/90 rounded border border-rose-900/60 text-xs space-y-1.5 font-mono"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-rose-400 font-bold">{evt.eventId}</span>
                    <span className="text-slate-400">{evt.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    Gateway: <span className="font-mono text-cyan-400">{evt.sourceGateway}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Telemetry: Temp={evt.metrics.ambientTempC}°C, AQI={evt.metrics.aqi} (Out-of-range sensor exception)
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stale Sensor Diagnostics */}
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="font-semibold">Stale Sensors Watchdog</span>
              <span className="font-mono text-amber-400">3 nodes flagged</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              3 micro-sensors in Harbor Logistics haven't reported heartbeat in &gt; 180s. Automatic heartbeat ping scheduled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
