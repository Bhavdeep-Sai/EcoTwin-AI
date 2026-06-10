"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export function WhyCare() {
  return (
    <section className="w-full py-24 bg-card/10 border-t border-border relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Imagery Grid */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl grid grid-cols-2 grid-rows-2 gap-2 p-2 bg-muted/30"
          >
            <div className="row-span-2 rounded-2xl bg-gradient-to-br from-emerald-500/80 to-teal-700/90 flex flex-col justify-end p-6 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
               <h3 className="font-bold text-lg relative z-10">Healthy Ecosystems</h3>
               <p className="text-xs opacity-90 mt-1 relative z-10">Clean air and preserved biodiversity.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-400/80 to-indigo-600/90 flex flex-col justify-end p-4 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
               <h3 className="font-bold text-sm relative z-10">Future Generations</h3>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-400/80 to-red-600/90 flex flex-col justify-end p-4 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
               <h3 className="font-bold text-sm relative z-10">Mitigating Crisis</h3>
            </div>
          </motion.div>

          {/* Right: Text */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Why does this matter?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our individual choices add up. While we can&apos;t solve the climate crisis alone, understanding our impact is the first step toward meaningful, systemic change. 
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              It is not about guilt—it is about empowerment. When you know where your emissions come from, you can make informed decisions that benefit both the planet and yourself.
            </p>

            <ul className="space-y-4 pt-4">
              {[
                "Discover cost-saving energy efficiencies.",
                "Build personal awareness of global supply chains.",
                "Adopt healthier dietary and transit habits.",
                "Drive community impact through collective action."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
