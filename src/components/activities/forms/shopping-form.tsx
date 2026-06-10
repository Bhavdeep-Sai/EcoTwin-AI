"use client"

import { useState } from "react"
import { SubmitButton } from "./submit-button"
import { useActivityForm } from "./use-activity-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SHOPPING_FACTORS } from "@/lib/services/carbonFactors"
import { CalculationInspector } from "@/components/ui/calculation-inspector"

export function ShoppingForm() {
  const [category, setCategory] = useState("Clothing")
  const [cost, setCost] = useState("")
  const { submitActivity } = useActivityForm("shopping")

  const activeFactorData = SHOPPING_FACTORS[category]

  async function action(formData: FormData) {
    const costNum = Number(formData.get("cost") || cost)
    if (!costNum || costNum <= 0) {
      // Basic validation handled
      return
    }

    const factor = activeFactorData?.factor || 0.0
    const impactKg = costNum * (factor / 1000)
    const title = `₹${costNum} on ${category}`
    const details = { item_category: category, cost: costNum }

    await submitActivity(title, impactKg, details, () => setCost(""))
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="shopping-category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Item Category
          </label>
          <Select value={category} onValueChange={(val) => { if (val) setCategory(val) }}>
            <SelectTrigger id="shopping-category" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-border">
              <SelectItem value="Clothing">Clothing & Apparel</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Groceries">Groceries</SelectItem>
              <SelectItem value="Home">Home Goods</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shopping-cost" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cost
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
              ₹
            </div>
            <Input 
              id="shopping-cost"
              name="cost" 
              type="number" 
              step="0.01" 
              min="0.1" 
              placeholder="0.00" 
              required
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all pl-8 pr-4 text-xs font-medium text-foreground"
            />
          </div>
        </div>
      </div>
      <CalculationInspector 
        factorData={activeFactorData}
        quantityText={`₹${cost || "0"} spent`}
      />
      <SubmitButton />
    </form>
  )
}
