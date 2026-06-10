import { createClient } from '../supabase/server';

// Scientific eGRID Subregion Factors (2024 Release)
// Values in lbs CO2e per MWh and converted to kg CO2e per kWh
export interface EgridFactor {
  subregion_code: string;
  subregion_name: string;
  co2_rate_lbs_mwh: number;
  ch4_rate_lbs_mwh: number;
  n2o_rate_lbs_mwh: number;
  co2e_rate_lbs_mwh: number;
  co2e_rate_kg_kwh: number; // calculated helper
  fuel_mix_pct: Record<string, number>;
}

const EGRID_SUBREGIONS: Record<string, EgridFactor> = {
  NYUP: {
    subregion_code: "NYUP",
    subregion_name: "NYUP (Upstate New York - Hydro/Nuclear Rich)",
    co2_rate_lbs_mwh: 242.1,
    ch4_rate_lbs_mwh: 0.015,
    n2o_rate_lbs_mwh: 0.002,
    co2e_rate_lbs_mwh: 243.2,
    co2e_rate_kg_kwh: 0.110, // ~0.110 kg CO2e/kWh
    fuel_mix_pct: { hydro: 0.35, nuclear: 0.38, gas: 0.22, wind: 0.04, other: 0.01 }
  },
  CAMX: {
    subregion_code: "CAMX",
    subregion_name: "CAMX (California - Solar/Gas/Imports)",
    co2_rate_lbs_mwh: 450.4,
    ch4_rate_lbs_mwh: 0.028,
    n2o_rate_lbs_mwh: 0.004,
    co2e_rate_lbs_mwh: 452.1,
    co2e_rate_kg_kwh: 0.205, // ~0.205 kg CO2e/kWh
    fuel_mix_pct: { gas: 0.43, solar: 0.19, hydro: 0.11, geothermal: 0.06, wind: 0.07, nuclear: 0.08, other: 0.06 }
  },
  NWPP: {
    subregion_code: "NWPP",
    subregion_name: "NWPP (Northwest Power Pool - Hydro Rich)",
    co2_rate_lbs_mwh: 588.6,
    ch4_rate_lbs_mwh: 0.041,
    n2o_rate_lbs_mwh: 0.006,
    co2e_rate_lbs_mwh: 591.2,
    co2e_rate_kg_kwh: 0.268,
    fuel_mix_pct: { hydro: 0.48, gas: 0.25, coal: 0.14, wind: 0.08, other: 0.05 }
  },
  ERCT: {
    subregion_code: "ERCT",
    subregion_name: "ERCT (ERCOT Texas - Wind/Gas/Coal)",
    co2_rate_lbs_mwh: 792.8,
    ch4_rate_lbs_mwh: 0.052,
    n2o_rate_lbs_mwh: 0.007,
    co2e_rate_lbs_mwh: 796.4,
    co2e_rate_kg_kwh: 0.361,
    fuel_mix_pct: { gas: 0.46, wind: 0.22, coal: 0.18, solar: 0.05, nuclear: 0.08, other: 0.01 }
  },
  RFCE: {
    subregion_code: "RFCE",
    subregion_name: "RFCE (RFC East - Mid-Atlantic Gas/Nuclear)",
    co2_rate_lbs_mwh: 640.2,
    ch4_rate_lbs_mwh: 0.042,
    n2o_rate_lbs_mwh: 0.006,
    co2e_rate_lbs_mwh: 643.1,
    co2e_rate_kg_kwh: 0.292,
    fuel_mix_pct: { nuclear: 0.42, gas: 0.38, coal: 0.15, wind: 0.03, other: 0.02 }
  },
  SRMW: {
    subregion_code: "SRMW",
    subregion_name: "SRMW (SERC Midwest - Coal Heavy)",
    co2_rate_lbs_mwh: 1390.5,
    ch4_rate_lbs_mwh: 0.091,
    n2o_rate_lbs_mwh: 0.013,
    co2e_rate_lbs_mwh: 1396.2,
    co2e_rate_kg_kwh: 0.633, // ~0.633 kg CO2e/kWh
    fuel_mix_pct: { coal: 0.52, gas: 0.32, nuclear: 0.10, wind: 0.04, other: 0.02 }
  },
  US_AVERAGE: {
    subregion_code: "US_AVERAGE",
    subregion_name: "US National Grid Average",
    co2_rate_lbs_mwh: 812.3,
    ch4_rate_lbs_mwh: 0.055,
    n2o_rate_lbs_mwh: 0.008,
    co2e_rate_lbs_mwh: 816.1,
    co2e_rate_kg_kwh: 0.370,
    fuel_mix_pct: { gas: 0.39, coal: 0.19, nuclear: 0.19, wind: 0.10, hydro: 0.06, solar: 0.04, other: 0.03 }
  }
};

// Map ZIP prefixes to eGRID subregions
const ZIP_SUBREGION_MAP: Record<string, string> = {
  "10": "NYUP", "11": "NYUP", "12": "NYUP", "13": "NYUP", "14": "NYUP", // NY
  "90": "CAMX", "91": "CAMX", "92": "CAMX", "93": "CAMX", "94": "CAMX", "95": "CAMX", "96": "CAMX", // CA
  "98": "NWPP", "99": "NWPP", "97": "NWPP", // Pacific Northwest (WA, OR, ID)
  "75": "ERCT", "76": "ERCT", "77": "ERCT", "78": "ERCT", "79": "ERCT", // TX
  "07": "RFCE", "08": "RFCE", "19": "RFCE", "18": "RFCE", "17": "RFCE", // Mid-Atlantic (NJ, PA)
  "60": "SRMW", "61": "SRMW", "62": "SRMW", "47": "SRMW", "46": "SRMW"  // Midwest (IL, IN)
};

/**
 * Maps a US ZIP code to its corresponding EPA eGRID subregion and emission factors.
 */
export async function getEpaGridFactorsByZip(zip: string): Promise<EgridFactor> {
  const cleanZip = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(cleanZip)) {
    return EGRID_SUBREGIONS.US_AVERAGE;
  }

  // 1. Attempt lookup from Supabase Database
  try {
    const supabase = await createClient();
    const { data: zipMap, error: zipErr } = await supabase
      .from('epa_zip_to_egrid')
      .select('subregion_code')
      .eq('zip_code', cleanZip)
      .single();

    if (!zipErr && zipMap) {
      const { data: factor, error: factErr } = await supabase
        .from('epa_egrid_factors')
        .select('subregion_code, subregion_name, co2_rate_lbs_mwh, ch4_rate_lbs_mwh, n2o_rate_lbs_mwh, co2e_rate_lbs_mwh, fuel_mix_pct')
        .eq('subregion_code', zipMap.subregion_code)
        .single();
      
      if (!factErr && factor) {
        return {
          subregion_code: factor.subregion_code,
          subregion_name: factor.subregion_name,
          co2_rate_lbs_mwh: Number(factor.co2_rate_lbs_mwh),
          ch4_rate_lbs_mwh: Number(factor.ch4_rate_lbs_mwh),
          n2o_rate_lbs_mwh: Number(factor.n2o_rate_lbs_mwh),
          co2e_rate_lbs_mwh: Number(factor.co2e_rate_lbs_mwh),
          co2e_rate_kg_kwh: Number((factor.co2e_rate_lbs_mwh * 0.00045359237).toFixed(4)),
          fuel_mix_pct: factor.fuel_mix_pct
        };
      }
    }
  } catch (err) {
    // Database connection failed or table missing, fall back to hardcoded map
  }

  // 2. Local Fallback Mapping
  const prefix = cleanZip.slice(0, 2);
  const code = ZIP_SUBREGION_MAP[prefix] || "US_AVERAGE";
  return EGRID_SUBREGIONS[code] || EGRID_SUBREGIONS.US_AVERAGE;
}

/**
 * Retrieves the current Air Quality Index (AQI).
 * Primary: Open-Meteo Air Quality API (free, global, no key required).
 * Secondary: EPA AirNow (US-only, requires AIRNOW_API_KEY).
 */
export async function getRealtimeAqi(lat: number, lon: number): Promise<{ aqi: number; category: string; pollutant: string; reporting_area: string }> {
  // Round coordinates to 2 decimal places to bucket queries within ~1.1km and enable efficient caching
  const roundLat = Number(lat.toFixed(2));
  const roundLon = Number(lon.toFixed(2));
  const cacheKey = `${roundLat},${roundLon}`;

  // AQI caching removed; fetching fresh data.

  // ── PRIMARY: Open-Meteo Air Quality API (free, global, no API key needed) ──
  // Returns European AQI (0-500 scale) and PM2.5 / PM10 concentrations.
  try {
    const omUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${roundLat}&longitude=${roundLon}&current=european_aqi,pm2_5,pm10,us_aqi&timezone=auto`;
    const omRes = await fetch(omUrl, { signal: AbortSignal.timeout(5000) });
    if (omRes.ok) {
      const omData = await omRes.json();
      const current = omData?.current;
      if (current) {
        const usAqi = current.us_aqi ?? current.european_aqi ?? 0;
        const pm25 = current.pm2_5 ?? 0;

        // Map US AQI value to EPA category labels
        let category = 'Good';
        if (usAqi > 300) category = 'Hazardous';
        else if (usAqi > 200) category = 'Very Unhealthy';
        else if (usAqi > 150) category = 'Unhealthy';
        else if (usAqi > 100) category = 'Unhealthy for Sensitive Groups';
        else if (usAqi > 50) category = 'Moderate';

        const result = {
          aqi: Math.round(usAqi),
          category,
          pollutant: pm25 > 0 ? 'PM2.5' : 'PM10',
          reporting_area: `${roundLat}°N, ${Math.abs(roundLon)}°${roundLon >= 0 ? 'E' : 'W'} (Open-Meteo)`
        };
        return result;
      }
    }
  } catch (err: unknown) {
    console.warn('Open-Meteo AQI fetch failed:', err instanceof Error ? err.message : String(err));
  }

  // ── SECONDARY: EPA AirNow (US-only, requires AIRNOW_API_KEY) ──
  const AIRNOW_API_KEY = process.env.AIRNOW_API_KEY || '';
  const isWithinUS = lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66;
  if (AIRNOW_API_KEY && isWithinUS) {
    const url = `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${roundLat}&longitude=${roundLon}&distance=25&API_KEY=${AIRNOW_API_KEY}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          let maxObs = data[0];
          for (const obs of data) {
            if (obs.AQI > maxObs.AQI) maxObs = obs;
          }
          const result = {
            aqi: Number(maxObs.AQI),
            category: maxObs.Category.Name,
            pollutant: maxObs.ParameterName,
            reporting_area: maxObs.ReportingArea
          };
          return result;
        }
      }
    } catch (error: unknown) {
      console.warn('EPA AirNow API query failed:', error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error("Air quality data is currently unavailable. Please check your coordinates or connection.");
}
