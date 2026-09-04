-- ==========================================================
-- RideRadar: PostgreSQL + PostGIS Schema for Demand Radar
-- ==========================================================

-- Enable PostGIS extension for high-performance spatial indexing
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. TRANSIT HUBS & DEMAND ZONES
CREATE TABLE IF NOT EXISTS transit_hubs (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('metro', 'railway', 'market', 'college', 'office', 'hospital')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    base_demand INTEGER NOT NULL DEFAULT 50 CHECK (base_demand BETWEEN 0 AND 100),
    current_demand INTEGER NOT NULL DEFAULT 50 CHECK (current_demand BETWEEN 0 AND 100),
    demand_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (demand_level IN ('LOW', 'MEDIUM', 'HIGH', 'SURGE')),
    active_passenger_pings INTEGER NOT NULL DEFAULT 0,
    driver_count_nearby INTEGER NOT NULL DEFAULT 0,
    estimated_wait_minutes INTEGER NOT NULL DEFAULT 3,
    avg_fare_estimate VARCHAR(50) DEFAULT '₹40 - ₹100',
    tips_hint TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-populate and maintain the PostGIS geometry point from lat/lng
CREATE OR REPLACE FUNCTION update_hub_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hub_geom ON transit_hubs;
CREATE TRIGGER trg_hub_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON transit_hubs
FOR EACH ROW
EXECUTE FUNCTION update_hub_geom();

-- 2. PASSENGER PINGS (QR Stand / Web Beacon requests)
CREATE TABLE IF NOT EXISTS passenger_pings (
    id VARCHAR(100) PRIMARY KEY,
    hub_id VARCHAR(100) REFERENCES transit_hubs(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    destination_hint VARCHAR(255),
    passenger_count INTEGER NOT NULL DEFAULT 1 CHECK (passenger_count >= 1),
    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'any' CHECK (vehicle_type IN ('auto', 'e_rickshaw', 'taxi', 'any')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE OR REPLACE FUNCTION update_ping_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ping_geom ON passenger_pings;
CREATE TRIGGER trg_ping_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON passenger_pings
FOR EACH ROW
EXECUTE FUNCTION update_ping_geom();

-- 3. DRIVER GROUND STATUS REPORTS (1-Tap Crowd feedback)
CREATE TABLE IF NOT EXISTS driver_reports (
    id VARCHAR(100) PRIMARY KEY,
    hub_id VARCHAR(100) NOT NULL REFERENCES transit_hubs(id) ON DELETE CASCADE,
    driver_id VARCHAR(100) NOT NULL,
    crowd_status VARCHAR(50) NOT NULL CHECK (crowd_status IN ('empty', 'moderate', 'heavy', 'overcrowded')),
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('auto', 'e_rickshaw', 'taxi')),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DRIVER LIVE LOCATIONS & TELEMETRY
CREATE TABLE IF NOT EXISTS driver_locations (
    driver_id VARCHAR(100) PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'auto',
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_driver_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_driver_geom ON driver_locations;
CREATE TRIGGER trg_driver_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON driver_locations
FOR EACH ROW
EXECUTE FUNCTION update_driver_geom();

-- 5. SPATIAL & B-TREE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_transit_hubs_geom ON transit_hubs USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_transit_hubs_city ON transit_hubs(city);
CREATE INDEX IF NOT EXISTS idx_transit_hubs_demand ON transit_hubs(demand_level, current_demand DESC);

CREATE INDEX IF NOT EXISTS idx_passenger_pings_geom ON passenger_pings USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_passenger_pings_active ON passenger_pings(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_passenger_pings_hub ON passenger_pings(hub_id);

CREATE INDEX IF NOT EXISTS idx_driver_locations_geom ON driver_locations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_driver_locations_status ON driver_locations(status, last_seen);

CREATE INDEX IF NOT EXISTS idx_driver_reports_hub ON driver_reports(hub_id, reported_at DESC);

-- ==========================================================
-- SPATIAL HELPER FUNCTIONS
-- ==========================================================

-- Function to find nearest high-demand hubs within radius in meters
CREATE OR REPLACE FUNCTION get_nearby_hubs(
    driver_lat DOUBLE PRECISION,
    driver_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 5000.0
)
RETURNS TABLE (
    id VARCHAR(100),
    name VARCHAR(255),
    city VARCHAR(100),
    category VARCHAR(50),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    current_demand INTEGER,
    demand_level VARCHAR(20),
    active_passenger_pings INTEGER,
    estimated_wait_minutes INTEGER,
    avg_fare_estimate VARCHAR(50),
    tips_hint TEXT,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.city,
        h.category,
        h.latitude,
        h.longitude,
        h.current_demand,
        h.demand_level,
        h.active_passenger_pings,
        h.estimated_wait_minutes,
        h.avg_fare_estimate,
        h.tips_hint,
        ROUND((ST_DistanceSphere(h.geom, ST_SetSRID(ST_MakePoint(driver_lng, driver_lat), 4326)) / 1000.0)::numeric, 2)::DOUBLE PRECISION AS distance_km
    FROM transit_hubs h
    WHERE ST_DWithin(
        h.geom::geography,
        ST_SetSRID(ST_MakePoint(driver_lng, driver_lat), 4326)::geography,
        radius_meters
    )
    ORDER BY (h.current_demand - (ST_DistanceSphere(h.geom, ST_SetSRID(ST_MakePoint(driver_lng, driver_lat), 4326)) / 1000.0) * 8) DESC;
END;
$$ LANGUAGE plpgsql;
