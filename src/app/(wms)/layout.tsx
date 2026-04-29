import { AppShellSidebar } from "@/components/layout/app-shell-sidebar"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { RealtimeRefresh } from "@/components/inventory/realtime-refresh"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

/** لا يُجمّد المحتوى أثناء `next build` لأن الصفحات تستدعي `requireUser` وقاعدة البيانات */
export const dynamic = "force-dynamic"

/**
 * تخطيط التطبيق بشريط جانبي يمين (RTL) + تحديث لحظي عند توفر Realtime
 */
export default function WmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellSidebar />
      <SidebarInset>
        <header
          className="border-border/60 bg-card/75 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-20 flex h-14 min-w-0 shrink-0 items-center justify-between gap-3 border-b px-3 shadow-[var(--wms-surface-elevated)] backdrop-blur-md sm:px-4"
        >
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="shrink-0" />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 flex-col gap-0 sm:flex-row sm:items-center sm:gap-2">
              <span className="bg-primary/15 text-primary ring-primary/25 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ring-1">
                <span className="text-xs font-black tracking-tighter">م</span>
              </span>
              <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                نظام المهند — إدارة المخازن
              </h1>
            </div>
          </div>
          <ThemeSwitcher variant="toolbar" />
        </header>
        <div className="wms-content-shell min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[90rem] px-3 py-6 sm:px-6 sm:py-8">{children}</div>
        </div>
      </SidebarInset>
      <RealtimeRefresh />
    </SidebarProvider>
  )
}
