"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClientSupabase } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/env"

/**
 * يسمع تغييرات `items` و`transactions` (إن وُفّر Supabase + تفعيل Realtime في المشروع)
 * ويُعيد تحميل الـ RSC.
 */
export function RealtimeRefresh() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!isSupabaseConfigured() || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const supabase = createBrowserClientSupabase()
    const refresh = () => {
      void router.refresh()
    }
    const c = supabase
      .channel("wms-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        refresh
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(c)
    }
  }, [router, ready])
  return null
}
