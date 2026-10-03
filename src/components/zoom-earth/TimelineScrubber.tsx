import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

interface TimelineScrubberProps {
  currentOffsetHours: number;
  onChangeOffset: React.Dispatch<React.SetStateAction<number>>;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentOffsetHours,
  onChangeOffset,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);

  const steps = [
    { label: '-6h', value: -6 },
    { label: '-4h', value: -4 },
    { label: '-2h', value: -2 },
    { label: '-1h', value: -1 },
    { label: 'LIVE', value: 0 },
    { label: '+1h', value: 1 },
    { label: '+2h', value: 2 },
    { label: '+4h', value: 4 },
    { label: '+6h', value: 6 },
  ];

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1400 / speed);
    const timer = setInterval(() => {
      onChangeOffset(prev => {
        const next = prev >= 6 ? -6 : prev + 1;
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, onChangeOffset]);

  // Compute displayed simulated time
  const now = new Date();
  const simulatedTime = new Date(now.getTime() + currentOffsetHours * 3600 * 1000);
  const timeFormatted = simulatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const utcFormatted = simulatedTime.toUTCString().slice(17, 22) + ' UTC';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-11/12 max-w-2xl">
      <div className="bg-[#0b0f17]/90 backdrop-blur-xl border border-slate-800/90 rounded-xl px-4 py-2.5 shadow-2xl flex flex-col gap-2">
        {/* Top line: Play controls & Time stamp */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 font-semibold text-xs ${
                isPlaying
                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Loop'}</span>
            </button>

            <button
              onClick={() => setSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1))}
              className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-mono rounded text-slate-300 transition-colors"
            >
              {speed}x
            </button>

            <button
              onClick={() => {
                onChangeOffset(0);
                setIsPlaying(false);
              }}
              className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] font-medium rounded text-slate-300 hover:text-white transition-colors"
            >
              Reset Live
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white">{timeFormatted}</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-300">{utcFormatted}</span>
            {currentOffsetHours === 0 ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Real-time Live Stream" />
            ) : (
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1 rounded ml-1">
                {currentOffsetHours > 0 ? `+${currentOffsetHours}h Forecast` : `${currentOffsetHours}h Archive`}
              </span>
            )}
          </div>
        </div>

        {/* Scrubber track with tick points */}
        <div className="relative pt-1 pb-1">
          {/* Track Line */}
          <div className="h-1.5 w-full bg-slate-800/90 rounded-full relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 transition-all duration-200"
              style={{
                width: `${((currentOffsetHours + 6) / 12) * 100}%`,
              }}
            />
          </div>

          {/* Stepper buttons along the bar */}
          <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-slate-400">
            {steps.map(step => {
              const isSelected = currentOffsetHours === step.value;
              const isLive = step.value === 0;

              return (
                <button
                  key={step.value}
                  onClick={() => {
                    onChangeOffset(step.value);
                    setIsPlaying(false);
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all flex flex-col items-center ${
                    isSelected
                      ? isLive
                        ? 'text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800 scale-110'
                        : 'text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-800 scale-105'
                      : isLive
                      ? 'text-emerald-400 font-semibold hover:text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
