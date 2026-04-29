import { Factory } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/env"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { LoginForm } from "./login-form"

/**
 * دخول عند تفعيل Supabase؛ بلا إعداد — يحيل للوحة (يفترض الـ dev bypass في الخادم)
 */
export default function LoginPage() {
  return (
    <div className="bg-background relative grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" dir="rtl">
      <div className="fixed top-3 start-3 z-50 sm:top-4 sm:start-4">
        <ThemeSwitcher variant="toolbar" />
      </div>
      <div className="from-primary/90 relative hidden flex-col justify-between overflow-hidden bg-gradient-to-bl via-amber-700/85 to-stone-900 p-10 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex items-start gap-3">
          <span className="bg-primary-foreground/15 ring-primary-foreground/20 flex size-12 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm">
            <Factory className="size-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-bold tracking-tight">شركة المهند</p>
            <p className="text-primary-foreground/85 text-sm leading-relaxed">
              نظام إدارة المخازن — مواد خام، منتجات نهائية، وموردون في مكان واحد.
            </p>
          </div>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          WMS · طن · كيلو · قطعة · تنبيهات نقص · تقارير يومية
        </p>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="border-border/70 bg-card/95 w-full max-w-md rounded-2xl border p-6 text-right shadow-[var(--wms-surface-mid)] backdrop-blur-sm sm:p-8">
          <div className="wms-page-accent-line mb-4 w-14" aria-hidden />
          <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">دخول إلى النظام</h1>
          <p className="text-muted-foreground mt-1 text-sm">نظام المهند — إدارة المخازن</p>
          {isSupabaseConfigured() ? (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              استخدم البريد وكلمة السر (Supabase Auth).
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-amber-800 dark:text-amber-400/95">
              لم تُهيأ مفاتيح Supabase — أضف متغيّرات <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> ثم
              أعِد التشغيل. في التطوير يُسمَح باستخدام التطبيق بدون تسجيل دخول.
            </p>
          )}
          {isSupabaseConfigured() && (
            <div className="mt-6">
              <LoginForm />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
