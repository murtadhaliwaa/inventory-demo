"use client"

import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ITEMS_TABLE_MIN_WIDTH, itemsTableColumnClass } from "@/components/inventory/items-table-layout"

type ItemsTableDesktopProps = {
  table: TanStackTable<ItemForClient>
  columns: ColumnDef<ItemForClient>[]
}

export function ItemsTableDesktop({ table, columns }: ItemsTableDesktopProps) {
  return (
    <Table className={cn("w-full", ITEMS_TABLE_MIN_WIDTH, "md:min-w-0 md:table-fixed")}>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((h) => {
              const id = h.column.id
              return (
                <TableHead
                  key={h.id}
                  className={itemsTableColumnClass(id, "text-xs font-medium align-middle")}
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((r) => (
            <TableRow key={r.id}>
              {r.getVisibleCells().map((c) => {
                const id = c.column.id
                return (
                  <TableCell
                    key={c.id}
                    className={itemsTableColumnClass(id, "align-middle text-sm")}
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
  )
}
