"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#64748b']

export function DashboardCharts({ activities }: { activities: any[] }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 min-h-[300px] bg-card">
        <div className="animate-pulse flex flex-col items-center space-y-4 w-full max-w-sm">
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-40 bg-muted rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center p-8 bg-card">
        <p className="text-muted-foreground text-center text-xs">No activities logged yet. Head to the Activity Tracker to start!</p>
      </div>
    )
  }

  // 1. Prepare Pie Chart Data (Emissions by Category)
  const categoryMap = activities.reduce((acc, act) => {
    acc[act.category] = (acc[act.category] || 0) + Number(act.carbon_impact_kg)
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.keys(categoryMap).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: Number(categoryMap[key].toFixed(2))
  })).filter(d => d.value > 0)

  // 2. Prepare Area Chart Data (Emissions over Time)
  const dateMap = activities.reduce((acc, act) => {
    const date = new Date(act.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] || 0) + Number(act.carbon_impact_kg)
    return acc
  }, {} as Record<string, number>)

  const areaData = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => ({
    date,
    emissions: Number(dateMap[date].toFixed(2))
  }))

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6 p-6">
      <div className="flex-1 min-h-[250px] flex flex-col justify-between">
        <h4 className="text-xs font-semibold mb-4 text-center text-muted-foreground uppercase tracking-wider">Emissions by Category (kg)</h4>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`${value} kg`, 'Emissions']}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 10, color: 'var(--foreground)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] flex flex-col justify-between">
        <h4 className="text-xs font-semibold mb-4 text-center text-muted-foreground uppercase tracking-wider">Trend Over Time (kg)</h4>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} stroke="var(--muted-foreground)" tick={{ fontSize: 10 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="var(--border)" />
              <Tooltip 
                formatter={(value: any) => [`${value} kg`, 'Emissions']}
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  color: 'var(--foreground)'
                }}
                itemStyle={{ color: 'var(--foreground)' }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
              />
              <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
