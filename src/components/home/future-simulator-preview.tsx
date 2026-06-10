"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function FutureSimulatorPreview() {
  const [sliderVal, setSliderVal] = useState(0)

  return (
    <section className="w-full py-24 bg-background border-t border-border relative">
      <div className="container px-4 md:px-8 mx-auto max-w-5xl text-center">
        
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Small changes. Massive impact.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            See the compounding effect of your habits. Use the Future Simulator to project your current lifestyle into the future—and visualize how minor adjustments today can save tons of emissions over decades.
          </p>
        </div>

        {/* Interactive Timeline Mockup */}
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            {/* Left side: Setup */}
            <div className="text-left w-full md:w-1/2 space-y-6">
              <div>
                <h4 className="font-bold text-foreground mb-2">Simulate Lifestyle Shift</h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors">
                    <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Switch to 100% Renewable Grid</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30 cursor-pointer hover:border-primary/50 transition-colors">
                    <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                    <span className="text-sm font-medium">Adopt a Plant-based Diet</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Time Horizon</p>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={sliderVal} 
                  onChange={(e) => setSliderVal(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                  <span>2024</span>
                  <span>{2024 + sliderVal}</span>
                  <span>2054</span>
                </div>
              </div>
            </div>

            {/* Right side: Results */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-primary" 
                    strokeWidth="8" 
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * (sliderVal / 30))}
                    strokeLinecap="round"
                    transition={{ duration: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-foreground">
                    {(sliderVal * 4.2).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Tons Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
