"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CtaSection() {
  return (
    <section className="w-full py-32 bg-foreground text-background relative overflow-hidden">
      {/* Background dark glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-primary/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      <div className="container px-4 md:px-8 mx-auto max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-background">
            You don't have to change everything overnight.
          </h2>
          
          <p className="text-lg md:text-xl text-muted/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Understanding your impact is the first step toward building a more sustainable future. Start small, learn continuously, and build better habits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto">
            <Link 
              href="/auth"
              className={cn(buttonVariants({ size: "lg", className: "w-full sm:w-auto h-14 px-10 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all rounded-xl" }))}
            >
              Start Tracking <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-14 px-10 text-base font-semibold border-background/20 bg-background/5 hover:bg-background/10 text-background rounded-xl backdrop-blur-md" }))}
            >
              Explore the Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
