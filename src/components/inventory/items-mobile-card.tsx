"use client"

import Link from "next/link"
import { FileBarChart } from "lucide-react"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { formatDecimalQuantity } from "@/lib/format"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { EditItemButton, DeleteItemButton } from "@/components/inventory/item-form-dialogs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ItemMobileCardProps = {
  item: ItemForClient
  canManage?: boolean
}

/** بطاقة مادة واحدة — ترتيب: الاسم، الوحدة، الرصيد، حد الإنذار، تقرير، إدارة */
export function ItemMobileCard({ item, canManage = true }: ItemMobileCardProps) {
  return (
    <article className="rounded-xl border border-border/60 bg-card p-4 shadow-[var(--wms-surface-elevated)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
          {item.name}
        </h3>
        <Badge variant="outline" className="shrink-0 text-xs">
          {itemUnitLabelFor(item.unit)}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="min-w-0">
          <dt className="text-muted-foreground mb-1 text-xs font-medium">الرصيد</dt>
          <dd className="font-mono text-base font-semibold tabular-nums text-foreground" dir="ltr">
            {formatDecimalQuantity(item.currentQuantity)}
          </dd>
        </div>
        <div className="min-w-0 text-end">
          <dt className="text-muted-foreground mb-1 text-xs font-medium">حد الإنذار</dt>
          <dd className="font-mono text-base tabular-nums text-muted-foreground" dir="ltr">
            {formatDecimalQuantity(item.minThreshold)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-h-11 w-full touch-manipulation gap-1.5 sm:min-h-10 sm:flex-1"
          asChild
        >
          <Link href={`/reports/items/${item.id}`}>
            <FileBarChart className="size-4 shrink-0" aria-hidden />
            تقرير
          </Link>
        </Button>
        {canManage ? (
          <div className="flex w-full gap-2 sm:w-auto">
            <div className="flex flex-1 gap-2">
              <EditItemButton item={item} canManage={canManage} />
              <DeleteItemButton nameDisplay={item.name} itemId={item.id} canManage={canManage} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}
