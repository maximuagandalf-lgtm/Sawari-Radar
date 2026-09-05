"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const hubs_1 = require("./data/hubs");
const demandEngine_1 = require("./services/demandEngine");
const aiDispatcher_1 = require("./services/aiDispatcher");
const db_1 = require("./db");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// REST Endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.get('/api/cities', (req, res) => {
    res.json(hubs_1.CITIES);
});
// AI Smart Dispatcher Recommendations Endpoint
app.post('/api/ai/recommendations', (req, res) => {
    const { driverLocation, vehicleType, priorityPreference, city } = req.body;
    if (!driverLocation || typeof driverLocation.lat !== 'number' || typeof driverLocation.lng !== 'number') {
        return res.status(400).json({ error: 'Driver location coordinates required' });
    }
    const hubs = demandEngine_1.demandEngine.getAllHubs(city);
    const suggestions = aiDispatcher_1.aiSmartDispatcher.generateSuggestions(hubs, {
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
    const city = req.query.city;
    const hubs = demandEngine_1.demandEngine.getAllHubs(city);
    res.json(hubs);
});
app.get('/api/hubs/:id', (req, res) => {
    const hub = demandEngine_1.demandEngine.getHubById(req.params.id);
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
    const ping = demandEngine_1.demandEngine.addPassengerPing({
        location,
        destinationHint: destinationHint || 'Nearby Local Area',
        passengerCount: Number(passengerCount) || 1,
        vehicleType: vehicleType || 'any'
    });
    // Broadcast updated hubs to all connected drivers
    io.emit('hubs_updated', demandEngine_1.demandEngine.getAllHubs());
    io.emit('new_passenger_ping', ping);
    res.status(201).json({ success: true, ping, message: 'Drivers in your vicinity have been notified!' });
});
// Driver 1-Tap Crowd Report
app.post('/api/reports', (req, res) => {
    const { hubId, driverId, crowdStatus, vehicleType } = req.body;
    if (!hubId || !crowdStatus) {
        return res.status(400).json({ error: 'Missing required report fields' });
    }
    const updatedHub = demandEngine_1.demandEngine.addDriverReport({
        hubId,
        driverId: driverId || 'driver_' + Math.random().toString(36).substring(2, 6),
        crowdStatus,
        vehicleType: vehicleType || 'auto'
    });
    if (!updatedHub) {
        return res.status(404).json({ error: 'Hub not found' });
    }
    io.emit('hubs_updated', demandEngine_1.demandEngine.getAllHubs());
    res.json({ success: true, hub: updatedHub });
});
// Simulation trigger (Metro arrival / rush burst)
app.post('/api/simulate-rush', (req, res) => {
    const { hubId, extraPassengers } = req.body;
    const updatedHub = demandEngine_1.demandEngine.triggerRushEvent(hubId, extraPassengers || 20);
    if (!updatedHub) {
        return res.status(404).json({ error: 'Hub not found' });
    }
    io.emit('hubs_updated', demandEngine_1.demandEngine.getAllHubs());
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
    socket.emit('hubs_updated', demandEngine_1.demandEngine.getAllHubs());
    // Driver sends live location
    socket.on('driver_location', (data) => {
        // Find nearest hotspots within 5km
        const allHubs = demandEngine_1.demandEngine.getAllHubs();
        const hubsWithDistance = allHubs.map((hub) => ({
            ...hub,
            distanceKm: demandEngine_1.demandEngine.calculateDistance(data, hub.location)
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
    io.emit('hubs_updated', demandEngine_1.demandEngine.getAllHubs());
}, 10000);
// Serve client build in production
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
app.use(express_1.default.static(clientDistPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
});
server.listen(PORT, async () => {
    console.log(`🚀 Sawari Radar Server running on port ${PORT}`);
    await (0, db_1.checkDatabaseConnection)();
});
