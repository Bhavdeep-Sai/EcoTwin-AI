"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()

  if (pathname?.startsWith("/auth")) {
    return null
  }

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          <p className="text-sm leading-loose text-center md:text-left text-muted-foreground">
            Built by{" "}
            <Link
              href="https://bhavdeepsai.tech"
              className="font-medium underline underline-offset-4"
            >
              Bhavdeep Sai
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/Bhavdeep-Sai/EcoTwin-AI"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
