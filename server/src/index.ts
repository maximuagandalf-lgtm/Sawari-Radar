import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CITIES } from './data/hubs';
import { demandEngine } from './services/demandEngine';
import { aiSmartDispatcher } from './services/aiDispatcher';
import { checkDatabaseConnection } from './db';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/cities', (req, res) => {
  res.json(CITIES);
});

// AI Smart Dispatcher Recommendations Endpoint
app.post('/api/ai/recommendations', (req, res) => {
  const { driverLocation, vehicleType, priorityPreference, city } = req.body;
  if (!driverLocation || typeof driverLocation.lat !== 'number' || typeof driverLocation.lng !== 'number') {
    return res.status(400).json({ error: 'Driver location coordinates required' });
  }

  const hubs = demandEngine.getAllHubs(city);
  const suggestions = aiSmartDispatcher.generateSuggestions(hubs, {
    driverLocation,
    vehicleType: vehicleType || 'auto',
    priorityPreference: priorityPreference || 'balanced',
  });

  res.json({
    success: true,
    suggestions,
    topRecommendation: suggestions[0] || null,
  });
});

app.get('/api/hubs', (req, res) => {
  const city = req.query.city as string | undefined;
  const hubs = demandEngine.getAllHubs(city);
  res.json(hubs);
});

app.get('/api/hubs/:id', (req, res) => {
  const hub = demandEngine.getHubById(req.params.id);
  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }
  res.json(hub);
});

// Passenger 1-Tap QR Beacon / Web Ping
app.post('/api/pings', (req, res) => {
  const { location, destinationHint, passengerCount, vehicleType } = req.body;
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return res.status(400).json({ error: 'Invalid location coordinates' });
  }

  const ping = demandEngine.addPassengerPing({
    location,
    destinationHint: destinationHint || 'Nearby Local Area',
    passengerCount: Number(passengerCount) || 1,
    vehicleType: vehicleType || 'any'
  });

  // Broadcast updated hubs to all connected drivers
  io.emit('hubs_updated', demandEngine.getAllHubs());
  io.emit('new_passenger_ping', ping);

  res.status(201).json({ success: true, ping, message: 'Drivers in your vicinity have been notified!' });
});

// Driver 1-Tap Crowd Report
app.post('/api/reports', (req, res) => {
  const { hubId, driverId, crowdStatus, vehicleType } = req.body;
  if (!hubId || !crowdStatus) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const updatedHub = demandEngine.addDriverReport({
    hubId,
    driverId: driverId || 'driver_' + Math.random().toString(36).substring(2, 6),
    crowdStatus,
    vehicleType: vehicleType || 'auto'
  });

  if (!updatedHub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  io.emit('hubs_updated', demandEngine.getAllHubs());
  res.json({ success: true, hub: updatedHub });
});

// Simulation trigger (Metro arrival / rush burst)
app.post('/api/simulate-rush', (req, res) => {
  const { hubId, extraPassengers } = req.body;
  const updatedHub = demandEngine.triggerRushEvent(hubId, extraPassengers || 20);
  if (!updatedHub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  io.emit('hubs_updated', demandEngine.getAllHubs());
  io.emit('rush_alert', {
    hubId: updatedHub.id,
    hubName: updatedHub.name,
    message: updatedHub.tipsHint,
    demandLevel: updatedHub.demandLevel
  });

  res.json({ success: true, hub: updatedHub });
});

// Real-time WebSocket connection handling
io.on('connection', (socket) => {
  // Send initial data to newly connected client
  socket.emit('hubs_updated', demandEngine.getAllHubs());

  // Driver sends live location
  socket.on('driver_location', (data: { lat: number; lng: number; vehicleType?: string }) => {
    // Find nearest hotspots within 5km
    const allHubs = demandEngine.getAllHubs();
    const hubsWithDistance = allHubs.map((hub) => ({
      ...hub,
      distanceKm: demandEngine.calculateDistance(data, hub.location)
    }));

    // Sort by priority (demand score vs distance)
    hubsWithDistance.sort((a, b) => {
      const scoreA = a.currentDemand - a.distanceKm * 8;
      const scoreB = b.currentDemand - b.distanceKm * 8;
      return scoreB - scoreA;
    });

    socket.emit('nearby_recommendations', hubsWithDistance.slice(0, 5));
  });
});

// Broadcast regular heartbeat updates to drivers every 10s
setInterval(() => {
  io.emit('hubs_updated', demandEngine.getAllHubs());
}, 10000);

server.listen(PORT, async () => {
  console.log(`🚀 Demand Radar Server running on http://localhost:${PORT}`);
  await checkDatabaseConnection();
});
