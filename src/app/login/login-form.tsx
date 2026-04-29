"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { type LoginState, signInWithPassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

function Sub() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending} size="lg">
      {pending ? "…" : "تسجيل الدخول"}
    </Button>
  )
}

/**
 * `signInWithPassword` يعيد { error } أو يعيد redirect (لا يصل للعميل)
 */
export function LoginForm() {
  const [st, act] = useActionState<LoginState, FormData>(signInWithPassword, null)
  useEffect(() => {
    if (st?.error) toast.error(st.error)
  }, [st])
  return (
    <form action={act} className="mt-4 space-y-3" dir="rtl">
      <div className="space-y-1.5 text-right">
        <Label htmlFor="em">البريد</Label>
        <Input
          name="email"
          id="em"
          type="email"
          autoComplete="email"
          required
          className="text-left"
        />
      </div>
      <div className="space-y-1.5 text-right">
        <Label htmlFor="pw">كلمة السر</Label>
        <Input
          name="password"
          id="pw"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <Sub />
    </form>
  )
}
