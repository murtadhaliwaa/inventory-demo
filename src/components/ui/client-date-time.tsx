"use client"

import { useEffect, useState } from "react"
import { formatDateTimeDmy, formatLocaleTime } from "@/lib/locale-display"

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
      showFullDateTime
        ? formatDateTimeDmy(d)
        : formatLocaleTime(d, { hour: "2-digit", minute: "2-digit", hour12: true })
    )
  }, [iso, showFullDateTime])

  return (
    <span dir="ltr" className={className} suppressHydrationWarning>
      {label || "\u00a0"}
    </span>
  )
}
