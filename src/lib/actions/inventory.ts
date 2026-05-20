"use server"

import { revalidatePath } from "next/cache"
import type { Item } from "@/generated/prisma"
import { Prisma, TransactionType } from "@/generated/prisma"
import { requireUser } from "@/lib/auth/require-user"
import { db } from "@/lib/db"
import { formatDecimalQuantity } from "@/lib/format"
import type { DailyPdfPayload } from "@/lib/daily-report-pdf-types"
import { itemUnitLabelFor } from "@/lib/item-unit"
import { formatLocaleDateTime, formatLocaleTime } from "@/lib/locale-display"
import {
  resolveReportPeriod,
  type ReportPeriodParams,
} from "@/lib/report-period"
import {
  itemCreateSchema,
  itemDeleteSchema,
  itemUpdateSchema,
  supplierCreateSchema,
  supplierDeleteSchema,
  supplierUpdateSchema,
  transactionAddSchema,
  transactionWithdrawSchema,
} from "@/lib/validations/inventory"

const paths = ["/", "/items", "/reports/daily", "/operations", "/suppliers"] as const

function revalidateApp() {
  for (const p of paths) revalidatePath(p)
}

function dec(n: number | string) {
  return new Prisma.Decimal(n)
}

type ActionResult = { success: true } | { success: false; error: string }

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

export type PagedResult<T> = {
  rows: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function clampPage(n: number) {
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

function clampPageSize(n: number) {
  const p = Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_SIZE
  return Math.min(MAX_PAGE_SIZE, Math.max(10, p))
}

/** ترقيم صفحات للمواد (اسم تصاعدي) — يقلل حمل الخادم مع توسع الجدول */
export async function listItemsPaged(opts?: { page?: number; pageSize?: number }): Promise<PagedResult<Item>> {
  await requireUser()
  const pageSize = clampPageSize(opts?.pageSize ?? DEFAULT_PAGE_SIZE)
  const total = await db.item.count()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(clampPage(opts?.page ?? 1), totalPages)
  const rows = await db.item.findMany({
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  return { rows, total, page, pageSize, totalPages }
}

export async function listSuppliers() {
  await requireUser()
  return db.supplier.findMany({ orderBy: { name: "asc" } })
}

export async function getLowStockItems() {
  await requireUser()
  // Prisma لا يدعم مقارنة عمودين (current_quantity <= min_threshold) مباشرةً في where
  // لذا نستخدم SQL مباشر (مُعقّم عبر prisma template tag)
  const rows = await db.$queryRaw<
    Array<{
      id: string
      name: string
      current_quantity: Prisma.Decimal
      min_threshold: Prisma.Decimal
      unit: string
      created_at: Date
      updated_at: Date
    }>
  >`
    SELECT id, name, current_quantity, min_threshold, unit, created_at, updated_at
    FROM items
    WHERE current_quantity <= min_threshold
    ORDER BY name ASC
  `
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    currentQuantity: r.current_quantity,
    minThreshold: r.min_threshold,
    unit: r.unit,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

const OPS_SELECT_LIMIT = 3000

export async function getOperationsPageData() {
  await requireUser()
  const [items, suppliers] = await Promise.all([
    db.item.findMany({ orderBy: { name: "asc" }, take: OPS_SELECT_LIMIT }),
    db.supplier.findMany({ orderBy: { name: "asc" }, take: OPS_SELECT_LIMIT }),
  ])
  return { items, suppliers }
}

export async function createSupplier(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = supplierCreateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const notes = parsed.data.notes?.trim()
    await db.supplier.create({
      data: {
        name: parsed.data.name.trim(),
        countryCode: parsed.data.countryCode,
        notes: notes && notes.length > 0 ? notes : null,
      },
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر إنشاء المورد"
    return { success: false, error: err }
  }
}

export async function updateSupplier(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = supplierUpdateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const notes = parsed.data.notes?.trim()
    await db.supplier.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name.trim(),
        countryCode: parsed.data.countryCode,
        notes: notes && notes.length > 0 ? notes : null,
      },
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر تحديث المورد"
    return { success: false, error: err }
  }
}

export async function deleteSupplier(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = supplierDeleteSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "مُعرف حذف غير صالح" }
    }
    await db.supplier.delete({ where: { id: parsed.data.id } })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر حذف المورد"
    return { success: false, error: err }
  }
}

export async function createItem(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data =
      f instanceof FormData
        ? Object.fromEntries(f.entries())
        : f
    const parsed = itemCreateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const { name, minThreshold, unit, currentQuantity } = parsed.data
    const opening = dec(currentQuantity)

    await db.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          name,
          minThreshold: dec(minThreshold),
          unit,
          currentQuantity: opening,
        },
      })
      if (currentQuantity > 0) {
        await tx.transaction.create({
          data: {
            itemId: item.id,
            type: TransactionType.ADD,
            quantity: opening,
            supplierId: null,
            note: "رصيد افتتاحي",
          },
        })
      }
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر الإنشاء"
    return { success: false, error: err }
  }
}

export async function updateItem(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = itemUpdateSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const { id, name, minThreshold, unit } = parsed.data
    await db.item.update({
      where: { id },
      data: {
        name,
        minThreshold: dec(minThreshold),
        unit,
      },
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر التحديث"
    return { success: false, error: err }
  }
}

export async function deleteItem(f: FormData | Record<string, unknown>) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = itemDeleteSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: "مُعرف حذف غير صالح" }
    }
    const txCount = await db.transaction.count({ where: { itemId: parsed.data.id } })
    if (txCount > 0) {
      return {
        success: false,
        error: "لا يمكن حذف مادة لها حركات مسجّلة في النظام (حماية السجل).",
      }
    }
    await db.item.delete({ where: { id: parsed.data.id } })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر الحذف"
    return { success: false, error: err }
  }
}

/**
 * إضافة مواد من مورد (قائمة أو تاجر جديد)
 */
export async function recordTransactionAdd(
  f: FormData | Record<string, unknown>
) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = transactionAddSchema.safeParse({
      ...data,
      type: TransactionType.ADD,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const {
      itemId,
      quantity,
      supplierId,
      newSupplierName,
      newSupplierCountryCode,
      newSupplierNotes,
      note,
    } = parsed.data
    const q = dec(quantity)
    const noteValue = !note || note === "" ? null : note

    await db.$transaction(async (tx) => {
      let resolvedSupplierId: string | null = null
      const newName = newSupplierName?.trim()
      if (newName) {
        const code = newSupplierCountryCode!.trim()
        const sn = newSupplierNotes?.trim()
        const s = await tx.supplier.create({
          data: {
            name: newName,
            countryCode: code,
            notes: sn && sn.length > 0 ? sn : null,
          },
        })
        resolvedSupplierId = s.id
      } else if (supplierId?.trim()) {
        const exists = await tx.supplier.findUnique({
          where: { id: supplierId.trim() },
        })
        if (!exists) throw new Error("المورد غير موجود")
        resolvedSupplierId = exists.id
      } else {
        throw new Error("مورد مطلوب")
      }

      const item = await tx.item.findUniqueOrThrow({ where: { id: itemId } })
      const cur = new Prisma.Decimal(item.currentQuantity.toString())
      const next = cur.add(q)

      await tx.transaction.create({
        data: {
          itemId,
          type: TransactionType.ADD,
          quantity: q,
          supplierId: resolvedSupplierId,
          note: noteValue,
        },
      })
      await tx.item.update({
        where: { id: itemId },
        data: { currentQuantity: next },
      })
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر تسجيل الإضافة"
    return { success: false, error: err }
  }
}

/** سحب مواد */
export async function recordTransactionWithdraw(
  f: FormData | Record<string, unknown>
) {
  try {
    await requireUser()
    const data = f instanceof FormData ? Object.fromEntries(f.entries()) : f
    const parsed = transactionWithdrawSchema.safeParse({
      ...data,
      type: TransactionType.WITHDRAW,
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
    }
    const { itemId, quantity, note } = parsed.data
    const q = dec(quantity)
    const noteValue = !note || note === "" ? null : note

    await db.$transaction(async (tx) => {
      const item = await tx.item.findUniqueOrThrow({ where: { id: itemId } })
      const cur = new Prisma.Decimal(item.currentQuantity.toString())
      const next = cur.sub(q)
      if (new Prisma.Decimal(next.toString()).comparedTo(0) < 0) {
        throw new Error("الكمية غير متاحة: الرصيد لن يكفي")
      }
      await tx.transaction.create({
        data: {
          itemId,
          type: TransactionType.WITHDRAW,
          quantity: q,
          supplierId: null,
          note: noteValue,
        },
      })
      await tx.item.update({
        where: { id: itemId },
        data: { currentQuantity: next },
      })
    })
    revalidateApp()
    return { success: true } satisfies ActionResult
  } catch (e) {
    const err = e instanceof Error ? e.message : "تعذّر تسجيل السحب"
    return { success: false, error: err }
  }
}

function startEndOfLocalDay(d = new Date()) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const end = new Date(d)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function getDashboardData() {
  await requireUser()
  const { start, end } = startEndOfLocalDay()
  const [totalSkus, lowStockRows, recentTransactions, todayTransactions, supplierCount] = await Promise.all([
    db.item.count(),
    db.$queryRaw<
      Array<{
        id: string
        name: string
        current_quantity: Prisma.Decimal
        min_threshold: Prisma.Decimal
        unit: string
        created_at: Date
        updated_at: Date
      }>
    >`
      SELECT id, name, current_quantity, min_threshold, unit, created_at, updated_at
      FROM items
      WHERE current_quantity <= min_threshold
      ORDER BY name ASC
    `,
    db.transaction.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 8,
      select: {
        id: true,
        createdAt: true,
        type: true,
        quantity: true,
        item: { select: { id: true, name: true, unit: true } },
        supplier: { select: { id: true, name: true, countryCode: true } },
      },
    }),
    db.transaction.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { type: true },
    }),
    db.supplier.count(),
  ])
  const lowStock = lowStockRows.map((r) => ({
    id: r.id,
    name: r.name,
    currentQuantity: r.current_quantity,
    minThreshold: r.min_threshold,
    unit: r.unit,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
  const todayAdds = todayTransactions.filter((t) => t.type === TransactionType.ADD).length
  const todayWithdraws = todayTransactions.filter(
    (t) => t.type === TransactionType.WITHDRAW
  ).length
  return {
    recentTransactions,
    lowStock,
    totalSkus,
    supplierCount,
    todayAdds,
    todayWithdraws,
    todayMovementsCount: todayTransactions.length,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

const DAILY_SUMMARY_CAP = 500

const dailyTxSelect = {
  id: true,
  createdAt: true,
  type: true,
  quantity: true,
  item: { select: { id: true, name: true, unit: true } },
  supplier: { select: { id: true, name: true, countryCode: true } },
} as const

type PeriodItemBalance = {
  id: string
  name: string
  currentQuantity: Prisma.Decimal
  minThreshold: Prisma.Decimal
  unit: string
  createdAt: Date
  updatedAt: Date
}

/** رصيد كل مادة عند نهاية الفترة (الرصيد الحالي ناقص حركات ما بعد الفترة) */
async function balancesAtPeriodEnd(periodEnd: Date): Promise<PeriodItemBalance[]> {
  const items = await db.item.findMany({ orderBy: { name: "asc" } })
  const now = new Date()
  if (periodEnd >= now) {
    return items.map((i) => ({
      id: i.id,
      name: i.name,
      currentQuantity: i.currentQuantity,
      minThreshold: i.minThreshold,
      unit: i.unit,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }))
  }

  const deltas = await db.$queryRaw<
    Array<{ item_id: string; delta: Prisma.Decimal | null }>
  >`
    SELECT item_id,
      COALESCE(
        SUM(
          CASE
            WHEN type = 'ADD' THEN quantity
            ELSE -quantity
          END
        ),
        0
      ) AS delta
    FROM transactions
    WHERE created_at > ${periodEnd}
    GROUP BY item_id
  `
  const deltaByItem = new Map(
    deltas.map((r) => [r.item_id, new Prisma.Decimal(r.delta?.toString() ?? "0")])
  )

  return items.map((i) => {
    const after = deltaByItem.get(i.id) ?? new Prisma.Decimal(0)
    const atEnd = new Prisma.Decimal(i.currentQuantity.toString()).sub(after)
    return {
      id: i.id,
      name: i.name,
      currentQuantity: atEnd,
      minThreshold: i.minThreshold,
      unit: i.unit,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }
  })
}

export async function getDailyReport(
  opts?: {
    movementsPage?: number
    movementsPageSize?: number
  } & ReportPeriodParams
) {
  await requireUser()
  const period = resolveReportPeriod(opts ?? {})
  const { start, end } = period
  const movementsPage = clampPage(opts?.movementsPage ?? 1)
  const movementsPageSize = clampPageSize(opts?.movementsPageSize ?? 50)
  const rangeWhere = { createdAt: { gte: start, lte: end } }

  const [
    endBalances,
    todaysMovesTotal,
    todaysMoves,
    addsTotal,
    withdrawsTotal,
    todaysAdds,
    todaysWithdraws,
  ] = await Promise.all([
    balancesAtPeriodEnd(end),
    db.transaction.count({ where: rangeWhere }),
    db.transaction.findMany({
      where: rangeWhere,
      select: dailyTxSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (movementsPage - 1) * movementsPageSize,
      take: movementsPageSize,
    }),
    db.transaction.count({
      where: { ...rangeWhere, type: TransactionType.ADD },
    }),
    db.transaction.count({
      where: { ...rangeWhere, type: TransactionType.WITHDRAW },
    }),
    db.transaction.findMany({
      where: { ...rangeWhere, type: TransactionType.ADD },
      select: dailyTxSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: DAILY_SUMMARY_CAP,
    }),
    db.transaction.findMany({
      where: { ...rangeWhere, type: TransactionType.WITHDRAW },
      select: dailyTxSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: DAILY_SUMMARY_CAP,
    }),
  ])

  const lowStock = endBalances
    .filter((i) => i.currentQuantity.lte(i.minThreshold))
    .sort((a, b) => a.name.localeCompare(b.name, "ar"))

  return {
    period,
    todaysMoves,
    todaysMovesTotal,
    movementsPage,
    movementsPageSize,
    movementsTotalPages: Math.max(1, Math.ceil(todaysMovesTotal / movementsPageSize)),
    todaysAdds,
    todaysWithdraws,
    addsTotal,
    withdrawsTotal,
    addsTruncated: addsTotal > DAILY_SUMMARY_CAP,
    withdrawsTruncated: withdrawsTotal > DAILY_SUMMARY_CAP,
    lowStock,
    periodStart: start,
    periodEnd: end,
    endBalances,
    showFullDateTime: period.type !== "daily",
  }
}

/** يحمّل بيانات الفترة لتصدير PDF عند الطلب (لا يُستدعى إلا عند الضغط) */
export async function getDailyReportPdfPayload(
  params?: ReportPeriodParams
): Promise<DailyPdfPayload> {
  await requireUser()
  const period = resolveReportPeriod(params ?? {})
  const { start, end } = period
  const dateLabel = `${period.titleLabel} — ${period.rangeLabel}`
  const rangeWhere = { createdAt: { gte: start, lte: end } }

  const [addRows, withdrawRows, items] = await Promise.all([
    db.transaction.findMany({
      where: { ...rangeWhere, type: TransactionType.ADD },
      select: dailyTxSelect,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    db.transaction.findMany({
      where: { ...rangeWhere, type: TransactionType.WITHDRAW },
      select: dailyTxSelect,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }),
    balancesAtPeriodEnd(end),
  ])

  const timeFmt =
    period.type === "daily"
      ? (d: Date) => formatLocaleTime(d, { timeStyle: "short" })
      : (d: Date) => formatLocaleDateTime(d, { dateStyle: "short", timeStyle: "short" })

  const adds = addRows.map((t) => ({
    time: timeFmt(new Date(t.createdAt)),
    itemName: t.item.name,
    supplierName: t.supplier?.name ?? "—",
    supplierCountryCode: t.supplier?.countryCode ?? null,
    qtyUnit: `${formatDecimalQuantity(t.quantity)} ${itemUnitLabelFor(t.item.unit)}`,
  }))
  const withdraws = withdrawRows.map((t) => ({
    time: timeFmt(new Date(t.createdAt)),
    itemName: t.item.name,
    qtyUnit: `${formatDecimalQuantity(t.quantity)} ${itemUnitLabelFor(t.item.unit)}`,
  }))
  const balances = items.map((i) => ({
    itemName: i.name,
    qtyUnit: `${formatDecimalQuantity(i.currentQuantity)} ${itemUnitLabelFor(i.unit)}`,
  }))

  return { dateLabel, adds, withdraws, balances }
}
