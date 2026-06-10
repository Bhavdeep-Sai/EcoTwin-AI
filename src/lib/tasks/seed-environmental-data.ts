import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'src', 'data', 'environmental_cache.json');

// Supabase details from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 1. IPCC DEFAULT FACTORS
const IPCC_SEEDS = [
  { ipcc_code: "1.A.1.a", sector: "Energy", source_category: "Electricity Generation (Coal)", fuel_type: "Coal", gas_type: "CO2", value: 0.950, unit: "kg/kWh", region_or_country: "Global", description: "Default IPCC emission factor for coal-fired electricity generation", reporting_year: 2024 },
  { ipcc_code: "1.A.1.a", sector: "Energy", source_category: "Electricity Generation (Natural Gas)", fuel_type: "Gas", gas_type: "CO2", value: 0.400, unit: "kg/kWh", region_or_country: "Global", description: "Default IPCC emission factor for gas-fired electricity generation", reporting_year: 2024 },
  { ipcc_code: "1.A.1.a", sector: "Energy", source_category: "Electricity Generation (Solar PV)", fuel_type: "Solar", gas_type: "CO2", value: 0.040, unit: "kg/kWh", region_or_country: "Global", description: "Lifecycle emissions factor for Solar PV", reporting_year: 2024 },
  { ipcc_code: "1.A.1.a", sector: "Energy", source_category: "Electricity Generation (Wind)", fuel_type: "Wind", gas_type: "CO2", value: 0.011, unit: "kg/kWh", region_or_country: "Global", description: "Lifecycle emissions factor for Wind turbines", reporting_year: 2024 },
  { ipcc_code: "5.A.1", sector: "Waste", source_category: "Solid Waste Disposal (Landfill)", fuel_type: null, gas_type: "CH4", value: 0.520, unit: "kg/kg", region_or_country: "Global", description: "Emissions factor for mixed solid waste sent to landfill", reporting_year: 2024 },
  { ipcc_code: "5.C.1", sector: "Waste", source_category: "Incineration of Waste", fuel_type: null, gas_type: "CO2", value: 0.430, unit: "kg/kg", region_or_country: "Global", description: "Emissions factor for open incineration of municipal waste", reporting_year: 2024 },
  { ipcc_code: "3.A.1", sector: "Agriculture", source_category: "Enteric Fermentation (Beef Cattle)", fuel_type: null, gas_type: "CH4", value: 99.48, unit: "kg/kg", region_or_country: "Global", description: "Enteric methane emissions from beef production", reporting_year: 2024 }
];

// 2. DEFRA UK CONVERSION FACTORS (2024 Release)
const DEFRA_SEEDS = [
  { category: "Passenger vehicles", activity_type: "petrol_car", unit: "km", co2e_factor: 0.170, reporting_year: 2024, notes: "Average petrol car emissions (UK DEFRA 2024)" },
  { category: "Passenger vehicles", activity_type: "diesel_car", unit: "km", co2e_factor: 0.165, reporting_year: 2024, notes: "Average diesel car emissions (UK DEFRA 2024)" },
  { category: "Passenger vehicles", activity_type: "electric_vehicle", unit: "km", co2e_factor: 0.045, reporting_year: 2024, notes: "UK grid-average lifecycle factor for EVs" },
  { category: "Passenger vehicles", activity_type: "bus", unit: "km", co2e_factor: 0.078, reporting_year: 2024, notes: "Average bus passenger-km factor" },
  { category: "Passenger vehicles", activity_type: "train", unit: "km", co2e_factor: 0.035, reporting_year: 2024, notes: "National rail passenger-km factor" },
  { category: "Electricity", activity_type: "grid_electricity", unit: "kWh", co2e_factor: 0.207, reporting_year: 2024, notes: "UK Electricity grid emissions factor" },
  { category: "Water", activity_type: "water_supply", unit: "m3", co2e_factor: 0.149, reporting_year: 2024, notes: "Carbon intensity of UK public water supply" },
  { category: "Water", activity_type: "water_treatment", unit: "m3", co2e_factor: 0.272, reporting_year: 2024, notes: "Carbon intensity of UK public wastewater treatment" },
  { category: "Waste", activity_type: "landfill_waste", unit: "kg", co2e_factor: 0.437, reporting_year: 2024, notes: "UK standard mixed municipal waste to landfill" },
  { category: "Waste", activity_type: "recycled_waste", unit: "kg", co2e_factor: -0.012, reporting_year: 2024, notes: "Avoided emissions from closed-loop recycling" }
];

// 3. EPA eGRID SUBREGION FACTORS (2024 Release)
const EPA_EGRID_SEEDS = [
  { subregion_code: "NYUP", subregion_name: "NYUP (Upstate New York - Hydro/Nuclear Rich)", co2_rate_lbs_mwh: 242.1, ch4_rate_lbs_mwh: 0.015, n2o_rate_lbs_mwh: 0.002, co2e_rate_lbs_mwh: 243.2, fuel_mix_pct: { hydro: 0.35, nuclear: 0.38, gas: 0.22, wind: 0.04, other: 0.01 }, reporting_year: 2024 },
  { subregion_code: "CAMX", subregion_name: "CAMX (California - Solar/Gas/Imports)", co2_rate_lbs_mwh: 450.4, ch4_rate_lbs_mwh: 0.028, n2o_rate_lbs_mwh: 0.004, co2e_rate_lbs_mwh: 452.1, fuel_mix_pct: { gas: 0.43, solar: 0.19, hydro: 0.11, geothermal: 0.06, wind: 0.07, nuclear: 0.08, other: 0.06 }, reporting_year: 2024 },
  { subregion_code: "NWPP", subregion_name: "NWPP (Northwest Power Pool - Hydro Rich)", co2_rate_lbs_mwh: 588.6, ch4_rate_lbs_mwh: 0.041, n2o_rate_lbs_mwh: 0.006, co2e_rate_lbs_mwh: 591.2, fuel_mix_pct: { hydro: 0.48, gas: 0.25, coal: 0.14, wind: 0.08, other: 0.05 }, reporting_year: 2024 },
  { subregion_code: "ERCT", subregion_name: "ERCT (ERCOT Texas - Wind/Gas/Coal)", co2_rate_lbs_mwh: 792.8, ch4_rate_lbs_mwh: 0.052, n2o_rate_lbs_mwh: 0.007, co2e_rate_lbs_mwh: 796.4, fuel_mix_pct: { gas: 0.46, wind: 0.22, coal: 0.18, solar: 0.05, nuclear: 0.08, other: 0.01 }, reporting_year: 2024 },
  { subregion_code: "RFCE", subregion_name: "RFCE (RFC East - Mid-Atlantic Gas/Nuclear)", co2_rate_lbs_mwh: 640.2, ch4_rate_lbs_mwh: 0.042, n2o_rate_lbs_mwh: 0.006, co2e_rate_lbs_mwh: 643.1, fuel_mix_pct: { nuclear: 0.42, gas: 0.38, coal: 0.15, wind: 0.03, other: 0.02 }, reporting_year: 2024 },
  { subregion_code: "SRMW", subregion_name: "SRMW (SERC Midwest - Coal Heavy)", co2_rate_lbs_mwh: 1390.5, ch4_rate_lbs_mwh: 0.091, n2o_rate_lbs_mwh: 0.013, co2e_rate_lbs_mwh: 1396.2, fuel_mix_pct: { coal: 0.52, gas: 0.32, nuclear: 0.10, wind: 0.04, other: 0.02 }, reporting_year: 2024 },
  { subregion_code: "US_AVERAGE", subregion_name: "US National Grid Average", co2_rate_lbs_mwh: 812.3, ch4_rate_lbs_mwh: 0.055, n2o_rate_lbs_mwh: 0.008, co2e_rate_lbs_mwh: 816.1, fuel_mix_pct: { gas: 0.39, coal: 0.19, nuclear: 0.19, wind: 0.10, hydro: 0.06, solar: 0.04, other: 0.03 }, reporting_year: 2024 }
];

const EPA_ZIP_SEEDS = [
  { zip_code: "10001", subregion_code: "NYUP", state: "NY" },
  { zip_code: "90210", subregion_code: "CAMX", state: "CA" },
  { zip_code: "98101", subregion_code: "NWPP", state: "WA" },
  { zip_code: "75001", subregion_code: "ERCT", state: "TX" },
  { zip_code: "07001", subregion_code: "RFCE", state: "NJ" },
  { zip_code: "60601", subregion_code: "SRMW", state: "IL" }
];

// 4. WORLD BANK COUNTRY INDICATORS
const WORLDBANK_SEEDS = [
  { country_code: "USA", indicator_code: "EG.USE.PCAP.KG.OE", reporting_year: 2024, value: 6800.0 }, // Energy per capita
  { country_code: "GBR", indicator_code: "EG.USE.PCAP.KG.OE", reporting_year: 2024, value: 2800.0 },
  { country_code: "DEU", indicator_code: "EG.USE.PCAP.KG.OE", reporting_year: 2024, value: 3500.0 },
  { country_code: "IND", indicator_code: "EG.USE.PCAP.KG.OE", reporting_year: 2024, value: 650.0 },
  { country_code: "CHN", indicator_code: "EG.USE.PCAP.KG.OE", reporting_year: 2024, value: 2200.0 },

  { country_code: "USA", indicator_code: "EN.ATM.CO2E.PC", reporting_year: 2024, value: 14.5 }, // CO2 tons/capita
  { country_code: "GBR", indicator_code: "EN.ATM.CO2E.PC", reporting_year: 2024, value: 4.6 },
  { country_code: "DEU", indicator_code: "EN.ATM.CO2E.PC", reporting_year: 2024, value: 7.7 },
  { country_code: "IND", indicator_code: "EN.ATM.CO2E.PC", reporting_year: 2024, value: 1.8 },
  { country_code: "CHN", indicator_code: "EN.ATM.CO2E.PC", reporting_year: 2024, value: 7.6 }
];

async function seed() {
  console.log("Starting Environmental Datasets seeding process...");

  // 1. Write to local environmental_cache.json
  console.log("Writing datasets to local environmental_cache.json file...");
  try {
    let cacheData: any = {};
    try {
      const existing = await fs.readFile(CACHE_PATH, 'utf8');
      cacheData = JSON.parse(existing);
    } catch {
      cacheData = {};
    }

    cacheData.ipcc_emission_factors = IPCC_SEEDS;
    cacheData.defra_conversion_factors = DEFRA_SEEDS;
    cacheData.epa_egrid_factors = EPA_EGRID_SEEDS.reduce((acc: any, item) => {
      acc[item.subregion_code] = item;
      return acc;
    }, {});
    cacheData.epa_zip_to_egrid = EPA_ZIP_SEEDS.reduce((acc: any, item) => {
      acc[item.zip_code] = item;
      return acc;
    }, {});
    cacheData.worldbank_country_indicators = WORLDBANK_SEEDS.reduce((acc: any, item) => {
      const key = `${item.country_code}:${item.indicator_code}`;
      acc[key] = item;
      return acc;
    }, {});

    // Ensure caching properties from other modules exist
    if (!cacheData.cached_food_products) cacheData.cached_food_products = {};
    if (!cacheData.cached_geocode_locations) cacheData.cached_geocode_locations = {};
    if (!cacheData.cached_routes) cacheData.cached_routes = {};
    if (!cacheData.owid_co2_data) cacheData.owid_co2_data = {};

    await fs.writeFile(CACHE_PATH, JSON.stringify(cacheData, null, 2));
    console.log("Successfully wrote seed data to local cache file.");
  } catch (fsErr) {
    console.error("Failed to seed local cache file:", fsErr);
  }

  // 2. Upload to Supabase Database (if online)
  if (supabaseUrl && supabaseKey) {
    console.log("Attempting database seeding on Supabase Postgres instance...");
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Seed eGRID subregions
      console.log("Seeding epa_egrid_factors...");
      const { error: egridErr } = await supabase.from('epa_egrid_factors').upsert(EPA_EGRID_SEEDS);
      if (egridErr) throw egridErr;

      // Seed ZIP map
      console.log("Seeding epa_zip_to_egrid...");
      const { error: zipErr } = await supabase.from('epa_zip_to_egrid').upsert(EPA_ZIP_SEEDS);
      if (zipErr) throw zipErr;

      // Seed IPCC
      console.log("Seeding ipcc_emission_factors...");
      const { error: ipccErr } = await supabase.from('ipcc_emission_factors').upsert(IPCC_SEEDS);
      if (ipccErr) throw ipccErr;

      // Seed DEFRA
      console.log("Seeding defra_conversion_factors...");
      const { error: defraErr } = await supabase.from('defra_conversion_factors').upsert(DEFRA_SEEDS);
      if (defraErr) throw defraErr;

      // Seed World Bank
      console.log("Seeding worldbank_country_indicators...");
      const { error: wbErr } = await supabase.from('worldbank_country_indicators').upsert(WORLDBANK_SEEDS);
      if (wbErr) throw wbErr;

      console.log("Successfully completed Supabase PostgreSQL database seeding!");
    } catch (dbErr: any) {
      console.warn("Database seeding skipped or failed:", dbErr.message);
    }
  } else {
    console.log("Supabase credentials missing. Database seeding skipped.");
  }

  console.log("Seeding complete.");
}

// Check if run directly
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('seed-environmental-data'))) {
  seed();
}

export { seed as seedEnvironmentalData };
