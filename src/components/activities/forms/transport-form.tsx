"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SubmitButton } from "./submit-button"
import { useActivityForm } from "./use-activity-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TRANSPORT_FACTORS } from "@/lib/services/carbonFactors"
import { CalculationInspector } from "@/components/ui/calculation-inspector"

export function TransportForm() {
  const [mode, setMode] = useState("Car (Petrol)")
  const [calcMode, setCalcMode] = useState<'quick' | 'route'>('quick')
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [routeData, setRouteData] = useState<{
    distance_km: number;
    duration_seconds: number;
    start: { display_name: string; latitude: number; longitude: number };
    end: { display_name: string; latitude: number; longitude: number };
  } | null>(null)
  const { submitActivity } = useActivityForm("transport")
  const [calculating, setCalculating] = useState(false)

  const activeFactorData = TRANSPORT_FACTORS[mode]
  const factor = activeFactorData?.factor || 0.0
  const activeDistance = calcMode === 'route' && routeData ? routeData.distance_km : 0
  const estimatedImpact = activeDistance * factor

  async function calculateRoute() {
    if (!origin.trim() || !destination.trim()) {
      toast.error("Please enter both origin and destination addresses.")
      return
    }

    setCalculating(true)
    setRouteData(null)
    
    try {
      let apiMode = 'car'
      if (mode.includes('Bus') || mode.includes('Train') || mode.includes('Rickshaw')) {
        apiMode = 'transit'
      } else if (mode.includes('Walking') || mode.includes('Bicycle')) {
        apiMode = 'foot'
      }

      const res = await fetch(`/api/datasets/route?start=${encodeURIComponent(origin)}&end=${encodeURIComponent(destination)}&mode=${apiMode}`)
      if (!res.ok) throw new Error("Failed to compute route details")
      const result = await res.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setRouteData(result)
      toast.success("Route calculated successfully!", {
        description: `Distance: ${result.distance_km.toFixed(2)} km`,
      })
    } catch (err: unknown) {
      toast.error("Route calculation failed", { description: err instanceof Error ? err.message : "Ensure addresses are valid." })
    } finally {
      setCalculating(false)
    }
  }

  async function action(formData: FormData) {
    let distance = 0
    const details: Record<string, unknown> = { mode }

    if (calcMode === 'quick') {
      distance = Number(formData.get("distance_km"))
      if (!distance || distance <= 0) {
        toast.error("Please enter a valid distance.")
        return
      }
      details.distance_km = distance
    } else {
      if (!routeData) {
        toast.error("Please calculate your route first.")
        return
      }
      distance = routeData.distance_km
      details.distance_km = distance
      details.origin_address = routeData.start.display_name
      details.destination_address = routeData.end.display_name
      details.origin_coords = { lat: routeData.start.latitude, lon: routeData.start.longitude }
      details.destination_coords = { lat: routeData.end.latitude, lon: routeData.end.longitude }
      details.duration_minutes = Math.round(routeData.duration_seconds / 60)
    }

    const impactKg = distance * factor
    const title = calcMode === 'quick' 
      ? `${distance}km via ${mode}`
      : `${origin.split(',')[0]} to ${destination.split(',')[0]} via ${mode}`

    await submitActivity(title, impactKg, details, () => {
      if (calcMode === 'route') {
        setOrigin("")
        setDestination("")
        setRouteData(null)
      }
    })
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Mode Toggle Tabs */}
      <div className="flex bg-muted border border-border/60 p-1 rounded-lg w-full max-w-sm">
        <button
          type="button"
          onClick={() => setCalcMode('quick')}
          className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-all cursor-pointer ${calcMode === 'quick' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Quick Log
        </button>
        <button
          type="button"
          onClick={() => setCalcMode('route')}
          className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-all cursor-pointer ${calcMode === 'route' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Route Calculator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="transport-mode" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mode of Transport
          </label>
          <Select value={mode} onValueChange={(val) => {
            if (val) {
              setMode(val)
              setRouteData(null)
            }
          }}>
            <SelectTrigger id="transport-mode" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-border">
              <SelectItem value="Car (Petrol)">Car (Petrol)</SelectItem>
              <SelectItem value="Car (Diesel)">Car (Diesel)</SelectItem>
              <SelectItem value="Car (CNG)">Car (CNG)</SelectItem>
              <SelectItem value="Two-Wheeler (Petrol)">Two-Wheeler (Motorcycle/Scooter)</SelectItem>
              <SelectItem value="Auto Rickshaw (CNG)">Auto Rickshaw (CNG)</SelectItem>
              <SelectItem value="Electric Vehicle (EV)">Electric Vehicle (EV)</SelectItem>
              <SelectItem value="Bus (Public Transport)">Bus (Public Transport)</SelectItem>
              <SelectItem value="Train (Indian Railways)">Train (Indian Railways)</SelectItem>
              <SelectItem value="Walking / Bicycle">Walking / Bicycle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Inputs based on calcMode */}
        {calcMode === 'quick' ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="transport-distance" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Distance
            </label>
            <div className="relative">
              <Input 
                id="transport-distance"
                name="distance_km" 
                type="number" 
                step="0.1" 
                min="0.1" 
                placeholder="0.0" 
                required={calcMode === 'quick'}
                className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                km
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="transport-origin" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origin</label>
                <div className="relative">
                  <Input 
                    id="transport-origin"
                    type="text" 
                    placeholder="e.g. Seattle, WA or London Heathrow" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full h-11 rounded-md bg-background border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 px-4 pl-10 text-xs font-medium text-foreground"
                  />
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="transport-destination" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</label>
                <div className="relative">
                  <Input 
                    id="transport-destination"
                    type="text" 
                    placeholder="e.g. Portland, OR or Kings Cross" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-11 rounded-md bg-background border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 px-4 pl-10 text-xs font-medium text-foreground"
                  />
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={calculating}
              onClick={calculateRoute}
              className="w-full h-10 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border/80"
            >
              {calculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Geocoding & Finding Route...
                </>
              ) : (
                "Calculate Route (OSM/OSRM)"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Visual route summary details block */}
      {calcMode === 'route' && routeData && (
        <div className="p-4 bg-primary/5 border border-primary/25 rounded-md flex flex-col gap-3 transition-all text-foreground">
          <div className="flex items-center justify-between border-b border-primary/10 pb-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-primary">Route Summary</span>
            <span className="text-xs font-black text-primary">{estimatedImpact.toFixed(2)} kg CO₂e</span>
          </div>

          <div className="flex flex-col gap-2 text-xs font-medium">
            <div className="flex items-start gap-2">
              <span className="font-bold text-muted-foreground min-w-[50px]">From:</span>
              <span className="truncate text-foreground/80">{routeData.start.display_name}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-muted-foreground min-w-[50px]">To:</span>
              <span className="truncate text-foreground/80">{routeData.end.display_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-1 pt-2 border-t border-primary/10 text-muted-foreground">
              <div>
                <span className="font-semibold block text-[10px] uppercase text-muted-foreground/60">Distance</span>
                <span className="text-xs font-bold text-foreground">{routeData.distance_km.toFixed(2)} km</span>
              </div>
              <div>
                <span className="font-semibold block text-[10px] uppercase text-muted-foreground/60">Duration</span>
                <span className="text-xs font-bold text-foreground">{Math.round(routeData.duration_seconds / 60)} minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <CalculationInspector 
        factorData={activeFactorData}
        quantityText={`${calcMode === 'quick' ? 'Distance' : 'Route Distance'} (${calcMode === 'quick' ? 'user input' : 'calculated route'})`}
      />
      <SubmitButton />
    </form>
  )
}
