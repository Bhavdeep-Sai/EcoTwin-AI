import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface BenchmarkResults {
  country: string;
  owid_co2: Record<string, unknown>[] | null;
  world_bank: Record<string, unknown>;
  conversion_factors: Record<string, unknown>[];
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'USA';
  const category = searchParams.get('category'); // optional DEFRA / IPCC lookup

  const results: BenchmarkResults = {
    country,
    owid_co2: null,
    world_bank: {},
    conversion_factors: []
  };

  try {
    const supabase = await createClient();
    
    // Look up OWID data
    const { data: owid, error: owidErr } = await supabase
      .from('owid_co2_data')
      .select('country_code, country_name, reporting_year, co2_tons, co2_per_capita, cumulative_co2, share_global_co2')
      .eq('country_code', country)
      .order('reporting_year', { ascending: false })
      .limit(5);

    if (!owidErr && owid && owid.length > 0) {
      results.owid_co2 = owid;
    }

    // Look up World Bank Indicators
    const { data: wb, error: wbErr } = await supabase
      .from('worldbank_country_indicators')
      .select('indicator_code, value')
      .eq('country_code', country);

    if (!wbErr && wb) {
      wb.forEach((ind: { indicator_code: string; value: unknown }) => {
        results.world_bank[ind.indicator_code] = ind.value;
      });
    }

    // Look up DEFRA or IPCC conversion factors if requested
    if (category) {
      const { data: defra } = await supabase
        .from('defra_conversion_factors')
        .select('category, activity_type, unit, co2e_factor, reporting_year')
        .ilike('category', `%${category}%`);
      
      const { data: ipcc } = await supabase
        .from('ipcc_emission_factors')
        .select('sector, source_category, fuel_type, co2_emission_factor')
        .ilike('sector', `%${category}%`);

      results.conversion_factors = [
        ...(defra || []),
        ...(ipcc || [])
      ];
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Failed to fetch benchmarks';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
