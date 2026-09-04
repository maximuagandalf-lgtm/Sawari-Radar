-- ==========================================================
-- RideRadar: Seed Data for Transit Hubs
-- ==========================================================

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  -- Delhi NCR
  ('delhi-kashmere-gate', 'Kashmere Gate Metro (Gate 1 & 2)', 'delhi', 'metro', 28.6672, 77.2285, 75, 88, 'SURGE', 24, 6, 1, '₹40 - ₹90', 'Interchange rush! Huge crowd heading towards Old Delhi & ISBT.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('delhi-anand-vihar', 'Anand Vihar ISBT & Metro', 'delhi', 'railway', 28.6469, 77.3161, 80, 92, 'SURGE', 31, 8, 2, '₹60 - ₹150', 'Long-distance buses arriving from UP/Uttarakhand.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('delhi-ndls-ajmeri', 'New Delhi Rly Station (Ajmeri Gate)', 'delhi', 'railway', 28.6429, 77.2215, 85, 78, 'HIGH', 19, 11, 3, '₹80 - ₹200', 'Shatabdi & Vande Bharat express arrivals right now.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('delhi-rajiv-chowk', 'Rajiv Chowk / CP Inner Circle', 'delhi', 'market', 28.6328, 77.2197, 65, 60, 'MEDIUM', 12, 15, 4, '₹50 - ₹120', 'Office dispersal starting soon.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('delhi-north-campus', 'Vishwa Vidyalaya Metro (DU North Campus)', 'delhi', 'college', 28.6975, 77.2120, 70, 84, 'HIGH', 22, 5, 2, '₹30 - ₹70', 'College classes ended; heavy demand for shared e-rickshaws to Hudson Lane.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('delhi-cyber-hub', 'Cyber City / DLF Cyber Hub Gurugram', 'delhi', 'office', 28.4952, 77.0890, 70, 95, 'SURGE', 42, 12, 1, '₹80 - ₹250', 'Corporate shift wrap-up. Rapid Metro queues overflowing.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

-- Bengaluru
INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('blr-majestic', 'KSR Majestic Railway & Bus Station', 'bengaluru', 'railway', 12.9784, 77.5726, 80, 91, 'SURGE', 35, 12, 1, '₹70 - ₹180', 'Inter-city bus arrivals; high auto demand towards Malleshwaram & Rajajinagar.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('blr-indiranagar', 'Indiranagar Metro (100 Ft Road)', 'bengaluru', 'metro', 12.9783, 77.6408, 65, 76, 'HIGH', 18, 7, 2, '₹50 - ₹150', 'Evening pub & cafe crowd starting.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

-- Mumbai
INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('mum-dadar', 'Dadar Station (Flower Market / East)', 'mumbai', 'railway', 19.0178, 72.8478, 85, 96, 'SURGE', 45, 14, 1, '₹50 - ₹120', 'Local train peak frequency! Massive queue at taxi stand.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;

-- Jaipur
INSERT INTO transit_hubs (id, name, city, category, latitude, longitude, base_demand, current_demand, demand_level, active_passenger_pings, driver_count_nearby, estimated_wait_minutes, avg_fare_estimate, tips_hint)
VALUES
  ('jpr-junction', 'Jaipur Junction Railway Station', 'jaipur', 'railway', 26.9196, 75.7878, 70, 82, 'HIGH', 18, 8, 2, '₹50 - ₹130', 'Superfast express arrival; passengers heading towards Sindhi Camp & Mansarovar.')
  ON CONFLICT (id) DO UPDATE SET current_demand = EXCLUDED.current_demand, demand_level = EXCLUDED.demand_level;
