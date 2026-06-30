import Image from "next/image"
import { AppShellSidebar } from "@/components/layout/app-shell-sidebar"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { RealtimeRefresh } from "@/components/inventory/realtime-refresh"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { getServerUser } from "@/lib/auth/require-user"
import { canViewAuditLog } from "@/lib/auth/roles"

/** لا يُجمّد المحتوى أثناء `next build` لأن الصفحات تستدعي `requireUser` وقاعدة البيانات */
export const dynamic = "force-dynamic"

/**
 * تخطيط التطبيق بشريط جانبي يمين (RTL) + تحديث لحظي عند توفر Realtime
 */
export default async function WmsLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  const showAudit = canViewAuditLog(user)

  return (
    <SidebarProvider>
      <AppShellSidebar showAudit={showAudit} />
      <SidebarInset>
        <header
          className="border-border/60 bg-card/75 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-20 flex min-h-14 min-w-0 max-w-full shrink-0 items-center justify-between gap-2 overflow-x-clip border-b px-2 py-2 shadow-[var(--wms-surface-elevated)] backdrop-blur-md max-md:pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:gap-3 sm:px-4 sm:py-0"
        >
          <div className="flex min-w-0 max-w-full flex-1 items-center gap-2">
            <SidebarTrigger className="shrink-0 touch-manipulation" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <span className="relative inline-flex size-8 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-border/70 sm:size-9 sm:rounded-xl">
                <Image
                  src="/company-logo.png"
                  alt=""
                  fill
                  className="object-contain p-0.5 sm:p-1"
                  sizes="(max-width: 640px) 32px, 36px"
                />
              </span>
              <h1 className="line-clamp-2 min-w-0 text-xs font-semibold leading-snug tracking-tight text-foreground sm:line-clamp-1 sm:truncate sm:text-sm md:text-base">
                معمل الاتحاد — إدارة المخازن
              </h1>
            </div>
          </div>
          <ThemeSwitcher variant="toolbar" className="touch-manipulation" />
        </header>
        <div className="wms-content-shell min-w-0 flex-1 max-md:overflow-x-clip">
          <div className="mx-auto w-full min-w-0 max-w-[90rem] px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-8 sm:pb-8">
            {children}
          </div>
        </div>
      </SidebarInset>
      <RealtimeRefresh />
    </SidebarProvider>
  )
}
