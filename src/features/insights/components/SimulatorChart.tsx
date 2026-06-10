"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HabitProfile, generateProjections } from "../utils/simulator"

interface SimulatorChartProps {
  profile: HabitProfile
}

export function SimulatorChart({ profile }: SimulatorChartProps) {
  const data = useMemo(() => {
    const rawData = generateProjections(profile)
    // Convert kg to metric tons for better readability on Y-axis
    return rawData.map(d => ({
      year: `Year ${d.year}`,
      Current: Number((d.current_behavior_kg / 1000).toFixed(2)),
      Improved: Number((d.improved_behavior_kg / 1000).toFixed(2)),
      BestPossible: Number((d.best_possible_kg / 1000).toFixed(2)),
    }))
  }, [profile])

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Future Carbon Simulator (5-Year Projection)</CardTitle>
        <CardDescription>
          Visualize the compound impact of your habits. The green shaded area represents your potential Avoided Emissions (Tons of CO₂e).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorImproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
            <YAxis unit="t" stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              dataKey="Current"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorCurrent)"
              name="Current Habits"
            />
            <Area
              type="monotone"
              dataKey="Improved"
              stroke="#eab308"
              fillOpacity={1}
              fill="url(#colorImproved)"
              name="Realistic Improvement"
            />
            <Area
              type="monotone"
              dataKey="BestPossible"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorBest)"
              name="Aggressive Decarbonization"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
