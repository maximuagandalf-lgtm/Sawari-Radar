# 🛺 Sawari Radar - Auto / E-Rickshaw / Taxi Real-Time Demand Radar

> **Smart Passenger Demand Heatmap & Hotspot Navigation System**

**Sawari Radar** solves the **"dead mileage"** and **unpredictable wait time** problem for street-hailing drivers (Autos, E-Rickshaws, Taxis) and commuters. Instead of relying on high-commission ride-dispatch apps, Sawari Radar functions as an **intelligent real-time demand radar** that guides drivers to areas with high passenger footfall and waiting queues.

---

## 🌟 Key Features

1. **Live Driver Radar Map**:
   - High-contrast, sunlight-readable dark map with pulsing hotspots (`SURGE 🔥`, `HIGH ⚡`, `MEDIUM 🟡`).
   - Real-time GPS location tracking and 1.2 km search radius circle.
   - Pre-seeded realistic transit hotspots for **Delhi NCR**, **Bengaluru**, **Mumbai**, and **Jaipur** (Metro gates, railway stations, office tech parks, college campuses, markets).

2. **Multilingual Voice Alerts (Hindi, Hinglish, English)**:
   - Voice audio cues announcing crowd spikes when approaching high-demand transit hubs.
   - Example: *"Attention! Kashmere Gate Metro pe high demand hai. 30+ customers waiting."*

3. **Zero-Download Passenger Web Beacon (QR Stands)**:
   - Passengers waiting at metro/bus stands can tap **1 button** in their mobile browser to ping nearby drivers without needing to install an app.
   - Drivers in the vicinity immediately see the spike on their radar.

4. **1-Tap Driver Ground Reporting ("Crowd Radar")**:
   - Drivers tap 1 button on arrival: *"Massive Crowd 🔥"*, *"Steady High ⚡"*, *"Normal Flow 🟡"*, or *"Stand Empty ⚪"*.
   - Dynamically updates the demand algorithm for all nearby drivers.

5. **Integrated Turn-by-Turn Navigation**:
   - 1-click **Start Navigation** connects directly to Google Maps / GPS directions to the target hotspot gate.

6. **Interactive Rush Simulator**:
   - Test mode allowing you to trigger simulated Metro train arrivals, college dismissals, and corporate logouts to see live radar updates.

---

## 🚀 Quick Start (Running Locally)

### 1. Start Both Backend & Frontend with One Command
From the root directory:
```bash
npm run dev
```

This starts:
- **Backend API & WebSocket Server**: [http://localhost:4000](http://localhost:4000)
- **Driver Radar Web Client**: [http://localhost:3000](http://localhost:3000)

Open [http://localhost:3000](http://localhost:3000) in your browser (or open in your mobile browser connected to the same Wi-Fi using your local IP, e.g., `http://192.168.x.x:3000`).

---

## 📱 Packaging as an Android Mobile App (for Non-Developers)

Because this application is built with a modern mobile-responsive frontend (React + Tailwind + Leaflet), you can package it into a native Android APK in **2 easy steps using Capacitor**:

```bash
# 1. Inside the client directory, install Capacitor
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init RideRadar com.rideradar.app

# 2. Build and sync to Android project
npm run build
npx cap add android
npx cap open android
```
*(This opens the project in Android Studio, where you can click "Build APK" to install on any Android phone or tablet mounted on an auto dashboard).*

---

## 🏗️ Project Architecture

```
traffic_predictor/
├── package.json              # Unified dev scripts (runs backend & frontend)
├── server/                   # Node.js + Express + Socket.io backend
│   ├── src/
│   │   ├── data/hubs.ts      # Transit hubs dataset (Delhi, Bengaluru, Mumbai, Jaipur)
│   │   ├── services/         # Geospatial clustering & simulation engine
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.ts          # REST endpoints & WebSocket broadcasts
│   └── package.json
└── client/                   # Vite + React + Tailwind CSS + Leaflet frontend
    ├── src/
    │   ├── components/       # Radar Map, Hotspot Cards, Passenger Beacon, Modals
    │   ├── services/         # Web SpeechSynthesis Voice Alert Service
    │   ├── types.ts          # Client types
    │   └── App.tsx           # Main application state and WebSocket connector
    └── package.json
```

---

## 🎯 How Demand Prediction Works (Cold-Start Solution)

1. **Baseline Transit Timetables**: Metro arrival frequencies and scheduled office hours create a baseline demand curve.
2. **Passenger Web Beacon**: Real-time crowd pings from QR stands at transit hubs boost demand scores dynamically.
3. **Driver Feedback**: Crowd status reports from drivers on the ground apply positive/negative weights.
4. **Time Decay**: Hotspots gradually cool down over a 15-minute window if no further pings are detected.
