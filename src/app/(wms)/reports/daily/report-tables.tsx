"use client"

import { useMemo, useState } from "react"
import { TransactionType } from "@/generated/prisma"
import type { DailyMovementForClient } from "@/lib/serialize-inventory"
import { ColumnDef, getCoreRowModel, getPaginationRowModel, useReactTable, flexRender } from "@tanstack/react-table"
import { formatDecimalQuantity, directionLabelFromTransactionType } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClientDateTime } from "@/components/ui/client-date-time"
import { cn } from "@/lib/utils"
import { supplierCountryLabelAr } from "@/lib/supplier-country"
import { CountryFlag } from "@/components/inventory/country-flag"

/** جدول حركات الفترة مع فلترة */
export function DailyAllMovements({
  rows: src,
  showFullDateTime = false,
}: {
  rows: DailyMovementForClient[]
  showFullDateTime?: boolean
}) {
  const [nameQ, setN] = useState("")
  const [dir, setD] = useState<"all" | TransactionType>("all")

  const data = useMemo(() => {
    const q = nameQ.trim().toLowerCase()
    return src.filter((r) => {
      const n = !q || r.item.name.toLowerCase().includes(q)
      const b = dir === "all" || r.type === dir
      return n && b
    })
  }, [src, nameQ, dir])

  const columns: ColumnDef<DailyMovementForClient>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: showFullDateTime ? "التاريخ والوقت" : "الوقت",
        cell: (c) => (
          <ClientDateTime
            iso={String(c.getValue())}
            showFullDateTime={showFullDateTime}
            className="whitespace-nowrap text-xs"
          />
        ),
      },
      {
        id: "item",
        header: "المادة",
        cell: (c) => <span className="font-medium">{c.row.original.item.name}</span>,
      },
      {
        id: "supplier",
        header: "المورد",
        cell: (c) => {
          const s = c.row.original.supplier
          if (c.row.original.type === TransactionType.WITHDRAW) {
            return <span className="text-muted-foreground text-xs">—</span>
          }
          return (
            <span className="inline-flex items-center gap-1 text-sm">
              {s ? (
                <>
                  <span className="shrink-0" aria-hidden title={supplierCountryLabelAr(s.countryCode)}>
                    <CountryFlag code={s.countryCode} size={18} />
                  </span>
                  <span className="min-w-0">{s.name}</span>
                </>
              ) : (
                "—"
              )}
            </span>
          )
        },
      },
      {
        id: "unit",
        header: "الوحدة",
        cell: (c) => (
          <Badge variant="outline" className="text-[10px]">
            {itemUnitLabelFor(c.row.original.item.unit)}
          </Badge>
        ),
      },
      {
        accessorKey: "type",
        header: "النوع",
        cell: (c) => {
          const d = c.getValue() as TransactionType
          return (
            <Badge variant={d === TransactionType.ADD ? "default" : "secondary"}>
              {directionLabelFromTransactionType(d)}
            </Badge>
          )
        },
      },
      {
        id: "qty",
        header: "الكمية",
        cell: (c) => {
          const o = c.row.original
          return (
            <span className="font-mono tabular-nums" dir="ltr">
              {formatDecimalQuantity(o.quantity)} {itemUnitLabelFor(o.item.unit)}
            </span>
          )
        },
      },
    ],
    [showFullDateTime]
  )

  const t = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  if (src.length === 0) {
    return <p className="text-muted-foreground text-sm">لا حركات اليوم.</p>
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 sm:max-w-sm">
          <Label className="text-muted-foreground text-xs" htmlFor="d-name">
            فلترة اسم
          </Label>
          <Input
            id="d-name"
            className="mt-1.5"
            value={nameQ}
            onChange={(e) => setN(e.target.value)}
            placeholder="جزء من اسم المادة"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs" htmlFor="d-d">
            النوع
          </Label>
          <Select value={dir} onValueChange={(v) => setD(v as typeof dir)} dir="rtl">
            <SelectTrigger id="d-d" className="mt-1.5 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value={TransactionType.ADD}>إضافة</SelectItem>
              <SelectItem value={TransactionType.WITHDRAW}>سحب</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-muted/20 max-h-96 overflow-auto rounded-md border p-0">
        <Table>
          <TableHeader>
            {t.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => {
                  const end = h.column.id === "qty"
                  return (
                    <TableHead
                      key={h.id}
                      className={cn("text-xs", end ? "text-end" : "text-start")}
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {t.getRowModel().rows.map((r) => (
              <TableRow key={r.id}>
                {r.getVisibleCells().map((c) => {
                  const end = c.column.id === "qty"
                  return (
                    <TableCell
                      key={c.id}
                      className={cn("text-sm", end ? "text-end" : "text-start")}
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          عرض {data.length} من {src.length}
        </span>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" onClick={() => t.previousPage()} disabled={!t.getCanPreviousPage()}>
            السابقة
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => t.nextPage()} disabled={!t.getCanNextPage()}>
            التالي
          </Button>
        </div>
      </div>
    </div>
  )
}
