import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { CityConfig, Language, Location, TransitHub, VehicleType, AISuggestion, AIPriority } from './types';
import { Navbar } from './components/Navbar';
import { DriverRadarMap } from './components/DriverRadarMap';
import { HotspotListSheet } from './components/HotspotListSheet';
import { PassengerBeaconModal } from './components/PassengerBeaconModal';
import { CrowdReportModal } from './components/CrowdReportModal';
import { SimulationControls } from './components/SimulationControls';
import { voiceAlerts } from './services/voiceAlerts';
import { Flame } from 'lucide-react';

const FALLBACK_CITIES: CityConfig[] = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    center: { lat: 28.6139, lng: 77.2090 },
    zoom: 12,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    center: { lat: 12.9716, lng: 77.5946 },
    zoom: 12,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    center: { lat: 19.0760, lng: 72.8777 },
    zoom: 12,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    center: { lat: 26.9124, lng: 75.7873 },
    zoom: 13,
  },
];

export function App() {
  const [cities] = useState<CityConfig[]>(FALLBACK_CITIES);
  const [selectedCity, setSelectedCity] = useState<CityConfig>(FALLBACK_CITIES[0]);
  const [hubs, setHubs] = useState<TransitHub[]>([]);
  const [selectedHub, setSelectedHub] = useState<TransitHub | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('auto');
  const [language, setLanguage] = useState<Language>('hinglish');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'driver' | 'passenger' | 'simulator'>('driver');

  // AI Smart Dispatcher State
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiPriority, setAiPriority] = useState<AIPriority>('balanced');

  // Driver GPS Location (Starts at Connaught Place for Delhi)
  const [driverLocation, setDriverLocation] = useState<Location>({
    lat: 28.6315,
    lng: 77.2167,
  });

  // Modals state
  const [showPassengerModal, setShowPassengerModal] = useState<boolean>(false);
  const [reportingHub, setReportingHub] = useState<TransitHub | null>(null);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<{ hubName: string; message: string } | null>(null);

  // Fetch initial hubs and connect to WebSocket
  useEffect(() => {
    // 1. Fetch hubs via REST API
    fetch(`/api/hubs?city=${selectedCity.id}`)
      .then((res) => res.json())
      .then((data: TransitHub[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setHubs(data);
        }
      })
      .catch((err) => {
        console.warn('Backend REST unreachable, using live mock state', err);
      });

    // 2. Connect Socket.io (dynamically connects to origin in cloud deployment or localhost:4000 in dev)
    const socketUrl = window.location.port === '3000' ? 'http://localhost:4000' : window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('hubs_updated', (updatedHubs: TransitHub[]) => {
      const cityHubs = updatedHubs.filter((h) => h.city === selectedCity.id);
      setHubs(cityHubs.length > 0 ? cityHubs : updatedHubs);
    });

    newSocket.on('rush_alert', (alertData: { hubName: string; message: string; demandLevel: string }) => {
      setActiveAlert({ hubName: alertData.hubName, message: alertData.message });
      voiceAlerts.announce(alertData.hubName, alertData.demandLevel, language);

      setTimeout(() => {
        setActiveAlert(null);
      }, 7000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedCity.id, language]);

  // Request AI Recommendations whenever hubs, location, or priority mode change
  useEffect(() => {
    fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverLocation,
        vehicleType,
        priorityPreference: aiPriority,
        city: selectedCity.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.suggestions)) {
          setAiSuggestions(data.suggestions);
        }
      })
      .catch((err) => console.log('AI recommendations offline fallback', err));
  }, [hubs, driverLocation, vehicleType, aiPriority, selectedCity.id]);

  // Handle City Change
  const handleSelectCity = (city: CityConfig) => {
    setSelectedCity(city);
    setDriverLocation({
      lat: city.center.lat + (Math.random() - 0.5) * 0.02,
      lng: city.center.lng + (Math.random() - 0.5) * 0.02,
    });
    setSelectedHub(null);

    fetch(`/api/hubs?city=${city.id}`)
      .then((res) => res.json())
      .then((data: TransitHub[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setHubs(data);
        }
      })
      .catch((e) => console.log(e));
  };

  // Open Turn-by-Turn Navigation (Google Maps URL or in-app guidance)
  const handleNavigate = (hub: TransitHub) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hub.location.lat},${hub.location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Passenger Ping Submission
  const handlePassengerPing = async (pingData: {
    hubId?: string;
    location: Location;
    destinationHint: string;
    passengerCount: number;
    vehicleType: string;
  }) => {
    try {
      await fetch('/api/pings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingData),
      });
    } catch (e) {
      console.log('Error posting ping', e);
    }
  };

  // Driver Ground Status Report
  const handleCrowdReport = async (reportData: {
    hubId: string;
    crowdStatus: 'empty' | 'moderate' | 'heavy' | 'overcrowded';
    vehicleType: VehicleType;
  }) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
    } catch (e) {
      console.log('Error posting report', e);
    }
  };

  // Rush Simulation Trigger
  const handleSimulateRush = async (hubId: string, extraPassengers: number = 20) => {
    try {
      await fetch('/api/simulate-rush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hubId, extraPassengers }),
      });
    } catch (e) {
      console.log('Error simulating rush', e);
    }
  };

  // Move Driver GPS
  const handleMoveDriver = (hub: TransitHub) => {
    setDriverLocation({
      lat: hub.location.lat - 0.004,
      lng: hub.location.lng - 0.003,
    });
    setSelectedHub(hub);
    setShowSimModal(false);
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceAlerts.setEnabled(next);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <Navbar
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        vehicleType={vehicleType}
        onSelectVehicle={setVehicleType}
        language={language}
        onSelectLanguage={setLanguage}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          if (view === 'passenger') setShowPassengerModal(true);
          if (view === 'simulator') setShowSimModal(true);
        }}
      />

      {/* Real-time Rush Toast Banner */}
      {activeAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md w-11/12">
          <div className="bg-white text-red-600 p-2 rounded-xl shrink-0 font-bold">
            <Flame className="w-5 h-5 fill-red-600 animate-bounce" />
          </div>
          <div>
            <h4 className="font-black text-sm">SURGE ALERT: {activeAlert.hubName}</h4>
            <p className="text-xs text-white/90 leading-tight">{activeAlert.message}</p>
          </div>
        </div>
      )}

      {/* Main Map View Area */}
      <main className="flex-1 relative w-full h-full">
        <DriverRadarMap
          center={selectedCity.center}
          zoom={selectedCity.zoom}
          hubs={hubs}
          driverLocation={driverLocation}
          selectedHub={selectedHub}
          onSelectHub={(hub) => setSelectedHub(hub)}
          onNavigate={handleNavigate}
          onReportCrowd={(hub) => setReportingHub(hub)}
        />

        {/* Floating Action Buttons for quick access */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setShowPassengerModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xl border border-emerald-400/40 transition-transform active:scale-95"
            title="Open Passenger Beacon"
          >
            <span>📡 Passenger Ping</span>
          </button>

          <button
            onClick={() => setShowSimModal(true)}
            className="bg-indigo-600/90 hover:bg-indigo-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xl border border-indigo-400/30 transition-transform active:scale-95"
            title="Open Rush Event Simulator"
          >
            <span>⚡ Rush Simulator</span>
          </button>
        </div>

        {/* Hotspots & AI Dispatcher Drawer */}
        <HotspotListSheet
          hubs={hubs}
          selectedHub={selectedHub}
          onSelectHub={(hub) => setSelectedHub(hub)}
          onNavigate={handleNavigate}
          onReportCrowd={(hub) => setReportingHub(hub)}
          aiSuggestions={aiSuggestions}
          aiPriority={aiPriority}
          onSelectAiPriority={setAiPriority}
        />
      </main>

      {/* Modals */}
      {showPassengerModal && (
        <PassengerBeaconModal
          hubs={hubs}
          onClose={() => {
            setShowPassengerModal(false);
            if (activeView === 'passenger') setActiveView('driver');
          }}
          onSubmitPing={handlePassengerPing}
        />
      )}

      {reportingHub && (
        <CrowdReportModal
          hub={reportingHub}
          vehicleType={vehicleType}
          onClose={() => setReportingHub(null)}
          onSubmitReport={handleCrowdReport}
        />
      )}

      {showSimModal && (
        <SimulationControls
          hubs={hubs}
          onClose={() => {
            setShowSimModal(false);
            if (activeView === 'simulator') setActiveView('driver');
          }}
          onSimulateRush={handleSimulateRush}
          onMoveDriver={handleMoveDriver}
        />
      )}
    </div>
  );
}

export default App;
