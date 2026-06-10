"use client"

import React from 'react'
import { TrendingDown, TrendingUp, Calendar, BookOpen } from 'lucide-react'

interface WeeklyReportsProps {
  activities: any[]
}

interface WeeklyReport {
  id: string
  weekLabel: string
  dateRange: string
  totalCarbonKg: number
  trendPct: number // positive (increase) or negative (saving)
  aiTakeaway: string
  breakdown: Record<string, number> // category percentages
}

export function WeeklyReportsList({ activities }: WeeklyReportsProps) {
  // 1. Return empty state if no activities logged yet
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl shadow-sm w-full text-center min-h-[240px]">
        <Calendar className="h-8 w-8 text-primary mb-3" />
        <h4 className="text-base font-semibold text-foreground">No Weekly Digests Available</h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Once you start logging activities on the dashboard, your performance trends, weekly reports, and category breakdowns will be dynamically generated here.
        </p>
      </div>
    )
  }

  // 2. Group activities by week
  // Sunday is the start of the week
  const getWeekStartDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const day = d.getDay() // 0 = Sun, 1 = Mon...
    const diff = d.getDate() - day
    const weekStart = new Date(d.setDate(diff))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  const weeksMap: Record<string, {
    weekStart: Date
    activities: any[]
  }> = {}

  activities.forEach(act => {
    const weekStart = getWeekStartDate(act.activity_date)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    if (!weeksMap[weekStartStr]) {
      weeksMap[weekStartStr] = {
        weekStart,
        activities: []
      }
    }
    weeksMap[weekStartStr].activities.push(act)
  })

  // Convert map to sorted array (most recent first)
  const sortedWeeksData = Object.values(weeksMap).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())

  // Compile reports list
  const reports: WeeklyReport[] = sortedWeeksData.map((weekData, index) => {
    const weekStart = weekData.weekStart
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const dateRange = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
    
    const weekActivities = weekData.activities
    const totalCarbonKg = Number(weekActivities.reduce((sum, act) => sum + Number(act.carbon_impact_kg), 0).toFixed(1))

    // Calculate category breakdowns
    const categories = ['transport', 'food', 'electricity', 'shopping', 'waste']
    const breakdown: Record<string, number> = {}
    categories.forEach(cat => {
      const catTotal = weekActivities.filter(act => act.category === cat).reduce((sum, act) => sum + Number(act.carbon_impact_kg), 0)
      breakdown[cat] = totalCarbonKg > 0 ? Math.round((catTotal / totalCarbonKg) * 100) : 0
    })

    // Calculate trend percentage compared to previous week (which is next in sorted array)
    let trendPct = 0
    const prevWeekData = sortedWeeksData[index + 1]
    if (prevWeekData) {
      const prevTotal = prevWeekData.activities.reduce((sum, act) => sum + Number(act.carbon_impact_kg), 0)
      trendPct = prevTotal > 0 ? Number((((totalCarbonKg - prevTotal) / prevTotal) * 100).toFixed(1)) : 0
    }

    // Dynamic AI Twin Analysis summary (fully authentic)
    const transportCount = weekActivities.filter(a => a.category === 'transport').length
    const foodCount = weekActivities.filter(a => a.category === 'food').length
    const energyCount = weekActivities.filter(a => a.category === 'electricity').length
    
    // Find category with highest emissions
    let maxCategory = 'none'
    let maxEmissions = 0
    Object.entries(breakdown).forEach(([cat, pct]) => {
      if (pct > maxEmissions) {
        maxEmissions = pct
        maxCategory = cat
      }
    })

    const weekNum = sortedWeeksData.length - index
    const weekLabel = `Week ${weekNum} ${index === 0 ? '(Current)' : ''}`

    const aiTakeaway = `Genuine emissions logged: ${totalCarbonKg} kg CO₂e across ${weekActivities.length} activities (${transportCount} transport, ${foodCount} food, ${energyCount} energy). Your highest emissions source this week was "${maxCategory}" at ${maxEmissions}% of your share. Adjust your lifestyle habits in this category to establish positive carbon offsets.`

    return {
      id: weekStart.toISOString().split('T')[0],
      weekLabel,
      dateRange,
      totalCarbonKg,
      trendPct,
      aiTakeaway,
      breakdown
    }
  })

  return (
    <div className="flex flex-col space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm w-full relative overflow-visible">
      <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <h4 className="text-lg font-bold text-foreground">Weekly Performance Digests</h4>
        <p className="text-xs text-muted-foreground">Notion-style weekly reviews and AI carbon analysis summaries</p>
      </div>

      <div className="space-y-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted/65 transition-all duration-200 flex flex-col space-y-4"
          >
            {/* Top row: Date & Trend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{report.weekLabel} ({report.dateRange})</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium">Total Emissions</div>
                  <div className="text-sm font-black text-foreground">{report.totalCarbonKg} kg CO₂e</div>
                </div>
                
                <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${
                  report.trendPct < 0 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                }`}>
                  {report.trendPct < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                  <span>{Math.abs(report.trendPct)}%</span>
                </div>
              </div>
            </div>

            {/* AI Summary takeaway */}
            <div className="p-4 bg-muted border border-border/50 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-primary">AI Twin Analysis</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.aiTakeaway}</p>
              </div>
            </div>

            {/* Category breakdown progress bars */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Emissions Share By Category</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {Object.entries(report.breakdown).map(([cat, pct]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground capitalize">
                      <span>{cat}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          cat === 'transport' ? 'bg-emerald-500' :
                          cat === 'food' ? 'bg-emerald-400' :
                          cat === 'electricity' ? 'bg-teal-600' :
                          cat === 'shopping' ? 'bg-blue-500' : 'bg-slate-500'
                        }`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
