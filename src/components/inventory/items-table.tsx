"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import type { ItemForClient } from "@/lib/serialize-inventory"
import type { ItemUnit } from "@/lib/item-unit"
import { parseItemUnit } from "@/lib/item-unit"
import { CreateItemButton } from "@/components/inventory/item-form-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList } from "lucide-react"
import { buildItemsTableColumns } from "@/components/inventory/items-table-columns"
import { ItemsTableDesktop } from "@/components/inventory/items-table-desktop"
import { ItemsTablePagination } from "@/components/inventory/items-table-pagination"

const pageSize = 8

export function ItemsDataTable({
  items: src,
  canManage = true,
  serverPagination,
}: {
  items: ItemForClient[]
  canManage?: boolean
  serverPagination?: { page: number; totalPages: number; total: number; pageSize: number }
}) {
  const [q, setQ] = useState("")
  const [unitFilter, setUnitFilter] = useState<"all" | ItemUnit>("all")
  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return src.filter((i) => {
      const okN = !qq || i.name.toLowerCase().includes(qq)
      const okU = unitFilter === "all" || parseItemUnit(i.unit) === unitFilter
      return okN && okU
    })
  }, [src, q, unitFilter])

  const columns = useMemo(() => buildItemsTableColumns(canManage), [canManage])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap items-stretch justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 sm:max-w-sm">
          <Label className="text-muted-foreground text-xs" htmlFor="f-name">
            فلترة الاسم
          </Label>
          <Input
            id="f-name"
            className="mt-1.5"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نص داخل اسم المادة"
          />
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <div>
            <Label className="text-muted-foreground text-xs" htmlFor="f-unit">
              الوحدة
            </Label>
            <Select
              value={unitFilter}
              onValueChange={(v) => setUnitFilter(v as typeof unitFilter)}
              dir="rtl"
            >
              <SelectTrigger id="f-unit" className="mt-1.5 w-[8.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="TON">طن</SelectItem>
                <SelectItem value="KG">كيلو</SelectItem>
                <SelectItem value="PIECE">قطعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" variant="secondary" asChild className="gap-1.5">
            <Link href="/operations">
              <ClipboardList className="size-3.5" />
              العمليات اليومية
            </Link>
          </Button>
          {canManage ? <CreateItemButton /> : null}
        </div>
      </div>

      <div className="wms-panel overflow-x-auto overflow-y-visible p-0">
        <p className="text-muted-foreground border-b px-3 py-2 text-[11px] md:hidden">
          اسحب أفقياً لعرض كل الأعمدة
        </p>
        <ItemsTableDesktop table={table} columns={columns} />
        <ItemsTablePagination
          table={table}
          filteredTotal={rows.length}
          serverPagination={serverPagination}
        />
      </div>
    </div>
  )
}
