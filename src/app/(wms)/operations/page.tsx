import { Suspense } from "react"
import { getOperationsPageData } from "@/lib/actions/inventory"
import { DailyOperationsForms } from "@/components/inventory/daily-operations-forms"
import { PageHeader } from "@/components/layout/page-header"
import { isInventoryAdmin } from "@/lib/auth/roles"
import { requireUser } from "@/lib/auth/require-user"
import { itemToClient, supplierToClient } from "@/lib/serialize-inventory"
import { OperationsPageSkeleton } from "@/components/layout/page-skeletons"

async function OperationsPageContent() {
  const user = await requireUser()
  const canManage = isInventoryAdmin(user)
  const { items, suppliers } = await getOperationsPageData()
  return (
    <DailyOperationsForms
      canManage={canManage}
      items={items.map(itemToClient)}
      suppliers={suppliers.map(supplierToClient)}
    />
  )
}

/** إدخال يومي: إضافة من مورد + سحب — معمل الاتحاد */
export default function OperationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="العمليات اليومية"
        description="إضافة مواد مع ربط المورد، وسحب يومي — يتحدّث الرصيد فوراً ويظهر في التقارير."
      />
      <Suspense fallback={<OperationsPageSkeleton />}>
        <OperationsPageContent />
      </Suspense>
    </div>
  )
}
