"use client"

import { useEffect, useState } from "react"
import { formatLocaleDateTime } from "@/lib/locale-display"

type ClientDateTimeProps = {
  iso: string
  showFullDateTime?: boolean
  className?: string
}

/** تنسيق وقت/تاريخ بعد التحميل لتجنّب اختلاف الهيدرشن بين الخادم والمتصفح */
export function ClientDateTime({ iso, showFullDateTime = false, className }: ClientDateTimeProps) {
  const [label, setLabel] = useState("")

  useEffect(() => {
    const d = new Date(iso)
    setLabel(
      formatLocaleDateTime(d, {
        ...(showFullDateTime
          ? { dateStyle: "short" as const, timeStyle: "short" as const }
          : { timeStyle: "short" as const }),
      })
    )
  }, [iso, showFullDateTime])

  return (
    <span dir="ltr" className={className} suppressHydrationWarning>
      {label || "\u00a0"}
    </span>
  )
}
