import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeAqi } from '@/lib/services/epa';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'Both lat and lon parameters are required' }, { status: 400 });
  }

  const lat = Number(latStr);
  const lon = Number(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Invalid latitude or longitude coordinates' }, { status: 400 });
  }

  try {
    const aqiData = await getRealtimeAqi(lat, lon);
    return NextResponse.json(aqiData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch AQI' }, { status: 500 });
  }
}
