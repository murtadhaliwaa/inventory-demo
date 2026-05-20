"use client"

import { useEffect, useState, type ReactNode } from "react"

/** يعرض المحتوى بعد التحميل في المتصفح فقط — يمنع أخطاء الهيدرشن */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return fallback
  return children
}
