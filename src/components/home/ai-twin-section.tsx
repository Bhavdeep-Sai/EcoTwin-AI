"use client"

import { motion } from "framer-motion"
import { MessageSquare, Bot, Sparkles } from "lucide-react"

export function AiTwinSection() {
  return (
    <section className="w-full py-24 bg-background border-t border-border relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4" /> Powered by LLaMA-3.1
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Meet your digital twin.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              EcoTwin AI isn&apos;t just a static calculator; it&apos;s an intelligent conversational assistant that understands your historical footprint.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ask questions about your daily choices and receive personalized, scientifically-backed guidance. The AI translates complex emissions data into relatable, everyday analogies so you can easily understand your impact.
            </p>
          </motion.div>

          {/* Right: Chat Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[80px] rounded-full z-0"></div>

            <div className="relative z-10 bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[400px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">EcoTwin Assistant</h4>
                  <p className="text-[10px] text-muted-foreground">Always active</p>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/20">
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm shadow-sm">
                    Should I take the bus or drive to work today? It&apos;s about 10 miles.
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm shadow-sm text-foreground">
                    Taking the bus will generate about <strong className="text-primary">1.4kg CO₂e</strong>. 
                    Driving your car would generate <strong className="text-orange-500">3.3kg CO₂e</strong>.
                    <br/><br/>
                    By choosing the bus, you&apos;ll save <strong className="text-primary">1.9kg of CO₂</strong>—roughly the equivalent of keeping a 60W lightbulb turned off for an entire week!
                  </div>
                </motion.div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-background">
                <div className="bg-muted/50 border border-border rounded-full flex items-center px-4 py-2">
                  <span className="text-xs text-muted-foreground flex-1">Ask about your footprint...</span>
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
