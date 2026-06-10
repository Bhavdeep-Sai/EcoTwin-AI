"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Leaf, Activity, BrainCircuit, Globe, Sparkles } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CeaChart } from "@/components/cea-chart"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex-1 flex flex-col w-full border-t border-border/20 transition-colors duration-300">
      {/* Decorative ambient background glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-15"></div>
      <div className="absolute left-1/4 right-1/4 top-20 -z-10 m-auto h-[450px] w-[600px] rounded-full bg-primary/10 dark:bg-primary/5 opacity-60 blur-[130px] transition-colors duration-500"></div>
      <div className="absolute -left-20 top-1/2 -z-10 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px]"></div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center px-4 py-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl space-y-6 z-10 flex flex-col items-center justify-center"
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-bold text-primary transition-colors shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            EcoTwin AI Beta is Live
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] max-w-3xl">
            Meet your personal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-primary to-teal-400 dark:to-teal-500 drop-shadow-sm">
              carbon twin.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Synchronize your daily actions with an intelligent carbon avatar. Track transportation, food, and energy grid impacts with scientifically backed coefficients.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Link 
              href="/auth"
              className={cn(buttonVariants({ size: "lg", className: "w-full sm:w-auto h-12 px-6 text-sm font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-xl cursor-pointer" }))}
            >
              Initialize Your Twin <ArrowRight className="ml-2 h-4 w-4 stroke-[3]" />
            </Link>
            <Link 
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-12 px-6 text-sm font-bold border-border bg-card/40 hover:bg-card text-foreground hover:text-foreground rounded-xl backdrop-blur-sm cursor-pointer" }))}
            >
              Explore Architecture
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 border-t border-border bg-card/25 backdrop-blur-sm relative">
        <div className="container px-4 md:px-8 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Intelligent Carbon Management</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
              Everything you need to visualize, forecast, and reduce your climate impact through structured gamified loops.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-xl bg-card border border-border/80 hover:border-primary/20 transition-all shadow-sm"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Concentric Ring Logging</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log food barcodes, commuting distances, and energy usage. Dynamic concentric rings visualize your consumption budget in real-time.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-xl bg-card border border-border/80 hover:border-primary/20 transition-all shadow-sm"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Conversational Twin Assistant</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our Llama-powered AI twin analyzes your active footprint to suggest localized carbon offsets and meal swaps, offering inline actions.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-xl bg-card border border-border/80 hover:border-primary/20 transition-all shadow-sm"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Future Simulator Forecast</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toggle energy cleansings, travel modes, and diet types to simulate cumulative carbon savings across a 30-year timeframe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-16 border-t border-border bg-background relative">
        <div className="container px-4 md:px-8 mx-auto max-w-5xl z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">The Scientific Footprint Core</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2 mb-4">
              Our twin engine operates using real-world coefficients sourced from verified international reporting organizations. We maintain local cache copies to run checks completely offline.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs">
              <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Scientific Standards:</span>
              <a href="https://www.ipcc.ch/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">IPCC (EFDB)</a>
              <span className="text-border">•</span>
              <a href="https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DEFRA (UK GHG)</a>
              <span className="text-border">•</span>
              <a href="https://www.epa.gov/egrid" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">US EPA (eGRID)</a>
              <span className="text-border">•</span>
              <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenFoodFacts (Agribalyse)</a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left side parameters */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground">
                  <span className="text-primary">🚗</span> Transport Metrics
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Sourced from EPA & DEFRA conversion sets (calculated per km):</p>
                <ul className="text-xs space-y-2 font-medium text-foreground">
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Gasoline Car:</span> <span className="text-primary font-bold">0.170 kg CO₂e / km</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Diesel Car:</span> <span className="text-primary font-bold">0.165 kg CO₂e / km</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Electric Vehicle (US Avg Grid):</span> <span className="text-primary font-bold">0.045 kg CO₂e / km</span></li>
                  <li className="flex justify-between pb-0.5"><span>Train / National Rail:</span> <span className="text-primary font-bold">0.035 kg CO₂e / km</span></li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground">
                  <span className="text-primary">🍽️</span> Dietary Benchmarks
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Sourced from IPCC Agriculture sets (calculated per kg of ingredient):</p>
                <ul className="text-xs space-y-2 font-medium text-foreground">
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Beef (Enteric Methane):</span> <span className="text-primary font-bold">99.48 kg CO₂e / kg</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Lamb / Mutton:</span> <span className="text-primary font-bold">39.72 kg CO₂e / kg</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Pork / Poultry:</span> <span className="text-primary font-bold">9.87 - 12.31 kg CO₂e / kg</span></li>
                  <li className="flex justify-between pb-0.5"><span>Tofu / Plant Protein:</span> <span className="text-primary font-bold">3.16 kg CO₂e / kg</span></li>
                </ul>
              </div>
            </div>

            {/* Right side parameters */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground">
                  <span className="text-primary">⚡</span> Grid Electricity Intensities
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Sourced from US EPA eGRID 2024 (calculated per kWh):</p>
                <ul className="text-xs space-y-2 font-medium text-foreground">
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>Midwest Grid (SRMW - Coal Heavy):</span> <span className="text-primary font-bold">0.633 kg CO₂e / kWh</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>US National Grid Average:</span> <span className="text-primary font-bold">0.370 kg CO₂e / kWh</span></li>
                  <li className="flex justify-between border-b border-border/50 pb-1.5"><span>California Grid (CAMX - Solar Rich):</span> <span className="text-primary font-bold">0.205 kg CO₂e / kWh</span></li>
                  <li className="flex justify-between pb-0.5"><span>Upstate NY Grid (NYUP - Hydro Rich):</span> <span className="text-primary font-bold">0.110 kg CO₂e / kWh</span></li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 shadow-sm">
                <h4 className="text-sm font-bold mb-2 text-primary flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 fill-current" /> Active Twin Sync
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Logging activities matches your geolocation dynamically to local electricity grids and transport networks. If you are offline, our cache loader falls back to local JSON datasets to ensure uninterrupted tracking.
                </p>
              </div>
            </div>
          </div>
          
          {/* Chart visual representation */}
          <div className="mt-12 w-full max-w-4xl mx-auto z-10 relative">
            <CeaChart />
          </div>
        </div>
      </section>
    </div>
  )
}
