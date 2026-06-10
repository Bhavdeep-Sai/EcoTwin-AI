import { describe, it, expect } from 'vitest';
import { generateProjections, HabitProfile } from './simulator';

describe('Carbon Simulator Engine', () => {
  it('should generate accurate linear projections across 3 scenarios', () => {
    const testProfile: HabitProfile = {
      transport: { mode: 'gasoline_car', weekly_distance_km: 100 },
      food: { weekly_beef_kg: 1, weekly_poultry_kg: 1, weekly_plant_kg: 2 },
      electricity: { grid_type: 'us_average', monthly_kwh: 300 },
      shopping: { monthly_spend_usd: 200 }
    };

    const projections = generateProjections(testProfile);

    // Should generate 4 data points (Year 0, 1, 3, 5)
    expect(projections.length).toBe(4);

    // Year 0 should be baseline 0
    expect(projections[0].current_behavior_kg).toBe(0);

    // Best possible should ALWAYS be strictly less than improved, which is less than current
    // (Given our test profile has reducible metrics like gasoline car and beef)
    const year1 = projections[1];
    expect(year1.best_possible_kg).toBeLessThan(year1.improved_behavior_kg);
    expect(year1.improved_behavior_kg).toBeLessThan(year1.current_behavior_kg);

    // Projections should scale linearly
    const year3 = projections[2];
    const year5 = projections[3];
    
    expect(year3.current_behavior_kg).toBeCloseTo(year1.current_behavior_kg * 3);
    expect(year5.best_possible_kg).toBeCloseTo(year1.best_possible_kg * 5);
  });
});
