export interface EmissionFactor {
  factor: number
  unit: string
  source: string
  year: number
  reference_url: string
  assumptions: string
  formula: string
}

// Transportation Emission Factors (kg CO2e per km)
export const TRANSPORT_FACTORS: Record<string, EmissionFactor> = {
  "Car (Petrol)": {
    factor: 0.170,
    unit: "kg CO₂e / km",
    source: "US EPA & UK DEFRA",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Based on standard mid-sized passenger gasoline vehicle under average driving conditions.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.170"
  },
  "Car (Diesel)": {
    factor: 0.165,
    unit: "kg CO₂e / km",
    source: "US EPA & UK DEFRA",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Standard mid-sized diesel passenger vehicle, accounting for direct tailpipe greenhouse emissions.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.165"
  },
  "Car (CNG)": {
    factor: 0.110,
    unit: "kg CO₂e / km",
    source: "UK DEFRA / IPCC",
    year: 2024,
    reference_url: "https://www.ipcc-nggip.iges.or.jp/EFDB/main.php",
    assumptions: "Average passenger vehicle powered by Compressed Natural Gas (CNG).",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.110"
  },
  "Two-Wheeler (Petrol)": {
    factor: 0.080,
    unit: "kg CO₂e / km",
    source: "UK DEFRA",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Average medium motorcycle or scooter powered by petrol.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.080"
  },
  "Auto Rickshaw (CNG)": {
    factor: 0.060,
    unit: "kg CO₂e / km",
    source: "India ARAI & IPCC",
    year: 2023,
    reference_url: "https://www.araiindia.com/",
    assumptions: "Standard three-wheeler auto-rickshaw running on CNG in urban driving conditions.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.060"
  },
  "Electric Vehicle (EV)": {
    factor: 0.045,
    unit: "kg CO₂e / km",
    source: "US EPA",
    year: 2024,
    reference_url: "https://www.epa.gov/egrid",
    assumptions: "Calculated based on standard EV efficiency (~0.20 kWh/km) and the US National Grid Average electricity emission rate.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.045"
  },
  "Bus (Public Transport)": {
    factor: 0.040,
    unit: "kg CO₂e / passenger-km",
    source: "UK DEFRA",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Emissions per passenger-km assuming standard average local bus occupancy rates.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.040"
  },
  "Train (Indian Railways)": {
    factor: 0.020,
    unit: "kg CO₂e / passenger-km",
    source: "India CEA & DEFRA",
    year: 2024,
    reference_url: "https://cea.nic.in/cdm-co2-baseline-database-for-indian-power-sector/?lang=en",
    assumptions: "National rail electric passenger transport under average coach occupancy.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.020"
  },
  "Walking / Bicycle": {
    factor: 0.000,
    unit: "kg CO₂e / km",
    source: "Scientific Consensus",
    year: 2024,
    reference_url: "https://www.ipcc.ch/",
    assumptions: "Direct mechanical human-powered travel with zero operational fuel emissions.",
    formula: "Emissions (kg CO₂e) = Distance (km) × 0.000"
  }
}

// Electricity Grid Sourcing Factors (kg CO2e per kWh)
export const ENERGY_FACTORS: Record<string, EmissionFactor> = {
  "US Average Grid": {
    factor: 0.370,
    unit: "kg CO₂e / kWh",
    source: "US EPA eGRID",
    year: 2024,
    reference_url: "https://www.epa.gov/egrid",
    assumptions: "US national average resource mix output emission rate including gas, coal, nuclear, and renewables.",
    formula: "Emissions (kg CO₂e) = Electricity (kWh) × 0.370"
  },
  "India Average Grid": {
    factor: 0.710,
    unit: "kg CO₂e / kWh",
    source: "India Central Electricity Authority (CEA)",
    year: 2024,
    reference_url: "https://cea.nic.in/cdm-co2-baseline-database-for-indian-power-sector/?lang=en",
    assumptions: "Weighted average grid emission factor for the unified Indian national grid (Baseline Database v19).",
    formula: "Emissions (kg CO₂e) = Electricity (kWh) × 0.710"
  },
  "UK Average Grid": {
    factor: 0.207,
    unit: "kg CO₂e / kWh",
    source: "UK DEFRA",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Grid electricity transmission and distribution average intensity for the United Kingdom.",
    formula: "Emissions (kg CO₂e) = Electricity (kWh) × 0.207"
  },
  "Solar / Clean Sourcing": {
    factor: 0.040,
    unit: "kg CO₂e / kWh",
    source: "National Renewable Energy Lab (NREL)",
    year: 2023,
    reference_url: "https://www.nrel.gov/analysis/life-cycle-assessment.html",
    assumptions: "Lifecycle emission estimate for solar photovoltaic power, accounting for manufacturing and solar pane lifecycle degradation.",
    formula: "Emissions (kg CO₂e) = Electricity (kWh) × 0.040"
  }
}

// Food Sourcing Factors (kg CO2e per meal or kg)
export const FOOD_FACTORS: Record<string, EmissionFactor> = {
  "Non-Vegetarian": {
    factor: 2.80,
    unit: "kg CO₂e / meal",
    source: "Our World In Data",
    year: 2023,
    reference_url: "https://ourworldindata.org/environmental-impacts-of-food",
    assumptions: "Average mixed diet meal containing beef, poultry, dairy, and agricultural goods (LCA standard).",
    formula: "Emissions (kg CO₂e) = Meals × 2.80"
  },
  "Indian Vegetarian (Dairy-heavy)": {
    factor: 1.20,
    unit: "kg CO₂e / meal",
    source: "Our World In Data / Poore & Nemecek",
    year: 2018,
    reference_url: "https://www.science.org/doi/10.1126/science.aaq0216",
    assumptions: "Dietary pattern emphasizing grains, vegetables, and high dairy content (paneer, milk, ghee).",
    formula: "Emissions (kg CO₂e) = Meals × 1.20"
  },
  "Vegan / Plant-based": {
    factor: 0.50,
    unit: "kg CO₂e / meal",
    source: "Our World In Data / Poore & Nemecek",
    year: 2018,
    reference_url: "https://www.science.org/doi/10.1126/science.aaq0216",
    assumptions: "Zero-animal-product dietary baseline, relying entirely on plant proteins, grains, and local vegetables.",
    formula: "Emissions (kg CO₂e) = Meals × 0.50"
  }
}

// Shopping Factors (kg CO2e per ₹1000 spend, spend-based approximation)
export const SHOPPING_FACTORS: Record<string, EmissionFactor> = {
  "Clothing": {
    factor: 1.80,
    unit: "kg CO₂e / ₹1000 spent",
    source: "UK DEFRA Spend Factors",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Spend-based approximation for textiles and footwear, converted to INR base.",
    formula: "Emissions (kg CO₂e) = Spend (₹) × (1.80 / 1000)"
  },
  "Electronics": {
    factor: 3.50,
    unit: "kg CO₂e / ₹1000 spent",
    source: "UK DEFRA Spend Factors",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Spend-based factor for computers, electronics, and optoelectronics manufacturing lifecycle emissions.",
    formula: "Emissions (kg CO₂e) = Spend (₹) × (3.50 / 1000)"
  },
  "Groceries": {
    factor: 1.20,
    unit: "kg CO₂e / ₹1000 spent",
    source: "UK DEFRA Spend Factors",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Spend-based factor for mixed food and beverage products under average supermarket supply lines.",
    formula: "Emissions (kg CO₂e) = Spend (₹) × (1.20 / 1000)"
  },
  "Home": {
    factor: 2.10,
    unit: "kg CO₂e / ₹1000 spent",
    source: "UK DEFRA Spend Factors",
    year: 2024,
    reference_url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024",
    assumptions: "Spend-based factor for home furniture, metalware, and durable home goods.",
    formula: "Emissions (kg CO₂e) = Spend (₹) × (2.10 / 1000)"
  }
}

// Waste Sourcing Factors (kg CO2e per kg waste)
export const WASTE_FACTORS: Record<string, EmissionFactor> = {
  "Plastic": {
    factor: 1.50,
    unit: "kg CO₂e / kg waste",
    source: "US EPA WARM Model",
    year: 2023,
    reference_url: "https://www.epa.gov/warm",
    assumptions: "Landfill emissions and manufacturing energy loss for standard mixed plastic packaging waste.",
    formula: "Emissions (kg CO₂e) = Weight (kg) × 1.50"
  },
  "Organic": {
    factor: 0.50,
    unit: "kg CO₂e / kg waste",
    source: "US EPA WARM / IPCC",
    year: 2023,
    reference_url: "https://www.epa.gov/warm",
    assumptions: "Methane potential emissions from decaying food and garden waste under standard municipal waste handling.",
    formula: "Emissions (kg CO₂e) = Weight (kg) × 0.50"
  },
  "Paper": {
    factor: 0.90,
    unit: "kg CO₂e / kg waste",
    source: "US EPA WARM Model",
    year: 2023,
    reference_url: "https://www.epa.gov/warm",
    assumptions: "Fugitive decay emissions for paper, newspaper, and cardboard waste types.",
    formula: "Emissions (kg CO₂e) = Weight (kg) × 0.90"
  },
  "Mixed": {
    factor: 0.53,
    unit: "kg CO₂e / kg waste",
    source: "US EPA WARM Model",
    year: 2023,
    reference_url: "https://www.epa.gov/warm",
    assumptions: "Weighted average for standard unsorted municipal solid waste.",
    formula: "Emissions (kg CO₂e) = Weight (kg) × 0.53"
  }
}

// Multiplier offset for recycled waste
export const RECYCLING_MULTIPLIER = 0.10 // 90% reduction credit
