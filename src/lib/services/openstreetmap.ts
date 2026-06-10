import { getCachedGeocode, setCachedGeocode, getCachedRoute, setCachedRoute } from '../db/environmentalCache';

const USER_AGENT = 'EcoTwinAI - WebApp - Version 1.0 - contact@ecotwin.ai';

// ---------------------------------------------------------------------------
// 1. Haversine & Circuity Helpers (Fallback calculation)
// ---------------------------------------------------------------------------
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Straight-line distance in km
}

/**
 * Converts straight-line distance to estimated road distance
 * based on transport mode circuity factors (from transportation research).
 */
export function estimateRoadDistance(straightLineKm: number, mode: string): number {
  let circuityFactor = 1.27; // Average driving circuity
  if (mode === 'bike' || mode === 'bicycle') circuityFactor = 1.20;
  if (mode === 'foot' || mode === 'walking') circuityFactor = 1.15;
  if (mode === 'train') circuityFactor = 1.10;
  
  return Number((straightLineKm * circuityFactor).toFixed(2));
}

// ---------------------------------------------------------------------------
// 2. Geocoding Service (Nominatim)
// ---------------------------------------------------------------------------
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number; display_name: string }> {
  const cleanAddress = address.trim();
  if (!cleanAddress) throw new Error("Address cannot be empty");

  // Check cache
  const cached = await getCachedGeocode(cleanAddress);
  if (cached) {
    return {
      latitude: Number(cached.latitude),
      longitude: Number(cached.longitude),
      display_name: cached.display_name
    };
  }

  // Live request
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!res.ok) {
      throw new Error(`Nominatim API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Location not found: "${cleanAddress}". Please check the spelling or search for a broader area.`);
    }

    const result = {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      display_name: data[0].display_name
    };
    await setCachedGeocode(cleanAddress, result);
    return result;
  } catch (error: any) {
    console.error("Nominatim geocoding failed:", error);
    throw new Error(error.message || "Geocoding service temporarily unavailable. Check your internet connection.");
  }
}

// ---------------------------------------------------------------------------
// 3. Routing Service (OSRM / OpenRouteService)
// ---------------------------------------------------------------------------
export async function getRouteDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  mode: 'car' | 'foot' | 'bike' | 'transit' = 'car'
): Promise<{ distance_km: number; duration_seconds: number }> {
  
  const routeKey = `${lat1.toFixed(4)},${lon1.toFixed(4)}:${lat2.toFixed(4)},${lon2.toFixed(4)}:${mode}`;

  // Check cache
  const cached = await getCachedRoute(routeKey);
  if (cached) {
    return {
      distance_km: Number(cached.distance_km),
      duration_seconds: Number(cached.duration_seconds)
    };
  }

  // Attempt live API
  // Map internal modes to OSRM profiles
  let osrmProfile = 'driving';
  if (mode === 'foot') osrmProfile = 'foot';
  if (mode === 'bike') osrmProfile = 'cycling';

  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${lon1},${lat1};${lon2},${lat2}?overview=false&skip_waypoints=true`;

  try {
    // We attempt OSRM routing
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(3000) // 3s timeout
    });

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
        const route = data.routes[0];
        const result = {
          distance_km: Number((route.distance / 1000).toFixed(2)), // OSRM returns meters
          duration_seconds: Number(route.duration.toFixed(0))    // OSRM returns seconds
        };
        await setCachedRoute(routeKey, result);
        return result;
      }
    }
  } catch (error) {
    console.error("OSRM routing API query failed, falling back to Haversine approximation:", error);
  }

  // Fallback to Haversine distance with circuity estimation
  const straightLine = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  const roadDist = estimateRoadDistance(straightLine, mode);
  
  // Estimate travel duration based on average speeds
  // Car: 60 km/h, Bike: 15 km/h, Foot: 5 km/h, Transit: 40 km/h
  let avgSpeedKmh = 60;
  if (mode === 'bike') avgSpeedKmh = 15;
  if (mode === 'foot') avgSpeedKmh = 5;
  if (mode === 'transit') avgSpeedKmh = 40;

  const durationSecs = Math.round((roadDist / avgSpeedKmh) * 3600);

  const result = {
    distance_km: roadDist,
    duration_seconds: durationSecs
  };

  // Cache fallback result so we don't recalculate
  await setCachedRoute(routeKey, result);
  return result;
}
