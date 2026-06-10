"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function FaqSection() {
  const faqs = [
    {
      q: "What is CO₂e?",
      a: "CO₂e stands for 'Carbon Dioxide Equivalent'. Because there are many different greenhouse gases (like methane and nitrous oxide) that trap heat differently, scientists use CO₂e as a standard unit to express the impact of all gases combined as if they were just carbon dioxide."
    },
    {
      q: "How accurate are the estimates?",
      a: "Our estimates are highly accurate for general lifestyle tracking. They are calculated using verified coefficients from the IPCC and EPA. However, they are still estimates. True pinpoint accuracy would require exact supply-chain tracking for every product, which is currently impossible. We aim for directional accuracy to help you make better decisions."
    },
    {
      q: "Does EcoTwin AI use my data responsibly?",
      a: "Yes. Your personal logging data is yours. We use it strictly to calculate your footprint and provide AI insights. We do not sell it to data brokers or advertising agencies."
    },
    {
      q: "Can I improve my score?",
      a: "Absolutely! EcoTwin AI is designed to help you improve. By substituting high-emission activities with lower-emission ones (like taking public transit instead of driving), your overall Carbon Score will reflect your sustainable choices."
    },
    {
      q: "How often is data updated?",
      a: "We regularly sync our local datasets with updates from the US EPA eGRID, DEFRA, and OpenFoodFacts APIs to ensure our conversion factors reflect the most current scientific consensus."
    }
  ]

  return (
    <section className="w-full py-24 bg-background border-t border-border">
      <div className="container px-4 md:px-8 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-5 text-left font-bold text-foreground hover:bg-muted/30 transition-colors"
      >
        {question}
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
