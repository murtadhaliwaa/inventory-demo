"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { createItem, updateItem, deleteItem } from "@/lib/actions/inventory"
import { itemCreateSchema, itemUpdateSchema } from "@/lib/validations/inventory"
import { ITEM_UNITS, itemUnitLabel, itemUnitLabelFor, parseItemUnit } from "@/lib/item-unit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function fieldsCreate(tId: string) {
  return (
    <>
      <div className="space-y-1.5 text-right">
        <Label htmlFor={`n-${tId}`}>اسم المادة</Label>
        <Input id={`n-${tId}`} name="name" required className="text-left" maxLength={200} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 text-right">
          <Label htmlFor={`min-${tId}`}>حد الإنذار (الحد الأدنى)</Label>
          <Input id={`min-${tId}`} name="minThreshold" type="number" min="0" step="any" required className="font-mono" dir="ltr" />
        </div>
        <div className="space-y-1.5 text-right">
          <Label htmlFor={`cur-${tId}`}>رصيد افتتاحي</Label>
          <Input id={`cur-${tId}`} name="currentQuantity" type="number" min="0" step="any" defaultValue="0" className="font-mono" dir="ltr" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <Label htmlFor={`u-${tId}`}>الوحدة</Label>
        <select
          id={`u-${tId}`}
          name="unit"
          className="bg-background border-input w-full rounded-md border px-3 py-2 text-sm"
          defaultValue="KG"
        >
          {ITEM_UNITS.map((u) => (
            <option key={u} value={u}>
              {itemUnitLabel[u]}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [p, t] = useTransition()
  const tId = useId()
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const v = itemCreateSchema.safeParse({
          name: fd.get("name"),
          minThreshold: fd.get("minThreshold"),
          currentQuantity: fd.get("currentQuantity"),
          unit: fd.get("unit"),
        })
        if (!v.success) {
          toast.error(v.error.issues[0]?.message ?? "بيانات غير صالحة")
          return
        }
        t(async () => {
          const r = await createItem(v.data)
          if (r.success) {
            toast.success("تمت الإضافة")
            onClose()
            router.refresh()
          } else {
            toast.error("error" in r ? (r as { error: string }).error : "فشل")
          }
        })
      }}
    >
      {fieldsCreate(tId)}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={p} className="min-w-24">
          {p ? "…" : "حفظ"}
        </Button>
      </div>
    </form>
  )
}

export function CreateItemButton() {
  const [open, set] = useState(false)
  return (
    <Dialog open={open} onOpenChange={set}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2" size="sm">
          <Plus className="size-3.5" />
          إضافة مادة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-right">
          <DialogTitle>مادة جديدة</DialogTitle>
          <DialogDescription>رصيد افتتاحي أكبر من صفر يُسجَّل كإضافة «رصيد افتتاحي»</DialogDescription>
        </DialogHeader>
        <CreateForm onClose={() => set(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditForm({ item, onClose }: { item: ItemForClient; onClose: () => void }) {
  const router = useRouter()
  const [p, t] = useTransition()
  const tId = useId()
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const v = itemUpdateSchema.safeParse({
          id: item.id,
          name: fd.get("name"),
          minThreshold: fd.get("minThreshold"),
          unit: fd.get("unit"),
        })
        if (!v.success) {
          toast.error(v.error.issues[0]?.message ?? "بيانات غير صالحة")
          return
        }
        t(async () => {
          const r = await updateItem(v.data)
          if (r.success) {
            toast.success("تُمّ التعديل")
            onClose()
            router.refresh()
          } else {
            toast.error("error" in r ? (r as { error: string }).error : "فشل")
          }
        })
      }}
    >
      <input name="id" type="hidden" value={item.id} readOnly />
      <div className="space-y-1.5 text-right">
        <Label htmlFor={`n2-${tId}`}>الاسم</Label>
        <Input id={`n2-${tId}`} name="name" defaultValue={item.name} required className="text-left" maxLength={200} />
      </div>
      <div className="space-y-1.5 text-right">
        <Label htmlFor={`min2-${tId}`}>حد الإنذار (الحد الأدنى لهذه المادة)</Label>
        <Input
          id={`min2-${tId}`}
          name="minThreshold"
          type="number"
          min="0"
          step="any"
          className="font-mono"
          defaultValue={item.minThreshold}
          required
          dir="ltr"
        />
      </div>
      <div className="space-y-1.5 text-right">
        <Label>الرصيد (قراءة فقط)</Label>
        <p className="text-muted-foreground text-sm" dir="ltr">
          {item.currentQuantity} {itemUnitLabelFor(item.unit)} — يُحدَّث من العمليات اليومية
        </p>
      </div>
      <div className="space-y-1.5 text-right">
        <Label htmlFor={`u2-${tId}`}>الوحدة</Label>
        <select
          id={`u2-${tId}`}
          name="unit"
          className="bg-background border-input w-full rounded-md border px-3 py-2 text-sm"
          defaultValue={parseItemUnit(item.unit)}
        >
          {ITEM_UNITS.map((u) => (
            <option key={u} value={u}>
              {itemUnitLabel[u]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={p} className="min-w-24">
          {p ? "…" : "تعديل"}
        </Button>
      </div>
    </form>
  )
}

export function EditItemButton({ item }: { item: ItemForClient }) {
  const [open, set] = useState(false)
  return (
    <Dialog open={open} onOpenChange={set}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm" className="h-7 w-7" aria-label="تعديل">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-right">
          <DialogTitle>تعديل مادة</DialogTitle>
          <DialogDescription>
            الحد الأدنى للإنذار يُحدَّد لكل مادة حسب احتياجها. الرصيد يُحدَّث من العمليات اليومية فقط.
          </DialogDescription>
        </DialogHeader>
        <EditForm item={item} onClose={() => set(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function DeleteItemButton({
  itemId,
  nameDisplay,
  canDelete = true,
}: {
  itemId: string
  nameDisplay: string
  canDelete?: boolean
}) {
  const router = useRouter()
  const [open, set] = useState(false)
  const [p, t] = useTransition()
  if (!canDelete) return null
  return (
    <AlertDialog open={open} onOpenChange={set}>
      <Button
        type="button"
        size="icon-sm"
        className="text-destructive h-7 w-7"
        variant="outline"
        onClick={() => set(true)}
        aria-label="حذف"
      >
        <Trash2 className="size-3" />
      </Button>
      <AlertDialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف {nameDisplay}؟</AlertDialogTitle>
          <AlertDialogDescription>
            يُسمح بالحذف فقط إن لم تُسجَّل أي حركة لهذه المادة. إن وُجدت حركات، سيظهر خطأ ولن يُحذف السجل
            التاريخي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              t(async () => {
                const r = await deleteItem({ id: itemId })
                if (r.success) {
                  toast.success("تم الحذف")
                  router.refresh()
                } else {
                  toast.error("error" in r ? (r as { error: string }).error : "فشل")
                }
                set(false)
              })
            }}
            disabled={p}
          >
            {p ? "…" : "تأكيد حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
