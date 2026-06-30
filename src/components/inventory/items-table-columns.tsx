"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { DeleteItemButton, EditItemButton } from "@/components/inventory/item-form-dialogs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileBarChart } from "lucide-react"
import { ITEMS_TABLE_COLUMN_ORDER } from "@/components/inventory/items-table-layout"

/** تعريف أعمدة جدول المواد (مشترك بين سطح المكتب والمنطق) */
export function buildItemsTableColumns(
  canManage: boolean,
  canDelete: boolean
): ColumnDef<ItemForClient>[] {
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
            {formatDecimalQuantity(r.currentQuantity)}
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
            {formatDecimalQuantity(r.minThreshold)}
          </span>
        )
      },
    },
    {
      id: "report",
      header: "تقرير",
      cell: (ctx) => {
        const r = ctx.row.original
        return (
          <div className="flex justify-center">
            <Button type="button" size="sm" variant="outline" asChild className="gap-1.5">
              <Link href={`/reports/items/${r.id}`}>
                <FileBarChart className="size-3.5" aria-hidden />
                تقرير
              </Link>
            </Button>
          </div>
        )
      },
    },
    {
      id: "ops",
      header: "إدارة",
      cell: (ctx) => {
        const r = ctx.row.original
        return (
          <div className="flex flex-row items-center justify-center gap-1.5">
            <EditItemButton item={r} canManage={canManage} />
            <DeleteItemButton nameDisplay={r.name} itemId={r.id} canDelete={canDelete} />
          </div>
        )
      },
      enableHiding: false,
    },
  ]

  const byId = Object.fromEntries(
    base.map((c) => {
      const key = c.id ?? ("accessorKey" in c ? String(c.accessorKey) : "")
      return [key, c]
    })
  )
  const order = canManage || canDelete
    ? ITEMS_TABLE_COLUMN_ORDER
    : ITEMS_TABLE_COLUMN_ORDER.filter((id) => id !== "ops")
  return order.map((id) => byId[id]).filter(Boolean) as ColumnDef<ItemForClient>[]
}
