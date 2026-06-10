import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HeroSection } from "@/components/activities/hero-section"
import { ActivityCard } from "@/components/activities/activity-card"

export default async function ActivitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      
      {/* Decorative Background Leaves (Removed per user request) */}

      <div className="relative z-10 pb-12">
        <HeroSection />
        <ActivityCard />
      </div>
    </div>
  )
}
