-- 1. OpenFoodFacts Cache Table
CREATE TABLE IF NOT EXISTS public.cached_food_products (
  barcode text PRIMARY KEY,
  product_name text NOT NULL,
  eco_score text, -- 'A', 'B', 'C', 'D', 'E'
  carbon_100g_g numeric, -- carbon footprint in grams per 100g
  ingredients_analysis jsonb,
  packaging_info jsonb,
  fetched_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.cached_food_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of cached food" ON public.cached_food_products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated/anon insert of cached food" ON public.cached_food_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated/anon update of cached food" ON public.cached_food_products FOR UPDATE USING (true);

-- 2. OpenStreetMap (OSM) Geocoding Cache Table
CREATE TABLE IF NOT EXISTS public.cached_geocode_locations (
  query_address text PRIMARY KEY,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  display_name text,
  cached_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.cached_geocode_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of geocode cache" ON public.cached_geocode_locations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated/anon insert of geocode cache" ON public.cached_geocode_locations FOR INSERT WITH CHECK (true);

-- OSM Route Cache Table
CREATE TABLE IF NOT EXISTS public.cached_routes (
  route_key text PRIMARY KEY, -- "lat1,lon1:lat2,lon2:mode"
  distance_km numeric NOT NULL,
  duration_seconds numeric NOT NULL,
  geometry text,
  cached_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.cached_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of route cache" ON public.cached_routes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated/anon insert of route cache" ON public.cached_routes FOR INSERT WITH CHECK (true);

-- 3. US EPA eGRID Factors Table
CREATE TABLE IF NOT EXISTS public.epa_egrid_factors (
  subregion_code text PRIMARY KEY,
  subregion_name text NOT NULL,
  co2_rate_lbs_mwh numeric NOT NULL,
  ch4_rate_lbs_mwh numeric NOT NULL,
  n2o_rate_lbs_mwh numeric NOT NULL,
  co2e_rate_lbs_mwh numeric NOT NULL,
  fuel_mix_pct jsonb NOT NULL,
  reporting_year int NOT NULL
);

ALTER TABLE public.epa_egrid_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of EPA eGRID factors" ON public.epa_egrid_factors FOR SELECT USING (true);

-- EPA ZIP to Subregion Map
CREATE TABLE IF NOT EXISTS public.epa_zip_to_egrid (
  zip_code text PRIMARY KEY,
  subregion_code text REFERENCES public.epa_egrid_factors(subregion_code) ON DELETE CASCADE,
  state text NOT NULL
);

ALTER TABLE public.epa_zip_to_egrid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of EPA ZIP map" ON public.epa_zip_to_egrid FOR SELECT USING (true);

-- 4. IPCC Emission Factors (EFDB) Table
CREATE TABLE IF NOT EXISTS public.ipcc_emission_factors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ipcc_code text NOT NULL,
  sector text NOT NULL,
  source_category text NOT NULL,
  fuel_type text,
  gas_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  region_or_country text DEFAULT 'Global',
  description text,
  reporting_year int
);

CREATE INDEX IF NOT EXISTS idx_ipcc_lookup ON public.ipcc_emission_factors (sector, gas_type, region_or_country);
ALTER TABLE public.ipcc_emission_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of IPCC factors" ON public.ipcc_emission_factors FOR SELECT USING (true);

-- 5. Our World In Data (OWID) CO2 Data Table
CREATE TABLE IF NOT EXISTS public.owid_co2_data (
  country_code text NOT NULL,
  country_name text NOT NULL,
  reporting_year int NOT NULL,
  co2_tons numeric,
  co2_per_capita numeric,
  gdp numeric,
  population numeric,
  cumulative_co2 numeric,
  share_global_co2 numeric,
  PRIMARY KEY (country_code, reporting_year)
);

CREATE INDEX IF NOT EXISTS idx_owid_country_year ON public.owid_co2_data (country_code, reporting_year DESC);
ALTER TABLE public.owid_co2_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of OWID CO2 data" ON public.owid_co2_data FOR SELECT USING (true);

-- 6. DEFRA UK Conversion Factors Table
CREATE TABLE IF NOT EXISTS public.defra_conversion_factors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL,
  activity_type text NOT NULL,
  unit text NOT NULL,
  co2e_factor numeric NOT NULL,
  reporting_year int NOT NULL,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_defra_lookup ON public.defra_conversion_factors (category, activity_type, reporting_year DESC);
ALTER TABLE public.defra_conversion_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of DEFRA factors" ON public.defra_conversion_factors FOR SELECT USING (true);

-- 7. World Bank Open Data Table
CREATE TABLE IF NOT EXISTS public.worldbank_country_indicators (
  country_code text NOT NULL,
  indicator_code text NOT NULL,
  reporting_year int NOT NULL,
  value numeric NOT NULL,
  PRIMARY KEY (country_code, indicator_code, reporting_year)
);

ALTER TABLE public.worldbank_country_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of World Bank indicators" ON public.worldbank_country_indicators FOR SELECT USING (true);
