"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf } from "lucide-react"
import { CategoryTabs } from "./category-tabs"
import { TransportForm } from "./forms/transport-form"
import { FoodForm } from "./forms/food-form"
import { EnergyForm } from "./forms/energy-form"
import { ShoppingForm } from "./forms/shopping-form"
import { WasteForm } from "./forms/waste-form"
import { ActivityCategory } from "@/lib/actions/activities"

export function ActivityCard() {
  const [activeTab, setActiveTab] = useState<ActivityCategory>("transport")

  return (
    <div className="w-full lg:max-w-[60%] mx-auto mt-2 relative z-10 px-4 md:px-8">
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground leading-none">
              What did you do today?
            </h2>
            <p className="text-muted-foreground text-xs mt-1">
              Select a category and fill in the details to estimate your carbon impact.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <CategoryTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Dynamic Form Content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "transport" && <TransportForm />}
              {activeTab === "food" && <FoodForm />}
              {activeTab === "electricity" && <EnergyForm />}
              {activeTab === "shopping" && <ShoppingForm />}
              {activeTab === "waste" && <WasteForm />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
