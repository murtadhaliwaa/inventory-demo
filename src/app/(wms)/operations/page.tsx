import { getOperationsPageData } from "@/lib/actions/inventory"
import { DailyOperationsForms } from "@/components/inventory/daily-operations-forms"
import { PageHeader } from "@/components/layout/page-header"
import { isInventoryAdmin } from "@/lib/auth/roles"
import { requireUser } from "@/lib/auth/require-user"
import { itemToClient, supplierToClient } from "@/lib/serialize-inventory"

export const dynamic = "force-dynamic"

/** إدخال يومي: إضافة من مورد + سحب — معمل الاتحاد */
export default async function OperationsPage() {
  const user = await requireUser()
  const canManage = isInventoryAdmin(user)
  const { items, suppliers } = await getOperationsPageData()
  return (
    <div className="space-y-8">
      <PageHeader
        title="العمليات اليومية"
        description="إضافة مواد مع ربط المورد، وسحب يومي — يتحدّث الرصيد فوراً ويظهر في التقارير."
      />
      <DailyOperationsForms
        canManage={canManage}
        items={items.map(itemToClient)}
        suppliers={suppliers.map(supplierToClient)}
      />
    </div>
  )
}
