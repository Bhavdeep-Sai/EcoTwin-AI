"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Car, Coffee, Lightbulb, ShoppingBag, Leaf } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 max-w-7xl mx-auto overflow-hidden">
      {/* Background glow specific to Hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/10 opacity-70 blur-[150px] pointer-events-none"></div>

      {/* Abstract Interactive Twin Animation (Moved to Bottom-Right Corner) */}
      <div className="absolute right-[-40px] bottom-[-40px] md:right-4 md:bottom-4 pointer-events-none z-0 opacity-20 select-none">
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Orbiting nodes */}
            <OrbitNode icon={<Car />} delay={0} radius={85} angle={0} />
            <OrbitNode icon={<Coffee />} delay={1} radius={125} angle={72} />
            <OrbitNode icon={<Lightbulb />} delay={2} radius={105} angle={144} />
            <OrbitNode icon={<ShoppingBag />} delay={0.5} radius={145} angle={216} />
            <OrbitNode icon={<Leaf />} delay={1.5} radius={115} angle={288} />
          </motion.div>

          {/* Connecting Lines Graphic */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
             <svg className="w-full h-full" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="85" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="160" cy="160" r="115" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="160" cy="160" r="145" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
             </svg>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl space-y-8 z-10 flex flex-col items-center justify-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          <SparklesIcon className="w-4 h-4" />
          The Science of Sustainability
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
          Understand your carbon footprint. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
            Change what matters.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          EcoTwin AI helps you measure, track, and reduce your environmental impact through personalized insights powered by real-world data.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto">
          <Link 
            href="/auth"
            className={cn(buttonVariants({ size: "lg", className: "w-full sm:w-auto h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-xl" }))}
          >
            Start Your Carbon Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link 
            href="#what-is-footprint"
            className={cn(buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-14 px-8 text-base font-semibold border-border/50 bg-card/40 hover:bg-card text-foreground rounded-xl backdrop-blur-md" }))}
          >
            Learn How It Works
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

function OrbitNode({ icon, delay, radius, angle }: { icon: React.ReactNode, delay: number, radius: number, angle: number }) {
  // Simple CSS positioning for a static circular layout that rotates with the parent container
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8 + delay, duration: 0.8, type: "spring" }}
      className="absolute flex items-center justify-center w-12 h-12 bg-card border border-border/80 rounded-full shadow-md text-muted-foreground"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <div className="w-5 h-5">
        {icon}
      </div>
    </motion.div>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
