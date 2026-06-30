import { Suspense } from "react"
import { getDashboardData } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { DashboardKpiGrids } from "@/components/dashboard/kpi-grids"
import { LowStockPanel } from "@/components/dashboard/low-stock-panel"
import { RecentMovementsPanel } from "@/components/dashboard/recent-movements-panel"
import { DashboardSkeleton } from "@/components/layout/page-skeletons"

async function DashboardContent() {
  const data = await getDashboardData()

  return (
    <>
      <DashboardKpiGrids data={data} />
      <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2 lg:items-start">
        <LowStockPanel lowStock={data.lowStock} />
        <RecentMovementsPanel transactions={data.recentTransactions} />
      </div>
    </>
  )
}

/** لوحة معمل الاتحاد: حركات اليوم، تنبيهات النقص، أحدث الحركات */
export default function DashboardPage() {
  return (
    <div className="min-w-0 max-w-full space-y-6 sm:space-y-8">
      <PageHeader
        title="لوحة التحكم"
        description="معمل الاتحاد — نظام إدارة المخازن: حركات اليوم، تنبيهات النقص، وأحدث السجلات."
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
