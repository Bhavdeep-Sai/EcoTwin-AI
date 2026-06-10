import { NextRequest, NextResponse } from 'next/server';
import { getEpaGridFactorsByZip } from '@/lib/services/epa';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip) {
    return NextResponse.json({ error: 'ZIP code parameter is required' }, { status: 400 });
  }

  try {
    const gridFactors = await getEpaGridFactorsByZip(zip);
    return NextResponse.json(gridFactors);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch grid factors';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
