import { Suspense } from "react"
import { listSuppliers } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { SuppliersDataTable } from "@/components/inventory/suppliers-table"
import { supplierToClient } from "@/lib/serialize-inventory"
import { requireUser } from "@/lib/auth/require-user"
import { isInventoryAdmin } from "@/lib/auth/roles"
import { TablePageSkeleton } from "@/components/layout/page-skeletons"

async function SuppliersPageContent() {
  const user = await requireUser()
  const canManage = isInventoryAdmin(user)
  const suppliers = await listSuppliers()
  return (
    <SuppliersDataTable suppliers={suppliers.map(supplierToClient)} canManage={canManage} />
  )
}

/** موردون: عرض وإضافة وتعديل */
export default function SuppliersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="الموردون"
        description="إدارة التجار المرتبطين بحركات الإضافة."
      />
      <Suspense fallback={<TablePageSkeleton />}>
        <SuppliersPageContent />
      </Suspense>
    </div>
  )
}
