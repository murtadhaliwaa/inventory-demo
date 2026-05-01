import { listSuppliers } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { SuppliersDataTable } from "@/components/inventory/suppliers-table"
import { supplierToClient } from "@/lib/serialize-inventory"
import { requireUser } from "@/lib/auth/require-user"
import { isInventoryAdmin } from "@/lib/auth/roles"

/** موردون: عرض وإضافة وتعديل */
export default async function SuppliersPage() {
  const user = await requireUser()
  const canManage = isInventoryAdmin(user)
  const suppliers = await listSuppliers()
  return (
    <div className="space-y-8">
      <PageHeader
        title="الموردون"
        description="إدارة التجار المرتبطين بحركات الإضافة."
      />
      <SuppliersDataTable suppliers={suppliers.map(supplierToClient)} canManage={canManage} />
    </div>
  )
}
