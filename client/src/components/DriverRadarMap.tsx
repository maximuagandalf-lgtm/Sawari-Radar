import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Location, TransitHub } from '../types';
import { Users, Navigation, Clock } from 'lucide-react';

interface DriverRadarMapProps {
  center: Location;
  zoom: number;
  hubs: TransitHub[];
  driverLocation: Location;
  selectedHub: TransitHub | null;
  onSelectHub: (hub: TransitHub) => void;
  onNavigate: (hub: TransitHub) => void;
  onReportCrowd: (hub: TransitHub) => void;
}

const MapController: React.FC<{ center: Location; zoom: number; selectedHub: TransitHub | null }> = ({
  center,
  zoom,
  selectedHub,
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHub) {
      map.flyTo([selectedHub.location.lat, selectedHub.location.lng], 15, {
        duration: 1.2,
      });
    } else {
      map.flyTo([center.lat, center.lng], zoom, {
        duration: 1.0,
      });
    }
  }, [center, zoom, selectedHub, map]);

  return null;
};

const createHubIcon = (hub: TransitHub, isSelected: boolean) => {
  let bgColor = 'bg-slate-700';
  let ringColor = 'border-slate-500';
  const badgeText = hub.activePassengerPings.toString();
  let pulseClass = '';

  if (hub.demandLevel === 'SURGE') {
    bgColor = 'bg-red-600 shadow-red-500/50';
    ringColor = 'border-red-300';
    pulseClass = 'pulse-ring-surge';
  } else if (hub.demandLevel === 'HIGH') {
    bgColor = 'bg-amber-500 shadow-amber-500/40';
    ringColor = 'border-amber-200';
    pulseClass = 'pulse-ring-high';
  } else if (hub.demandLevel === 'MEDIUM') {
    bgColor = 'bg-emerald-600 shadow-emerald-500/30';
    ringColor = 'border-emerald-300';
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${pulseClass ? `<div class="${pulseClass}"></div>` : ''}
      <div class="relative z-10 w-9 h-9 rounded-full ${bgColor} border-2 ${isSelected ? 'border-white scale-125' : ringColor} flex items-center justify-center text-white shadow-xl transition-transform duration-200">
        ${
          hub.demandLevel === 'SURGE'
            ? `<span class="text-sm font-black">🔥</span>`
            : hub.category === 'metro'
            ? `<span class="text-xs font-black">🚇</span>`
            : hub.category === 'railway'
            ? `<span class="text-xs font-black">🚆</span>`
            : `<span class="text-xs font-black">👥</span>`
        }
        <span class="absolute -top-1.5 -right-1.5 bg-white text-slate-900 text-[10px] font-extrabold px-1 rounded-full border border-slate-300 shadow">
          ${badgeText}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-hub-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const driverIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></div>
      <div class="relative z-10 w-8 h-8 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-cyan-500/50">
        <span class="text-sm font-black">🛺</span>
      </div>
    </div>
  `,
  className: 'driver-location-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const DriverRadarMap: React.FC<DriverRadarMapProps> = ({
  center,
  zoom,
  hubs,
  driverLocation,
  selectedHub,
  onSelectHub,
  onNavigate,
  onReportCrowd,
}) => {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapController center={center} zoom={zoom} selectedHub={selectedHub} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>
            <div className="text-slate-900 font-bold text-xs p-1">
              📍 Aapki Location (You Are Here)
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[driverLocation.lat, driverLocation.lng]}
          radius={1200}
          pathOptions={{
            color: '#06b6d4',
            fillColor: '#06b6d4',
            fillOpacity: 0.08,
            weight: 1,
            dashArray: '4, 4',
          }}
        />

        {hubs.map((hub) => {
          const isSelected = selectedHub?.id === hub.id;
          return (
            <React.Fragment key={hub.id}>
              {hub.demandLevel === 'SURGE' && (
                <Circle
                  center={[hub.location.lat, hub.location.lng]}
                  radius={400}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.18,
                    weight: 1.5,
                  }}
                />
              )}
              {hub.demandLevel === 'HIGH' && (
                <Circle
                  center={[hub.location.lat, hub.location.lng]}
                  radius={300}
                  pathOptions={{
                    color: '#f59e0b',
                    fillColor: '#f59e0b',
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />
              )}

              <Marker
                position={[hub.location.lat, hub.location.lng]}
                icon={createHubIcon(hub, isSelected)}
                eventHandlers={{
                  click: () => onSelectHub(hub),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px] text-slate-900">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-extrabold text-sm leading-tight">{hub.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                          hub.demandLevel === 'SURGE'
                            ? 'bg-red-600'
                            : hub.demandLevel === 'HIGH'
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {hub.demandLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2">{hub.tipsHint}</p>

                    <div className="grid grid-cols-2 gap-1.5 text-xs bg-slate-100 p-2 rounded-lg mb-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Waiting Crowd</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-600" />
                          {hub.activePassengerPings} people
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Pickup Wait</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          ~{hub.estimatedWaitMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onNavigate(hub)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Navigate
                      </button>
                      <button
                        onClick={() => onReportCrowd(hub)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-1.5 px-2 rounded-lg text-xs"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
