import { createClient } from '../supabase/server';

// ---------------------------------------------------------------------------
// 1. Food Product Cache
// ---------------------------------------------------------------------------
export async function getCachedFood(barcode: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cached_food_products')
      .select('barcode, product_name, eco_score, carbon_100g_g, ingredients_analysis, packaging_info, updated_at')
      .eq('barcode', barcode)
      .single();
    if (!error && data) return data;
  } catch (err) {
    console.warn("Supabase lookup failed for cached food:", err);
  }
  return null;
}

import type { FoodProductDetails } from '../services/openfoodfacts';

export async function setCachedFood(barcode: string, productData: FoodProductDetails) {
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
    const supabase = await createClient();
    await supabase.from('cached_food_products').upsert(payload);
  } catch (err) {
    console.warn("Supabase upsert failed for food product:", err);
  }
}

// ---------------------------------------------------------------------------
// 2. Geocoding & Route Cache
// ---------------------------------------------------------------------------
export async function getCachedGeocode(address: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cached_geocode_locations')
      .select('query_address, latitude, longitude, display_name')
      .eq('query_address', address)
      .single();
    if (!error && data) return data;
  } catch (err) {
    console.warn("Supabase lookup failed for geocode:", err);
  }
  return null;
}

export async function setCachedGeocode(address: string, geocodeData: { latitude: number; longitude: number; display_name: string }) {
  const payload = {
    query_address: address,
    latitude: geocodeData.latitude,
    longitude: geocodeData.longitude,
    display_name: geocodeData.display_name
  };

  try {
    const supabase = await createClient();
    await supabase.from('cached_geocode_locations').upsert(payload);
  } catch (err) {
    console.warn("Supabase geocode save failed:", err);
  }
}

export async function getCachedRoute(routeKey: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cached_routes')
      .select('route_key, distance_km, duration_seconds, geometry')
      .eq('route_key', routeKey)
      .single();
    if (!error && data) return data;
  } catch (err) {
    console.warn("Supabase lookup failed for route:", err);
  }
  return null;
}

export async function setCachedRoute(routeKey: string, routeData: { distance_km: number; duration_seconds: number; geometry?: string }) {
  const payload = {
    route_key: routeKey,
    distance_km: routeData.distance_km,
    duration_seconds: routeData.duration_seconds,
    geometry: routeData.geometry || null
  };

  try {
    const supabase = await createClient();
    await supabase.from('cached_routes').upsert(payload);
  } catch (err) {
    console.warn("Supabase route save failed:", err);
  }
}

