"use server"

import { z } from "zod"
import { groq } from "@/lib/groq/client"

const StorySchema = z.object({
  story: z.string().describe("The exact 3-sentence narrative story")
})

export type StoryResult = z.infer<typeof StorySchema>

export interface WeeklyDataPayload {
  total_kg: number
  trend_percentage: number
  top_category: string
  top_category_kg: number
  target_kg: number
}

export async function generateWeeklyStory(data: WeeklyDataPayload): Promise<{ success: true; data: StoryResult } | { success: false; error: string }> {
  const SYSTEM_PROMPT = `
You are the EcoTwin Story Engine. Your job is to translate weekly carbon emission data into a short, emotional, and factual narrative.

CRITICAL RULES:
1. Tone: Empathetic, human-readable, and factual.
2. Select a narrative archetype: 
   - Celebratory (if trend is negative/below target)
   - Reflective (if slightly above target)
   - Urgent (if heavily above target)
3. Tangible Analogy: You MUST use our Exact Scientific Equivalents to mathematically contextualize the "total_kg". Do not invent analogies.
   - 1 kg CO2e = Driving 4.8 km in a gasoline car
   - 1 kg CO2e = Charging 122 smartphones
   - 10 kg CO2e = Recycling 11 kg of mixed municipal waste
   - 100 kg CO2e = Powering an average US home for 10 days
   (You must do the math! If total_kg is 18.5, that is 18.5 * 4.8 = 88.8 km of driving).
4. Length: Exactly 3 sentences.
   - Sentence 1: State the total and the emotional tone based on the target.
   - Sentence 2: Provide the mathematically calculated analogy.
   - Sentence 3: Highlight the top category and provide a personalized takeaway.
5. Return ONLY a JSON object: { "story": "The 3 sentence narrative." }
`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Weekly Data Payload: ${JSON.stringify(data)}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // Slight creative variance for storytelling, but strict enough for math
      response_format: { type: "json_object" }
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error("No response received from Groq.")
    }

    const parsedJson = JSON.parse(rawContent)
    const validatedData = StorySchema.parse(parsedJson)

    return { success: true, data: validatedData }

  } catch (error) {
    console.error("Error generating story:", error)
    return { success: false, error: "Failed to generate your weekly carbon story." }
  }
}
