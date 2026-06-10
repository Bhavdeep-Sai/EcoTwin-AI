import fs from 'fs/promises';
import path from 'path';
import { createClient } from '../supabase/server';

const CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'environmental_cache.json');

// Ensure the local cache file exists
async function ensureCacheFile() {
  const dir = path.dirname(CACHE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(CACHE_PATH);
    } catch {
      await fs.writeFile(
        CACHE_PATH,
        JSON.stringify({
          cached_food_products: {},
          cached_geocode_locations: {},
          cached_routes: {},
          epa_egrid_factors: {},
          epa_zip_to_egrid: {},
          ipcc_emission_factors: [],
          owid_co2_data: {},
          defra_conversion_factors: [],
          worldbank_country_indicators: {}
        }, null, 2)
      );
    }
  } catch (error) {
    console.error("Failed to initialize local environmental cache file:", error);
  }
}

export async function readLocalCache(): Promise<any> {
  await ensureCacheFile();
  const data = await fs.readFile(CACHE_PATH, 'utf8');
  return JSON.parse(data);
}

export async function writeLocalCache(data: any): Promise<void> {
  await ensureCacheFile();
  await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2));
}

// Check if database is online
async function isDbOnline(): Promise<boolean> {
  try {
    const supabase = await createClient();
    // Quick, cheap query to test connection
    const { error } = await supabase.from('cached_food_products').select('barcode').limit(1);
    if (error && (error.code === 'ENOTFOUND' || error.message.includes('fetch'))) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 1. Food Product Cache
// ---------------------------------------------------------------------------
export async function getCachedFood(barcode: string) {
  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('cached_food_products')
        .select('*')
        .eq('barcode', barcode)
        .single();
      if (!error && data) return data;
    }
  } catch (err) {
    console.warn("Supabase lookup failed, falling back to local file cache:", err);
  }

  const cache = await readLocalCache();
  return cache.cached_food_products[barcode] || null;
}

export async function setCachedFood(barcode: string, productData: any) {
  const payload = {
    barcode,
    product_name: productData.product_name,
    eco_score: productData.eco_score,
    carbon_100g_g: productData.carbon_100g_g,
    ingredients_analysis: productData.ingredients_analysis || {},
    packaging_info: productData.packaging_info || {},
    updated_at: new Date().toISOString()
  };

  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { error } = await supabase.from('cached_food_products').upsert(payload);
      if (!error) return;
    }
  } catch (err) {
    console.warn("Supabase upsert failed, saving to local file cache:", err);
  }

  const cache = await readLocalCache();
  cache.cached_food_products[barcode] = {
    ...payload,
    fetched_at: new Date().toISOString()
  };
  await writeLocalCache(cache);
}

// ---------------------------------------------------------------------------
// 2. Geocoding & Route Cache
// ---------------------------------------------------------------------------
export async function getCachedGeocode(address: string) {
  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('cached_geocode_locations')
        .select('*')
        .eq('query_address', address)
        .single();
      if (!error && data) return data;
    }
  } catch (err) {
    console.warn("Supabase lookup failed, falling back to local file cache:", err);
  }

  const cache = await readLocalCache();
  return cache.cached_geocode_locations[address] || null;
}

export async function setCachedGeocode(address: string, geocodeData: { latitude: number; longitude: number; display_name: string }) {
  const payload = {
    query_address: address,
    latitude: geocodeData.latitude,
    longitude: geocodeData.longitude,
    display_name: geocodeData.display_name
  };

  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { error } = await supabase.from('cached_geocode_locations').upsert(payload);
      if (!error) return;
    }
  } catch (err) {
    console.warn("Supabase geocode save failed:", err);
  }

  const cache = await readLocalCache();
  cache.cached_geocode_locations[address] = {
    ...payload,
    cached_at: new Date().toISOString()
  };
  await writeLocalCache(cache);
}

export async function getCachedRoute(routeKey: string) {
  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('cached_routes')
        .select('*')
        .eq('route_key', routeKey)
        .single();
      if (!error && data) return data;
    }
  } catch (err) {
    console.warn("Supabase lookup failed, falling back to local route cache:", err);
  }

  const cache = await readLocalCache();
  return cache.cached_routes[routeKey] || null;
}

export async function setCachedRoute(routeKey: string, routeData: { distance_km: number; duration_seconds: number; geometry?: string }) {
  const payload = {
    route_key: routeKey,
    distance_km: routeData.distance_km,
    duration_seconds: routeData.duration_seconds,
    geometry: routeData.geometry || null
  };

  try {
    if (await isDbOnline()) {
      const supabase = await createClient();
      const { error } = await supabase.from('cached_routes').upsert(payload);
      if (!error) return;
    }
  } catch (err) {
    console.warn("Supabase route save failed:", err);
  }

  const cache = await readLocalCache();
  cache.cached_routes[routeKey] = {
    ...payload,
    cached_at: new Date().toISOString()
  };
  await writeLocalCache(cache);
}
