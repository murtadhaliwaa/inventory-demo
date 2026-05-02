"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ItemForClient } from "@/lib/serialize-inventory"
import { createItem, updateItem, deleteItem } from "@/lib/actions/inventory"
import type { z } from "zod"
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<z.infer<typeof itemCreateSchema> | null>(null)

  function runCreate(data: z.infer<typeof itemCreateSchema>) {
    t(async () => {
      const r = await createItem(data)
      if (r.success) {
        toast.success("تمت الإضافة")
        onClose()
        router.refresh()
      } else {
        toast.error("error" in r ? (r as { error: string }).error : "فشل")
      }
      setConfirmOpen(false)
      setPending(null)
    })
  }

  return (
    <>
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
          setPending(v.data)
          setConfirmOpen(true)
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

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o)
          if (!o) setPending(null)
        }}
      >
        <AlertDialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إضافة هذه المادة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إنشاء سجل مادة جديد. إن كان الرصيد الافتتاحي أكبر من صفر يُسجَّل كحركة «رصيد افتتاحي».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={p}
              onClick={() => {
                if (pending) runCreate(pending)
              }}
            >
              {p ? "…" : "نعم، تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function CreateItemButton({ canManage = true }: { canManage?: boolean }) {
  const [open, set] = useState(false)
  if (!canManage) return null
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<z.infer<typeof itemUpdateSchema> | null>(null)

  function runUpdate(data: z.infer<typeof itemUpdateSchema>) {
    t(async () => {
      const r = await updateItem(data)
      if (r.success) {
        toast.success("تُمّ التعديل")
        onClose()
        router.refresh()
      } else {
        toast.error("error" in r ? (r as { error: string }).error : "فشل")
      }
      setConfirmOpen(false)
      setPending(null)
    })
  }

  return (
    <>
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
          setPending(v.data)
          setConfirmOpen(true)
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

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o)
          if (!o) setPending(null)
        }}
      >
        <AlertDialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حفظ التعديلات على هذه المادة؟</AlertDialogTitle>
            <AlertDialogDescription>
              المادة: <span className="font-medium text-foreground">{item.name}</span>
              <br />
              يُحدَّث الاسم وحد الإنذار والوحدة. الرصيد لا يتغير من هنا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={p}
              onClick={() => {
                if (pending) runUpdate(pending)
              }}
            >
              {p ? "…" : "نعم، تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function EditItemButton({ item, canManage = true }: { item: ItemForClient; canManage?: boolean }) {
  const [open, set] = useState(false)
  if (!canManage) return null
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
  canManage = true,
}: {
  itemId: string
  nameDisplay: string
  canManage?: boolean
}) {
  const router = useRouter()
  const [open, set] = useState(false)
  const [p, t] = useTransition()
  if (!canManage) return null
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
          <AlertDialogTitle>هل أنت متأكد من حذف هذه المادة؟</AlertDialogTitle>
          <AlertDialogDescription>
            المادة: <span className="font-medium text-foreground">{nameDisplay}</span>
            <br />
            يُسمح بالحذف فقط إن لم تُسجَّل أي حركة لهذه المادة. إن وُجدت حركات، سيظهر خطأ ولن يُحذف السجل
            التاريخي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            type="button"
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
            {p ? "…" : "نعم، احذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
