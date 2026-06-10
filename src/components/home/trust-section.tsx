"use client"

import { Shield, Fingerprint, SearchCheck, CheckCircle2 } from "lucide-react"

export function TrustSection() {
  const items = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "No Dummy Data",
      desc: "If data is unavailable, EcoTwin AI does not fabricate results. Every estimate requires actual inputs."
    },
    {
      icon: <SearchCheck className="w-6 h-6 text-emerald-500" />,
      title: "Transparent Methodologies",
      desc: "Every calculation is traceable. We openly disclose all assumptions and formulas used to calculate your score."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-blue-500" />,
      title: "Official Datasets",
      desc: "Our engine is strictly powered by published numbers from the IPCC, US EPA, DEFRA, and OpenFoodFacts."
    },
    {
      icon: <Fingerprint className="w-6 h-6 text-orange-500" />,
      title: "You Are In Control",
      desc: "Your data is yours. We do not sell your personal footprint data or activity logs to third-party advertisers."
    }
  ]

  return (
    <section className="w-full py-24 bg-card/10 border-t border-border">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy first. Truth always.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Greenwashing is everywhere. We combat it with strict transparency, scientific integrity, and user-controlled data.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-background border border-border shadow-sm">
              <div className="shrink-0 mt-1">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
