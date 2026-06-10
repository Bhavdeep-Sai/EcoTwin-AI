"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getDb, saveDb } from "@/lib/db/localStore"
import { generateInsight } from "@/lib/actions/ai"

export type ActivityCategory = 'transport' | 'food' | 'electricity' | 'shopping' | 'waste'

export async function logActivity(category: ActivityCategory, title: string, impactKg: number, details: any) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const db = await getDb()

  const newActivity = {
    id: crypto.randomUUID(),
    user_id: user.id,
    category,
    title,
    carbon_impact_kg: impactKg,
    activity_date: new Date().toISOString().split('T')[0],
    details
  }

  db.activities.push(newActivity)
  await saveDb(db)

  await generateInsight(newActivity.id).catch(console.error)

  revalidatePath('/dashboard')
  revalidatePath('/activities')
  
  return { success: true, activity: newActivity }
}

export async function getActivitiesSummary() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const db = await getDb()
  const userActivities = db.activities
    .filter((a: any) => a.user_id === user.id)
    .sort((a: any, b: any) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())

  return userActivities || []
}
