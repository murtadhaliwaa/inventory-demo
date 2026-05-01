import { isSupabaseConfigured } from "@/lib/env"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { LoginForm } from "./login-form"

/**
 * دخول عند تفعيل Supabase؛ بلا إعداد — يحيل للوحة (يفترض الـ dev bypass في الخادم)
 */
export default function LoginPage() {
  return (
    <div
      className="bg-background relative grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      dir="rtl"
    >
      <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] start-[max(0.75rem,env(safe-area-inset-left))] z-50 sm:top-4 sm:start-4">
        <ThemeSwitcher variant="toolbar" />
      </div>
      <div className="from-primary/90 relative hidden overflow-hidden bg-gradient-to-bl via-amber-700/85 to-stone-900 text-primary-foreground lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto w-full max-w-md text-right">
          <div className="mb-6 h-1 w-14 rounded-full bg-primary-foreground/90 shadow-sm" aria-hidden />
          <section className="space-y-6" aria-labelledby="login-hero-title">
            <div className="space-y-4">
              <h2
                id="login-hero-title"
                className="text-[1.65rem] font-bold leading-[1.25] tracking-tight sm:text-3xl sm:leading-tight"
              >
                معمل الاتحاد
              </h2>
              <div className="space-y-3 border-primary-foreground/20 border-s-2 ps-5">
                <p className="text-primary-foreground text-base font-semibold leading-snug sm:text-lg">
                  نظام إدارة المخازن
                </p>
                <p className="text-primary-foreground/85 max-w-[26rem] text-sm leading-[1.85] sm:text-[0.9375rem]">
                  مواد خام، منتجات نهائية، وموردون في مكان واحد.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/[0.07] px-4 py-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:px-5 sm:py-5">
              <p className="text-primary-foreground/70 mb-3 text-xs font-medium tracking-wide">ما يوفّره النظام</p>
              <ul className="space-y-2.5 text-sm leading-relaxed text-primary-foreground/92 sm:text-[0.9375rem]">
                <li className="flex items-start gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-foreground/75 ring-2 ring-primary-foreground/25"
                    aria-hidden
                  />
                  <span>تنبيهات نقص الكميات</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-foreground/75 ring-2 ring-primary-foreground/25"
                    aria-hidden
                  />
                  <span>تقارير يومية</span>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-foreground/75 ring-2 ring-primary-foreground/25"
                    aria-hidden
                  />
                  <span>تتبّع المخزون</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-8">
        <div className="border-border/70 bg-card/95 w-full max-w-md rounded-2xl border p-5 text-right shadow-[var(--wms-surface-mid)] backdrop-blur-sm sm:p-8">
          <div className="wms-page-accent-line mb-4 w-14" aria-hidden />
          <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-xl md:text-2xl">دخول إلى النظام</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">معمل الاتحاد — إدارة المخازن</p>
          {!isSupabaseConfigured() && (
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
