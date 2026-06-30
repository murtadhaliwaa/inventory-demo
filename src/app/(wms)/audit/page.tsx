import { listRecentAuditLogsForAdmin } from "@/lib/actions/inventory"
import { PageHeader } from "@/components/layout/page-header"
import { formatDateTimeDmy } from "@/lib/locale-display"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ACTION_LABELS: Record<string, string> = {
  ITEM_CREATE: "إنشاء مادة",
  ITEM_UPDATE: "تعديل مادة",
  ITEM_DELETE: "حذف مادة",
  SUPPLIER_CREATE: "إنشاء مورد",
  SUPPLIER_UPDATE: "تعديل مورد",
  SUPPLIER_DELETE: "حذف مورد",
  TRANSACTION_ADD: "إضافة مخزون",
  TRANSACTION_WITHDRAW: "سحب مخزون",
}

export default async function AuditLogPage() {
  const rows = await listRecentAuditLogsForAdmin(150)

  return (
    <div className="space-y-8">
      <PageHeader
        title="سجل التدقيق"
        description="آخر العمليات الحساسة: من نفّذها ومتى (للمشرفين فقط)."
      />

      <div className="wms-panel overflow-x-auto p-0">
        {rows.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">لا توجد سجلات بعد.</p>
        ) : (
          <Table className="min-w-[40rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">الزمن</TableHead>
                <TableHead className="text-start">المستخدم</TableHead>
                <TableHead className="text-start">الإجراء</TableHead>
                <TableHead className="text-start">الكيان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    <span dir="ltr" className="inline-block tabular-nums">
                      {formatDateTimeDmy(r.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{r.userEmail ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {ACTION_LABELS[r.action] ?? r.action}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {r.entityType}
                    {r.entityId ? ` · ${r.entityId.slice(0, 8)}…` : ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
