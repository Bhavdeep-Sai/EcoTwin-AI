import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const OWID_CO2_JSON_URL = 'https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json';
const CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'environmental_cache.json');

// Supabase details from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function run() {
  console.log("Starting Our World In Data CO2 synchronization task...");
  
  try {
    console.log(`Downloading dataset from ${OWID_CO2_JSON_URL}...`);
    
    const response = await fetch(OWID_CO2_JSON_URL, {
      signal: AbortSignal.timeout(15000) // 15s timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error downloading OWID data: ${response.status} ${response.statusText}`);
    }

    const co2Data = await response.json();
    console.log("Dataset downloaded successfully. Parsing records...");

    const countryCodes = Object.keys(co2Data);
    console.log(`Total entities found: ${countryCodes.length}`);

    // Parse and filter records for recent years (2018 - 2024) to keep it lightweight
    const recordsToSync: any[] = [];
    const minYear = 2018;

    for (const code of countryCodes) {
      const countryInfo = co2Data[code];
      const countryName = countryInfo.country;
      const dataPoints = countryInfo.data || [];

      for (const dp of dataPoints) {
        if (dp.year >= minYear) {
          recordsToSync.push({
            country_code: code,
            country_name: countryName,
            reporting_year: dp.year,
            co2_tons: dp.co2 ? Number((dp.co2 * 1000000).toFixed(0)) : null, // OWID lists CO2 in million tons, convert to actual tons
            co2_per_capita: dp.co2_per_capita ? Number(dp.co2_per_capita.toFixed(3)) : null,
            gdp: dp.gdp ? Number(dp.gdp) : null,
            population: dp.population ? Number(dp.population) : null,
            cumulative_co2: dp.cumulative_co2 ? Number((dp.cumulative_co2 * 1000000).toFixed(0)) : null,
            share_global_co2: dp.share_global_co2 ? Number(dp.share_global_co2.toFixed(3)) : null
          });
        }
      }
    }

    console.log(`Parsed ${recordsToSync.length} relevant country-year records.`);

    // 1. Attempt database upload (if configured and online)
    let dbSuccess = false;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log("Connecting to Supabase database...");
        
        // Batch upsert in chunks of 500 records
        const chunkSize = 500;
        for (let i = 0; i < recordsToSync.length; i += chunkSize) {
          const chunk = recordsToSync.slice(i, i + chunkSize);
          const { error } = await supabase.from('owid_co2_data').upsert(chunk);
          if (error) throw error;
        }

        console.log("Successfully loaded records into Supabase table public.owid_co2_data.");
        dbSuccess = true;
      } catch (dbErr: any) {
        console.warn("Could not sync directly to Supabase Postgres:", dbErr.message);
      }
    }

    // 2. Write to local cache file for offline fallback
    console.log("Writing synchronized records to local file cache...");
    try {
      let cacheData: any = {};
      try {
        const existing = await fs.readFile(CACHE_PATH, 'utf8');
        cacheData = JSON.parse(existing);
      } catch {
        cacheData = {};
      }

      if (!cacheData.owid_co2_data) cacheData.owid_co2_data = {};
      
      // Structure by country code for rapid O(1) local lookups
      for (const rec of recordsToSync) {
        if (!cacheData.owid_co2_data[rec.country_code]) {
          cacheData.owid_co2_data[rec.country_code] = [];
        }
        // Avoid duplicates in file
        cacheData.owid_co2_data[rec.country_code] = cacheData.owid_co2_data[rec.country_code]
          .filter((item: any) => item.reporting_year !== rec.reporting_year);
        
        cacheData.owid_co2_data[rec.country_code].push(rec);
      }

      await fs.writeFile(CACHE_PATH, JSON.stringify(cacheData, null, 2));
      console.log("Local environmental_cache.json file updated successfully.");
    } catch (fsErr) {
      console.error("Failed to write to local cache file:", fsErr);
    }

    console.log("Our World In Data sync complete.");

  } catch (error: any) {
    console.error("OWID Sync task failed:", error.message);
  }
}

// Check if run directly
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('sync-owid'))) {
  run();
}

export { run as syncOwidData };
