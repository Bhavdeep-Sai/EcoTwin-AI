"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import Groq from "groq-sdk"
import { getDb, saveDb } from "@/lib/db/localStore"

export async function generateInsight(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const db = await getDb()

  // Fetch the recently logged activity and all recent activities for context
  const recentActivity = db.activities.find((a: any) => a.id === activityId)

  if (!recentActivity) return null

  const pastActivities = db.activities
    .filter((a: any) => a.user_id === user.id)
    .sort((a: any, b: any) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    .slice(0, 10)

  // Construct context for the AI
  const prompt = `
    You are EcoTwin AI, a supportive and intelligent carbon footprint reduction assistant.
    The user just logged a new activity: a ${recentActivity.category} activity titled "${recentActivity.title}" emitting ${recentActivity.carbon_impact_kg}kg of CO2.
    
    Here is their recent history:
    ${pastActivities.map((a: any) => `- ${a.category}: ${a.title} (${a.carbon_impact_kg}kg)`).join('\n')}

    Write a single, encouraging, personalized 1-2 sentence tip (maximum 30 words) analyzing their footprint and offering a highly specific actionable step to reduce it next time. 
    Keep the tone friendly and modern. Do not use hashtags.
  `

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 100,
    })

    const insightText = chatCompletion.choices[0]?.message?.content?.trim()

    if (insightText) {
      // Save it to local db
      db.ai_insights.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        activity_id: activityId,
        content: insightText,
        created_at: new Date().toISOString()
      })
      await saveDb(db)

      revalidatePath('/dashboard')
      return insightText
    }
  } catch (error: any) {
    console.error("Failed to generate Groq insight:", error)
    db.ai_insights.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      activity_id: activityId,
      content: `AI Error: ${error?.message || 'Unknown error'}`,
      created_at: new Date().toISOString()
    })
    await saveDb(db)
  }

  return null
}

export async function chatWithTwin(userMessage: string, history: { role: 'user' | 'assistant'; content: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const systemMessage = {
    role: "system",
    content: "You are EcoTwin AI, a supportive, witty, and highly intelligent carbon twin. You help users understand their carbon footprint, diet choices, transport modes, and electricity consumption. Keep your replies concise (maximum 60 words), actionable, and friendly. Do not use hashtags."
  }

  const formattedHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'assistant',
    content: h.content
  }))

  const messages = [
    systemMessage,
    ...formattedHistory,
    { role: "user", content: userMessage }
  ]

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 150,
    })

    const reply = chatCompletion.choices[0]?.message?.content?.trim()
    if (reply) return reply
  } catch (error) {
    console.error("Failed to run Groq chat completion:", error)
  }

  // Smart local fallback responses if key is missing or offline
  const msg = userMessage.toLowerCase()
  if (msg.includes('meat') || msg.includes('beef') || msg.includes('diet') || msg.includes('food')) {
    return "Eating a plant-based diet is one of the most effective ways to lower your footprint! A single beef meal produces ~2.5kg CO2, while a vegan option is only ~0.8kg. Try swapping one meat meal daily for a big win."
  }
  if (msg.includes('car') || msg.includes('transport') || msg.includes('drive') || msg.includes('commute')) {
    return "Transportation accounts for a large share of individual emissions. Standard petrol cars emit ~0.17kg CO2e per km. Swapping to public transit (0.035kg/km) or cycling (0.0kg) drastically cuts this down."
  }
  if (msg.includes('electric') || msg.includes('power') || msg.includes('grid') || msg.includes('solar')) {
    return "Home energy footprints depend heavily on your local grid. If your grid is coal-heavy, electricity emits ~0.7-0.8kg CO2 per kWh. Switching to a green/solar supplier cuts this to nearly zero!"
  }
  
  return "Hey there! I am your digital EcoTwin. I track your activities and help you discover low-carbon choices. Go ahead and ask me about your diet, transit modes, energy grid, or tips to optimize your streak!"
}

