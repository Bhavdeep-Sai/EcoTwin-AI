"use client"

import { motion } from "framer-motion"
import { Car, Utensils, Zap, ShoppingBag, Trash2 } from "lucide-react"
import type { ActivityCategory } from "@/types"
import { cn } from "@/lib/utils"

interface CategoryTabsProps {
  activeTab: ActivityCategory
  onChange: (tab: ActivityCategory) => void
}

export function CategoryTabs({ activeTab, onChange }: CategoryTabsProps) {
  const tabs: { id: ActivityCategory; label: string; icon: React.ReactNode }[] = [
    { id: "transport", label: "Transport", icon: <Car className="w-4 h-4" /> },
    { id: "food", label: "Food", icon: <Utensils className="w-4 h-4" /> },
    { id: "electricity", label: "Energy", icon: <Zap className="w-4 h-4" /> },
    { id: "shopping", label: "Shopping", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "waste", label: "Waste", icon: <Trash2 className="w-4 h-4" /> },
  ]

  return (
    <div className="w-full overflow-x-auto scrollbar-none pb-2">
      <div className="flex w-full min-w-max border border-border rounded-xl p-1 bg-muted/30">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg transition-all duration-300 font-bold text-xs cursor-pointer",
                isActive 
                  ? "text-primary bg-card shadow-sm border border-border" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <motion.div
                whileHover={!isActive ? { scale: 1.05 } : {}}
                className="flex items-center gap-2"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-[-1px] left-[20%] right-[20%] h-[2px] bg-primary rounded-t-full"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
