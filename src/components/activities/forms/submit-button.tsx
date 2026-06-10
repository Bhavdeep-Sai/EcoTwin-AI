"use client"

import { useFormStatus } from "react-dom"
import { Loader2, Leaf } from "lucide-react"

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-[15px] flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20 hover:-translate-y-[2px] active:translate-y-[1px] disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-white/20 group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
      
      {pending ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Leaf className="w-6 h-6" />
      )}
      <span>{pending ? "Logging..." : "Log Activity"}</span>
    </button>
  )
}
