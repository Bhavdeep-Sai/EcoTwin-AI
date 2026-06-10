"use client"

import { motion } from "framer-motion"
import { CarFront, Zap, Utensils, Droplets, CloudFog } from "lucide-react"

export function WhatIsFootprint() {
  return (
    <section id="what-is-footprint" className="w-full py-24 bg-card/30 border-t border-border relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Educational Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                What is a carbon footprint?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Everything we do—from turning on a light switch to driving to the store—requires energy. 
                Most of this energy comes from burning fossil fuels, which releases invisible gases into the air.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your <strong className="text-foreground font-semibold">carbon footprint</strong> is the total amount of these greenhouse gases 
                (measured in CO₂e) generated directly and indirectly by your lifestyle choices.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CloudFog className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">CO₂e Explained</h4>
                  <p className="text-xs text-muted-foreground mt-1">Carbon dioxide equivalent. It combines all greenhouse gases into one measurable unit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Invisible Impact</h4>
                  <p className="text-xs text-muted-foreground mt-1">Gases like Methane (CH₄) and Nitrous Oxide (N₂O) are also factored into your footprint.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Interactive Footprint Animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] w-full flex items-center justify-center rounded-3xl bg-background border border-border/50 shadow-inner overflow-hidden"
          >
            {/* Abstract visual of particles emitting from icons */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/40 via-background to-background"></div>
            
            <div className="relative z-10 grid grid-cols-2 gap-6 w-full max-w-sm px-6">
               <FootprintCard icon={<CarFront />} title="Driving" desc="Fuel combustion" delay={0.2} />
               <FootprintCard icon={<Zap />} title="Electricity" desc="Power grid" delay={0.4} />
               <FootprintCard icon={<Utensils />} title="Food" desc="Agriculture" delay={0.6} />
               <div className="flex flex-col items-center justify-center text-center p-4">
                  <span className="text-4xl font-black text-primary">CO₂e</span>
                  <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Total Impact</span>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

function FootprintCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="flex flex-col items-center p-4 rounded-2xl bg-card border border-border shadow-sm text-center group cursor-default"
    >
      <div className="w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/10 border border-primary/10 flex items-center justify-center text-primary mb-3 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </motion.div>
  )
}
