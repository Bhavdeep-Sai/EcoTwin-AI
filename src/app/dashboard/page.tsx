import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getActivitiesSummary, calculateStreak } from "@/lib/actions/activities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard/charts"
import { AppleHealthRings } from "@/components/dashboard/apple-health-rings"
import { GithubContributionGrid } from "@/components/dashboard/github-contribution-grid"
import { FutureSimulator } from "@/components/dashboard/future-simulator"
import { AchievementsGrid } from "@/components/dashboard/achievements-grid"
import { WeeklyReportsList } from "@/components/dashboard/weekly-reports-list"
import { AiChatDrawer } from "@/components/dashboard/ai-chat-drawer"
import { AqiCard } from "@/components/dashboard/aqi-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Sparkles, Plus } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const activities = await getActivitiesSummary()
  
  // Calculate total footprint
  const totalImpact = activities.reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)

  // Calculate category impacts for Concentric Rings
  const transportImpact = activities
    .filter((a: any) => a.category === 'transport')
    .reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)
  
  const foodImpact = activities
    .filter((a: any) => a.category === 'food')
    .reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)
  
  const energyImpact = activities
    .filter((a: any) => a.category === 'electricity')
    .reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)

  const shoppingImpact = activities
    .filter((a: any) => a.category === 'shopping')
    .reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)

  const wasteImpact = activities
    .filter((a: any) => a.category === 'waste')
    .reduce((sum: any, act: any) => sum + Number(act.carbon_impact_kg), 0)

  // Calculate dynamic score (Start at 1000, subtract 5 points per kg of CO2)
  const carbonScore = activities.length === 0 ? 1000 : Math.max(0, 1000 - Math.floor(totalImpact * 5))

  // Real streak: consecutive days with at least one logged activity
  const streakDays = calculateStreak(activities)

  // Fetch real AI insights from DB
  const { getDb } = await import('@/lib/db/localStore')
  const db = await getDb()
  const insights = db.ai_insights
    .filter((i: any) => i.user_id === user.id)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="relative min-h-screen bg-background text-foreground flex-1 w-full border-t border-border/20 transition-colors duration-300">
      {/* Background Decorative Mesh Grids & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.08] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-[var(--dashboard-glow,rgba(16,185,129,0.06))] rounded-full blur-[120px] opacity-60 transition-all duration-500 pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 -z-10 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[140px] opacity-40 pointer-events-none"></div>

      <div className="container mx-auto py-8 px-4 max-w-7xl relative z-10 space-y-12">
        
        {/* Top Header greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/25">
                Twin Active
              </span>
              {streakDays > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-500/10 text-orange-500 dark:text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/25">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  {streakDays} Day Streak!
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Eco-Warrior'}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Here is your digital twin footprint and impact center.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/activities"
              className={cn(buttonVariants({ className: "bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold h-10 px-5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer" }))}
            >
              <Plus className="mr-1.5 h-4 w-4 stroke-[3]" /> Log Activity
            </Link>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-muted border border-border p-1 rounded-2xl flex flex-nowrap overflow-x-auto scrollbar-none gap-1 max-w-full justify-start w-full sm:w-auto backdrop-blur-md">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0">
              Analytics & History
            </TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0">
              Future Simulator
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0">
              Weekly Reports
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-8 outline-none">
            {/* Quick Stats Banner */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              <Card className="bg-card border-border rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between h-full min-h-[140px] hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
                <CardHeader className="p-6">
                  <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Total Footprint</CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary mt-2 flex items-baseline gap-2">
                    {totalImpact.toFixed(1)} <span className="text-sm font-semibold text-muted-foreground">kg CO₂e</span>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border rounded-xl shadow-sm flex flex-col justify-between h-full min-h-[140px] hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <CardHeader className="p-6">
                  <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Logged Actions</CardDescription>
                  <CardTitle className="text-3xl font-bold text-foreground mt-2">{activities.length}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-card border-border rounded-xl shadow-sm flex flex-col justify-between h-full min-h-[140px] hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <CardHeader className="p-6">
                  <CardDescription className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Carbon Score</CardDescription>
                  <CardTitle className="text-3xl font-bold text-primary mt-2 flex items-baseline gap-2">
                    {carbonScore} <span className="text-sm font-semibold text-muted-foreground">/ 1000</span>
                  </CardTitle>
                </CardHeader>
              </Card>

              <AqiCard />
            </div>

            {/* Concentric Rings, Action Grid, AI Insights Column Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Apple Health Progress Rings */}
              <div className="lg:col-span-1 flex flex-col justify-start">
                <AppleHealthRings
                  transportKg={transportImpact}
                  foodKg={foodImpact}
                  energyKg={energyImpact}
                  shoppingKg={shoppingImpact}
                  wasteKg={wasteImpact}
                />
              </div>

              {/* GitHub Grid and AI insights */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                
                {/* 12-week GitHub savings grid */}
                <GithubContributionGrid activities={activities} />

                {/* AI Insights Card */}
                <Card className="bg-card border-border rounded-xl shadow-sm relative overflow-hidden flex-1">
                  <div className="absolute top-0 left-0 -ml-16 -mt-16 w-28 h-28 bg-primary/5 rounded-full blur-2xl"></div>
                  <CardHeader className="pb-3 border-b border-border/30">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary fill-current" />
                      Digital Twin AI Insights
                    </CardTitle>
                    <CardDescription className="text-xs">Personalized lifestyle recommendations from Llama-3.1</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {insights && insights.length > 0 ? (
                        insights.map((insight: any) => (
                          <div 
                            key={insight.id} 
                            className="p-4 rounded-xl bg-muted/40 border border-border/80 hover:border-primary/10 transition-colors"
                          >
                            <p className="text-xs text-foreground/80 leading-relaxed">{insight.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 rounded-xl border border-dashed border-border text-center">
                          <p className="text-xs text-muted-foreground">Log some activities to synchronize and generate AI Twin insights!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          {/* TAB 2: ANALYTICS & HISTORY */}
          <TabsContent value="analytics" className="outline-none">
            <Card className="bg-card border-border rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="text-lg font-bold text-foreground">Carbon Footprint Analysis</CardTitle>
                <CardDescription className="text-xs">Visualize your carbon footprint breakdown and comparative grid generation stats.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] p-0 flex items-center justify-center bg-muted/10">
                <DashboardCharts activities={activities} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: FUTURE SIMULATOR */}
          <TabsContent value="simulator" className="outline-none">
            <FutureSimulator />
          </TabsContent>

          {/* TAB 4: ACHIEVEMENTS */}
          <TabsContent value="achievements" className="outline-none">
            <AchievementsGrid activities={activities} />
          </TabsContent>

          {/* TAB 5: WEEKLY REPORTS */}
          <TabsContent value="reports" className="outline-none">
            <WeeklyReportsList activities={activities} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Floating Slide-out AI Twin Assistant */}
      <AiChatDrawer />
    </div>
  )
}
