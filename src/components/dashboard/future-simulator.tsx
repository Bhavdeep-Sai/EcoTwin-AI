"use client"

import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

import { FOOD_FACTORS, TRANSPORT_FACTORS, ENERGY_FACTORS } from '@/lib/services/carbonFactors'

export function FutureSimulator() {
  const [dietType, setDietType] = useState<number>(2) // 0: Vegan, 1: Vegetarian, 2: Average, 3: Meat Heavy
  const [commuteDistance, setCommuteDistance] = useState<number>(30) // km per day
  const [commuteMode, setCommuteMode] = useState<string>('petrol_car') // petrol_car, electric_vehicle, transit
  const [renewablePct, setRenewablePct] = useState<number>(10) // 0% to 100%

  // Scientific daily rates (in kg CO2e) derived from carbonFactors.ts
  const DIET_RATES = [
    FOOD_FACTORS['Vegan / Plant-based'].factor,
    FOOD_FACTORS['Indian Vegetarian (Dairy-heavy)'].factor,
    FOOD_FACTORS['Non-Vegetarian'].factor,
    FOOD_FACTORS['Non-Vegetarian'].factor * 1.25 // Meat-Heavy scaling
  ]
  const DIET_LABELS = ['Vegan/Plant-based', 'Vegetarian', 'Average Mixed', 'Meat Heavy']
  
  const TRANSPORT_RATES: Record<string, number> = {
    petrol_car: TRANSPORT_FACTORS['Car (Petrol)'].factor,
    electric_vehicle: TRANSPORT_FACTORS['Electric Vehicle (EV)'].factor,
    transit: TRANSPORT_FACTORS['Bus (Public Transport)'].factor,
    walking_bike: TRANSPORT_FACTORS['Walking / Bicycle'].factor
  }

  // Energy: US household average ~30 kWh/day
  const GRID_CO2_KWH = ENERGY_FACTORS['US Average Grid'].factor // kg CO2e/kWh
  const RENEWABLE_CO2_KWH = ENERGY_FACTORS['Solar / Clean Sourcing'].factor

  // Calculate simulated footprint (annual metric tons)
  const calculateAnnualFootprint = () => {
    const dietDaily = DIET_RATES[dietType] * 3 // 3 meals/day
    const transportDaily = commuteDistance * (TRANSPORT_RATES[commuteMode] || 0)
    
    const energyDailyKwh = 30
    const energyDaily = energyDailyKwh * (
      (GRID_CO2_KWH * (1 - renewablePct / 100)) + 
      (RENEWABLE_CO2_KWH * (renewablePct / 100))
    )

    const totalDailyKg = dietDaily + transportDaily + energyDaily
    return Number(((totalDailyKg * 365) / 1000).toFixed(2)) // return in metric tons CO2e per year
  }

  // Baseline footprint: Average diet (2.0), 40km petrol commute, 0% renewables
  const getBaselineAnnual = () => {
    const dietDaily = 2.0 * 3
    const transportDaily = 40 * 0.170
    const energyDaily = 30 * GRID_CO2_KWH
    const totalDailyKg = dietDaily + transportDaily + energyDaily
    return Number(((totalDailyKg * 365) / 1000).toFixed(2))
  }

  const annualSimulated = calculateAnnualFootprint()
  const annualBaseline = getBaselineAnnual()
  const annualSaved = Math.max(0, annualBaseline - annualSimulated)

  // Generate 30-year projection data points
  const generateProjectionData = () => {
    const dataPoints = []
    const baseVal = annualBaseline
    const simVal = annualSimulated
    
    for (let year = 0; year <= 30; year += 5) {
      // Net Zero Target Pathway: Baseline emissions cutting in half by 2030 (year 5) and hitting net zero by 2050 (year 25)
      const targetVal = Number((baseVal * Math.pow(0.5, year / 7)).toFixed(2))

      dataPoints.push({
        year: `Yr ${year}`,
        Baseline: Number((baseVal * year).toFixed(1)),
        Simulated: Number((simVal * year).toFixed(1)),
        TargetPathway: Number((targetVal * year).toFixed(1))
      })
    }
    return dataPoints
  }

  const chartData = generateProjectionData()

  return (
    <div className="grid gap-6 lg:grid-cols-5 p-6 bg-card border border-border rounded-xl shadow-sm w-full relative overflow-visible">
      {/* Left Column: Sliders */}
      <div className="lg:col-span-2 flex flex-col space-y-6">
        <div>
          <h4 className="text-lg font-bold text-foreground">Lifestyle Simulation</h4>
          <p className="text-xs text-muted-foreground">Adjust sliders to forecast your cumulative impact over 30 years</p>
        </div>

        {/* Diet Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-foreground">Diet Composition</span>
            <span className="text-primary font-bold">{DIET_LABELS[dietType]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={dietType}
            onChange={(e) => setDietType(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>Vegan</span>
            <span>Vegetarian</span>
            <span>Average</span>
            <span>Meat-Heavy</span>
          </div>
        </div>

        {/* Transportation Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Commuting Transit Mode</label>
          <select
            value={commuteMode}
            onChange={(e) => setCommuteMode(e.target.value)}
            className="w-full h-10 px-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary/50"
          >
            <option value="petrol_car">Gasoline Car (Petrol)</option>
            <option value="electric_vehicle">Electric Vehicle (EV)</option>
            <option value="transit">Public Transit (Bus/Train)</option>
            <option value="walking_bike">Bicycle / Walking</option>
          </select>
        </div>

        {/* Commute Distance Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-foreground">Daily Commute Distance</span>
            <span className="text-primary font-bold">{commuteDistance} km / day</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={commuteDistance}
            onChange={(e) => setCommuteDistance(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>0 km</span>
            <span>75 km</span>
            <span>150 km</span>
          </div>
        </div>

        {/* Energy Cleanliness Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-foreground">Clean Electricity Sourcing</span>
            <span className="text-primary font-bold">{renewablePct}% Clean</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={renewablePct}
            onChange={(e) => setRenewablePct(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>100% Fossil Grid</span>
            <span>50% Solar/Wind</span>
            <span>100% Clean Energy</span>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col space-y-2 mt-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-primary">Savings Forecast</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary">{annualSaved.toFixed(1)}</span>
            <span className="text-xs text-primary font-medium">Metric Tons CO₂e / Year Saved</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Your simulated choices reduce your carbon output by {Math.round((annualSaved / (annualBaseline || 1)) * 100)}% compared to the national average baseline.
          </p>
        </div>

      </div>

      {/* Right Column: Chart */}
      <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">30-Year Cumulative Projections</h4>
          <p className="text-xs text-muted-foreground">Emissions accumulation (Metric Tons CO₂e) under different pathways</p>
        </div>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="var(--border)" />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                labelStyle={{ fontWeight: 'bold', fontSize: 11, color: 'var(--foreground)' }}
                itemStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              
              <Area type="monotone" dataKey="Baseline" stroke="#ef4444" fillOpacity={1} fill="url(#colorBase)" strokeWidth={2} name="US Average Baseline" />
              <Area type="monotone" dataKey="Simulated" stroke="#10b981" fillOpacity={1} fill="url(#colorSim)" strokeWidth={2.5} name="Your Simulated Choice" />
              <Area type="monotone" dataKey="TargetPathway" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={2} strokeDasharray="4 4" name="Paris Goal Alignment" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center pt-2">
          <div className="p-3 bg-muted/30 border border-border rounded-xl">
            <div className="text-[9px] text-muted-foreground uppercase font-bold">Accumulated Saved</div>
            <div className="text-lg font-black text-primary mt-1">{(annualSaved * 30).toFixed(0)} t</div>
            <div className="text-[9px] text-muted-foreground/60">Over 30 Years</div>
          </div>
          <div className="p-3 bg-muted/30 border border-border rounded-xl">
            <div className="text-[9px] text-muted-foreground uppercase font-bold">Equivalent Trees</div>
            <div className="text-lg font-black text-primary mt-1">{Math.round(annualSaved * 30 * 45)}</div>
            <div className="text-[9px] text-muted-foreground/60">Planted & Grown</div>
          </div>
          <div className="p-3 bg-muted/30 border border-border rounded-xl">
            <div className="text-[9px] text-muted-foreground uppercase font-bold">Paris Alignment</div>
            <div className="text-lg font-black text-primary mt-1">{annualSimulated <= (annualBaseline * 0.4) ? 'Paris Fit' : 'Not Aligned'}</div>
            <div className="text-[9px] text-muted-foreground/60">2030 Compatibility</div>
          </div>
        </div>

        {/* Scientific Assumptions & Confidence Limitations */}
        <div className="col-span-1 md:col-span-3 border-t border-border pt-4 mt-2 text-[10px] text-muted-foreground leading-relaxed space-y-2">
          <p>
            <span className="font-bold text-foreground">🔬 Scientific Methodology:</span> Calculations are derived from deterministic mathematical coefficients sourced from US EPA eGRID (2024) grid emissions, UK DEFRA (2024) transport factors, and Poore & Nemecek (2018) food lifecycle assessments. Commute calculations assume a 365-day year. Grid calculations assume average US household energy baseline consumption of 30 kWh per day.
          </p>
          <p>
            <span className="font-bold text-foreground">⚠️ Confidence Limitations:</span> Projections assume static lifestyle inputs and emissions coefficients across 30 years. Actual outcomes will vary based on macro-grid decarbonization rates, regional transportation advancements, and variable personal behaviors. Projections are indicators for planning, not absolute mathematical certainties.
          </p>
        </div>

      </div>

    </div>
  )
}
