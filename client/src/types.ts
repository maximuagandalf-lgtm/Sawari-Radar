export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SURGE';

export type HubCategory = 'metro' | 'railway' | 'market' | 'college' | 'office' | 'hospital';

export type VehicleType = 'auto' | 'e_rickshaw' | 'taxi';

export type Language = 'en' | 'hi' | 'hinglish';

export type AIPriority = 'balanced' | 'highest_fare' | 'least_traffic' | 'fastest_pickup';

export interface Location {
  lat: number;
  lng: number;
}

export interface TransitHub {
  id: string;
  name: string;
  city: string;
  category: HubCategory;
  location: Location;
  baseDemand: number;
  currentDemand: number;
  demandLevel: DemandLevel;
  activePassengerPings: number;
  driverCountNearby: number;
  estimatedWaitMinutes: number;
  avgFareEstimate: string;
  tipsHint: string;
  lastUpdated: string;
  distanceKm?: number;
  history?: { time: string; demand: number }[];
}

export interface AISuggestion {
  hubId: string;
  hubName: string;
  category: string;
  demandScore: number;
  demandLevel: string;
  distanceKm: number;
  estimatedWaitMinutes: number;
  avgFareEstimate: string;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy';
  trafficDelayMinutes: number;
  netScore: number;
  recommendationReason: string;
  hindiVoiceReason: string;
  actionGuidance: string;
}

export interface PassengerPing {
  id: string;
  hubId?: string;
  location: Location;
  destinationHint?: string;
  passengerCount: number;
  vehicleType: string;
  timestamp: number;
}

export interface CityConfig {
  id: string;
  name: string;
  center: Location;
  zoom: number;
}
