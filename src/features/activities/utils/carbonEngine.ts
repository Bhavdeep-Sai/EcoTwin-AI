/**
 * EcoTwin AI Carbon Calculation Engine
 * 
 * All factors are scientifically sourced. No dummy data.
 * Returns emissions strictly in kg CO2e.
 */

// ---------------------------------------------------------------------------
// 1. TRANSPORTATION
// Source: EPA GHG Emission Factors Hub (2024) / DEFRA (2023)
// ---------------------------------------------------------------------------
export type TransportMode = 
  | 'gasoline_car' 
  | 'electric_vehicle' 
  | 'bus' 
  | 'train' 
  | 'flight_short' 
  | 'flight_long' 
  | 'bicycle_walking';

const TRANSPORT_FACTORS: Record<TransportMode, number> = {
  gasoline_car: 0.208,
  electric_vehicle: 0.071,
  bus: 0.065,
  train: 0.035,
  flight_short: 0.246,
  flight_long: 0.193,
  bicycle_walking: 0.0,
};

export function calculateTransportation(distanceKm: number, mode: TransportMode): number {
  if (distanceKm < 0) throw new Error("Distance cannot be negative");
  return distanceKm * TRANSPORT_FACTORS[mode];
}

// ---------------------------------------------------------------------------
// 2. FOOD
// Source: Poore & Nemecek (2018) via Our World In Data
// ---------------------------------------------------------------------------
export type FoodIngredient = 
  | 'beef' 
  | 'lamb' 
  | 'cheese' 
  | 'pork' 
  | 'poultry' 
  | 'fish_farmed' 
  | 'eggs' 
  | 'rice' 
  | 'tofu' 
  | 'vegetables';

const FOOD_FACTORS: Record<FoodIngredient, number> = {
  beef: 99.48,
  lamb: 39.72,
  cheese: 23.88,
  pork: 12.31,
  poultry: 9.87,
  fish_farmed: 13.63,
  eggs: 4.67,
  rice: 4.45,
  tofu: 3.16,
  vegetables: 0.53,
};

export function calculateFood(weightKg: number, ingredient: FoodIngredient): number {
  if (weightKg < 0) throw new Error("Weight cannot be negative");
  return weightKg * FOOD_FACTORS[ingredient];
}

// ---------------------------------------------------------------------------
// 3. ELECTRICITY
// Source: US EPA eGRID (2022/2024)
// ---------------------------------------------------------------------------
export type GridType = 'us_average' | 'coal_heavy' | 'clean' | 'renewable';

const ELECTRICITY_FACTORS: Record<GridType, number> = {
  us_average: 0.386,
  coal_heavy: 0.850,
  clean: 0.110,
  renewable: 0.0,
};

export function calculateElectricity(kwh: number, grid: GridType = 'us_average'): number {
  if (kwh < 0) throw new Error("kWh cannot be negative");
  return kwh * ELECTRICITY_FACTORS[grid];
}

// ---------------------------------------------------------------------------
// 4. SHOPPING & RETAIL
// Source: EPA EEIO (2023)
// ---------------------------------------------------------------------------
export type ShoppingCategory = 
  | 'apparel' 
  | 'electronics' 
  | 'furniture' 
  | 'books_paper' 
  | 'pharmaceuticals';

const SHOPPING_FACTORS: Record<ShoppingCategory, number> = {
  apparel: 0.32,
  electronics: 0.45,
  furniture: 0.38,
  books_paper: 0.30,
  pharmaceuticals: 0.25,
};

export function calculateShopping(spendUsd: number, category: ShoppingCategory): number {
  if (spendUsd < 0) throw new Error("Spend cannot be negative");
  return spendUsd * SHOPPING_FACTORS[category];
}

// ---------------------------------------------------------------------------
// 5. WASTE
// Source: EPA WARM Model v16
// ---------------------------------------------------------------------------
export type WasteDestination = 
  | 'landfilled' 
  | 'incinerated' 
  | 'recycled' 
  | 'composted';

const WASTE_FACTORS: Record<WasteDestination, number> = {
  landfilled: 0.52,
  incinerated: 0.43,
  recycled: -0.89, // Avoided emissions
  composted: 0.17,
};

export function calculateWaste(weightKg: number, destination: WasteDestination): number {
  if (weightKg < 0) throw new Error("Weight cannot be negative");
  return weightKg * WASTE_FACTORS[destination];
}

/**
 * Utility: Sum multiple activities
 */
export function calculateTotalFootprint(activities: number[]): number {
  return activities.reduce((acc, current) => acc + current, 0);
}
