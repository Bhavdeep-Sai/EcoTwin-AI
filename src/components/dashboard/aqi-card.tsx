"use client"

import { useEffect, useState, useCallback } from "react"
import { Wind, ShieldAlert, CheckCircle, MapPin, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface AqiData {
  aqi: number
  category: string
  pollutant: string
  reporting_area: string
}

type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

export function AqiCard() {
  const [data, setData] = useState<AqiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  const fetchAqi = useCallback(async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/datasets/aqi?lat=${lat}&lon=${lon}`)
      if (!res.ok) {
        const errRes = await res.json().catch(() => ({}))
        throw new Error(errRes.error || "AQI fetch failed.")
      }
      const result = await res.json()
      setData(result)

      // Drive the dashboard glow colour from AQI
      const root = document.documentElement
      if (result.aqi <= 50) root.style.setProperty('--dashboard-glow', 'rgba(16, 185, 129, 0.1)')
      else if (result.aqi <= 100) root.style.setProperty('--dashboard-glow', 'rgba(245, 158, 11, 0.08)')
      else root.style.setProperty('--dashboard-glow', 'rgba(239, 68, 68, 0.08)')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState('unavailable')
      setLoading(false)
      setError('Geolocation is not supported by your browser.')
      return
    }
    setLocationState('requesting')
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setCoords({ lat, lon })
        setLocationState('granted')
        fetchAqi(lat, lon)
      },
      (err) => {
        setLocationState('denied')
        setLoading(false)
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Allow location in your browser settings, then retry.'
            : 'Unable to determine your location. Please retry.'
        )
      },
      { timeout: 8000, maximumAge: 300_000 }
    )
  }, [fetchAqi])

  // On mount: check permission state and auto-request if prompt or granted
  useEffect(() => {
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationState('unavailable')
      setLoading(false)
      setError('Geolocation is not supported by your browser.')
      return
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestLocation()
        } else if (result.state === 'prompt') {
          requestLocation()
        } else {
          setLocationState('denied')
          setLoading(false)
          setError('Location access denied. Allow location in your browser settings, then click Retry.')
        }
        result.onchange = () => {
          if (result.state === 'granted') requestLocation()
        }
      }).catch(() => {
        requestLocation()
      })
    } else {
      requestLocation()
    }
  }, [requestLocation])

  const handleRetry = () => {
    if (coords) {
      fetchAqi(coords.lat, coords.lon)
    } else {
      requestLocation()
    }
  }


  if (loading) {
    return (
      <Card className="bg-card border-border rounded-xl shadow-sm animate-pulse flex flex-col justify-between h-full min-h-[140px]">
        <CardHeader className="p-6 pb-3">
          <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Live Air Quality</CardDescription>
          <div className="h-8 bg-muted rounded w-1/3 mt-2"></div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {locationState === 'requesting' ? 'Requesting location…' : 'Fetching AQI…'}
          </p>
        </CardHeader>
      </Card>
    )
  }

  if (error || !data) {
    const errorTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const isDenied = locationState === 'denied'
    return (
      <Card className="bg-card border-border rounded-xl shadow-sm flex flex-col justify-between h-full min-h-[140px] hover:shadow-md transition-all duration-300">
        <CardHeader className="p-6 pb-2">
          <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Live Air Quality</CardDescription>
          <CardTitle className="text-sm font-semibold text-destructive mt-1 flex flex-col gap-1">
            {isDenied ? (
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location Required</span>
            ) : (
              <span>Live AQI temporarily unavailable</span>
            )}
            <span className="text-[10px] text-muted-foreground font-medium normal-case leading-relaxed">
              {error || 'Unable to load air quality data.'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 text-[9px] text-muted-foreground flex flex-col gap-2">
          <div className="border-t border-border/40 pt-2 flex flex-col gap-1 leading-normal font-medium">
            <div>Provider: <span className="text-foreground">Open-Meteo + EPA AirNow</span></div>
            <div>Monitored: <span className="text-foreground">PM2.5, Ozone, PM10</span></div>
            <div>Checked: <span className="text-foreground">{errorTime}</span></div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full mt-1.5 py-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isDenied ? <><MapPin className="h-3 w-3" /> Share Location</> : <><RefreshCw className="h-3 w-3" /> Retry Fetch</>}
          </button>
        </CardContent>
      </Card>
    )
  }

  const { aqi, category, pollutant, reporting_area } = data

  // Determine styling based on AQI value
  let aqiColorClass = "text-emerald-500 dark:text-emerald-400"
  let aqiBgClass = "bg-emerald-500/10 border-emerald-500/25"
  let AqiIcon = CheckCircle

  if (aqi > 50 && aqi <= 100) {
    aqiColorClass = "text-amber-500 dark:text-amber-400"
    aqiBgClass = "bg-amber-500/10 border-amber-500/25"
    AqiIcon = Wind
  } else if (aqi > 100) {
    aqiColorClass = "text-rose-500 dark:text-rose-400"
    aqiBgClass = "bg-rose-500/10 border-rose-500/25"
    AqiIcon = ShieldAlert
  }

  return (
    <Card className="bg-card border-border rounded-xl shadow-sm relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-full min-h-[140px]">
      <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 rounded-full blur-xl opacity-30 ${aqi <= 50 ? 'bg-emerald-500' : aqi <= 100 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
      <CardHeader className="p-6 pb-2">
        <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider font-sans">Live Air Quality</CardDescription>
        <CardTitle
          className="text-3xl font-bold text-foreground mt-1 flex items-baseline gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={aqiColorClass}>{aqi}</span>
          <span className="text-sm font-semibold text-muted-foreground">AQI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiBgClass} ${aqiColorClass}`}>
              <AqiIcon className="h-3 w-3 stroke-[2.5]" />
              {category}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
            Pollutant: <span className="text-foreground">{pollutant}</span> | <span className="text-foreground truncate max-w-full block md:inline">{reporting_area.split('(')[0]}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
