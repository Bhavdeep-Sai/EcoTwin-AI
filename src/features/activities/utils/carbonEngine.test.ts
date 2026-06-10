import { describe, it, expect } from 'vitest';
import {
  calculateTransportation,
  calculateFood,
  calculateElectricity,
  calculateShopping,
  calculateWaste,
  calculateTotalFootprint
} from './carbonEngine';

describe('Carbon Engine Calculations', () => {

  describe('Transportation', () => {
    it('calculates gasoline car emissions correctly', () => {
      // 100 km * 0.208 = 20.8
      expect(calculateTransportation(100, 'gasoline_car')).toBeCloseTo(20.8);
    });

    it('calculates EV emissions correctly', () => {
      // 100 km * 0.071 = 7.1
      expect(calculateTransportation(100, 'electric_vehicle')).toBeCloseTo(7.1);
    });

    it('returns 0 for walking/biking', () => {
      expect(calculateTransportation(50, 'bicycle_walking')).toBe(0);
    });

    it('throws error on negative distance', () => {
      expect(() => calculateTransportation(-10, 'bus')).toThrow();
    });
  });

  describe('Food', () => {
    it('calculates beef emissions correctly', () => {
      // 0.5 kg * 99.48 = 49.74
      expect(calculateFood(0.5, 'beef')).toBeCloseTo(49.74);
    });

    it('calculates tofu emissions correctly', () => {
      // 0.5 kg * 3.16 = 1.58
      expect(calculateFood(0.5, 'tofu')).toBeCloseTo(1.58);
    });

    it('throws error on negative weight', () => {
      expect(() => calculateFood(-1, 'rice')).toThrow();
    });
  });

  describe('Electricity', () => {
    it('calculates US average grid correctly', () => {
      // 100 kWh * 0.386 = 38.6
      expect(calculateElectricity(100, 'us_average')).toBeCloseTo(38.6);
    });

    it('defaults to us_average if no grid specified', () => {
      expect(calculateElectricity(100)).toBeCloseTo(38.6);
    });

    it('returns 0 for renewable grid', () => {
      expect(calculateElectricity(100, 'renewable')).toBe(0);
    });

    it('throws error on negative kWh', () => {
      expect(() => calculateElectricity(-50, 'us_average')).toThrow();
    });
  });

  describe('Shopping & Retail', () => {
    it('calculates apparel shopping correctly', () => {
      // $100 * 0.32 = 32.0
      expect(calculateShopping(100, 'apparel')).toBeCloseTo(32.0);
    });

    it('calculates electronics shopping correctly', () => {
      // $500 * 0.45 = 225.0
      expect(calculateShopping(500, 'electronics')).toBeCloseTo(225.0);
    });

    it('throws error on negative spend', () => {
      expect(() => calculateShopping(-10, 'apparel')).toThrow();
    });
  });

  describe('Waste', () => {
    it('calculates landfilled waste correctly', () => {
      // 10 kg * 0.52 = 5.2
      expect(calculateWaste(10, 'landfilled')).toBeCloseTo(5.2);
    });

    it('calculates recycled waste correctly (negative emissions)', () => {
      // 10 kg * -0.89 = -8.9
      expect(calculateWaste(10, 'recycled')).toBeCloseTo(-8.9);
    });

    it('throws error on negative weight', () => {
      expect(() => calculateWaste(-1, 'composted')).toThrow();
    });
  });

  describe('Total Footprint', () => {
    it('sums multiple activities correctly', () => {
      const activities = [
        calculateTransportation(100, 'gasoline_car'), // 20.8
        calculateFood(0.5, 'beef'),                   // 49.74
        calculateElectricity(100, 'us_average')       // 38.6
      ];
      // 20.8 + 49.74 + 38.6 = 109.14
      expect(calculateTotalFootprint(activities)).toBeCloseTo(109.14);
    });
  });
});
