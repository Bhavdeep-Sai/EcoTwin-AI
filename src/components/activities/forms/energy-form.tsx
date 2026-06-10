"use client"

import { useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { SubmitButton } from "./submit-button"
import { logActivity } from "@/lib/actions/activities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ENERGY_FACTORS } from "@/lib/services/carbonFactors"
import { CalculationInspector } from "@/components/ui/calculation-inspector"

export function EnergyForm() {
  const [source, setSource] = useState("Grid")
  const [zip, setZip] = useState("")
  const [gridData, setGridData] = useState<{
    subregion_code: string;
    subregion_name: string;
    co2e_rate_kg_kwh: number;
    fuel_mix_pct: Record<string, number>;
  } | null>(null)
  const [loadingGrid, setLoadingGrid] = useState(false)
  const [kwhUsed, setKwhUsed] = useState("")

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().slice(0, 5)
    setZip(val)

    if (val.length === 5 && /^\d{5}$/.test(val)) {
      setLoadingGrid(true)
      setGridData(null)
      try {
        const res = await fetch(`/api/datasets/grid?zip=${val}`)
        if (!res.ok) throw new Error("Failed to query EPA grid database")
        const result = await res.json()
        if (result.error) {
          throw new Error(result.error)
        }
        setGridData(result)
        toast.success(`EPA eGRID Subregion loaded: ${result.subregion_code}`, {
          description: result.subregion_name
        })
      } catch (err: unknown) {
        toast.error("EPA eGRID Lookup failed", { description: err instanceof Error ? err.message : "Unknown error" })
        setGridData(null)
      } finally {
        setLoadingGrid(false)
      }
    } else {
      setGridData(null)
    }
  }

  // Get active carbon factor (kg CO2e per kWh)
  const getCarbonFactor = () => {
    if (source === 'Solar') return ENERGY_FACTORS['Solar / Clean Sourcing'].factor
    if (gridData) return gridData.co2e_rate_kg_kwh
    return ENERGY_FACTORS['US Average Grid'].factor
  }

  const activeFactor = getCarbonFactor()
  const kwhNum = Number(kwhUsed) || 0
  const estimatedImpact = kwhNum * activeFactor

  const activeFactorData = source === 'Solar'
    ? ENERGY_FACTORS['Solar / Clean Sourcing']
    : gridData
      ? {
          factor: gridData.co2e_rate_kg_kwh,
          unit: "kg CO₂e / kWh",
          source: `US EPA eGRID (${gridData.subregion_code})`,
          year: 2024,
          reference_url: "https://www.epa.gov/egrid",
          assumptions: `Localized power grid emissions rate for subregion "${gridData.subregion_name}".`,
          formula: `Emissions (kg CO₂e) = Electricity (kWh) × ${gridData.co2e_rate_kg_kwh.toFixed(4)}`
        }
      : ENERGY_FACTORS['US Average Grid']

  async function action() {
    if (kwhNum <= 0) {
      toast.error("Please enter a valid kWh amount.")
      return
    }

    const details: Record<string, unknown> = { source, kwh_used: kwhNum }
    let subregionLabel = "Standard Grid"

    if (source === 'Grid') {
      if (gridData) {
        details.zip_code = zip
        details.subregion_code = gridData.subregion_code
        details.subregion_name = gridData.subregion_name
        details.co2e_rate_kg_kwh = gridData.co2e_rate_kg_kwh
        details.fuel_mix_pct = gridData.fuel_mix_pct
        subregionLabel = `${gridData.subregion_code} Grid`
      } else {
        subregionLabel = "US Avg Grid"
      }
    }

    const title = `${kwhNum} kWh from ${subregionLabel}`

    try {
      await logActivity("electricity", title, Number(estimatedImpact.toFixed(2)), details)
      toast.success("Electricity activity logged successfully!", {
        description: `Estimated impact: ${estimatedImpact.toFixed(2)} kg CO₂e`,
      })
      setKwhUsed("")
      setZip("")
      setGridData(null)
    } catch (err: unknown) {
      toast.error("Failed to log electricity activity", { description: err instanceof Error ? err.message : "Unknown error" })
    }
  }

  const getFuelColor = (fuel: string) => {
    switch (fuel.toLowerCase()) {
      case 'coal': return 'bg-gray-500'
      case 'gas': return 'bg-orange-500'
      case 'nuclear': return 'bg-purple-500'
      case 'hydro': return 'bg-blue-500'
      case 'wind': return 'bg-sky-400'
      case 'solar': return 'bg-yellow-400'
      case 'geothermal': return 'bg-rose-500'
      default: return 'bg-slate-400'
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="energy-source" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Energy Source
          </label>
          <Select value={source} onValueChange={(val) => {
            if (val) {
              setSource(val)
              if (val === 'Solar') setGridData(null)
            }
          }}>
            <SelectTrigger id="energy-source" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-border">
              <SelectItem value="Grid">Standard Grid Power</SelectItem>
              <SelectItem value="Solar">Solar / Renewable energy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="kwh-used" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Electricity Used
          </label>
          <div className="relative">
            <Input 
              id="kwh-used"
              type="number" 
              step="0.1" 
              min="0.1" 
              placeholder="0.0" 
              value={kwhUsed}
              onChange={(e) => setKwhUsed(e.target.value)}
              required
              className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
              kWh
            </div>
          </div>
        </div>
      </div>

      {source === 'Grid' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="zip-code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">US ZIP Code (Loads EPA eGRID Subregion Factors)</label>
            <div className="relative">
              <Input 
                id="zip-code"
                type="text" 
                maxLength={5}
                placeholder="Enter 5-digit ZIP code (optional)" 
                value={zip}
                onChange={handleZipChange}
                className="w-full h-11 rounded-md bg-background border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 px-4 pl-10 text-xs font-medium text-foreground"
              />
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {loadingGrid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EPA eGRID Region details & fuel mix graphics */}
      {source === 'Grid' && gridData && (
        <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col gap-4 transition-all">
          <div className="flex items-start justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-sm font-black text-foreground">{gridData.subregion_name.split(' (')[0]}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">eGRID Region: {gridData.subregion_code}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-black tracking-wider text-muted-foreground">Subregion CO₂ Rate</span>
              <span className="text-sm font-black text-primary mt-0.5">{gridData.co2e_rate_kg_kwh.toFixed(3)} kg/kWh</span>
            </div>
          </div>

          {/* Fuel Mix Progress Bar Stack */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Local Power Sourcing Breakdown</span>
            
            <div className="flex flex-col gap-2">
              {Object.entries(gridData.fuel_mix_pct as Record<string, number>).map(([fuel, pct]) => {
                if (pct <= 0) return null
                const percentVal = Math.round(pct * 100)
                return (
                  <div key={fuel} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground capitalize">
                      <span>{fuel}</span>
                      <span>{percentVal}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getFuelColor(fuel)}`} 
                        style={{ width: `${percentVal}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {kwhNum > 0 && (
            <div className="border-t border-border pt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Calculated Emissions:</span>
              <span className="text-sm font-black text-primary">{estimatedImpact.toFixed(2)} kg CO₂e</span>
            </div>
          )}
        </div>
      )}

      <CalculationInspector 
        factorData={activeFactorData}
        quantityText={`${kwhUsed || '0'} kWh`}
      />
      <SubmitButton />
    </form>
  )
}
