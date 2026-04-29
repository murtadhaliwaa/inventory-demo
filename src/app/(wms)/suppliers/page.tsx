import { listSuppliers } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { SuppliersDataTable } from "@/components/inventory/suppliers-table"
import { supplierToClient } from "@/lib/serialize-inventory"
import { requireUser } from "@/lib/auth/require-user"
import { canDeleteInventoryEntities } from "@/lib/auth/roles"

/** موردون: عرض وإضافة وتعديل — الحذف حسب WMS_ADMIN_EMAILS */
export default async function SuppliersPage() {
  const user = await requireUser()
  const canDelete = canDeleteInventoryEntities(user)
  const suppliers = await listSuppliers()
  return (
    <div className="space-y-8">
      <PageHeader
        title="الموردون"
        description="إدارة التجار المرتبطين بحركات الإضافة. الحذف متاح للمسؤولين فقط عند تعريف WMS_ADMIN_EMAILS."
      />
      <SuppliersDataTable suppliers={suppliers.map(supplierToClient)} canDelete={canDelete} />
    </div>
  )
}
