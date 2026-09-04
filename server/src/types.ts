export type DemandLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SURGE';

export type HubCategory = 'metro' | 'railway' | 'market' | 'college' | 'office' | 'hospital';

export type VehicleType = 'auto' | 'e_rickshaw' | 'taxi' | 'any';

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
  history: { time: string; demand: number }[];
}

export interface PassengerPing {
  id: string;
  hubId?: string;
  location: Location;
  destinationHint?: string;
  passengerCount: number;
  vehicleType: VehicleType;
  timestamp: number;
  activeUntil: number;
}

export interface DriverReport {
  id: string;
  driverId: string;
  hubId: string;
  crowdStatus: 'empty' | 'moderate' | 'heavy' | 'overcrowded';
  vehicleType: VehicleType;
  timestamp: number;
}

export interface CityConfig {
  id: string;
  name: string;
  center: Location;
  zoom: number;
}
