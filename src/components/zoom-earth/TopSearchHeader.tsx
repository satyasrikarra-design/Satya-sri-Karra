import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Compass, ShieldAlert, Sparkles, X } from 'lucide-react';
import { searchNominatim, GeocodingResult, FALLBACK_PRESETS } from '../../services/geocoding';

interface TopSearchHeaderProps {
  onSelectLocation: (result: { name: string; lat: number; lng: number }) => void;
  currentRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  activeView: 'earth_gis' | 'enterprise';
  onToggleView: (view: 'earth_gis' | 'enterprise') => void;
}

export const TopSearchHeader: React.FC<TopSearchHeaderProps> = ({
  onSelectLocation,
  currentRiskLevel,
  activeView,
  onToggleView,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const items = await searchNominatim(query);
      setResults(items);
      setIsLoading(false);
      setIsOpen(items.length > 0);
    }, 380);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: { name: string; lat: number; lng: number }) => {
    onSelectLocation(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Brand & Search Container */}
      <div className="pointer-events-auto flex items-center gap-2.5 w-full sm:w-auto">
        {/* Brand Icon */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 rounded-lg shadow-xl text-white">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-slate-950 shadow-sm shadow-cyan-500/30">
            CS
          </div>
          <span className="font-bold text-sm tracking-tight">ClimateShield</span>
        </div>

        {/* Global Location Search Input */}
        <div className="relative flex-1 sm:w-80 md:w-96" ref={dropdownRef}>
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500/80 rounded-lg px-3 py-2 shadow-2xl transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search any city, town, village, or coordinates..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (results.length > 0 || query.length >= 2) setIsOpen(true);
              }}
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-sans"
            />
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/80 rounded-lg shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
                <span>Worldwide Geocoding Results</span>
                <span className="text-cyan-400 font-sans">OpenStreetMap</span>
              </div>

              {results.length > 0 ? (
                results.map(item => (
                  <button
                    key={item.placeId}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-800/80 border-b border-slate-800/40 last:border-0 transition-colors flex items-start gap-2.5 group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate leading-snug">
                        {item.displayName}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3">
                  <div className="text-[11px] text-slate-400 mb-2">Popular Quick Hotspots:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {FALLBACK_PRESETS.map(p => (
                      <button
                        key={p.placeId}
                        onClick={() => handleSelect(p)}
                        className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 rounded border border-slate-700 transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Operational Badge & View Switcher */}
      <div className="pointer-events-auto flex items-center gap-2 self-end sm:self-auto">
        {/* Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md border text-xs font-semibold shadow-xl ${
            currentRiskLevel === 'critical'
              ? 'bg-rose-950/85 border-rose-800 text-rose-200'
              : currentRiskLevel === 'high'
              ? 'bg-amber-950/85 border-amber-800 text-amber-200'
              : 'bg-slate-900/85 border-slate-800 text-emerald-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              currentRiskLevel === 'critical'
                ? 'bg-rose-500 animate-ping'
                : currentRiskLevel === 'high'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {currentRiskLevel === 'critical'
              ? 'EMERGENCY ACTIVE'
              : currentRiskLevel === 'high'
              ? 'INCIDENT TRIGGERED'
              : 'SYSTEM NOMINAL'}
          </span>
        </div>

        {/* View Switcher: Interactive Map vs Operations Suite */}
        <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl text-xs">
          <button
            onClick={() => onToggleView('earth_gis')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeView === 'earth_gis'
                ? 'bg-cyan-950 border border-cyan-800/80 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Map
          </button>
          <button
            onClick={() => onToggleView('enterprise')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeView === 'enterprise'
                ? 'bg-cyan-950 border border-cyan-800/80 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Operations Suite
          </button>
        </div>
      </div>
    </div>
  );
};
