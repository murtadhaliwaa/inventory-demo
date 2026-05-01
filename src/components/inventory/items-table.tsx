"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable, flexRender } from "@tanstack/react-table"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { formatDecimalQuantity } from "@/lib/format"
import type { ItemUnit } from "@/lib/item-unit"
import { itemUnitLabelFor, parseItemUnit } from "@/lib/item-unit"
import { CreateItemButton, DeleteItemButton, EditItemButton } from "@/components/inventory/item-form-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const columns: ColumnDef<ItemForClient>[] = useMemo(() => {
    const base: ColumnDef<ItemForClient>[] = [
      { accessorKey: "name", header: "الاسم" },
      {
        accessorKey: "unit",
        header: "الوحدة",
        cell: (ctx) => {
          const raw = ctx.getValue() as string
          return (
            <Badge variant="outline" className="text-xs">
              {itemUnitLabelFor(raw)}
            </Badge>
          )
        },
      },
      {
        id: "bal",
        header: "الرصيد",
        cell: (ctx) => {
          const r = ctx.row.original
          return (
            <span className="font-mono text-sm tabular-nums" dir="ltr">
              {formatDecimalQuantity(r.currentQuantity)} {itemUnitLabelFor(r.unit)}
            </span>
          )
        },
      },
      {
        id: "safety",
        header: "حد الإنذار",
        cell: (ctx) => {
          const r = ctx.row.original
          return (
            <span className="text-muted-foreground font-mono text-sm tabular-nums" dir="ltr">
              {formatDecimalQuantity(r.minThreshold)} {itemUnitLabelFor(r.unit)}
            </span>
          )
        },
      },
    ]
    if (!canManage) return base
    return [
      ...base,
      {
        id: "ops",
        header: "إدارة",
        cell: (ctx) => {
          const r = ctx.row.original
          return (
            <div className="flex flex-row items-center justify-center gap-1.5">
              <EditItemButton item={r} canManage={canManage} />
              <DeleteItemButton nameDisplay={r.name} itemId={r.id} canManage={canManage} />
            </div>
          )
        },
        enableHiding: false,
      },
    ]
  }, [canManage])

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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => {
                  const id = h.column.id
                  const headAlign =
                    id === "ops" ? "text-center" : id === "bal" || id === "safety" ? "text-end" : "text-start"
                  return (
                    <TableHead
                      key={h.id}
                      className={cn("text-xs font-medium", headAlign)}
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((r) => (
                <TableRow key={r.id} data-state={r.getIsSelected() && "selected"}>
                  {r.getVisibleCells().map((c) => {
                    const id = c.column.id
                    const cellAlign =
                      id === "ops" ? "text-center" : id === "bal" || id === "safety" ? "text-end" : "text-start"
                    return (
                      <TableCell
                        key={c.id}
                        className={cn(
                          "align-top text-sm",
                          cellAlign
                        )}
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-sm text-muted-foreground"
                >
                  لا تطابقات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="text-muted-foreground border-t px-2 py-2.5 text-xs sm:flex sm:items-center sm:justify-between">
          <div>
            {serverPagination ? (
              <>
                عرض الجدول: {table.getRowModel().rows.length} / {rows.length} في هذه الصفحة — من أصل{" "}
                {serverPagination.total} مادة (صفحة {serverPagination.page} / {serverPagination.totalPages})
              </>
            ) : (
              <>
                عرض {table.getRowModel().rows.length} / {rows.length} نتائج
              </>
            )}
          </div>
          <div className="mt-2 flex gap-2 sm:mt-0">
            <Button
              type="button"
              size="default"
              variant="outline"
              className="min-h-10 touch-manipulation sm:min-h-9"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              السابقة
            </Button>
            <Button
              type="button"
              size="default"
              variant="outline"
              className="min-h-10 touch-manipulation sm:min-h-9"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالية
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
