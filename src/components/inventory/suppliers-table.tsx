"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { SupplierForClient } from "@/lib/serialize-inventory"
import { createSupplier, deleteSupplier, updateSupplier } from "@/lib/actions/inventory"
import { supplierCreateSchema, supplierUpdateSchema } from "@/lib/validations/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
              <TableHead className="text-start">المورد</TableHead>
              <TableHead className="text-center">الجوال</TableHead>
              {canManage ? <TableHead className="text-center">إدارة</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="max-w-[12rem] text-start font-medium" title={s.name}>
                  {s.name}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">
                  <span dir="ltr" className="inline-block">
                    {s.phone ?? "—"}
                  </span>
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
          <DialogDescription>الاسم مطلوب، الجوال اختياري.</DialogDescription>
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
  return (
    <form
      className="space-y-3 text-right"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        if (mode === "create") {
          const v = supplierCreateSchema.safeParse({
            name: fd.get("name"),
            phone: fd.get("phone"),
          })
          if (!v.success) {
            toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
            return
          }
          t(async () => {
            const r = await createSupplier(v.data)
            if (r.success) {
              toast.success("تمت إضافة المورد")
              onSuccess()
              onClose()
            } else {
              toast.error("error" in r ? r.error : "فشل")
            }
          })
          return
        }
        const v = supplierUpdateSchema.safeParse({
          id: supplier?.id,
          name: fd.get("name"),
          phone: fd.get("phone"),
        })
        if (!v.success) {
          toast.error(v.error.issues[0]?.message ?? "تحقق من الحقول")
          return
        }
        t(async () => {
          const r = await updateSupplier(v.data)
          if (r.success) {
            toast.success("تم التحديث")
            onSuccess()
            onClose()
          } else {
            toast.error("error" in r ? r.error : "فشل")
          }
        })
      }}
    >
      {mode === "edit" && supplier ? <input type="hidden" name="id" value={supplier.id} readOnly /> : null}
      <div className="space-y-1.5">
        <Label htmlFor={`${idBase}-n`}>اسم المورد</Label>
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
        <Label htmlFor={`${idBase}-ph`}>جوال (اختياري)</Label>
        <Input
          id={`${idBase}-ph`}
          name="phone"
          dir="ltr"
          maxLength={40}
          placeholder="05xxxxxxxx"
          defaultValue={supplier?.phone ?? ""}
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
          <AlertDialogTitle>حذف {supplier.name}؟</AlertDialogTitle>
          <AlertDialogDescription>
            ستبقى حركات الإضافة المرتبطة بهذا المورد في السجل لكن بدون ربط بالمورد (حقل المورد يُفرّغ).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
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
            {p ? "…" : "تأكيد"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
