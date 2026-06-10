import { NextRequest, NextResponse } from 'next/server';
import { getEpaGridFactorsByZip } from '@/lib/services/epa';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip) {
    return NextResponse.json({ error: 'ZIP code parameter is required' }, { status: 400 });
  }

  try {
    const gridFactors = await getEpaGridFactorsByZip(zip);
    return NextResponse.json(gridFactors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch grid factors' }, { status: 500 });
  }
}
