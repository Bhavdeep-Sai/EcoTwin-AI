import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, getRouteDistance } from '@/lib/services/openstreetmap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const modeParam = searchParams.get('mode') || 'car';

  if (!start || !end) {
    return NextResponse.json({ error: 'Both start and end parameters are required' }, { status: 400 });
  }

  const mode = ['car', 'foot', 'bike', 'transit'].includes(modeParam) 
    ? (modeParam as 'car' | 'foot' | 'bike' | 'transit')
    : 'car';

  try {
    // 1. Geocode start location
    console.log(`Geocoding start point: ${start}`);
    const startGeocode = await geocodeAddress(start);

    // 2. Geocode end location
    console.log(`Geocoding end point: ${end}`);
    const endGeocode = await geocodeAddress(end);

    // 3. Compute route distance and travel duration
    console.log(`Computing route from (${startGeocode.latitude}, ${startGeocode.longitude}) to (${endGeocode.latitude}, ${endGeocode.longitude}) using mode ${mode}`);
    const route = await getRouteDistance(
      startGeocode.latitude,
      startGeocode.longitude,
      endGeocode.latitude,
      endGeocode.longitude,
      mode
    );

    return NextResponse.json({
      start: {
        query: start,
        display_name: startGeocode.display_name,
        latitude: startGeocode.latitude,
        longitude: startGeocode.longitude
      },
      end: {
        query: end,
        display_name: endGeocode.display_name,
        latitude: endGeocode.latitude,
        longitude: endGeocode.longitude
      },
      mode,
      distance_km: route.distance_km,
      duration_seconds: route.duration_seconds
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to calculate route' }, { status: 500 });
  }
}
