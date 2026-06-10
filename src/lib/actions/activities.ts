"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getDb, saveDb } from "@/lib/db/localStore"
import { generateInsight } from "@/lib/actions/ai"
import { z } from "zod"

export type ActivityCategory = 'transport' | 'food' | 'electricity' | 'shopping' | 'waste'

// Zod schema for server-side input validation
const logActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'electricity', 'shopping', 'waste']),
  title: z.string().min(1).max(200).trim(),
  impactKg: z.number().min(0).max(10000).finite(),
  details: z.record(z.string(), z.unknown()).optional().default({})
})

export async function logActivity(category: ActivityCategory, title: string, impactKg: number, details: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Validate inputs
  const parsed = logActivitySchema.safeParse({ category, title, impactKg, details })
  if (!parsed.success) {
    throw new Error(`Invalid activity data: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { category: validCategory, title: validTitle, impactKg: validImpact, details: validDetails } = parsed.data

  const db = await getDb()

  const newActivity = {
    id: crypto.randomUUID(),
    user_id: user.id,
    category: validCategory,
    title: validTitle,
    carbon_impact_kg: validImpact,
    activity_date: new Date().toISOString().split('T')[0],
    details: validDetails
  }

  db.activities.push(newActivity)
  await saveDb(db)

  // Generate AI insight asynchronously — don't block activity logging on AI failures
  generateInsight(newActivity.id).catch(err => 
    console.error("Background insight generation failed:", err)
  )

  revalidatePath('/dashboard')
  revalidatePath('/activities')
  
  return { success: true, activity: newActivity }
}

export async function getActivitiesSummary() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const db = await getDb()
  const userActivities: any[] = db.activities
    .filter((a: any) => a.user_id === user.id)
    .sort((a: any, b: any) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())

  return userActivities
}

/**
 * Calculates the number of consecutive days the user has logged at least one activity,
 * counting backward from today. Returns 0 if no activity was logged today or yesterday.
 */
export function calculateStreak(activities: any[]): number {
  if (!activities || activities.length === 0) return 0

  // Collect unique logged dates (stored as YYYY-MM-DD local time strings)
  const loggedDates = new Set(activities.map((a: any) => a.activity_date))

  // Helper: get local YYYY-MM-DD string for a Date offset by N days from now
  const localDateStr = (daysOffset: number): string => {
    const d = new Date()
    d.setDate(d.getDate() - daysOffset)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const todayStr = localDateStr(0)
  const yesterdayStr = localDateStr(1)

  // Only count a streak if the user logged today or yesterday (avoids stale streaks)
  if (!loggedDates.has(todayStr) && !loggedDates.has(yesterdayStr)) return 0

  // Start counting from whichever is more recent
  let streak = 0
  let offset = loggedDates.has(todayStr) ? 0 : 1

  while (true) {
    const checkStr = localDateStr(offset)
    if (!loggedDates.has(checkStr)) break
    streak++
    offset++
  }

  return streak
}
