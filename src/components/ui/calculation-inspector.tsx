"use client"

import React, { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Landmark, ShieldQuestion } from 'lucide-react'
import { EmissionFactor } from '@/lib/services/carbonFactors'

interface CalculationInspectorProps {
  factorKey: string
  factorData: EmissionFactor | undefined
  quantityText: string
}

export function CalculationInspector({ factorKey, factorData, quantityText }: CalculationInspectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!factorData) return null

  return (
    <div className="mt-4 border border-border/80 rounded-xl overflow-hidden bg-muted/30 backdrop-blur-sm transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>Methodology & Scientific Transparency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/60">{isOpen ? "Hide Details" : "Inspect Calculation"}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-xs flex flex-col gap-3.5 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Formula */}
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-primary" /> Mathematical Formula
            </span>
            <div className="p-3 bg-background border border-border rounded-lg font-mono text-foreground/90 font-bold overflow-x-auto text-[11px]">
              {factorData.formula}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Derived from: <span className="font-semibold text-foreground">{quantityText}</span> consumed/logged.
            </p>
          </div>

          {/* Coefficient details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80 block">Emission Factor</span>
              <span className="text-xs font-bold text-foreground mt-0.5 block">
                {factorData.factor} {factorData.unit}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80 block">Scientific Source</span>
              <a 
                href={factorData.reference_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-bold text-primary hover:underline mt-0.5 block truncate max-w-full"
              >
                {factorData.source} ({factorData.year}) ↗
              </a>
            </div>
          </div>

          {/* Assumptions */}
          <div className="flex flex-col gap-1 border-t border-border/30 pt-3">
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <ShieldQuestion className="h-3.5 w-3.5 text-primary" /> Methodology Assumptions
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {factorData.assumptions}
            </p>
          </div>

        </div>
      )}
    </div>
  )
}
