"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Leaf, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, LineChart, TreePine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("full_name") as string

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else if (data?.session === null) {
      // Email confirmation required
      toast.success("Success! Please check your email to verify your account.")
      setError(null)
      form.reset()
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex-1 relative w-full min-h-[calc(100vh-3.5rem)] flex bg-background overflow-hidden">
      {/* Left Column: Image and Hero Text */}
      <div className="relative w-full lg:w-[55%] flex flex-col justify-center p-8 lg:p-16 overflow-hidden bg-green-50/50 dark:bg-green-950/20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-bg.png"
            alt="Sustainable Energy Landscape"
            fill
            className="object-cover opacity-80 mix-blend-multiply dark:mix-blend-overlay dark:opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent dark:from-background dark:via-background/90 dark:to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-lg space-y-8 lg:pl-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
              <span className="text-foreground font-bold text-3xl lg:text-4xl block mb-1">Welcome to</span>
              <span className="text-green-600 dark:text-green-500 text-6xl lg:text-7xl block">EcoTwin AI</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mt-4">
              Your personal AI carbon assistant <br className="hidden lg:block" />for a smarter, greener tomorrow.
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <Leaf className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Track Your Impact</h3>
                <p className="text-sm text-muted-foreground">Monitor your carbon footprint in real-time.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <LineChart className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Smart Insights</h3>
                <p className="text-sm text-muted-foreground">Get AI-powered insights and personalized tips.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/50 rounded-xl">
                <TreePine className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sustainable Future</h3>
                <p className="text-sm text-muted-foreground">Take action today for a better tomorrow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The sweeping curve background layers */}
      {/* Outer translucent curve */}
      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 bg-white/40 dark:bg-black/40 backdrop-blur-md z-10 rounded-full w-[110vw] h-[110vw] left-[45vw] pointer-events-none" />
      {/* Inner solid curve */}
      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 bg-background z-10 rounded-full w-[100vw] h-[100vw] left-[47vw] shadow-[-20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-none pointer-events-none" />

      {/* Right Column: Auth Card */}
      <div className="relative z-20 w-full lg:w-[45%] flex flex-col items-center justify-center p-4 sm:p-8 bg-background lg:bg-transparent lg:ml-auto">
        <div className="w-full max-w-[420px] bg-card p-8 rounded-[2rem] border shadow-xl shadow-black/5 relative z-30">
          <div className="flex flex-col items-center text-center mb-8 space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full mb-1">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to continue to your account</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="flex w-full mb-8 bg-transparent p-0 h-auto gap-0 border-b border-border/50 rounded-none">
              <TabsTrigger 
                value="login" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent py-3 font-semibold text-muted-foreground transition-colors"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent py-3 font-semibold text-muted-foreground transition-colors"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 outline-none">
              <form onSubmit={handleSignIn} className="space-y-5">
                {error && <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="m@example.com" className="pl-11 h-12 rounded-xl bg-background" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-11 pr-11 h-12 rounded-xl bg-background" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button className="w-full h-12 text-base rounded-xl bg-[#009944] hover:bg-green-700 text-white transition-colors mt-2" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Sign in {isLoading ? "..." : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0 outline-none">
              <form onSubmit={handleSignUp} className="space-y-5">
                {error && <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input id="full_name" name="full_name" placeholder="John Doe" className="h-12 rounded-xl bg-background" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="register-email" name="email" type="email" placeholder="m@example.com" className="pl-11 h-12 rounded-xl bg-background" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="register-password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="pl-11 pr-11 h-12 rounded-xl bg-background" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full h-12 text-base rounded-xl bg-[#009944] hover:bg-green-700 text-white transition-colors mt-2" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Create account {isLoading ? "..." : <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">&copy; 2026 EcoTwin AI. All rights reserved.</p>
      </div>
    </div>
  )
}
