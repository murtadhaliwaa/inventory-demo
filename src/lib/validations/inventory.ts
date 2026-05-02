import { z } from "zod"
import { TransactionType } from "@/generated/prisma"
import { ITEM_UNITS } from "@/lib/item-unit"
import { isValidSupplierCountryCode } from "@/lib/supplier-country"

const supplierCountryCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.toUpperCase())
  .refine((c) => isValidSupplierCountryCode(c), { message: "رمز الدولة غير صالح" })

const unitSchema = z.enum(ITEM_UNITS)

const idSchema = z.string().min(1, "مُعرف غير صالح")

const quantityField = z.coerce
  .number()
  .positive("يجب أن تكون الكمية أكبر من صفر")
  .finite()
  .refine(
    (n) => n <= 1_000_000_000_000,
    "القيمة كبيرة جداً (تحقق من وحدات القياس)"
  )

const itemBodySchema = {
  name: z.string().trim().min(1, "الاسم مطلوب").max(200, "الاسم طويل جداً"),
  minThreshold: z.coerce.number().min(0, "الحد يجب أن يكون ≥ 0").finite(),
  unit: unitSchema,
} as const

/** إنشاء مادة: رصيد افتتاحي &gt; 0 يُسجَّل كإضافة بدون مورد */
export const itemCreateSchema = z.object({
  name: itemBodySchema.name,
  minThreshold: itemBodySchema.minThreshold,
  unit: itemBodySchema.unit,
  currentQuantity: z.coerce
    .number()
    .min(0, "المخزون الابتدائي ≥ 0")
    .finite(),
})

export const itemUpdateSchema = z.object({
  id: idSchema,
  name: itemBodySchema.name,
  minThreshold: itemBodySchema.minThreshold,
  unit: itemBodySchema.unit,
})

export const itemDeleteSchema = z.object({ id: idSchema })

const supplierNotesField = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))

export const supplierCreateSchema = z.object({
  name: z.string().trim().min(1, "اسم المورد مطلوب").max(200),
  countryCode: supplierCountryCodeSchema,
  notes: supplierNotesField,
})

export const supplierUpdateSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1, "اسم المورد مطلوب").max(200),
  countryCode: supplierCountryCodeSchema,
  notes: supplierNotesField,
})

export const supplierDeleteSchema = z.object({ id: idSchema })

/** إضافة مواد: مورد موجود أو اسم تاجر جديد */
export const transactionAddSchema = z
  .object({
    itemId: idSchema,
    type: z.literal(TransactionType.ADD),
    quantity: quantityField,
    supplierId: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    newSupplierName: z.string().trim().max(200).optional().or(z.literal("")),
    newSupplierCountryCode: z.string().trim().optional().or(z.literal("")),
    newSupplierNotes: supplierNotesField,
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const sid = data.supplierId?.trim()
    const newName = data.newSupplierName?.trim()
    if (!sid && !newName) {
      ctx.addIssue({
        code: "custom",
        message: "اختر مورداً من القائمة أو أدخل اسم تاجر جديد",
        path: ["supplierId"],
      })
    }
    if (sid && newName) {
      ctx.addIssue({
        code: "custom",
        message: "استخدم إما قائمة الموردين أو حقل التاجر الجديد، وليس الاثنين",
        path: ["newSupplierName"],
      })
    }
    if (newName) {
      const cc = data.newSupplierCountryCode?.trim()
      if (!cc) {
        ctx.addIssue({
          code: "custom",
          message: "اختر دولة التاجر",
          path: ["newSupplierCountryCode"],
        })
      } else {
        const ok = supplierCountryCodeSchema.safeParse(cc)
        if (!ok.success) {
          ctx.addIssue({
            code: "custom",
            message: "رمز الدولة غير صالح",
            path: ["newSupplierCountryCode"],
          })
        }
      }
    }
  })

export const transactionWithdrawSchema = z.object({
  itemId: idSchema,
  type: z.literal(TransactionType.WITHDRAW),
  quantity: quantityField,
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
})

export type ItemCreateInput = z.infer<typeof itemCreateSchema>
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>
export type TransactionAddInput = z.infer<typeof transactionAddSchema>
export type TransactionWithdrawInput = z.infer<typeof transactionWithdrawSchema>
