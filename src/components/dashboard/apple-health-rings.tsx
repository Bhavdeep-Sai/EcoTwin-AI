"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface RingProps {
  size: number
  strokeWidth: number
  percentage: number // 0 to 1
  color: string
  trailColor: string
  radius: number
  glow?: boolean
}

function ProgressRing({ size, strokeWidth, percentage, color, trailColor, radius, glow = false }: RingProps) {
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - Math.min(Math.max(percentage, 0), 1) * circumference

  return (
    <g className="rotate-[-90deg] origin-center">
      {/* Background trail */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={trailColor}
        strokeWidth={strokeWidth}
      />
      {/* Glowing layer */}
      {glow && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `blur(4px)`, opacity: 0.4 }}
        />
      )}
      {/* Main active ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </g>
  )
}

interface AppleHealthRingsProps {
  transportKg: number
  foodKg: number
  energyKg: number
}

export function AppleHealthRings({ transportKg, foodKg, energyKg }: AppleHealthRingsProps) {
  // Scientific daily carbon targets (budgets)
  const targets = {
    transport: 6.0, // kg CO2e
    food: 4.5,
    energy: 5.0
  }

  // Calculate percentages (capping at 1.0 for the progress rings)
  const transportPct = Math.min(transportKg / targets.transport, 1)
  const foodPct = Math.min(foodKg / targets.food, 1)
  const energyPct = Math.min(energyKg / targets.energy, 1)

  const averagePct = Math.round(((transportPct + foodPct + energyPct) / 3) * 100)
  const isHealthy = averagePct < 80

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative w-[220px] h-[220px] flex items-center justify-center">
        <svg width={220} height={220} className="absolute inset-0">
          {/* Transport Ring (Outer) */}
          <ProgressRing
            size={220}
            strokeWidth={14}
            percentage={transportPct}
            color="#10B981" // Emerald Green
            trailColor="rgba(16, 185, 129, 0.1)"
            radius={85}
            glow
          />
          {/* Food Ring (Middle) */}
          <ProgressRing
            size={220}
            strokeWidth={14}
            percentage={foodPct}
            color="#34D399" // Light Green
            trailColor="rgba(52, 211, 153, 0.1)"
            radius={65}
            glow
          />
          {/* Energy Ring (Inner) */}
          <ProgressRing
            size={220}
            strokeWidth={14}
            percentage={energyPct}
            color="#0D9488" // Teal
            trailColor="rgba(13, 148, 136, 0.1)"
            radius={45}
            glow
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none gap-1">
          <div className="text-3xl font-bold tracking-tight text-foreground leading-none">{averagePct}%</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none mt-0.5">Budget Spent</div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 pointer-events-auto leading-none ${
            isHealthy 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' 
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
          }`}>
            {isHealthy ? 'On Track' : 'Warning'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 w-full mt-6 border-t border-border pt-4 text-[10px] font-semibold text-muted-foreground">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-foreground font-bold">Transport</span>
          </div>
          <span>{transportKg.toFixed(1)} / {targets.transport} kg</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-[#34D399]"></span>
            <span className="text-foreground font-bold">Food</span>
          </div>
          <span>{foodKg.toFixed(1)} / {targets.food} kg</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span className="text-foreground font-bold">Grid/Energy</span>
          </div>
          <span>{energyKg.toFixed(1)} / {targets.energy} kg</span>
        </div>
      </div>
    </div>
  )
}
