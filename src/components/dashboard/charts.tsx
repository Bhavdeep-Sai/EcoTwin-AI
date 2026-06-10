"use client"

import { useState, useEffect, useMemo } from "react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts"
import { TrendingUp, TrendingDown, ShieldCheck, ExternalLink, Info, Utensils, Zap, Car, ShoppingBag, Trash2, BarChart2 } from "lucide-react"

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  food:        { color: '#10b981', icon: Utensils,    label: 'Food'        },
  electricity: { color: '#f59e0b', icon: Zap,         label: 'Electricity' },
  transport:   { color: '#6366f1', icon: Car,         label: 'Transport'   },
  shopping:    { color: '#a855f7', icon: ShoppingBag, label: 'Shopping'    },
  waste:       { color: '#f97316', icon: Trash2,      label: 'Waste'       },
}

// ─── Custom Donut Label (center text) ─────────────────────────────────────────
function DonutCenterLabel({ total, cx, cy }: { total: number; cx?: number; cy?: number }) {
  return (
    <g>
      <text x={cx} y={(cy ?? 0) - 10} textAnchor="middle" dominantBaseline="middle" fill="var(--foreground)" style={{ fontSize: 28, fontWeight: 800, fontFamily: 'inherit' }}>
        {total.toFixed(1)}
      </text>
      <text x={cx} y={(cy ?? 0) + 18} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" style={{ fontSize: 11, fontWeight: 500, fontFamily: 'inherit' }}>
        kg CO₂e
      </text>
      <rect x={(cx ?? 0) - 42} y={(cy ?? 0) + 32} width={84} height={18} rx={9} fill="var(--primary)" fillOpacity={0.12} />
      <text x={cx} y={(cy ?? 0) + 41} textAnchor="middle" dominantBaseline="middle" fill="var(--primary)" style={{ fontSize: 10, fontWeight: 700, fontFamily: 'inherit' }}>
        Total Emissions
      </text>
    </g>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      color: 'var(--foreground)',
      fontSize: 12,
      minWidth: 130,
    }}>
      <p style={{ color: 'var(--muted-foreground)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: '#10b981', fontWeight: 700 }}>{p.value.toFixed(2)} kg CO₂e</p>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardCharts({ activities }: { activities: any[] }) {
  const [isMounted, setIsMounted] = useState(false)
  const [trendMode, setTrendMode] = useState<'daily' | 'weekly'>('daily')

  useEffect(() => { setIsMounted(true) }, [])

  // ── Data derivations ──────────────────────────────────────────────────────
  const { pieData, totalKg, topCategories } = useMemo(() => {
    const categoryMap: Record<string, number> = {}
    for (const act of activities ?? []) {
      const cat = act.category?.toLowerCase() ?? 'other'
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(act.carbon_impact_kg)
    }
    const total = Object.values(categoryMap).reduce((s, v) => s + v, 0)
    const pie = Object.entries(categoryMap)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        key,
        name: CATEGORY_CONFIG[key]?.label ?? key,
        value: Number(value.toFixed(2)),
        color: CATEGORY_CONFIG[key]?.color ?? '#64748b',
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
      }))
    const top = pie.slice(0, 2).map(c => c.name)
    return { pieData: pie, totalKg: total, topCategories: top }
  }, [activities])

  const areaData = useMemo(() => {
    if (!activities?.length) return []

    if (trendMode === 'daily') {
      const dateMap: Record<string, number> = {}
      for (const act of activities) {
        const key = act.activity_date // YYYY-MM-DD
        dateMap[key] = (dateMap[key] || 0) + Number(act.carbon_impact_kg)
      }
      return Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, emissions]) => ({
          date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          emissions: Number(emissions.toFixed(2)),
        }))
    }

    // Weekly grouping
    const weekMap: Record<string, number> = {}
    for (const act of activities) {
      const d = new Date(act.activity_date + 'T00:00:00')
      const day = d.getDay()
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((day + 6) % 7))
      const key = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weekMap[key] = (weekMap[key] || 0) + Number(act.carbon_impact_kg)
    }
    return Object.entries(weekMap)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, emissions]) => ({ date, emissions: Number(emissions.toFixed(2)) }))
  }, [activities, trendMode])

  // % change vs previous equal-length window
  const trendPct = useMemo(() => {
    if (areaData.length < 2) return null
    const half = Math.ceil(areaData.length / 2)
    const recent = areaData.slice(-half).reduce((s, d) => s + d.emissions, 0)
    const prev = areaData.slice(0, half).reduce((s, d) => s + d.emissions, 0)
    if (prev === 0) return null
    return Math.round(((recent - prev) / prev) * 100)
  }, [areaData])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="w-full p-6 animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!activities?.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart2 className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">No data yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">Log some activities to see your carbon footprint breakdown and trends.</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-0">

      {/* ── Two-panel charts grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">

        {/* LEFT: Donut + Category Breakdown */}
        <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          {/* Panel header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-none">Emissions by Category</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">kg CO₂e</p>
            </div>
            <Info className="h-3.5 w-3.5 text-muted-foreground ml-auto cursor-help" />
          </div>

          {/* Donut + Legend row */}
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="shrink-0" style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  {/* Gray remaining arc fill */}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--foreground)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                          <p style={{ fontWeight: 700 }}>{d.name}</p>
                          <p style={{ color: d.color, fontWeight: 600 }}>{d.value} kg · {d.pct}%</p>
                        </div>
                      )
                    }}
                  />
                  <DonutCenterLabel total={totalKg} cx={100} cy={100} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category list */}
            <div className="flex-1 flex flex-col gap-2.5 min-w-0">
              {pieData.map((cat) => {
                const Icon = CATEGORY_CONFIG[cat.key]?.icon ?? BarChart2
                return (
                  <div key={cat.key} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: cat.color + '20' }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-none">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{cat.value} kg</p>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: cat.color }}>{cat.pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Insight banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10 mt-auto">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {topCategories.length >= 2 ? (
                <><span className="font-bold text-primary">{topCategories[0]}</span> and <span className="font-bold text-indigo-500">{topCategories[1]}</span> are your top emission sources. Focus on small changes for a big impact!</>
              ) : topCategories.length === 1 ? (
                <><span className="font-bold text-primary">{topCategories[0]}</span> is your top emission source. Keep tracking to find reduction opportunities!</>
              ) : (
                <>Great start! Log more activities to see your top emission sources.</>
              )}
            </p>
          </div>
        </div>

        {/* RIGHT: Trend Area Chart */}
        <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          {/* Panel header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-none">Trend Over Time</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">kg CO₂e</p>
            </div>
            <Info className="h-3.5 w-3.5 text-muted-foreground ml-1 cursor-help" />
            {/* Daily / Weekly toggle */}
            <div className="ml-auto flex items-center gap-1 bg-muted rounded-lg p-0.5">
              {(['daily', 'weekly'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setTrendMode(m)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    trendMode === m
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="emissions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#trendGradient)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--card)' }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: 'var(--card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trend insight banner */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border mt-auto ${
            trendPct === null
              ? 'bg-muted/40 border-border/40'
              : trendPct > 0
              ? 'bg-rose-500/5 border-rose-500/15'
              : 'bg-emerald-500/5 border-emerald-500/15'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              trendPct === null ? 'bg-muted' : trendPct > 0 ? 'bg-rose-500/15' : 'bg-emerald-500/15'
            }`}>
              {trendPct !== null && trendPct > 0
                ? <TrendingUp className="h-3 w-3 text-rose-500" />
                : <TrendingDown className="h-3 w-3 text-emerald-500" />
              }
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {trendPct === null ? (
                <>Not enough data yet to compute a trend. Keep logging activities!</>
              ) : trendPct > 0 ? (
                <><span className="font-bold text-rose-500">{trendPct}% increase</span> in emissions compared to the previous period. Keep tracking and stay mindful!</>
              ) : (
                <><span className="font-bold text-emerald-500">{Math.abs(trendPct)}% decrease</span> in emissions compared to the previous period. Great progress, keep it up!</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Methodology footer ──────────────────────────────────────────────── */}
      <div className="mx-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">
              All calculations are based on <span className="text-primary">real data</span> and verified emission factors.
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Learn more about our <span className="text-primary font-semibold cursor-pointer underline underline-offset-2">methodology →</span>
            </p>
          </div>
        </div>
        <a
          href="https://www.epa.gov/ghgemissions"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold text-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-card transition-colors shrink-0"
        >
          View Methodology <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
