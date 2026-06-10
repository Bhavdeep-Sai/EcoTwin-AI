"use client"

import { useState } from "react"
import { SubmitButton } from "./submit-button"
import { useActivityForm } from "./use-activity-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { WASTE_FACTORS, RECYCLING_MULTIPLIER } from "@/lib/services/carbonFactors"
import { CalculationInspector } from "@/components/ui/calculation-inspector"

export function WasteForm() {
  const [type, setType] = useState("Plastic")
  const [isRecycled, setIsRecycled] = useState(false)
  const [weight, setWeight] = useState("")
  const { submitActivity } = useActivityForm("waste")

  const activeFactorData = WASTE_FACTORS[type]

  async function action(formData: FormData) {
    const weightNum = Number(formData.get("weight_kg") || weight)
    if (!weightNum || weightNum <= 0) {
      // It is a simple validation toast so we can keep it or let useActivityForm handle it if we want. But validation toast is fine here.
      return
    }

    const baseFactor = activeFactorData?.factor || 0.0
    const factor = isRecycled ? baseFactor * RECYCLING_MULTIPLIER : baseFactor
    const impactKg = weightNum * factor
    const title = `${weightNum}kg of ${isRecycled ? 'recycled ' : ''}${type}`
    const details = { waste_type: type, weight_kg: weightNum, recycled: isRecycled }

    await submitActivity(title, impactKg, details, () => setWeight(""))
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="waste-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Waste Type
          </label>
          <Select value={type} onValueChange={(val) => { if (val) setType(val) }}>
            <SelectTrigger id="waste-type" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-border">
              <SelectItem value="Plastic">Plastic</SelectItem>
              <SelectItem value="Organic">Organic / Compost</SelectItem>
              <SelectItem value="Paper">Paper / Cardboard</SelectItem>
              <SelectItem value="Mixed">Mixed / Trash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="waste-weight" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Weight
          </label>
          <div className="relative">
            <Input 
              id="waste-weight"
              name="weight_kg" 
              type="number" 
              step="0.1" 
              min="0.1" 
              placeholder="0.0" 
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
              kg
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/40 border border-border/80 shadow-sm">
            <Switch id="recycled" checked={isRecycled} onCheckedChange={setIsRecycled} />
            <label htmlFor="recycled" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              This was recycled or composted
            </label>
          </div>
        </div>
      </div>
      <CalculationInspector 
        factorData={
          isRecycled && activeFactorData
            ? {
                ...activeFactorData,
                factor: activeFactorData.factor * RECYCLING_MULTIPLIER,
                assumptions: `${activeFactorData.assumptions} A 90% emissions reduction credit is applied for recycling recovery benefits.`,
                formula: `Emissions (kg CO₂e) = Weight (kg) × ${activeFactorData.factor} × 0.10`
              }
            : activeFactorData
        }
        quantityText={`${weight || "0"} kg`}
      />
      <SubmitButton />
    </form>
  )
}
