-- ==========================================
-- PHASE 1: MEDIEVAL GEOGRAPHY (Additive)
-- Western Mediterranean map slice (~55 provinces)
-- ==========================================

-- 1. Map versions (versioned geography assets)
CREATE TABLE IF NOT EXISTS public.map_versions (
    id SERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE CHECK (char_length(version) >= 2 AND char_length(version) <= 50),
    description TEXT,
    topojson_asset TEXT NOT NULL, -- path to versioned TopoJSON asset
    province_count INT NOT NULL DEFAULT 0 CHECK (province_count > 0),
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 2. Region geography metadata (keyed by existing regions.id)
CREATE TABLE IF NOT EXISTS public.region_geography (
    region_id INT PRIMARY KEY REFERENCES public.regions(id) ON DELETE CASCADE,
    terrain TEXT NOT NULL DEFAULT 'plains' CHECK (terrain IN ('plains', 'forest', 'mountain', 'desert', 'coastal', 'marine', 'volcanic')),
    climate TEXT NOT NULL DEFAULT 'temperate' CHECK (climate IN ('arid', 'temperate', 'mediterranean', 'continental', 'marine', 'tropical')),
    culture TEXT NOT NULL DEFAULT 'unknown',
    development NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (development >= 0 AND development <= 100),
    capital BOOLEAN NOT NULL DEFAULT false,
    is_port BOOLEAN NOT NULL DEFAULT false,
    geometry_ref TEXT, -- reference into TopoJSON features
    display_name_local TEXT, -- localized display name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 3. Weighted adjacency graph (land borders, mountain passes, navigable seas, straits)
CREATE TABLE IF NOT EXISTS public.region_edges (
    id SERIAL PRIMARY KEY,
    from_region_id INT NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    to_region_id INT NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'land' CHECK (mode IN ('land', 'mountain_pass', 'navigable_sea', 'strait')),
    cost NUMERIC(6,2) NOT NULL DEFAULT 10.00 CHECK (cost > 0),
    seasonal_restrictions TEXT[], -- e.g. {'winter'} for mountain passes blocked in winter
    traversal_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_reciprocal BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    CONSTRAINT region_edges_from_to_unique UNIQUE (from_region_id, to_region_id, mode),
    CONSTRAINT region_edges_not_self CHECK (from_region_id <> to_region_id)
);

-- 4. Province control (reuses military_regions ownership; additive audit layer)
CREATE TABLE IF NOT EXISTS public.control_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id INT NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
    from_country_id INT REFERENCES public.countries(id) ON DELETE SET NULL,
    to_country_id INT NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    cause TEXT NOT NULL DEFAULT 'initial' CHECK (cause IN ('initial', 'conquest', 'liberation', 'treaty_transfer', 'civil_revolt')),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 5. Enable RLS on new tables
ALTER TABLE public.map_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_geography ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_events ENABLE ROW LEVEL SECURITY;

-- Read policies (all authenticated users can read geography)
CREATE POLICY "Map versions readable by everyone" ON public.map_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Region geography readable by everyone" ON public.region_geography FOR SELECT TO authenticated USING (true);
CREATE POLICY "Region edges readable by everyone" ON public.region_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Control events readable by everyone" ON public.control_events FOR SELECT TO authenticated USING (true);

-- Write policies (admin only)
CREATE POLICY "Map versions modifiable by Admin" ON public.map_versions FOR ALL USING (public.is_admin());
CREATE POLICY "Region geography modifiable by Admin" ON public.region_geography FOR ALL USING (public.is_admin());
CREATE POLICY "Region edges modifiable by Admin" ON public.region_edges FOR ALL USING (public.is_admin());
CREATE POLICY "Control events modifiable by Admin" ON public.control_events FOR ALL USING (public.is_admin());

-- 6. Indexes for common access patterns
CREATE INDEX idx_region_geography_region ON public.region_geography(region_id);
CREATE INDEX idx_region_edges_from ON public.region_edges(from_region_id);
CREATE INDEX idx_region_edges_to ON public.region_edges(to_region_id);
CREATE INDEX idx_control_events_region ON public.control_events(region_id);
CREATE INDEX idx_control_events_occurred_at ON public.control_events(occurred_at);

-- 7. Seed map version
INSERT INTO public.map_versions (version, description, topojson_asset, province_count, is_active)
VALUES ('v1-western-mediterranean', 'Western Mediterranean medieval map slice (54 provinces)', 'database/schemas/medieval_world_v1.topojson', 54, true)
ON CONFLICT (version) DO NOTHING;

-- 8. Seed western Mediterranean countries (additive; existing countries untouched)
INSERT INTO public.countries (id, name, gold_reserve, local_currency_reserve, vat_rate, import_tax_rate, income_tax_rate)
VALUES
  (100, 'Qurtuban Emirate', 12000.0000, 800000.00, 8.00, 10.00, 8.00),
  (101, 'Maghrebi Kingdom', 15000.0000, 900000.00, 10.00, 12.00, 10.00),
  (102, 'Byzantine Exarchate', 18000.0000, 1200000.00, 12.00, 10.00, 12.00),
  (103, 'Republic of Genoa', 22000.0000, 1500000.00, 6.00, 8.00, 6.00)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed region geography metadata for new western Mediterranean regions
INSERT INTO public.region_geography (region_id, terrain, climate, culture, development, capital, is_port, geometry_ref, display_name_local)
VALUES
  (1000, 'coastal', 'temperate', 'iberian', 12.5, false, true, 'region-1000', 'Galiza'),
  (1001, 'mountain', 'temperate', 'iberian', 10.0, false, true, 'region-1001', 'Asturies'),
  (1002, 'coastal', 'temperate', 'iberian', 11.0, false, true, 'region-1002', 'Cantabria'),
  (1003, 'mountain', 'temperate', 'iberian', 14.0, false, true, 'region-1003', 'Euskal Herria'),
  (1004, 'mountain', 'continental', 'iberian', 11.5, false, false, 'region-1004', 'Nafarroa'),
  (1005, 'plains', 'continental', 'iberian', 13.0, false, false, 'region-1005', 'Aragón'),
  (1006, 'coastal', 'mediterranean', 'iberian', 18.0, false, true, 'region-1006', 'Catalunya'),
  (1007, 'coastal', 'mediterranean', 'iberian', 15.0, false, true, 'region-1007', 'València'),
  (1008, 'coastal', 'arid', 'iberian', 11.0, false, true, 'region-1008', 'Murcia'),
  (1009, 'plains', 'mediterranean', 'iberian', 16.0, false, true, 'region-1009', 'Andalucía'),
  (1010, 'plains', 'mediterranean', 'iberian', 9.0, false, false, 'region-1010', 'Extremadura'),
  (1011, 'plains', 'continental', 'iberian', 12.0, false, false, 'region-1011', 'Castilla y León'),
  (1012, 'plains', 'continental', 'iberian', 10.5, false, false, 'region-1012', 'Castilla-La Mancha'),
  (1013, 'plains', 'continental', 'iberian', 22.0, true, false, 'region-1013', 'Madrid'),
  (1014, 'coastal', 'mediterranean', 'iberian', 20.0, true, true, 'region-1014', 'Lisboa'),
  (1015, 'plains', 'mediterranean', 'iberian', 9.5, false, false, 'region-1015', 'Alentejo'),
  (1016, 'coastal', 'mediterranean', 'iberian', 13.0, false, true, 'region-1016', 'Algarve'),
  (1017, 'coastal', 'mediterranean', 'occitan', 17.0, false, true, 'region-1017', 'Provença'),
  (1018, 'coastal', 'mediterranean', 'occitan', 14.0, false, true, 'region-1018', 'Lengadòc'),
  (1019, 'plains', 'temperate', 'occitan', 15.0, false, true, 'region-1019', 'Akitània'),
  (1020, 'plains', 'continental', 'occitan', 16.0, false, false, 'region-1020', 'Vallée du Rhône'),
  (1021, 'mountain', 'mediterranean', 'italian', 15.0, false, true, 'region-1021', 'Liguria'),
  (1022, 'mountain', 'continental', 'italian', 16.0, false, false, 'region-1022', 'Piemont'),
  (1023, 'plains', 'continental', 'italian', 20.0, false, false, 'region-1023', 'Lombardia'),
  (1024, 'coastal', 'continental', 'italian', 18.0, false, true, 'region-1024', 'Veneto'),
  (1025, 'plains', 'continental', 'italian', 17.0, false, false, 'region-1025', 'Emilia-Romagna'),
  (1026, 'coastal', 'mediterranean', 'italian', 18.0, false, true, 'region-1026', 'Toscana'),
  (1027, 'coastal', 'mediterranean', 'italian', 21.0, true, true, 'region-1027', 'Lazio'),
  (1028, 'coastal', 'mediterranean', 'italian', 17.0, false, true, 'region-1028', 'Campania'),
  (1029, 'coastal', 'mediterranean', 'italian', 15.0, false, true, 'region-1029', 'Puglia'),
  (1030, 'mountain', 'mediterranean', 'italian', 11.0, false, true, 'region-1030', 'Calabria'),
  (1031, 'plains', 'mediterranean', 'italian', 16.0, false, true, 'region-1031', 'Sicilia'),
  (1032, 'plains', 'mediterranean', 'italian', 13.0, false, true, 'region-1032', 'Sardegna'),
  (1033, 'mountain', 'mediterranean', 'italian', 11.0, false, true, 'region-1033', 'Corsica'),
  (1034, 'mountain', 'mediterranean', 'italian', 8.0, false, true, 'region-1034', 'Elba'),
  (1035, 'island', 'mediterranean', 'iberian', 14.0, false, true, 'region-1035', 'Mallorca'),
  (1036, 'island', 'mediterranean', 'mediterranean', 12.0, false, true, 'region-1036', 'Malta'),
  (1037, 'island', 'mediterranean', 'mediterranean', 7.0, false, true, 'region-1037', 'Pantelleria'),
  (1038, 'island', 'arid', 'berber', 8.0, false, true, 'region-1038', 'Jarzis'),
  (1039, 'island', 'mediterranean', 'iberian', 11.0, false, true, 'region-1039', 'Eivissa'),
  (1040, 'island', 'mediterranean', 'iberian', 10.0, false, true, 'region-1040', 'Menorca'),
  (1041, 'coastal', 'mediterranean', 'iberian', 13.0, false, true, 'region-1041', 'Ceuta'),
  (1042, 'coastal', 'mediterranean', 'berber', 15.0, false, true, 'region-1042', 'Tanja'),
  (1043, 'mountain', 'continental', 'berber', 16.0, true, false, 'region-1043', 'Fas'),
  (1044, 'mountain', 'arid', 'berber', 17.0, false, false, 'region-1044', 'Marrakesh'),
  (1045, 'plains', 'arid', 'berber', 11.0, false, false, 'region-1045', 'Souss'),
  (1046, 'coastal', 'mediterranean', 'berber', 18.0, false, true, 'region-1046', 'Al-Jaza''ir'),
  (1047, 'coastal', 'mediterranean', 'berber', 14.0, false, true, 'region-1047', 'Wahran'),
  (1048, 'mountain', 'mediterranean', 'berber', 12.0, false, false, 'region-1048', 'Tamurt n Leqvayel'),
  (1049, 'plains', 'mediterranean', 'berber', 14.0, false, false, 'region-1049', 'Qusanṭinah'),
  (1050, 'coastal', 'mediterranean', 'berber', 19.0, true, true, 'region-1050', 'Tūnis'),
  (1051, 'coastal', 'mediterranean', 'berber', 13.0, false, true, 'region-1051', 'Banzart'),
  (1052, 'coastal', 'arid', 'berber', 14.0, false, true, 'region-1052', 'Ṣafāqis'),
  (1053, 'coastal', 'arid', 'berber', 12.0, false, true, 'region-1053', 'Ṭarābulus al-Gharb')
ON CONFLICT (region_id) DO UPDATE SET
  terrain = excluded.terrain, climate = excluded.climate, culture = excluded.culture,
  development = excluded.development, capital = excluded.capital, is_port = excluded.is_port,
  geometry_ref = excluded.geometry_ref, display_name_local = excluded.display_name_local;

-- 10. Seed military_regions ownership for new regions (additive; preserves existing mechanism)
INSERT INTO public.military_regions (region_id, owner_country_id, occupier_country_id, resistance_level, supply_status)
VALUES
  (1000, 100, 100, 0, 'supplied'),
  (1001, 100, 100, 0, 'supplied'),
  (1002, 100, 100, 0, 'supplied'),
  (1003, 100, 100, 0, 'supplied'),
  (1004, 100, 100, 0, 'supplied'),
  (1005, 100, 100, 0, 'supplied'),
  (1006, 100, 100, 0, 'supplied'),
  (1007, 100, 100, 0, 'supplied'),
  (1008, 100, 100, 0, 'supplied'),
  (1009, 100, 100, 0, 'supplied'),
  (1010, 100, 100, 0, 'supplied'),
  (1011, 100, 100, 0, 'supplied'),
  (1012, 100, 100, 0, 'supplied'),
  (1013, 100, 100, 0, 'supplied'),
  (1014, 100, 100, 0, 'supplied'),
  (1015, 100, 100, 0, 'supplied'),
  (1016, 100, 100, 0, 'supplied'),
  (1017, 102, 102, 0, 'supplied'),
  (1018, 102, 102, 0, 'supplied'),
  (1019, 102, 102, 0, 'supplied'),
  (1020, 102, 102, 0, 'supplied'),
  (1021, 102, 102, 0, 'supplied'),
  (1022, 102, 102, 0, 'supplied'),
  (1023, 102, 102, 0, 'supplied'),
  (1024, 102, 102, 0, 'supplied'),
  (1025, 102, 102, 0, 'supplied'),
  (1026, 102, 102, 0, 'supplied'),
  (1027, 102, 102, 0, 'supplied'),
  (1028, 102, 102, 0, 'supplied'),
  (1029, 102, 102, 0, 'supplied'),
  (1030, 102, 102, 0, 'supplied'),
  (1031, 102, 102, 0, 'supplied'),
  (1032, 102, 102, 0, 'supplied'),
  (1033, 102, 102, 0, 'supplied'),
  (1034, 102, 102, 0, 'supplied'),
  (1035, 100, 100, 0, 'supplied'),
  (1036, 103, 103, 0, 'supplied'),
  (1037, 103, 103, 0, 'supplied'),
  (1038, 101, 101, 0, 'supplied'),
  (1039, 100, 100, 0, 'supplied'),
  (1040, 100, 100, 0, 'supplied'),
  (1041, 100, 100, 0, 'supplied'),
  (1042, 101, 101, 0, 'supplied'),
  (1043, 101, 101, 0, 'supplied'),
  (1044, 101, 101, 0, 'supplied'),
  (1045, 101, 101, 0, 'supplied'),
  (1046, 101, 101, 0, 'supplied'),
  (1047, 101, 101, 0, 'supplied'),
  (1048, 101, 101, 0, 'supplied'),
  (1049, 101, 101, 0, 'supplied'),
  (1050, 101, 101, 0, 'supplied'),
  (1051, 101, 101, 0, 'supplied'),
  (1052, 101, 101, 0, 'supplied'),
  (1053, 101, 101, 0, 'supplied')
ON CONFLICT (region_id) DO NOTHING;

-- 11. Seed region adjacency edges (weighted land and maritime connections)
INSERT INTO public.region_edges (from_region_id, to_region_id, mode, cost, seasonal_restrictions, traversal_rules, is_reciprocal)
VALUES
  -- Iberian peninsula land connections
  (1000, 1001, 'land', 15.00, '{}', '{}', true),
  (1001, 1002, 'land', 12.00, '{}', '{}', true),
  (1002, 1003, 'land', 12.00, '{}', '{}', true),
  (1003, 1004, 'land', 15.00, '{}', '{}', true),
  (1004, 1005, 'land', 14.00, '{}', '{}', true),
  (1005, 1006, 'land', 13.00, '{}', '{}', true),
  (1006, 1007, 'land', 12.00, '{}', '{}', true),
  (1007, 1008, 'land', 12.00, '{}', '{}', true),
  (1008, 1009, 'land', 14.00, '{}', '{}', true),
  (1009, 1010, 'land', 16.00, '{}', '{}', true),
  (1010, 1011, 'land', 18.00, '{}', '{}', true),
  (1011, 1012, 'land', 16.00, '{}', '{}', true),
  (1012, 1013, 'land', 14.00, '{}', '{}', true),
  (1013, 1014, 'land', 20.00, '{}', '{}', true),
  -- Portugal internal
  (1014, 1015, 'land', 14.00, '{}', '{}', true),
  (1015, 1016, 'land', 16.00, '{}', '{}', true),
  -- Southern France connections
  (1003, 1019, 'land', 18.00, '{}', '{}', true),
  (1019, 1020, 'land', 16.00, '{}', '{}', true),
  (1020, 1021, 'land', 16.00, '{}', '{}', true),
  (1021, 1022, 'mountain_pass', 22.00, '{"winter"}', '{"restricted_winter": true}', true),
  (1022, 1023, 'land', 15.00, '{}', '{}', true),
  (1023, 1024, 'land', 14.00, '{}', '{}', true),
  (1024, 1025, 'land', 14.00, '{}', '{}', true),
  (1025, 1026, 'land', 14.00, '{}', '{}', true),
  (1026, 1027, 'land', 15.00, '{}', '{}', true),
  (1027, 1028, 'land', 16.00, '{}', '{}', true),
  (1028, 1029, 'land', 17.00, '{}', '{}', true),
  (1029, 1030, 'land', 18.00, '{}', '{}', true),
  (1030, 1031, 'land', 20.00, '{}', '{}', true),
  -- Maritime connections (sea routes)
  (1000, 1035, 'navigable_sea', 25.00, '{}', '{}', true),
  (1006, 1039, 'navigable_sea', 20.00, '{}', '{}', true),
  (1006, 1040, 'navigable_sea', 20.00, '{}', '{}', true),
  (1009, 1031, 'navigable_sea', 28.00, '{}', '{}', true),
  (1009, 1046, 'navigable_sea', 24.00, '{}', '{}', true),
  (1014, 1035, 'navigable_sea', 22.00, '{}', '{}', true),
  (1016, 1042, 'navigable_sea', 24.00, '{}', '{}', true),
  (1017, 1038, 'navigable_sea', 30.00, '{}', '{}', true),
  (1021, 1033, 'navigable_sea', 18.00, '{}', '{}', true),
  (1024, 1032, 'navigable_sea', 26.00, '{}', '{}', true),
  (1027, 1031, 'navigable_sea', 22.00, '{}', '{}', true),
  (1031, 1032, 'navigable_sea', 24.00, '{}', '{}', true),
  (1032, 1033, 'navigable_sea', 16.00, '{}', '{}', true),
  (1036, 1050, 'navigable_sea', 28.00, '{}', '{}', true),
  (1038, 1042, 'navigable_sea', 20.00, '{}', '{}', true),
  -- Strait of Gibraltar crossings
  (1016, 1042, 'strait', 30.00, '{}', '{}', true),
  (1041, 1042, 'strait', 18.00, '{}', '{}', true),
  -- Sicily/Italy strait
  (1030, 1031, 'strait', 22.00, '{}', '{}', true)
ON CONFLICT (from_region_id, to_region_id, mode) DO UPDATE SET
  mode = excluded.mode, cost = excluded.cost, seasonal_restrictions = excluded.seasonal_restrictions,
  traversal_rules = excluded.traversal_rules, is_reciprocal = excluded.is_reciprocal;
