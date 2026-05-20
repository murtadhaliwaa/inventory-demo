import { listItemsForReports } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { ItemReportPicker } from "./item-report-picker"

export default async function ItemReportsIndexPage() {
  const items = await listItemsForReports()

  return (
    <div className="space-y-8">
      <PageHeader
        title="تقارير المواد"
        description="اختر مادة لعرض تقريرها خلال فترة زمنية (يومي، أسبوعي، شهري، سنوي، أو مخصص)."
      />

      <ItemReportPicker items={items} />
    </div>
  )
}
