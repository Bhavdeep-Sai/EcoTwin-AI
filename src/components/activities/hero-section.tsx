"use client"

import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full lg:max-w-[60%] mx-auto pt-20 pb-2 px-4 md:px-8">
      <div className="flex justify-between items-center gap-4">
        {/* Left Side: Copy */}
        <motion.div 
          className="flex flex-col space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600 shadow-sm border border-green-200/50 dark:border-green-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Activity Tracker
            </h1>
          </div>
          <p className="text-sm leading-snug text-muted-foreground max-w-[500px]">
            Log your daily actions to see their impact and receive AI-driven insights to reduce your footprint.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
