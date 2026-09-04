import { INITIAL_HUBS } from '../data/hubs';
import { DemandLevel, DriverReport, Location, PassengerPing, TransitHub } from '../types';

export class DemandEngine {
  private hubs: Map<string, TransitHub> = new Map();
  private pings: PassengerPing[] = [];
  private reports: DriverReport[] = [];

  constructor() {
    // Initialize hubs with starting historical data
    INITIAL_HUBS.forEach((hub) => {
      const history = this.generateInitialHistory(hub.currentDemand);
      this.hubs.set(hub.id, { ...hub, history });
    });

    // Start background demand recalculation & simulation loop
    this.startSimulationLoop();
  }

  private generateInitialHistory(currentDemand: number) {
    const history = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now - i * 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const fluctuation = Math.floor((Math.random() - 0.5) * 15);
      history.push({
        time,
        demand: Math.min(100, Math.max(20, currentDemand + fluctuation))
      });
    }
    return history;
  }

  public getAllHubs(city?: string): TransitHub[] {
    const list = Array.from(this.hubs.values());
    if (city) {
      return list.filter((h) => h.city.toLowerCase() === city.toLowerCase());
    }
    return list;
  }

  public getHubById(id: string): TransitHub | undefined {
    return this.hubs.get(id);
  }

  // Calculate distance in km between two geo coordinates
  public calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  // Register a passenger ping (from QR stand or web beacon)
  public addPassengerPing(ping: Omit<PassengerPing, 'id' | 'timestamp' | 'activeUntil'>): PassengerPing {
    const now = Date.now();
    const newPing: PassengerPing = {
      ...ping,
      id: 'ping_' + Math.random().toString(36).substring(2, 9),
      timestamp: now,
      activeUntil: now + 15 * 60 * 1000 // 15 mins active window
    };

    this.pings.push(newPing);

    // Find closest hub within 2km and boost demand
    let closestHub: TransitHub | null = null;
    let minDistance = 2.0;

    for (const hub of this.hubs.values()) {
      const dist = this.calculateDistance(ping.location, hub.location);
      if (dist < minDistance) {
        minDistance = dist;
        closestHub = hub;
      }
    }

    if (closestHub) {
      newPing.hubId = closestHub.id;
      closestHub.activePassengerPings += ping.passengerCount;
      closestHub.currentDemand = Math.min(100, closestHub.currentDemand + ping.passengerCount * 3);
      closestHub.demandLevel = this.calculateDemandLevel(closestHub.currentDemand);
      closestHub.lastUpdated = new Date().toISOString();
    }

    return newPing;
  }

  // Register a driver crowd status report
  public addDriverReport(report: Omit<DriverReport, 'id' | 'timestamp'>): TransitHub | null {
    const hub = this.hubs.get(report.hubId);
    if (!hub) return null;

    const newReport: DriverReport = {
      ...report,
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    this.reports.push(newReport);

    // Adjust hub demand based on community ground feedback
    if (report.crowdStatus === 'overcrowded') {
      hub.currentDemand = Math.min(100, hub.currentDemand + 15);
      hub.activePassengerPings += 8;
    } else if (report.crowdStatus === 'heavy') {
      hub.currentDemand = Math.min(100, hub.currentDemand + 8);
      hub.activePassengerPings += 4;
    } else if (report.crowdStatus === 'empty') {
      hub.currentDemand = Math.max(15, hub.currentDemand - 15);
      hub.activePassengerPings = Math.max(0, hub.activePassengerPings - 5);
    }

    hub.demandLevel = this.calculateDemandLevel(hub.currentDemand);
    hub.lastUpdated = new Date().toISOString();
    return hub;
  }

  private calculateDemandLevel(score: number): DemandLevel {
    if (score >= 85) return 'SURGE';
    if (score >= 65) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  // Background loop to simulate live passenger flow and decay old pings
  private startSimulationLoop() {
    setInterval(() => {
      const now = Date.now();
      // Filter expired pings
      this.pings = this.pings.filter((p) => p.activeUntil > now);

      // Slightly fluctuate hubs to simulate real city heartbeat
      for (const hub of this.hubs.values()) {
        const delta = (Math.random() - 0.48) * 4; // slight organic change
        hub.currentDemand = Math.min(99, Math.max(20, Math.round(hub.currentDemand + delta)));
        hub.demandLevel = this.calculateDemandLevel(hub.currentDemand);
        hub.lastUpdated = new Date().toISOString();

        // Calculate dynamic wait time
        hub.estimatedWaitMinutes = hub.demandLevel === 'SURGE' ? 1 : hub.demandLevel === 'HIGH' ? 2 : 4;

        // Keep 8 history points
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (hub.history.length > 8) {
          hub.history.shift();
        }
        hub.history.push({ time, demand: hub.currentDemand });
      }
    }, 12000);
  }

  // Trigger a simulated rush event (e.g. Metro arrival button for demonstration)
  public triggerRushEvent(hubId: string, extraPassengers = 15): TransitHub | null {
    const hub = this.hubs.get(hubId);
    if (!hub) return null;

    hub.currentDemand = Math.min(100, hub.currentDemand + 20);
    hub.activePassengerPings += extraPassengers;
    hub.demandLevel = 'SURGE';
    hub.tipsHint = `🚨 Metro Train just arrived! ${extraPassengers}+ passengers exited towards Gate 1 & 2.`;
    hub.lastUpdated = new Date().toISOString();
    return hub;
  }
}

export const demandEngine = new DemandEngine();
