"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md"
}

function Toggle({ checked, onChange, disabled, size = "sm" }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-green-500" : "bg-slate-200",
        size === "sm" ? "h-5 w-9" : "h-6 w-11"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          checked
            ? size === "sm"
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-0"
        )}
      />
    </button>
  )
}

export { Toggle }
