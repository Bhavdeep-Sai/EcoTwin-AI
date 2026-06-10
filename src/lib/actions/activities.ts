'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDb, saveDb } from '@/lib/db/localStore'
import { generateInsight } from '@/lib/actions/ai'
import { z } from 'zod'
import type { ActivityRecord, ActivityCategory } from '@/types'

// Zod schema for server-side input validation
const logActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'electricity', 'shopping', 'waste']),
  title: z.string().min(1).max(200).trim(),
  impactKg: z.number().min(0).max(10000).finite(),
  details: z.record(z.string(), z.unknown()).optional().default({}),
})

export async function logActivity(
  category: ActivityCategory,
  title: string,
  impactKg: number,
  details: Record<string, unknown>,
): Promise<{ success: true; activity: ActivityRecord } | { success: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate inputs
  const parsed = logActivitySchema.safeParse({ category, title, impactKg, details })
  if (!parsed.success) {
    throw new Error(
      `Invalid activity data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    )
  }

  const {
    category: validCategory,
    title: validTitle,
    impactKg: validImpact,
    details: validDetails,
  } = parsed.data

  const db = await getDb()

  const newActivity: ActivityRecord = {
    id: crypto.randomUUID(),
    user_id: user.id,
    category: validCategory,
    title: validTitle,
    carbon_impact_kg: validImpact,
    activity_date: new Date().toISOString().split('T')[0],
    details: validDetails,
  }

  db.activities.push(newActivity)
  await saveDb(db)

  // Generate AI insight asynchronously — don't block activity logging on AI failures
  generateInsight(newActivity.id).catch((err) =>
    console.error('Background insight generation failed:', err),
  )

  revalidatePath('/dashboard')
  revalidatePath('/activities')

  return { success: true, activity: newActivity }
}

export async function getActivitiesSummary(): Promise<ActivityRecord[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const db = await getDb()
  return db.activities
    .filter((a) => a.user_id === user.id)
    .sort(
      (a, b) =>
        new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime(),
    )
}
