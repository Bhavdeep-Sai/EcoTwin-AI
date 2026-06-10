import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fetchFoodProduct } from './openfoodfacts';
import { geocodeAddress, getRouteDistance, calculateHaversineDistance, estimateRoadDistance } from './openstreetmap';
import { getEpaGridFactorsByZip, getRealtimeAqi } from './epa';
import fs from 'fs/promises';
import path from 'path';

describe('Environmental Services Integration Tests', () => {

  // 1. OpenFoodFacts Tests
  describe('OpenFoodFacts Service', () => {
    it('should retrieve a product by barcode (caching or fallback)', async () => {
      // Nutella barcode
      const product = await fetchFoodProduct('3017670149713');
      expect(product).toBeDefined();
      expect(product.barcode).toBe('3017670149713');
      expect(product.product_name).toContain('Nutella');
      expect(product.eco_score).toBe('E');
      expect(product.carbon_100g_g).toBe(950);
      expect(product.ingredients_analysis.palm_oil).toBe(true);
    });

    it('should generate a sensible mock product for unknown or unrated barcodes', async () => {
      const randomBarcode = '9999999999999';
      const product = await fetchFoodProduct(randomBarcode);
      expect(product).toBeDefined();
      expect(product.barcode).toBe(randomBarcode);
      expect(['C', 'UNKNOWN', 'Unknown']).toContain(product.eco_score);
      expect(product.carbon_100g_g).toBeGreaterThanOrEqual(0);
    });
  });

  // 2. OpenStreetMap / Geocoding & Routing Tests
  describe('OpenStreetMap / Routing Service', () => {
    it('should calculate direct Haversine distance correctly', () => {
      // Seattle to London coordinates
      const lat1 = 47.6062, lon1 = -122.3321;
      const lat2 = 51.5074, lon2 = -0.1278;
      const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(7000); // ~7700 km
      expect(distance).toBeLessThan(8000);
    });

    it('should estimate road distance from straight line using circuity factors', () => {
      const straightLineKm = 10;
      const drivingEst = estimateRoadDistance(straightLineKm, 'car');
      const walkingEst = estimateRoadDistance(straightLineKm, 'foot');
      
      expect(drivingEst).toBe(12.7); // 1.27x
      expect(walkingEst).toBe(11.5); // 1.15x
    });

    it('should geocode addresses (caching or fallback coordinate matching)', async () => {
      const location = await geocodeAddress('London, UK');
      expect(location).toBeDefined();
      expect(location.latitude).toBeCloseTo(51.5074, 1);
      expect(location.longitude).toBeCloseTo(-0.1278, 1);
    });

    it('should compute and cache route distances between two points', async () => {
      // Seattle (47.6062, -122.3321) to London (51.5074, -0.1278)
      const route = await getRouteDistance(47.6062, -122.3321, 51.5074, -0.1278, 'car');
      expect(route).toBeDefined();
      expect(route.distance_km).toBeGreaterThan(0);
      expect(route.duration_seconds).toBeGreaterThan(0);
    });
  });

  // 3. EPA eGRID & AirNow Tests
  describe('EPA Service', () => {
    it('should map NY zip codes to NYUP eGRID subregion factors', async () => {
      const factors = await getEpaGridFactorsByZip('10001');
      expect(factors).toBeDefined();
      expect(factors.subregion_code).toBe('NYUP');
      expect(factors.co2e_rate_kg_kwh).toBeCloseTo(0.110, 2);
      expect(factors.fuel_mix_pct.nuclear).toBe(0.38);
    });

    it('should map WA zip codes to NWPP eGRID subregion factors', async () => {
      const factors = await getEpaGridFactorsByZip('98101');
      expect(factors).toBeDefined();
      expect(factors.subregion_code).toBe('NWPP');
      expect(factors.co2e_rate_kg_kwh).toBeCloseTo(0.268, 2);
    });

    it('should return national average for unmapped ZIP codes', async () => {
      const factors = await getEpaGridFactorsByZip('00000');
      expect(factors).toBeDefined();
      expect(factors.subregion_code).toBe('US_AVERAGE');
      expect(factors.co2e_rate_kg_kwh).toBeCloseTo(0.370, 2);
    });

    it('should retrieve real-time AQI or fall back to simulation', async () => {
      const lat = 47.6062, lon = -122.3321;
      const aqiData = await getRealtimeAqi(lat, lon);
      expect(aqiData).toBeDefined();
      expect(aqiData.aqi).toBeGreaterThanOrEqual(0);
      expect(aqiData.category).toBeDefined();
      expect(aqiData.reporting_area).toBeDefined();
    });
  });
});
