import React, { useState } from 'react';
import type { TransitHub, HubCategory, AISuggestion, AIPriority } from '../types';
import { Flame, Navigation, Users, Clock, MessageSquarePlus, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { AISuggestionsPanel } from './AISuggestionsPanel';

interface HotspotListSheetProps {
  hubs: TransitHub[];
  selectedHub: TransitHub | null;
  onSelectHub: (hub: TransitHub) => void;
  onNavigate: (hub: TransitHub) => void;
  onReportCrowd: (hub: TransitHub) => void;
  aiSuggestions: AISuggestion[];
  aiPriority: AIPriority;
  onSelectAiPriority: (p: AIPriority) => void;
}

export const HotspotListSheet: React.FC<HotspotListSheetProps> = ({
  hubs,
  selectedHub,
  onSelectHub,
  onNavigate,
  onReportCrowd,
  aiSuggestions,
  aiPriority,
  onSelectAiPriority,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'all'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<HubCategory | 'all'>('all');

  const filteredHubs = hubs.filter((hub) => {
    if (selectedCategory === 'all') return true;
    return hub.category === selectedCategory;
  });

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 text-white shadow-2xl transition-all duration-300 flex flex-col ${
        isExpanded ? 'max-h-[75vh] md:max-h-[60vh]' : 'max-h-[68px]'
      }`}
    >
      {/* Header Bar / Drag Handle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800 cursor-pointer hover:bg-slate-800/40 select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
          <h2 className="font-extrabold text-sm md:text-base flex items-center gap-1.5">
            <span>Demand Radar & AI Dispatcher</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-700">
              {filteredHubs.length} Zones
            </span>
          </h2>
        </div>

        {/* View Toggle (AI Smart Pick vs All Zones) */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setActiveTab('ai');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendations</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('all');
                setIsExpanded(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All Hubs</span>
            </button>
          </div>

          <button className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-y-auto p-3">
          {/* AI Smart Recommendations View */}
          {activeTab === 'ai' && (
            <AISuggestionsPanel
              suggestions={aiSuggestions}
              activePriority={aiPriority}
              onSelectPriority={onSelectAiPriority}
              onNavigate={(hubId) => {
                const target = hubs.find((h) => h.id === hubId);
                if (target) onNavigate(target);
              }}
              onSelectHub={(hubId) => {
                const target = hubs.find((h) => h.id === hubId);
                if (target) onSelectHub(target);
              }}
            />
          )}

          {/* Category Filter Pills (When exploring all zones) */}
          {activeTab === 'all' && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto text-xs no-scrollbar">
              {(
                [
                  { id: 'all', label: '⚡ All Zones' },
                  { id: 'metro', label: '🚇 Metro Gates' },
                  { id: 'railway', label: '🚆 Rail/Bus Stations' },
                  { id: 'office', label: '🏢 Tech Parks/Offices' },
                  { id: 'market', label: '🛍️ Markets/Malls' },
                  { id: 'college', label: '🎓 Colleges' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Standard Hotspots Grid */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredHubs.map((hub) => {
                const isSelected = selectedHub?.id === hub.id;
                const isSurge = hub.demandLevel === 'SURGE';

                return (
                  <div
                    key={hub.id}
                    onClick={() => onSelectHub(hub)}
                    className={`relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                        : isSurge
                        ? 'bg-gradient-to-br from-red-950/40 to-slate-900 border-red-500/40 hover:border-red-400'
                        : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500'
                    }`}
                  >
                    {/* Top Row: Name & Demand Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                          {isSurge && <Flame className="w-4 h-4 text-red-400 fill-red-400 animate-bounce" />}
                          {hub.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{hub.tipsHint}</p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          isSurge
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : hub.demandLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {hub.demandLevel}
                      </span>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-2 rounded-lg text-xs mb-3 border border-slate-800">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block">Crowd</span>
                        <span className="font-black text-amber-400 flex items-center justify-center gap-1">
                          <Users className="w-3 h-3" />
                          {hub.activePassengerPings}
                        </span>
                      </div>

                      <div className="text-center border-x border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Wait Time</span>
                        <span className="font-black text-emerald-400 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          &lt;{hub.estimatedWaitMinutes}m
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block">Est. Fare</span>
                        <span className="font-black text-slate-200 text-[11px]">
                          {hub.avgFareEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(hub);
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <Navigation className="w-4 h-4 fill-slate-950" />
                        <span>Start Navigation</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportCrowd(hub);
                        }}
                        title="Report Ground Status"
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-600"
                      >
                        <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">Report</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
