"use client"

import { useState, useEffect } from "react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const data = [
  { year: "2020-21", weightedAvg: 0.698, fossilAvg: 0.786, renewableGen: 147247, totalGen: 1147523 },
  { year: "2021-22", weightedAvg: 0.711, fossilAvg: 0.810, renewableGen: 170912, totalGen: 1230099 },
  { year: "2022-23", weightedAvg: 0.716, fossilAvg: 0.823, renewableGen: 203550, totalGen: 1320181 },
  { year: "2023-24", weightedAvg: 0.727, fossilAvg: 0.841, renewableGen: 225830, totalGen: 1408450 },
  { year: "2024-25", weightedAvg: 0.710, fossilAvg: 0.831, renewableGen: 255009, totalGen: 1461853 },
]

export function CeaChart() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full mt-8 bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center min-h-[550px]">
        <h3 className="text-lg font-bold mb-4 text-center">
          India&apos;s Grid Emission Factors & Renewable Generation (CEA Baseline)
        </h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-2xl">
          Comparing the Fossil Fuel Average vs. Overall Weighted Average (kg CO₂/kWh) alongside the growth in Net Renewable Generation (GWh).
        </p>
        <div className="animate-pulse w-full h-[350px] bg-muted rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="w-full mt-8 bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-bold mb-4 text-center">
        India&apos;s Grid Emission Factors & Renewable Generation (CEA Baseline)
      </h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-2xl">
        Comparing the Fossil Fuel Average vs. Overall Weighted Average (kg CO₂/kWh) alongside the growth in Net Renewable Generation (GWh).
      </p>
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 50, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis 
              yAxisId="left" 
              domain={[0.65, 0.9]} 
              tick={{ fontSize: 12 }} 
              label={{ value: 'Emission Factor (kg CO₂e/kWh)', angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle' } }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12 }}
              label={{ value: 'Renewable Gen (GWh)', angle: 90, position: 'insideRight', offset: -25, style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '30px' }} />
            
            <Bar yAxisId="right" dataKey="renewableGen" name="Renewable Generation (GWh)" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} />
            <Line yAxisId="left" type="monotone" dataKey="fossilAvg" name="Fossil Fuel Avg (kg/kWh)" stroke="#f97316" strokeWidth={3} />
            <Line yAxisId="left" type="monotone" dataKey="weightedAvg" name="Weighted Avg (Incl. Renewables)" stroke="#22c55e" strokeWidth={3} activeDot={{ r: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
