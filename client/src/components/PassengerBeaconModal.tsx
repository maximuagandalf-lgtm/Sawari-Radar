import React, { useState } from 'react';
import { Radio, Users, MapPin, CheckCircle2, ArrowRight, X } from 'lucide-react';
import type { Location, TransitHub } from '../types';

interface PassengerBeaconModalProps {
  hubs: TransitHub[];
  onClose: () => void;
  onSubmitPing: (pingData: {
    hubId?: string;
    location: Location;
    destinationHint: string;
    passengerCount: number;
    vehicleType: string;
  }) => void;
}

export const PassengerBeaconModal: React.FC<PassengerBeaconModalProps> = ({
  hubs,
  onClose,
  onSubmitPing,
}) => {
  const [selectedHubId, setSelectedHubId] = useState<string>(hubs[0]?.id || '');
  const [destinationHint, setDestinationHint] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [vehicleType, setVehicleType] = useState('auto');
  const [submitted, setSubmitted] = useState(false);

  const selectedHub = hubs.find((h) => h.id === selectedHubId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHub) return;

    onSubmitPing({
      hubId: selectedHub.id,
      location: selectedHub.location,
      destinationHint: destinationHint || 'Local Route',
      passengerCount,
      vehicleType,
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2">Beacon Broadcasted!</h3>
            <p className="text-sm text-slate-300 mb-6">
              Nearby Auto & Taxi drivers on Sawari Radar have received your demand ping at{' '}
              <span className="font-bold text-amber-400">{selectedHub?.name}</span>.
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-400 mb-6 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Broadcasting to ~{selectedHub?.driverCountNearby || 8} drivers within 1.5 km
            </div>
            <button
              onClick={onClose}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black">Passenger 1-Tap Beacon</h3>
                <p className="text-xs text-slate-400">Zero-app commuter demand ping (QR Stand)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700 mb-4">
              💡 <span className="font-semibold text-amber-400">How it works:</span> When you ping from a metro/bus stand, nearby empty auto drivers receive a live notification to pick you up. No app installation required!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Current Stand / Location */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Select Your Current Stand / Station
                </label>
                <select
                  value={selectedHubId}
                  onChange={(e) => setSelectedHubId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} ({hub.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Hint */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Where are you heading? (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 62 / City Center / Home"
                  value={destinationHint}
                  onChange={(e) => setDestinationHint(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Number of Passengers */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Number of Passengers Waiting
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setPassengerCount(num)}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                        passengerCount === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {num === 4 ? '4+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type preference */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Vehicle Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: '🛺 Auto' },
                    { id: 'e_rickshaw', label: '⚡ E-Rick' },
                    { id: 'taxi', label: '🚕 Taxi/Cab' },
                  ].map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setVehicleType(v.id)}
                      className={`py-2 px-1 text-xs rounded-xl font-bold border transition-all ${
                        vehicleType === v.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all mt-4"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>Notify Nearby Drivers Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
