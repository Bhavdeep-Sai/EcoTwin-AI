"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, Award, Activity, BarChart2 } from "lucide-react"

export function DashboardPreview() {
  const features = [
    { icon: <Activity />, title: "Live Carbon Score", desc: "Watch your score adjust in real-time as you log actions." },
    { icon: <BarChart2 />, title: "Weekly Analytics", desc: "Compare your performance against previous weeks." },
    { icon: <Award />, title: "Achievements", desc: "Unlock badges for sustainable milestones." },
    { icon: <LayoutDashboard />, title: "Action History", desc: "A GitHub-style contribution graph of your green habits." }
  ]

  return (
    <section className="w-full py-24 bg-card/5 border-t border-border relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Your sustainability command center.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Everything you need to monitor, analyze, and improve your footprint is beautifully organized in one intuitive dashboard.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Dashboard Features List */}
          <div className="lg:col-span-5 space-y-6">
            {features.map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{feat.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Abstract Dashboard UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative"
          >
            <div className="rounded-2xl border border-border bg-background shadow-2xl p-4 overflow-hidden relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                <div className="w-24 h-4 rounded bg-muted"></div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted"></div>
                  <div className="w-6 h-6 rounded-full bg-primary/20"></div>
                </div>
              </div>

              {/* Top Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="h-20 rounded-xl bg-card border border-border p-3 flex flex-col justify-between">
                   <div className="w-16 h-2 rounded bg-muted/50"></div>
                   <div className="w-12 h-6 rounded bg-primary/80"></div>
                </div>
                <div className="h-20 rounded-xl bg-card border border-border p-3 flex flex-col justify-between">
                   <div className="w-20 h-2 rounded bg-muted/50"></div>
                   <div className="w-8 h-6 rounded bg-foreground"></div>
                </div>
                <div className="h-20 rounded-xl bg-card border border-border p-3 flex flex-col justify-between">
                   <div className="w-12 h-2 rounded bg-muted/50"></div>
                   <div className="w-16 h-6 rounded bg-emerald-500"></div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-40 rounded-xl bg-card border border-border p-4 flex items-end justify-between gap-2">
                   {/* Fake Bar Chart */}
                   {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
                      <div key={i} className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                   ))}
                </div>
                <div className="col-span-1 h-40 rounded-xl bg-card border border-border p-4 space-y-3">
                   {/* Fake List */}
                   <div className="w-full h-8 rounded bg-muted/50"></div>
                   <div className="w-full h-8 rounded bg-muted/50"></div>
                   <div className="w-3/4 h-8 rounded bg-muted/50"></div>
                </div>
              </div>

              {/* Gradient Overlay for style */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
