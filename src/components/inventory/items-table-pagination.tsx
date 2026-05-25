"use client"

import type { Table as TanStackTable } from "@tanstack/react-table"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { Button } from "@/components/ui/button"

type ItemsTablePaginationProps = {
  table: TanStackTable<ItemForClient>
  filteredTotal: number
  serverPagination?: { page: number; totalPages: number; total: number; pageSize: number }
}

export function ItemsTablePagination({
  table,
  filteredTotal,
  serverPagination,
}: ItemsTablePaginationProps) {
  const pageCount = table.getRowModel().rows.length

  return (
    <div className="text-muted-foreground border-t px-3 py-3 text-xs md:px-4 md:flex md:items-center md:justify-between">
      <div className="leading-relaxed">
        {serverPagination ? (
          <>
            عرض {pageCount} / {filteredTotal} في هذه الصفحة — من أصل {serverPagination.total} مادة (صفحة{" "}
            {serverPagination.page} / {serverPagination.totalPages})
          </>
        ) : (
          <>
            عرض {pageCount} / {filteredTotal} نتائج
          </>
        )}
      </div>
      <div className="mt-3 flex gap-2 md:mt-0">
        <Button
          type="button"
          size="default"
          variant="outline"
          className="min-h-11 flex-1 touch-manipulation md:min-h-9 md:flex-none"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          السابقة
        </Button>
        <Button
          type="button"
          size="default"
          variant="outline"
          className="min-h-11 flex-1 touch-manipulation md:min-h-9 md:flex-none"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          التالية
        </Button>
      </div>
    </div>
  )
}
