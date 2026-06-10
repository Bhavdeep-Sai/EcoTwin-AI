import { toast } from "sonner"
import { logActivity } from "@/lib/actions/activities"

export function useActivityForm(category: "food" | "electricity" | "shopping" | "transport" | "waste") {
  const submitActivity = async (title: string, impactKg: number, details: Record<string, unknown>, onSuccess?: () => void) => {
    try {
      await logActivity(category, title, Number(impactKg.toFixed(2)), details)
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} activity logged successfully!`, {
        description: `Estimated impact: ${impactKg.toFixed(2)} kg CO₂e`,
      })
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      toast.error(`Failed to log ${category} activity`, { 
        description: err instanceof Error ? err.message : "Unknown error" 
      })
    }
  }

  return { submitActivity }
}
