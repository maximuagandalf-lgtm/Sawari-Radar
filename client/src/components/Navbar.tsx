import React, { useState, useEffect } from 'react';
import { Compass, Radio, Volume2, VolumeX, Sparkles, Download } from 'lucide-react';
import type { CityConfig, Language, VehicleType } from '../types';

interface NavbarProps {
  cities: CityConfig[];
  selectedCity: CityConfig;
  onSelectCity: (city: CityConfig) => void;
  vehicleType: VehicleType;
  onSelectVehicle: (v: VehicleType) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  activeView: 'driver' | 'passenger' | 'simulator';
  onChangeView: (view: 'driver' | 'passenger' | 'simulator') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  vehicleType,
  onSelectVehicle,
  language,
  onSelectLanguage,
  voiceEnabled,
  onToggleVoice,
  activeView,
  onChangeView,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg z-30 relative">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Sawari Radar
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">Smart Auto / Taxi Demand Heatmap</p>
        </div>
      </div>

      {/* Main Mode Switcher */}
      <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
        <button
          onClick={() => onChangeView('driver')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'driver'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Driver Radar</span>
        </button>

        <button
          onClick={() => onChangeView('passenger')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'passenger'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Passenger QR Beacon</span>
        </button>

        <button
          onClick={() => onChangeView('simulator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeView === 'simulator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Rush Sim</span>
        </button>
      </div>

      {/* Controls & Selectors */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* City Picker */}
        <select
          value={selectedCity.id}
          onChange={(e) => {
            const found = cities.find((c) => c.id === e.target.value);
            if (found) onSelectCity(found);
          }}
          className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              📍 {city.name}
            </option>
          ))}
        </select>

        {/* Vehicle Type Selector */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => onSelectVehicle('auto')}
            title="Auto Rickshaw"
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              vehicleType === 'auto' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            🛺 Auto
          </button>
          <button
            onClick={() => onSelectVehicle('e_rickshaw')}
            title="E-Rickshaw"
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              vehicleType === 'e_rickshaw' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            ⚡ E-Rick
          </button>
          <button
            onClick={() => onSelectVehicle('taxi')}
            title="Taxi / Cab"
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              vehicleType === 'taxi' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-slate-400'
            }`}
          >
            🚕 Cab
          </button>
        </div>

        {/* Voice Audio Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute Voice Alerts' : 'Unmute Hindi/Eng Voice Alerts'}
          className={`p-1.5 rounded-lg border text-xs transition-all ${
            voiceEnabled
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* PWA Install Button for Mobile Browsers */}
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md animate-pulse"
            title="Install Sawari Radar on your Phone"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => onSelectLanguage(e.target.value as Language)}
          className="bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 rounded-lg px-1.5 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="hinglish">Hinglish</option>
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </div>
    </header>
  );
};
