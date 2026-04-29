"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { TransactionType } from "@/generated/prisma"
import type { ItemForClient, SupplierForClient } from "@/lib/serialize-inventory"
import { recordTransactionAdd, recordTransactionWithdraw } from "@/lib/actions/inventory"
import { transactionAddSchema, transactionWithdrawSchema } from "@/lib/validations/inventory"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PackagePlus, PackageMinus } from "lucide-react"

type Props = {
  items: ItemForClient[]
  suppliers: SupplierForClient[]
}

/** نموذجا إضافة (مع مورد) وسحب — تحديث فوري للمخزون عبر Server Actions */
export function DailyOperationsForms({ items, suppliers }: Props) {
  if (items.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border/70 shadow-[var(--wms-surface-elevated)]">
        <CardHeader>
          <CardTitle className="text-base">العمليات اليومية</CardTitle>
          <CardDescription>
            أضف مادة واحدة على الأقل من صفحة «المواد» لتفعيل الإضافة والسحب.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AddMaterialsForm items={items} suppliers={suppliers} />
      <WithdrawMaterialsForm items={items} />
    </div>
  )
}

function AddMaterialsForm({ items, suppliers }: Props) {
  const router = useRouter()
  const [p, t] = useTransition()
  const [itemId, setItemId] = useState(() => items[0]?.id ?? "")
  const [supplierMode, setSupplierMode] = useState<"existing" | "new">(
    suppliers.length > 0 ? "existing" : "new"
  )
  const [supplierId, setSupplierId] = useState(() => suppliers[0]?.id ?? "")
  const idBase = useId()

  return (
    <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2 text-base">
          إضافة مواد
          <PackagePlus className="size-4 text-primary" />
        </CardTitle>
        <CardDescription>اختر التاجر من القائمة أو أدخل تاجراً جديداً مع الكمية</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4 text-right"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const raw = {
              itemId: itemId || (fd.get("itemId") as string),
              type: TransactionType.ADD,
              quantity: fd.get("quantity"),
              supplierId: supplierMode === "existing" ? supplierId : "",
              newSupplierName: supplierMode === "new" ? (fd.get("newSupplierName") as string) : "",
              newSupplierPhone: supplierMode === "new" ? (fd.get("newSupplierPhone") as string) : "",
              note: (fd.get("note") as string) ?? "",
            }
            const v = transactionAddSchema.safeParse(raw)
            if (!v.success) {
              toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
              return
            }
            t(async () => {
              const r = await recordTransactionAdd({
                itemId: v.data.itemId,
                quantity: v.data.quantity,
                supplierId: v.data.supplierId ?? "",
                newSupplierName: v.data.newSupplierName ?? "",
                newSupplierPhone: v.data.newSupplierPhone ?? "",
                note: v.data.note ?? "",
              })
              if (r.success) {
                toast.success("تم تسجيل الإضافة")
                router.refresh()
              } else {
                toast.error("error" in r ? r.error : "فشل التسجيل")
              }
            })
          }}
        >
          <input type="hidden" name="itemId" value={itemId} />
          <div className="space-y-2">
            <Label htmlFor={`${idBase}-item`}>المادة</Label>
            <Select
              value={itemId}
              onValueChange={setItemId}
              dir="rtl"
            >
              <SelectTrigger id={`${idBase}-item`} className="w-full">
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({itemUnitLabelFor(i.unit)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>المورد</Label>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                type="button"
                size="default"
                variant={supplierMode === "existing" ? "secondary" : "outline"}
                className="min-h-10 w-full touch-manipulation sm:w-auto"
                onClick={() => setSupplierMode("existing")}
                disabled={suppliers.length === 0}
              >
                من القائمة
              </Button>
              <Button
                type="button"
                size="default"
                variant={supplierMode === "new" ? "secondary" : "outline"}
                className="min-h-10 w-full touch-manipulation sm:w-auto"
                onClick={() => setSupplierMode("new")}
              >
                تاجر جديد
              </Button>
            </div>
            {supplierMode === "existing" && suppliers.length > 0 ? (
              <Select value={supplierId} onValueChange={setSupplierId} dir="rtl">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="المورد" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {supplierMode === "new" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${idBase}-ns`}>اسم التاجر</Label>
                  <Input
                    id={`${idBase}-ns`}
                    name="newSupplierName"
                    placeholder="مثال: شركة التوريد"
                    className="text-left"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${idBase}-ph`}>جوال (اختياري)</Label>
                  <Input
                    id={`${idBase}-ph`}
                    name="newSupplierPhone"
                    dir="ltr"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor={`${idBase}-q`}>الكمية</Label>
            <Input
              id={`${idBase}-q`}
              name="quantity"
              type="number"
              min="0"
              step="any"
              required
              className="font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idBase}-note`}>ملاحظة (اختياري)</Label>
            <Textarea id={`${idBase}-note`} name="note" rows={2} className="resize-none" />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={p}>
            {p ? "جاري الحفظ…" : "تسجيل الإضافة"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function WithdrawMaterialsForm({ items }: { items: ItemForClient[] }) {
  const router = useRouter()
  const [p, t] = useTransition()
  const [itemId, setItemId] = useState(() => items[0]?.id ?? "")
  const idBase = useId()

  return (
    <Card className="rounded-2xl border-border/60 shadow-[var(--wms-surface-elevated)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-end gap-2 text-base">
          سحب مواد
          <PackageMinus className="size-4 text-destructive" />
        </CardTitle>
        <CardDescription>تسجيل صرف يومي وتحديث الرصيد فوراً</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4 text-right"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const raw = {
              itemId: itemId || (fd.get("itemId") as string),
              type: TransactionType.WITHDRAW,
              quantity: fd.get("quantity"),
              note: (fd.get("note") as string) ?? "",
            }
            const v = transactionWithdrawSchema.safeParse(raw)
            if (!v.success) {
              toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
              return
            }
            t(async () => {
              const r = await recordTransactionWithdraw({
                itemId: v.data.itemId,
                quantity: v.data.quantity,
                note: v.data.note ?? "",
              })
              if (r.success) {
                toast.success("تم تسجيل السحب")
                router.refresh()
              } else {
                toast.error("error" in r ? r.error : "فشل التسجيل")
              }
            })
          }}
        >
          <input type="hidden" name="itemId" value={itemId} />
          <div className="space-y-2">
            <Label htmlFor={`${idBase}-witem`}>المادة</Label>
            <Select value={itemId} onValueChange={setItemId} dir="rtl">
              <SelectTrigger id={`${idBase}-witem`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} — رصيد {i.currentQuantity} {itemUnitLabelFor(i.unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idBase}-wq`}>الكمية المسحوبة</Label>
            <Input
              id={`${idBase}-wq`}
              name="quantity"
              type="number"
              min="0"
              step="any"
              required
              className="font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idBase}-wnote`}>ملاحظة (اختياري)</Label>
            <Textarea id={`${idBase}-wnote`} name="note" rows={2} className="resize-none" />
          </div>

          <Button type="submit" variant="destructive" className="w-full sm:w-auto" disabled={p}>
            {p ? "جاري الحفظ…" : "تسجيل السحب"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
