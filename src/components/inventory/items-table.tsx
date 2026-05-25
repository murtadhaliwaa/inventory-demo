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
import { ItemMobileCard } from "@/components/inventory/items-mobile-card"
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

  const pageItems = table.getRowModel().rows.map((r) => r.original)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <Label className="text-muted-foreground text-xs" htmlFor="f-name">
            فلترة الاسم
          </Label>
          <Input
            id="f-name"
            className="mt-1.5 min-h-11"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نص داخل اسم المادة"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 md:flex md:flex-wrap md:items-end md:justify-end">
          <div className="min-w-0">
            <Label className="text-muted-foreground text-xs" htmlFor="f-unit">
              الوحدة
            </Label>
            <Select
              value={unitFilter}
              onValueChange={(v) => setUnitFilter(v as typeof unitFilter)}
              dir="rtl"
            >
              <SelectTrigger id="f-unit" className="mt-1.5 min-h-11 w-full min-[400px]:w-[8.5rem]">
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
          <Button
            type="button"
            size="default"
            variant="secondary"
            asChild
            className="min-h-11 w-full touch-manipulation gap-1.5 md:min-h-9 md:w-auto"
          >
            <Link href="/operations">
              <ClipboardList className="size-4 shrink-0" />
              العمليات اليومية
            </Link>
          </Button>
          {canManage ? (
            <div className="flex min-[400px]:col-span-2 md:col-span-1 [&_button]:min-h-11 [&_button]:w-full md:[&_button]:w-auto">
              <CreateItemButton />
            </div>
          ) : null}
        </div>
      </div>

      {/* موبايل: بطاقات */}
      <div className="space-y-3 md:hidden">
        {pageItems.length > 0 ? (
          pageItems.map((item) => (
            <ItemMobileCard key={item.id} item={item} canManage={canManage} />
          ))
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            لا تطابقات
          </p>
        )}
        <ItemsTablePagination
          table={table}
          filteredTotal={rows.length}
          serverPagination={serverPagination}
        />
      </div>

      {/* سطح المكتب: جدول */}
      <div className="wms-panel hidden overflow-x-auto p-0 md:block">
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
