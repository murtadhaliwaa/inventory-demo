"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClientSupabase } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/env"

const REFRESH_DEBOUNCE_MS = 800

/**
 * يسمع تغييرات `items` و`transactions` (إن وُفّر Supabase + تفعيل Realtime في المشروع)
 * ويُعيد تحميل الـ RSC بعد تأخير قصير لتجميع التحديثات المتتالية.
 */
export function RealtimeRefresh() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured() || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    const scheduleRefresh = () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
      }
      refreshTimer.current = setTimeout(() => {
        refreshTimer.current = null
        void router.refresh()
      }, REFRESH_DEBOUNCE_MS)
    }

    const supabase = createBrowserClientSupabase()
    const c = supabase
      .channel("wms-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, scheduleRefresh)
      .subscribe()

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current)
      }
      void supabase.removeChannel(c)
    }
  }, [router, ready])

  return null
}
