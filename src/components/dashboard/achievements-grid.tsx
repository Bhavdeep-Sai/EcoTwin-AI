"use client"

import React from 'react'
import { Award, Flame, Leaf, Bus, Trash2, Zap, Lock } from 'lucide-react'

interface AchievementsGridProps {
  activities: any[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number // percentage 0 - 100
  metricText: string
}

export function AchievementsGrid({ activities }: AchievementsGridProps) {
  // 1. Calculate activity statistics for unlocking conditions
  const veganCount = activities.filter(act => act.category === 'food' && act.details?.diet_category?.toLowerCase() === 'vegan').length
  const transitCount = activities.filter(act => act.category === 'transport' && ['train', 'bus', 'electric_vehicle'].includes(act.details?.mode?.toLowerCase())).length
  const recycleCount = activities.filter(act => act.category === 'waste' && act.details?.recycled === true).length
  const renewableGridCount = activities.filter(act => act.category === 'electricity' && act.details?.source?.toLowerCase() === 'renewable').length
  const totalCount = activities.length
  
  const totalCarbonImpact = activities.reduce((sum, act) => sum + Number(act.carbon_impact_kg), 0)

  const achievementsList: Achievement[] = [
    {
      id: 'twin_init',
      title: 'Twin Initialized',
      description: 'Logged your first activity to synchronize your digital carbon twin.',
      icon: <Leaf className="h-6 w-6" />,
      unlocked: totalCount >= 1,
      progress: Math.min((totalCount / 1) * 100, 100),
      metricText: `${totalCount >= 1 ? 1 : 0}/1 Action`
    },
    {
      id: 'vegan_warrior',
      title: 'Plant Warrior',
      description: 'Log 3 vegan meals to establish a low-impact dietary pattern.',
      icon: <Award className="h-6 w-6" />,
      unlocked: veganCount >= 3,
      progress: Math.min((veganCount / 3) * 100, 100),
      metricText: `${veganCount}/3 meals`
    },
    {
      id: 'transit_hero',
      title: 'Transit Hero',
      description: 'Commute via low-emissions transport (EV, train, bus) 3 times.',
      icon: <Bus className="h-6 w-6" />,
      unlocked: transitCount >= 3,
      progress: Math.min((transitCount / 3) * 100, 100),
      metricText: `${transitCount}/3 trips`
    },
    {
      id: 'recycling_pro',
      title: 'Recycling Champion',
      description: 'Perform closed-loop waste recycling 3 times.',
      icon: <Trash2 className="h-6 w-6" />,
      unlocked: recycleCount >= 3,
      progress: Math.min((recycleCount / 3) * 100, 100),
      metricText: `${recycleCount}/3 recyclings`
    },
    {
      id: 'grid_pioneer',
      title: 'Grid Pioneer',
      description: 'Log home electricity usage backed by 100% renewable power.',
      icon: <Zap className="h-6 w-6" />,
      unlocked: renewableGridCount >= 1,
      progress: Math.min((renewableGridCount / 1) * 100, 100),
      metricText: `${renewableGridCount >= 1 ? 1 : 0}/1 log`
    },
    {
      id: 'carbon_saver',
      title: 'Centurion Saver',
      description: 'Keep your lifetime carbon impact low. Earned for maintaining footprints.',
      icon: <Flame className="h-6 w-6" />,
      unlocked: totalCount >= 5 && totalCarbonImpact < 100,
      progress: totalCount >= 5 ? Math.min(Math.max(0, (1 - totalCarbonImpact / 100) * 100), 100) : 0,
      metricText: totalCount >= 5 ? `${totalCarbonImpact.toFixed(0)}/100 kg` : 'Log 5 actions'
    }
  ]

  const unlockedCount = achievementsList.filter(a => a.unlocked).length

  return (
    <div className="flex flex-col space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm w-full relative overflow-visible">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Header and Summary stats */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h4 className="text-lg font-bold text-foreground">Unlocked Achievements</h4>
          <p className="text-xs text-muted-foreground">Complete goals to unlock premium badges</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">{unlockedCount}</span>
          <span className="text-xs text-muted-foreground font-semibold"> / {achievementsList.length} Unlocked</span>
        </div>
      </div>

      {/* Grid mapping */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievementsList.map((ach) => (
          <div
            key={ach.id}
            className={`relative p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
              ach.unlocked
                ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm'
                : 'bg-muted/40 border-border/50 grayscale opacity-60'
            }`}
          >
            {/* Holographic glowing ring surrounding unlocked icons */}
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-full flex items-center justify-center ${
                ach.unlocked 
                  ? 'bg-primary/10 border border-primary/25 text-primary animate-pulse' 
                  : 'bg-muted border border-border/50 text-muted-foreground'
              }`}>
                {ach.unlocked ? ach.icon : <Lock className="h-5 w-5" />}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase bg-background px-2 py-0.5 rounded-full border border-border">
                {ach.metricText}
              </span>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-bold text-foreground mb-1">{ach.title}</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{ach.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(ach.progress)}%</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${ach.unlocked ? 'bg-primary' : 'bg-muted-foreground/40'}`} 
                  style={{ width: `${ach.progress}%` }}
                />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
