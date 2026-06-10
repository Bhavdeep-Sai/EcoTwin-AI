"use client"

import { motion } from "framer-motion"
import { Leaf, TrendingUp, TreeDeciduous } from "lucide-react"

export function BenefitCards() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.section 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full lg:max-w-[60%] mx-auto mt-6 mb-6 px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
    >
      <motion.div variants={item} className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-300">
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600">
          <Leaf className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground leading-tight">Track Your Impact</h3>
          <p className="text-sm text-muted-foreground leading-snug mt-1">
            See how your actions affect your footprint.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-300">
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground leading-tight">Get AI Insights</h3>
          <p className="text-sm text-muted-foreground leading-snug mt-1">
            Receive personalized tips to live sustainably.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-card rounded-xl p-6 shadow-sm border border-border flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-300">
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600">
          <TreeDeciduous className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground leading-tight">Build a Greener Future</h3>
          <p className="text-sm text-muted-foreground leading-snug mt-1">
            Small actions lead to big impact.
          </p>
        </div>
      </motion.div>
    </motion.section>
  )
}
