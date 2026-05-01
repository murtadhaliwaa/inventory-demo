"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variant = "toolbar" | "sidebar"

function runWithViewTransition(fn: () => void) {
  const d = document as Document & {
    startViewTransition?: (callback: () => void) => void
  }
  if (typeof d.startViewTransition === "function") {
    d.startViewTransition(() => {
      fn()
    })
  } else {
    fn()
  }
}

/**
 * تبديل المظهر نهاري ↔ ليلي بضغطة واحدة، مع حركة للأيقونة ودعم View Transitions عند توفره.
 */
export function ThemeSwitcher({
  variant = "toolbar",
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark"
    runWithViewTransition(() => {
      setTheme(next)
      setBurst((n) => n + 1)
    })
  }, [isDark, setTheme])

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size={variant === "toolbar" ? "icon" : "icon-sm"}
        className={cn(
          "rounded-full",
          variant === "toolbar" && "h-10 w-10 min-h-10 min-w-10 sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9",
          className
        )}
        disabled
        aria-hidden
      />
    )
  }

  return (
    <Button
      type="button"
      variant={variant === "sidebar" ? "ghost" : "outline"}
      size={variant === "toolbar" ? "icon" : "icon-sm"}
      onClick={toggle}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border-sidebar-border/80 transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.94] motion-safe:active:scale-[0.92]",
        variant === "toolbar" &&
          "h-10 w-10 min-h-10 min-w-10 shadow-sm hover:shadow-md sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9",
        variant === "sidebar" && "border border-transparent hover:bg-sidebar-accent",
        className
      )}
      aria-label={isDark ? "التبديل إلى المظهر النهاري" : "التبديل إلى المظهر الليلي"}
    >
      <span
        key={burst}
        className={cn(
          "pointer-events-none flex size-full items-center justify-center",
          burst > 0 && "wms-theme-toggle-burst"
        )}
        aria-hidden
      >
        {isDark ? <Moon className="size-4" strokeWidth={2} /> : <Sun className="size-4" strokeWidth={2} />}
      </span>
    </Button>
  )
}
