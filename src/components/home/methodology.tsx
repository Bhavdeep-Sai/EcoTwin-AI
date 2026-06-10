"use client"

import { motion } from "framer-motion"
import { Database, Search, Calculator, BarChart3, ExternalLink } from "lucide-react"

export function Methodology() {
  const sources = [
    { name: "IPCC", desc: "Intergovernmental Panel on Climate Change", link: "https://www.ipcc.ch/" },
    { name: "EPA", desc: "US Environmental Protection Agency (eGRID)", link: "https://www.epa.gov/egrid" },
    { name: "DEFRA", desc: "UK GHG Conversion Factors", link: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting" },
    { name: "OpenFoodFacts", desc: "Global food product database", link: "https://world.openfoodfacts.org/" }
  ]

  return (
    <section className="w-full py-24 bg-background border-t border-border relative">
      <div className="container px-4 md:px-8 mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Science, not guesswork.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            We don't invent numbers. Every calculation in EcoTwin AI is rooted in verified scientific methodologies and official global datasets.
          </p>
        </div>

        {/* Data flow diagram */}
        <div className="relative mb-20 hidden md:block">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0"></div>
          <div className="relative z-10 grid grid-cols-4 gap-4">
            <FlowStep icon={<Search />} title="User Logs" desc="You input an activity." />
            <FlowStep icon={<Database />} title="Official Data" desc="We match it to global sets." />
            <FlowStep icon={<Calculator />} title="Carbon Engine" desc="We compute the emissions." />
            <FlowStep icon={<BarChart3 />} title="Insights" desc="You receive your footprint." />
          </div>
        </div>

        {/* Mobile Data Flow */}
        <div className="space-y-4 mb-16 md:hidden">
            <FlowStep icon={<Search />} title="User Logs" desc="You input an activity." />
            <FlowStep icon={<Database />} title="Official Data" desc="We match it to global sets." />
            <FlowStep icon={<Calculator />} title="Carbon Engine" desc="We compute the emissions." />
            <FlowStep icon={<BarChart3 />} title="Insights" desc="You receive your footprint." />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map((src, i) => (
            <a 
              key={i} 
              href={src.link} 
              target="_blank" 
              rel="noreferrer"
              className="p-5 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-colors group flex flex-col items-start"
            >
              <h4 className="font-bold text-foreground flex items-center justify-between w-full">
                {src.name}
                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {src.desc}
              </p>
            </a>
          ))}
        </div>

        {/* Interactive Math Box */}
        <div className="mt-12 p-6 rounded-2xl bg-muted/40 border border-border/60 max-w-2xl mx-auto text-center cursor-pointer hover:border-primary/20 transition-colors">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Example Calculation</p>
          <div className="font-mono text-sm md:text-base text-foreground bg-background border border-border rounded-lg p-4 inline-block shadow-sm">
            10 miles driven <span className="text-primary mx-2">×</span> 0.33 kg CO₂/mile <span className="text-primary mx-2">=</span> 3.3 kg CO₂e
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Click to see how we verify and disclose our calculation assumptions.
          </p>
        </div>

      </div>
    </section>
  )
}

function FlowStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center bg-background p-4 rounded-xl border border-border shadow-sm">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-bold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  )
}
