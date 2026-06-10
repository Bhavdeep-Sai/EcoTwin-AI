'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDb, saveDb } from '@/lib/db/localStore'
import { generateInsight } from '@/lib/actions/ai'
import { z } from 'zod'
import type { ActivityRecord, ActivityCategory } from '@/types'

// Zod schema for server-side input validation with category-specific refinements
const logActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'electricity', 'shopping', 'waste']),
  title: z.string().min(1).max(200).trim(),
  impactKg: z.number().min(0).max(10000).finite(),
  details: z.record(z.string(), z.unknown()).optional().default({}),
}).superRefine((data, ctx) => {
  const { category, details } = data
  if (category === 'transport') {
    if (typeof details.mode !== 'string' || details.mode.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Transport mode is required', path: ['details', 'mode'] })
    }
    if (typeof details.distance_km !== 'number' || isNaN(details.distance_km) || details.distance_km < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Distance must be a non-negative number', path: ['details', 'distance_km'] })
    }
  } else if (category === 'food') {
    if (typeof details.meal_type !== 'string' || details.meal_type.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Meal type is required', path: ['details', 'meal_type'] })
    }
    if (typeof details.diet_category !== 'string' || details.diet_category.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Diet category is required', path: ['details', 'diet_category'] })
    }
  } else if (category === 'electricity') {
    if (typeof details.kwh_used !== 'number' || isNaN(details.kwh_used) || details.kwh_used < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'kWh used must be a non-negative number', path: ['details', 'kwh_used'] })
    }
    if (typeof details.source !== 'string' || details.source.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Energy source is required', path: ['details', 'source'] })
    }
  } else if (category === 'shopping') {
    if (typeof details.item_category !== 'string' || details.item_category.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Item category is required', path: ['details', 'item_category'] })
    }
    if (typeof details.cost !== 'number' || isNaN(details.cost) || details.cost < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cost must be a non-negative number', path: ['details', 'cost'] })
    }
  } else if (category === 'waste') {
    if (typeof details.waste_type !== 'string' || details.waste_type.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Waste type is required', path: ['details', 'waste_type'] })
    }
    if (typeof details.weight_kg !== 'number' || isNaN(details.weight_kg) || details.weight_kg < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Weight must be a non-negative number', path: ['details', 'weight_kg'] })
    }
  }
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
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Validate inputs
  const parsed = logActivitySchema.safeParse({ category, title, impactKg, details })
  if (!parsed.success) {
    return {
      success: false,
      error: `Invalid activity data: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    }
  }

  const {
    category: validCategory,
    title: validTitle,
    impactKg: validImpact,
    details: validDetails,
  } = parsed.data

  const newActivity: ActivityRecord = {
    id: crypto.randomUUID(),
    user_id: user.id,
    category: validCategory,
    title: validTitle,
    carbon_impact_kg: validImpact,
    activity_date: new Date().toISOString().split('T')[0],
    details: validDetails,
  }

  // 1. Try to write to Supabase (Production Path)
  try {
    const { error: actErr } = await supabase.from('activities').insert({
      id: newActivity.id,
      user_id: user.id,
      category: validCategory,
      title: validTitle,
      carbon_impact_kg: validImpact,
      activity_date: newActivity.activity_date,
      details: validDetails,
    })

    if (!actErr) {
      if (validCategory === 'transport') {
        await supabase.from('transportation_logs').insert({
          activity_id: newActivity.id,
          mode: validDetails.mode as string,
          distance_km: validDetails.distance_km as number,
        })
      } else if (validCategory === 'food') {
        await supabase.from('food_logs').insert({
          activity_id: newActivity.id,
          meal_type: validDetails.meal_type as string,
          diet_category: validDetails.diet_category as string,
        })
      } else if (validCategory === 'electricity') {
        await supabase.from('electricity_logs').insert({
          activity_id: newActivity.id,
          kwh_used: validDetails.kwh_used as number,
          source: validDetails.source as string,
        })
      } else if (validCategory === 'shopping') {
        await supabase.from('shopping_logs').insert({
          activity_id: newActivity.id,
          item_category: validDetails.item_category as string,
          cost: validDetails.cost as number,
        })
      } else if (validCategory === 'waste') {
        await supabase.from('waste_logs').insert({
          activity_id: newActivity.id,
          waste_type: validDetails.waste_type as string,
          weight_kg: validDetails.weight_kg as number,
          recycled: Boolean(validDetails.recycled),
        })
      }
    }
  } catch (err) {
    console.warn('Supabase db insert failed, falling back to local store:', err)
  }

  // 2. Always maintain local file store mirror as a fallback/compatibility database
  try {
    const db = await getDb()
    db.activities.push(newActivity)
    await saveDb(db)
  } catch (err) {
    console.error('Local JSON save failed:', err)
  }

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

  // 1. Try to read from Supabase (Production Path)
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })

    if (!error && data && data.length > 0) {
      return (data as unknown as ActivityRecord[]).map((a) => ({
        id: a.id,
        user_id: a.user_id,
        category: a.category,
        title: a.title,
        carbon_impact_kg: Number(a.carbon_impact_kg),
        activity_date: a.activity_date,
        details: a.details || {},
        created_at: a.created_at,
      }))
    }
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local store:', err)
  }

  // 2. Local fallback client
  const db = await getDb()
  return db.activities
    .filter((a) => a.user_id === user.id)
    .sort(
      (a, b) =>
        new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime(),
    )
}
