import React, { useState } from 'react';
import type { TransitHub, VehicleType } from '../types';
import { X, CheckCircle2, MessageSquarePlus, Flame, Users, AlertCircle } from 'lucide-react';

interface CrowdReportModalProps {
  hub: TransitHub;
  vehicleType: VehicleType;
  onClose: () => void;
  onSubmitReport: (data: {
    hubId: string;
    crowdStatus: 'empty' | 'moderate' | 'heavy' | 'overcrowded';
    vehicleType: VehicleType;
  }) => void;
}

export const CrowdReportModal: React.FC<CrowdReportModalProps> = ({
  hub,
  vehicleType,
  onClose,
  onSubmitReport,
}) => {
  const [submitted, setSubmitted] = useState(false);

  const handleReport = (status: 'empty' | 'moderate' | 'heavy' | 'overcrowded') => {
    onSubmitReport({
      hubId: hub.id,
      crowdStatus: status,
      vehicleType,
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold">Report Received!</h3>
            <p className="text-xs text-slate-400 mt-1">Thank you for helping fellow drivers.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Report Ground Status</h3>
                <p className="text-xs text-slate-400">{hub.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              What is the current passenger crowd situation right now? (1-Tap updates the radar)
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleReport('overcrowded')}
                className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-400 text-red-200 font-bold p-3 rounded-xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-red-400 fill-red-400" />
                  <div>
                    <span className="block text-sm">🔥 Massive Crowd / Train Just Arrived</span>
                    <span className="text-[11px] text-red-300 font-normal">30+ people waiting for rides</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport('heavy')}
                className="w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-bold p-3 rounded-xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="block text-sm">⚡ Steady High Demand</span>
                    <span className="text-[11px] text-amber-300 font-normal">10–20 people waiting</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport('moderate')}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 font-bold p-3 rounded-xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🟡</span>
                  <div>
                    <span className="block text-sm">Normal Flow</span>
                    <span className="text-[11px] text-emerald-300 font-normal">3–8 people, quick turnover</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleReport('empty')}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 font-semibold p-3 rounded-xl text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="block text-sm">⚪ Stand is Empty / No Customers</span>
                    <span className="text-[11px] text-slate-400 font-normal">More autos than passengers</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
