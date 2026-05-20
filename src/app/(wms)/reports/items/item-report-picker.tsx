"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FileBarChart } from "lucide-react"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ItemForClient } from "@/lib/serialize-inventory"

export function ItemReportPicker({ items }: { items: ItemForClient[] }) {
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return items
    return items.filter((i) => i.name.toLowerCase().includes(qq))
  }, [items, q])

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        لا توجد مواد مسجّلة. أضف مواداً من صفحة{" "}
        <Link href="/items" className="text-primary underline-offset-2 hover:underline">
          المواد
        </Link>{" "}
        أولاً.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <Label htmlFor="item-report-search" className="text-muted-foreground text-xs">
          بحث باسم المادة
        </Label>
        <Input
          id="item-report-search"
          className="mt-1.5"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جزء من الاسم…"
        />
      </div>

      <div className="wms-panel overflow-x-auto p-0">
        <Table dir="rtl" className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%] text-start">المادة</TableHead>
              <TableHead className="w-[14%] text-start">الوحدة</TableHead>
              <TableHead className="w-[22%] text-end">الرصيد الحالي</TableHead>
              <TableHead className="w-[32%] text-center">تقرير</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground h-16 text-center text-sm">
                  لا تطابقات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-start align-middle font-medium">{i.name}</TableCell>
                  <TableCell className="text-start align-middle">
                    <Badge variant="outline" className="text-xs">
                      {itemUnitLabelFor(i.unit)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle text-end">
                    <span className="font-mono text-sm font-semibold tabular-nums" dir="ltr">
                      {formatDecimalQuantity(i.currentQuantity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <Button type="button" size="sm" variant="secondary" asChild className="gap-1.5">
                      <Link href={`/reports/items/${i.id}`}>
                        <FileBarChart className="size-3.5" aria-hidden />
                        عرض التقرير
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground text-xs">
        عرض {filtered.length} من {items.length} مادة
      </p>
    </div>
  )
}
