"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

/**
 * مزوّدات واجهة: الوضع الليلي + التلميحات + الإشعارات
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={0}>
        {children}
        <Toaster
          position="top-center"
          className="font-sans"
          toastOptions={{ duration: 4500, className: "font-sans" }}
        />
      </TooltipProvider>
    </ThemeProvider>
  )
}
