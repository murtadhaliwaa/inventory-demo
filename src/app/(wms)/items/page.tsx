import Link from "next/link"
import { listItemsPaged } from "@/lib/actions/inventory"
import { ItemsDataTable } from "@/components/inventory/items-table"
import { PageHeader } from "@/components/layout/page-header"
import { itemToClient } from "@/lib/serialize-inventory"
import { requireUser } from "@/lib/auth/require-user"
import { isInventoryAdmin } from "@/lib/auth/roles"
import { Button } from "@/components/ui/button"

/** تعريف المواد والوحدة */
export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const pageRaw = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const user = await requireUser()
  const canManage = isInventoryAdmin(user)
  const { rows, total, page, pageSize, totalPages } = await listItemsPaged({ page: pageRaw })

  return (
    <div className="space-y-8">
      <PageHeader
        title="المواد"
        description="تعريف الأصناف والوحدة."
      />
      <ItemsDataTable
        items={rows.map(itemToClient)}
        canManage={canManage}
        serverPagination={{ page, totalPages, total, pageSize }}
      />
      {totalPages > 1 ? (
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            صفحة {page} من {totalPages} — إجمالي {total} مادة
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/items?page=${page - 1}`}>السابق</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" disabled>
                السابق
              </Button>
            )}
            {page < totalPages ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href={`/items?page=${page + 1}`}>التالي</Link>
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" disabled>
                التالي
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
