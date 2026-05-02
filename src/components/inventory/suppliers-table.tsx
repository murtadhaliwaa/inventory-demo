"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { SupplierForClient } from "@/lib/serialize-inventory"
import { createSupplier, deleteSupplier, updateSupplier } from "@/lib/actions/inventory"
import type { z } from "zod"
import { supplierCreateSchema, supplierUpdateSchema } from "@/lib/validations/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SupplierCountryCombobox } from "@/components/inventory/supplier-country-select"
import { supplierCountryLabelAr } from "@/lib/supplier-country"
import { CountryFlag } from "@/components/inventory/country-flag"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"

type Props = {
  suppliers: SupplierForClient[]
  canManage: boolean
}

export function SuppliersDataTable({ suppliers, canManage }: Props) {
  const router = useRouter()

  if (suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <EmptySuppliers canManage={canManage} onCreated={() => router.refresh()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CreateSupplierDialog onCreated={() => router.refresh()} />
        </div>
      ) : null}
      <div className="wms-panel overflow-x-auto rounded-xl border border-border/60 p-0 shadow-[var(--wms-surface-elevated)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">التاجر</TableHead>
              <TableHead className="text-start">الدولة</TableHead>
              <TableHead className="text-start">ملاحظات</TableHead>
              {canManage ? <TableHead className="text-center">إدارة</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="max-w-[12rem] text-start font-medium" title={s.name}>
                  {s.name}
                </TableCell>
                <TableCell className="text-start text-sm">
                  <span
                    className="inline-flex items-center gap-2 whitespace-nowrap"
                    title={supplierCountryLabelAr(s.countryCode)}
                  >
                    <CountryFlag code={s.countryCode} size={20} />
                    <span className="min-w-0">{supplierCountryLabelAr(s.countryCode)}</span>
                  </span>
                </TableCell>
                <TableCell
                  className="max-w-[10rem] truncate text-start text-xs text-muted-foreground"
                  title={s.notes ?? undefined}
                >
                  {s.notes?.trim() ? s.notes : "—"}
                </TableCell>
                {canManage ? (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <EditSupplierDialog supplier={s} onSaved={() => router.refresh()} />
                      <DeleteSupplierButton supplier={s} onDone={() => router.refresh()} />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function EmptySuppliers({ canManage, onCreated }: { canManage: boolean; onCreated: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center shadow-[var(--wms-surface-elevated)]">
      <p className="text-muted-foreground mb-4 text-sm">
        {canManage
          ? "لا موردين بعد. أضف أول مورد للظهور في العمليات والتقارير."
          : "لا موردين مسجّلين. ليس لديك صلاحية إضافة موردين من هذا الحساب."}
      </p>
      {canManage ? <CreateSupplierDialog onCreated={onCreated} /> : null}
    </div>
  )
}

function CreateSupplierDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="gap-2">
          <Plus className="size-3.5" />
          مورد جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-right">
          <DialogTitle>إضافة مورد</DialogTitle>
          <DialogDescription>اسم التاجر والدولة مطلوبان؛ الملاحظات اختيارية.</DialogDescription>
        </DialogHeader>
        <SupplierForm mode="create" onClose={() => setOpen(false)} onSuccess={onCreated} />
      </DialogContent>
    </Dialog>
  )
}

function EditSupplierDialog({
  supplier,
  onSaved,
}: {
  supplier: SupplierForClient
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm" className="h-7 w-7" aria-label="تعديل">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-right">
          <DialogTitle>تعديل مورد</DialogTitle>
        </DialogHeader>
        <SupplierForm mode="edit" supplier={supplier} onClose={() => setOpen(false)} onSuccess={onSaved} />
      </DialogContent>
    </Dialog>
  )
}

type PendingSupplierSave =
  | { mode: "create"; data: z.infer<typeof supplierCreateSchema> }
  | { mode: "edit"; data: z.infer<typeof supplierUpdateSchema> }

function SupplierForm({
  mode,
  supplier,
  onClose,
  onSuccess,
}: {
  mode: "create" | "edit"
  supplier?: SupplierForClient
  onClose: () => void
  onSuccess: () => void
}) {
  const [p, t] = useTransition()
  const idBase = useId()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<PendingSupplierSave | null>(null)

  function runSave(save: PendingSupplierSave) {
    t(async () => {
      const r =
        save.mode === "create"
          ? await createSupplier(save.data)
          : await updateSupplier(save.data)
      if (r.success) {
        toast.success(save.mode === "create" ? "تمت إضافة المورد" : "تم التحديث")
        onSuccess()
        onClose()
      } else {
        toast.error("error" in r ? r.error : "فشل")
      }
      setConfirmOpen(false)
      setPending(null)
    })
  }

  return (
    <>
    <form
      className="space-y-3 text-right"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        if (mode === "create") {
          const v = supplierCreateSchema.safeParse({
            name: fd.get("name"),
            countryCode: fd.get("countryCode"),
            notes: fd.get("notes"),
          })
          if (!v.success) {
            toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
            return
          }
          setPending({ mode: "create", data: v.data })
          setConfirmOpen(true)
          return
        }
        const v = supplierUpdateSchema.safeParse({
          id: supplier?.id,
          name: fd.get("name"),
          countryCode: fd.get("countryCode"),
          notes: fd.get("notes"),
        })
        if (!v.success) {
          toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
          return
        }
        setPending({ mode: "edit", data: v.data })
        setConfirmOpen(true)
      }}
    >
      {mode === "edit" && supplier ? <input type="hidden" name="id" value={supplier.id} readOnly /> : null}
      <div className="space-y-1.5">
        <Label htmlFor={`${idBase}-n`}>اسم التاجر</Label>
        <Input
          id={`${idBase}-n`}
          name="name"
          required
          maxLength={200}
          className="text-left"
          defaultValue={supplier?.name}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idBase}-cc`}>الدولة</Label>
        <SupplierCountryCombobox
          id={`${idBase}-cc`}
          name="countryCode"
          defaultValue={supplier?.countryCode ?? "SA"}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idBase}-notes`}>ملاحظات (اختياري)</Label>
        <Textarea
          id={`${idBase}-notes`}
          name="notes"
          rows={3}
          maxLength={2000}
          className="resize-none text-right"
          placeholder="مثال: شروط الدفع، جهة الاتصال…"
          defaultValue={supplier?.notes ?? ""}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={p} className="min-w-24">
          {p ? "…" : mode === "create" ? "حفظ" : "تحديث"}
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
          <AlertDialogTitle>
            {pending?.mode === "edit"
              ? "هل أنت متأكد من حفظ التعديلات على هذا المورد؟"
              : "هل أنت متأكد من إضافة هذا المورد؟"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {pending?.mode === "edit"
              ? "سيتم تحديث الاسم والدولة والملاحظات في بطاقة المورد."
              : "سيتم إنشاء بطاقة مورد جديدة ويمكن ربطها بالحركات لاحقاً."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={p}
            onClick={() => {
              if (pending) runSave(pending)
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

function DeleteSupplierButton({
  supplier,
  onDone,
}: {
  supplier: SupplierForClient
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [p, t] = useTransition()
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="icon-sm"
        className="text-destructive h-7 w-7"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="حذف"
      >
        <Trash2 className="size-3" />
      </Button>
      <AlertDialogContent className="max-w-md" dir="rtl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا المورد؟</AlertDialogTitle>
          <AlertDialogDescription>
            المورد: <span className="font-medium text-foreground">{supplier.name}</span>
            <br />
            ستبقى حركات الإضافة المرتبطة به في السجل لكن بدون ربط بالمورد (حقل المورد يُفرّغ).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={p}
            onClick={() => {
              t(async () => {
                const r = await deleteSupplier({ id: supplier.id })
                if (r.success) {
                  toast.success("تم حذف المورد")
                  onDone()
                } else {
                  toast.error("error" in r ? r.error : "فشل")
                }
                setOpen(false)
              })
            }}
          >
            {p ? "…" : "نعم، احذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
