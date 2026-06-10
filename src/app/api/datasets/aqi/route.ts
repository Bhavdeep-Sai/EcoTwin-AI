import { NextRequest, NextResponse } from 'next/server';
import { getRealtimeAqi } from '@/lib/services/epa';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Coordinates out of valid bounds' }, { status: 400 });
  }

  try {
    const aqiData = await getRealtimeAqi(lat, lon);
    return NextResponse.json(aqiData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch AQI';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
