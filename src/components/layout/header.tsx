"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-8 w-full max-w-7xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span className="font-bold sm:inline-block">
              EcoTwin AI
            </span>
          </Link>
        </div>

        {/* Right: Nav Links + Theme + Profile */}
        <div className="flex items-center space-x-6">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/activities"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/activities" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Activities
            </Link>
          </nav>

          <div className="w-px h-5 bg-border"></div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}
