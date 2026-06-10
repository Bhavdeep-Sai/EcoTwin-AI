/**
 * EcoTwin AI — Shared Type Definitions
 *
 * Single source of truth for all shared interfaces across the application.
 * Import from '@/types' in all components and actions.
 */

// ---------------------------------------------------------------------------
// Activity Types
// ---------------------------------------------------------------------------

export type ActivityCategory = 'transport' | 'food' | 'electricity' | 'shopping' | 'waste'

export interface ActivityRecord {
  id: string
  user_id: string
  category: ActivityCategory
  title: string
  carbon_impact_kg: number
  activity_date: string // YYYY-MM-DD
  details: Record<string, unknown>
  created_at?: string
}

// ---------------------------------------------------------------------------
// AI Insight Types
// ---------------------------------------------------------------------------

export interface AiInsight {
  id: string
  user_id: string
  activity_id: string
  content: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Local Database Types
// ---------------------------------------------------------------------------

export interface LocalDatabase {
  activities: ActivityRecord[]
  ai_insights: AiInsight[]
}

// ---------------------------------------------------------------------------
// Environmental / Cache Types
// ---------------------------------------------------------------------------

export interface FoodProductCache {
  barcode: string
  product_name: string
  eco_score: string
  carbon_100g_g: number
  ingredients_analysis: Record<string, unknown>
  packaging_info: Record<string, unknown>
  updated_at: string
}

export interface GeocodeCache {
  query_address: string
  latitude: number
  longitude: number
  display_name: string
  cached_at?: string
}

export interface RouteCache {
  route_key: string
  distance_km: number
  duration_seconds: number
  geometry?: string | null
  cached_at?: string
}

// ---------------------------------------------------------------------------
// AQI Types
// ---------------------------------------------------------------------------

export interface AqiData {
  aqi: number
  category: string
  pollutant: string
  reporting_area: string
}

// ---------------------------------------------------------------------------
// Carbon Score / Stats Types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalImpact: number
  transportImpact: number
  foodImpact: number
  energyImpact: number
  shoppingImpact: number
  wasteImpact: number
  carbonScore: number
  streakDays: number
}
