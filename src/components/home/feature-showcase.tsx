"use client"

import { motion } from "framer-motion"
import { Car, Utensils, Zap, ShoppingBag, Trash2 } from "lucide-react"

export function FeatureShowcase() {
  const categories = [
    {
      icon: <Car className="w-5 h-5" />,
      title: "Transportation",
      log: "Vehicle type, fuel type, and distance traveled.",
      calc: "Distance × US EPA vehicle-specific emission factor.",
      rec: "Opt for public transit or carpooling for trips over 5 miles."
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      title: "Food",
      log: "Meal ingredients, dietary preferences, or product barcodes.",
      calc: "Ingredient weight × Agribalyse agricultural lifecycle data.",
      rec: "Substituting one beef meal a week for a plant-based option."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Electricity",
      log: "Monthly kWh usage and your zip code.",
      calc: "kWh × eGRID subregion specific carbon intensity.",
      rec: "Shifting high-energy chores to off-peak renewable hours."
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: "Shopping",
      log: "Purchase category and amount spent.",
      calc: "Cost × Economic Input-Output LCA models.",
      rec: "Buying second-hand or prioritizing local vendors."
    },
    {
      icon: <Trash2 className="w-5 h-5" />,
      title: "Waste",
      log: "Weight of waste and whether it was recycled/composted.",
      calc: "Weight × DEFRA end-of-life disposal metrics.",
      rec: "Composting organic waste to prevent landfill methane."
    }
  ]

  return (
    <section className="w-full py-24 bg-card/10 border-t border-border relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Track what matters.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            From your morning commute to your weekly groceries, EcoTwin AI categorizes your impact so you know exactly where to improve.
          </p>
        </div>

        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none md:pb-0 md:px-0">
          {categories.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="min-w-[280px] snap-center p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col group hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-4">{cat.title}</h3>
              
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">What you log</h4>
                  <p className="text-xs text-foreground/90">{cat.log}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">How it's calculated</h4>
                  <p className="text-xs text-foreground/90">{cat.calc}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Example Recommendation</h4>
                  <p className="text-xs text-primary/90 bg-primary/5 p-2 rounded-md border border-primary/10">
                    {cat.rec}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
