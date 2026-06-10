"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

export function HowItForms() {
  const steps = [
    {
      title: "Daily Activities",
      desc: "The choices you make every day: eating, commuting, shopping, and using electricity.",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    },
    {
      title: "Resource Consumption",
      desc: "Your activities require energy, land, water, and raw materials to be produced and delivered.",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    },
    {
      title: "Greenhouse Gas Emissions",
      desc: "Extracting and using these resources releases CO₂, Methane, and other heat-trapping gases.",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
    },
    {
      title: "Carbon Footprint",
      desc: "The total measurable weight of all these gases attributed to your lifestyle.",
      color: "bg-primary/10 text-primary border-primary/20"
    }
  ]

  return (
    <section className="w-full py-24 bg-background border-t border-border relative">
      <div className="container px-4 md:px-8 mx-auto max-w-4xl text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            From daily habits to global impact.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            A footprint isn&apos;t just about what comes out of a tailpipe. It includes the entire invisible lifecycle of the things we consume.
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center justify-center">
          {/* Central connecting line */}
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-orange-500/20 to-primary/50 left-1/2 -translate-x-1/2 z-0 hidden md:block"></div>

          <div className="space-y-6 md:space-y-12 w-full z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  className={`w-full md:w-2/3 p-6 rounded-2xl bg-card border shadow-sm ${step.color.split(' ').pop()} hover:-translate-y-1 transition-transform`}
                >
                  <h3 className={`text-xl font-bold mb-2 ${step.color.split(' ').slice(1,3).join(' ')}`}>
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    className="py-3 md:py-6 text-border md:bg-background md:px-2"
                  >
                    <ArrowDown className="w-6 h-6 text-muted-foreground/50" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
