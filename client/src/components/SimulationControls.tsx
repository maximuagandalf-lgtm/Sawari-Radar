import React from 'react';
import type { TransitHub } from '../types';
import { Sparkles, Train, Building2, ShoppingBag, X, Zap } from 'lucide-react';

interface SimulationControlsProps {
  hubs: TransitHub[];
  onClose: () => void;
  onSimulateRush: (hubId: string, extraPassengers: number) => void;
  onMoveDriver: (hub: TransitHub) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  hubs,
  onClose,
  onSimulateRush,
  onMoveDriver,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-indigo-600/30 text-indigo-400 p-2 rounded-xl border border-indigo-500/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black">Live City Demand Simulator</h3>
            <p className="text-xs text-slate-400">Trigger simulated real-world transit spikes & test radar response</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-800/70 p-3 rounded-xl border border-slate-700 mb-4">
          🧪 Use these scenarios to test how Sawari Radar dynamically highlights hotspots, updates wait times, triggers audio voice alerts, and reroutes drivers.
        </p>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-500 transition-all"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  {hub.category === 'metro' && <Train className="w-4 h-4 text-cyan-400" />}
                  {hub.category === 'railway' && <Train className="w-4 h-4 text-amber-400" />}
                  {hub.category === 'office' && <Building2 className="w-4 h-4 text-purple-400" />}
                  {hub.category === 'market' && <ShoppingBag className="w-4 h-4 text-emerald-400" />}
                  <span>{hub.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Score: <b className="text-amber-400">{hub.currentDemand}%</b></span>
                  <span>•</span>
                  <span>Waiting: <b className="text-emerald-400">{hub.activePassengerPings}</b></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSimulateRush(hub.id, 25)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>+25 Rush Spike</span>
                </button>

                <button
                  onClick={() => onMoveDriver(hub)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-1.5 px-2.5 rounded-lg text-xs transition-colors"
                  title="Move Driver GPS Near Here"
                >
                  📍 Teleport GPS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
