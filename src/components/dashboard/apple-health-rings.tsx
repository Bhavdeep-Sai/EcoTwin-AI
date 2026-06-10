"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Car, Utensils, Zap, ShoppingBag, Trash2, Leaf, ArrowRight } from 'lucide-react'

// ─── Donut ring ──────────────────────────────────────────────────────────────

interface DonutRingProps {
  size: number
  percentage: number // 0–n (uncapped; clamped to 1 for visual)
}

function DonutRing({ size, percentage }: DonutRingProps) {
  const sw = 18
  const outerR = size / 2 - sw / 2 - 4
  const innerR = outerR - sw - 10

  const outerC = 2 * Math.PI * outerR
  const innerC = 2 * Math.PI * innerR

  // Clamp fill to 100% visually; inner ring trails slightly
  const outerFill = Math.min(percentage, 1)
  const innerFill = Math.min(percentage * 0.85, 1)

  const outerOffset = outerC - outerFill * outerC
  const innerOffset = innerC - innerFill * innerC

  // Dashed trail: 75% of ring visible (open at bottom-left, like ref image)
  const outerTrailArr = `${outerC * 0.75} ${outerC * 0.25}`
  const innerTrailArr = `${innerC * 0.75} ${innerC * 0.25}`

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Outer trail (dashed gap) */}
      <circle
        cx={size / 2} cy={size / 2} r={outerR}
        fill="transparent"
        stroke="rgba(16,185,129,0.13)"
        strokeWidth={sw}
        strokeDasharray={outerTrailArr}
        strokeDashoffset={-outerC * 0.125}
      />
      {/* Outer fill */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={outerR}
        fill="transparent"
        stroke="#10B981"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={outerC}
        initial={{ strokeDashoffset: outerC }}
        animate={{ strokeDashoffset: outerOffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Outer glow */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={outerR}
        fill="transparent"
        stroke="#10B981"
        strokeWidth={sw + 4}
        strokeLinecap="round"
        strokeDasharray={outerC}
        initial={{ strokeDashoffset: outerC }}
        animate={{ strokeDashoffset: outerOffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ filter: 'blur(6px)', opacity: 0.22 }}
      />
      {/* Inner trail */}
      <circle
        cx={size / 2} cy={size / 2} r={innerR}
        fill="transparent"
        stroke="rgba(167,243,208,0.18)"
        strokeWidth={sw - 4}
        strokeDasharray={innerTrailArr}
        strokeDashoffset={-innerC * 0.125}
      />
      {/* Inner fill */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={innerR}
        fill="transparent"
        stroke="#6EE7B7"
        strokeWidth={sw - 4}
        strokeLinecap="round"
        strokeDasharray={innerC}
        initial={{ strokeDashoffset: innerC }}
        animate={{ strokeDashoffset: innerOffset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
      />
    </svg>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────

interface CategoryDef {
  key: string
  label: string
  icon: React.ReactNode
  used: number
  budget: number
}

function CategoryCard({ label, icon, used, budget }: CategoryDef) {
  const pct = budget > 0 ? used / budget : 0
  const isOver = pct > 1
  const displayPct = Math.round(pct * 100)
  const barColor = isOver ? '#F97316' : '#10B981'

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto">
        <span className="text-primary">{icon}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
          {used.toFixed(1)} / {budget} kg CO₂e
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      <div className="text-center text-[10px] font-bold" style={{ color: barColor }}>
        {displayPct}% of budget
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface AppleHealthRingsProps {
  transportKg: number
  foodKg: number
  energyKg: number
  shoppingKg: number
  wasteKg: number
}

// Scientific daily carbon budgets per category (kg CO₂e / day)
const BUDGETS: Record<string, number> = {
  transport: 6.0,
  food:      4.5,
  energy:    5.0,
  shopping:  3.5,
  waste:     1.5,
}

export function AppleHealthRings({
  transportKg,
  foodKg,
  energyKg,
  shoppingKg,
  wasteKg,
}: AppleHealthRingsProps) {

  const categories: CategoryDef[] = [
    {
      key: 'transport',
      label: 'Transport',
      icon: <Car className="h-4 w-4" />,
      used: transportKg,
      budget: BUDGETS.transport,
    },
    {
      key: 'food',
      label: 'Food',
      icon: <Utensils className="h-4 w-4" />,
      used: foodKg,
      budget: BUDGETS.food,
    },
    {
      key: 'energy',
      label: 'Grid/Energy',
      icon: <Zap className="h-4 w-4" />,
      used: energyKg,
      budget: BUDGETS.energy,
    },
    {
      key: 'shopping',
      label: 'Shopping',
      icon: <ShoppingBag className="h-4 w-4" />,
      used: shoppingKg,
      budget: BUDGETS.shopping,
    },
    {
      key: 'waste',
      label: 'Waste',
      icon: <Trash2 className="h-4 w-4" />,
      used: wasteKg,
      budget: BUDGETS.waste,
    },
  ]

  // Total actual vs total budget
  const totalUsed   = categories.reduce((s, c) => s + c.used,   0)
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0)
  const overallPct  = totalBudget > 0 ? totalUsed / totalBudget : 0
  const displayPct  = Math.round(overallPct * 100)
  const isHealthy   = displayPct < 90

  const RING_SIZE = 220

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">Budget Progress</h3>
            <p className="text-[11px] text-muted-foreground">Your carbon budget usage</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border ${
            isHealthy
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 border-rose-500/25 dark:text-rose-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {isHealthy ? 'On Track' : 'Over Budget'}
        </div>
      </div>

      {/* ── Donut Chart ── */}
      <div className="flex items-center justify-center px-4 py-1">
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
          />

          <DonutRing size={RING_SIZE} percentage={overallPct} />

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none gap-1">
            <div className="text-4xl font-black tracking-tight text-foreground leading-none">
              {displayPct}%
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground leading-none mt-1">
              Budget Spent
            </div>
            <div className="w-10 h-px bg-border my-1.5" />
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold ${
                isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <Leaf className="h-3 w-3" />
              {isHealthy ? 'On Track' : 'Over Budget'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Community comparison banner ── */}
      <div className="mx-4 mb-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {isHealthy ? (
              <>
                You&apos;re within your daily carbon budget.{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Keep it up!</span>
                {' '}Log more activities to track your full impact.
              </>
            ) : (
              <>
                You&apos;ve exceeded your budget.{' '}
                <span className="font-bold text-rose-500">Small changes</span> can make a big impact!
              </>
            )}
          </p>
        </div>
        {/* Mini sparkline */}
        <svg width="56" height="28" className="shrink-0 opacity-70">
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 24 Q 14 19 28 14 Q 42 9 56 3" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 0 24 Q 14 19 28 14 Q 42 9 56 3 L 56 28 L 0 28 Z" fill="url(#sparkGrad)" />
          <circle cx="56" cy="3" r="2.5" fill="#10B981" />
        </svg>
      </div>

      {/* ── Category cards – first 3 ── */}
      <div className={`grid grid-cols-3 gap-2 px-4 mb-2`}>
        {categories.slice(0, 3).map(({ key, ...rest }) => (
          <CategoryCard key={key} {...rest} />
        ))}
      </div>

      {/* ── Remaining category cards (4th, 5th…) ── */}
      {categories.length > 3 && (
        <div
          className={`grid gap-2 px-4 mb-3 ${
            categories.length - 3 === 1
              ? 'grid-cols-1 max-w-[40%] mx-auto w-full'
              : categories.length - 3 === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {categories.slice(3).map(({ key, ...rest }) => (
            <CategoryCard key={key} {...rest} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/20 mt-auto">
        <div className="flex items-center gap-2">
          <Leaf className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-[10px] text-muted-foreground font-medium">
            Every action counts. Keep building a greener tomorrow!
          </p>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
      </div>
    </div>
  )
}
