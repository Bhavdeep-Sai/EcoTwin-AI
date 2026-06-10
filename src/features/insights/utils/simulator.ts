import {
  TransportMode,
  GridType,
  calculateTransportation,
  calculateFood,
  calculateElectricity,
  calculateShopping,
} from "../../activities/utils/carbonEngine";

export interface HabitProfile {
  transport: {
    mode: TransportMode;
    weekly_distance_km: number;
  };
  food: {
    weekly_beef_kg: number;
    weekly_poultry_kg: number;
    weekly_plant_kg: number;
  };
  electricity: {
    grid_type: GridType;
    monthly_kwh: number;
  };
  shopping: {
    monthly_spend_usd: number;
  };
}

export interface ProjectionDataPoint {
  year: number; // 0, 1, 3, 5
  current_behavior_kg: number;
  improved_behavior_kg: number;
  best_possible_kg: number;
}

// Helper to calculate exact annual footprint based on a profile
function calculateAnnualBaseline(profile: HabitProfile): number {
  const transportWeekly = calculateTransportation(profile.transport.weekly_distance_km, profile.transport.mode);
  
  const foodWeekly = 
    calculateFood(profile.food.weekly_beef_kg, "beef") +
    calculateFood(profile.food.weekly_poultry_kg, "poultry") +
    calculateFood(profile.food.weekly_plant_kg, "vegetables"); // Abstracting plant-based to vegetables

  const elecMonthly = calculateElectricity(profile.electricity.monthly_kwh, profile.electricity.grid_type);
  const shopMonthly = calculateShopping(profile.shopping.monthly_spend_usd, "apparel"); // Defaulting to an average retail category

  return (transportWeekly * 52) + (foodWeekly * 52) + (elecMonthly * 12) + (shopMonthly * 12);
}

// Generate Scenarios
export function generateProjections(profile: HabitProfile): ProjectionDataPoint[] {
  // Scenario A: Current Behavior (Linear)
  const currentAnnual = calculateAnnualBaseline(profile);

  // Scenario B: Improved Behavior
  // - Shift 20% of driving to bus (if they drive)
  // - Reduce beef by 40%, shift to poultry
  // - Reduce electricity by 15%
  // - Reduce shopping by 10%
  const improvedProfile: HabitProfile = {
    transport: {
      mode: profile.transport.mode, // Keeping mode same for simplicity, but distance is reduced
      weekly_distance_km: profile.transport.weekly_distance_km * 0.8, 
    },
    food: {
      weekly_beef_kg: profile.food.weekly_beef_kg * 0.6,
      weekly_poultry_kg: profile.food.weekly_poultry_kg + (profile.food.weekly_beef_kg * 0.4),
      weekly_plant_kg: profile.food.weekly_plant_kg,
    },
    electricity: {
      grid_type: profile.electricity.grid_type,
      monthly_kwh: profile.electricity.monthly_kwh * 0.85,
    },
    shopping: {
      monthly_spend_usd: profile.shopping.monthly_spend_usd * 0.9,
    }
  };
  
  // Add back the 20% transport shift as bus miles
  const improvedAnnual = calculateAnnualBaseline(improvedProfile) + (calculateTransportation(profile.transport.weekly_distance_km * 0.2, "bus") * 52);

  // Scenario C: Best Possible Behavior
  // - Switch transport entirely to EV
  // - Switch food entirely to plant-based (beef/poultry become 0, shifted to plant)
  // - Switch electricity to renewable (0 emissions)
  // - Reduce shopping by 30%
  const bestProfile: HabitProfile = {
    transport: {
      mode: "electric_vehicle",
      weekly_distance_km: profile.transport.weekly_distance_km,
    },
    food: {
      weekly_beef_kg: 0,
      weekly_poultry_kg: 0,
      weekly_plant_kg: profile.food.weekly_plant_kg + profile.food.weekly_beef_kg + profile.food.weekly_poultry_kg,
    },
    electricity: {
      grid_type: "renewable",
      monthly_kwh: profile.electricity.monthly_kwh,
    },
    shopping: {
      monthly_spend_usd: profile.shopping.monthly_spend_usd * 0.7,
    }
  };
  const bestAnnual = calculateAnnualBaseline(bestProfile);

  return [
    { year: 0, current_behavior_kg: 0, improved_behavior_kg: 0, best_possible_kg: 0 },
    { year: 1, current_behavior_kg: currentAnnual, improved_behavior_kg: improvedAnnual, best_possible_kg: bestAnnual },
    { year: 3, current_behavior_kg: currentAnnual * 3, improved_behavior_kg: improvedAnnual * 3, best_possible_kg: bestAnnual * 3 },
    { year: 5, current_behavior_kg: currentAnnual * 5, improved_behavior_kg: improvedAnnual * 5, best_possible_kg: bestAnnual * 5 },
  ];
}
