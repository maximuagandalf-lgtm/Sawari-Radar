import React from 'react';
import type { AISuggestion, AIPriority } from '../types';
import { Sparkles, Navigation, ArrowRight, Gauge } from 'lucide-react';

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  activePriority: AIPriority;
  onSelectPriority: (p: AIPriority) => void;
  onNavigate: (hubId: string) => void;
  onSelectHub: (hubId: string) => void;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  suggestions,
  activePriority,
  onSelectPriority,
  onNavigate,
  onSelectHub,
}) => {
  const topPick = suggestions[0];

  return (
    <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3.5 text-white shadow-2xl backdrop-blur-md mb-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-1.5 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <span>AI Smart Dispatcher</span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                AUTO-OPTIMIZER
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Multi-objective matching (Distance + Fare + Traffic)</p>
          </div>
        </div>

        {/* Priority Filter Selector */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
          {(
            [
              { id: 'balanced', label: '⚖️ Best All-Round' },
              { id: 'highest_fare', label: '💰 Max Fare' },
              { id: 'least_traffic', label: '🟢 Clear Traffic' },
              { id: 'fastest_pickup', label: '⚡ Fastest' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectPriority(mode.id)}
              className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activePriority === mode.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Recommended Card */}
      {topPick && (
        <div
          onClick={() => onSelectHub(topPick.hubId)}
          className="relative bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border-2 border-indigo-500/60 rounded-xl p-3 mb-2.5 shadow-xl cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-indigo-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  #1 AI Choice ({topPick.netScore}% Match)
                </span>
                <span className="text-[11px] text-indigo-300 font-semibold">{topPick.category.toUpperCase()}</span>
              </div>
              <h4 className="font-black text-base text-slate-100 mt-1">{topPick.hubName}</h4>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-emerald-400">{topPick.avgFareEstimate}</span>
              <span className="text-[10px] text-slate-400 block">{topPick.distanceKm} km away</span>
            </div>
          </div>

          {/* AI Reason Prompt */}
          <p className="text-xs text-indigo-200 bg-indigo-950/60 p-2 rounded-lg border border-indigo-800/40 mb-2.5 font-medium leading-relaxed">
            💡 {topPick.recommendationReason}
          </p>

          {/* Quick Metrics & CTA */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-bold">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Traffic: <span className={topPick.trafficLevel === 'Low' ? 'text-emerald-400' : topPick.trafficLevel === 'Heavy' ? 'text-red-400' : 'text-amber-400'}>{topPick.trafficLevel}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Delay: +{topPick.trafficDelayMinutes}m</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(topPick.hubId);
              }}
              className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5 fill-slate-950" />
              <span>Drive Here</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Ranked Runners-up List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {suggestions.slice(1, 4).map((item, idx) => (
          <div
            key={item.hubId}
            onClick={() => onSelectHub(item.hubId)}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-slate-400">#{idx + 2} {item.category.toUpperCase()}</span>
                <span className="text-[10px] font-black text-indigo-400">{item.netScore}% Match</span>
              </div>
              <h5 className="font-bold text-xs text-slate-200 line-clamp-1">{item.hubName}</h5>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{item.distanceKm} km</span>
                <span className="text-emerald-400 font-bold">{item.avgFareEstimate}</span>
                <span className={item.trafficLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>
                  {item.trafficLevel}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(item.hubId);
              }}
              className="mt-2 w-full bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 font-bold py-1 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              <span>Navigate ({item.distanceKm}km)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
