"use server"

import { z } from "zod"
import { groq } from "@/lib/groq/client"

export const ActivityExtractionSchema = z.object({
  activities: z.array(z.object({
    title: z.string().describe("A short, descriptive title of the activity"),
    category: z.enum(['transport', 'food', 'electricity', 'shopping', 'waste']),
    estimated_impact_kg: z.number().describe("Estimated carbon impact in kg CO2e"),
  })),
  insights: z.string().describe("A personalized insight praising good choices or highlighting high-impact actions."),
  improvements: z.array(z.string()).describe("1-2 actionable improvements to reduce the footprint."),
})

export type ActivityExtractionResult = z.infer<typeof ActivityExtractionSchema>

const SYSTEM_PROMPT = `
You are the EcoTwin AI, a highly accurate carbon footprint analyzer.
Your task is to parse the user's natural language input, extract all carbon-generating activities, categorize them, and estimate their emissions in kg CO2e.

CRITICAL RULES:
1. You MUST respond ONLY in valid JSON matching the exact schema provided. Do not include markdown formatting or conversational text outside the JSON.
2. Use the following exact conversion factors to calculate estimated_impact_kg. DO NOT guess or use external data.
   - Transport (kg CO2e/km): gasoline_car=0.208, electric_vehicle=0.071, bus=0.065, train=0.035, flight_short=0.246, bicycle_walking=0.0
   - Food (kg CO2e/kg): beef=99.48, lamb=39.72, cheese=23.88, pork=12.31, poultry=9.87, fish=13.63, eggs=4.67, rice=4.45, tofu=3.16, vegetables=0.53
3. If an input lacks specific weights/distances, use reasonable defaults (e.g., standard meal size is 0.4kg, biryani uses rice/poultry factors).
4. Provide 1 personalized insight praising good choices or highlighting high-impact actions.
5. Provide 1-2 actionable improvements.

JSON SCHEMA:
{
  "activities": [
    {
      "title": "String",
      "category": "transport|food|electricity|shopping|waste",
      "estimated_impact_kg": Number
    }
  ],
  "insights": "String",
  "improvements": ["String"]
}
`

export async function analyzeActivity(userInput: string): Promise<{ success: true; data: ActivityExtractionResult } | { success: false; error: string }> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Low temperature for deterministic math/JSON
      response_format: { type: "json_object" }
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      throw new Error("No response received from Groq.")
    }

    // Parse the JSON
    const parsedJson = JSON.parse(rawContent)

    // Validate against Zod schema
    const validatedData = ActivityExtractionSchema.parse(parsedJson)

    return { success: true, data: validatedData }

  } catch (error) {
    console.error("Error analyzing activity:", error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "AI response failed structural validation. Please try rewording your input." }
    }
    
    if (error instanceof SyntaxError) {
      return { success: false, error: "AI returned malformed JSON data." }
    }

    return { success: false, error: "An unexpected error occurred while communicating with the AI Engine." }
  }
}
