import { listItems } from "@/lib/actions/inventory"
import { ItemsDataTable } from "@/components/inventory/items-table"
import { PageHeader } from "@/components/layout/page-header"
import { itemToClient } from "@/lib/serialize-inventory"

/** تعريف المواد وحد الإنذار والوحدة — السحب والإضافة من صفحة العمليات اليومية */
export default async function ItemsPage() {
  const items = await listItems()
  return (
    <div className="space-y-8">
      <PageHeader
        title="المواد"
        description="تعريف الأصناف والوحدة؛ تعديل حد الإنذار من عمود «إدارة» ← أيقونة التعديل. الحركات من «العمليات اليومية»."
      />
      <ItemsDataTable items={items.map(itemToClient)} />
    </div>
  )
}
