"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/env"

export type LoginState = { error: string } | null

/**
 * بريد + كلمة السر. النجاح يعيد المستخدم للواجهة الرئيسية.
 */
export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase غير مُهيأ" }
  }
  const email = (formData.get("email") as string)?.trim() ?? ""
  const password = (formData.get("password") as string) ?? ""
  if (!email || !password) {
    return { error: "أدخل البريد وكلمة السر" }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/", "layout")
  redirect("/")
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  redirect("/login")
}
