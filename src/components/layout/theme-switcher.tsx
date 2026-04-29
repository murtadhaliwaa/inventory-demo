"use client"

import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "system", label: "مطابق لجهازك", hint: "تلقائي", Icon: Monitor },
  { value: "light", label: "نهاري", hint: "فاتح", Icon: Sun },
  { value: "dark", label: "ليلي", hint: "داكن", Icon: Moon },
] as const

type Variant = "toolbar" | "sidebar"

/**
 * اختيار المظهر (نهاري / ليلي / مطابق للجهاز) — يُستخدم في الرأس وصفحة الدخول.
 */
export function ThemeSwitcher({
  variant = "toolbar",
  className,
}: {
  variant?: Variant
  className?: string
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const active = theme ?? "system"
  const CurrentIcon =
    active === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant === "sidebar" ? "ghost" : "outline"}
          size={variant === "toolbar" ? "icon" : "icon-sm"}
          className={cn(
            "rounded-full shrink-0 border-sidebar-border/80",
            variant === "toolbar" && "h-10 w-10 min-h-10 min-w-10 sm:h-9 sm:w-9 sm:min-h-9 sm:min-w-9",
            variant === "sidebar" && "border border-transparent hover:bg-sidebar-accent",
            className
          )}
          aria-label="المظهر: نهاري أو ليلي أو مطابق للجهاز"
          aria-haspopup="menu"
        >
          <CurrentIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[13rem] p-0">
        <div dir="rtl" className="p-1">
          <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-normal">
            المظهر
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {OPTIONS.map(({ value, label, hint, Icon }) => (
            <DropdownMenuItem
              key={value}
              className="flex cursor-pointer flex-row-reverse items-center justify-between gap-2 py-2"
              onClick={() => setTheme(value)}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 text-right">
                <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <span className="flex min-w-0 flex-col gap-0 leading-tight">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground text-[11px]">{hint}</span>
                </span>
              </span>
              {active === value ? (
                <Check className="text-primary size-4 shrink-0" aria-hidden />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
