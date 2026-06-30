import { Suspense } from "react"
import { listItemsForReports } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { TablePageSkeleton } from "@/components/layout/page-skeletons"
import { ItemReportPicker } from "./item-report-picker"

async function ItemReportsPickerContent() {
  const items = await listItemsForReports()
  return <ItemReportPicker items={items} />
}

export default function ItemReportsIndexPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="تقارير المواد"
        description="اختر مادة لعرض تقريرها خلال فترة زمنية (يومي، أسبوعي، شهري، سنوي، أو مخصص)."
      />
      <Suspense fallback={<TablePageSkeleton />}>
        <ItemReportsPickerContent />
      </Suspense>
    </div>
  )
}
