import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Prisma, PrismaClient, TransactionType } from "../src/generated/prisma"

function dec(n: number | string) {
  return new Prisma.Decimal(n)
}

/** `npm run db:seed:reset` أو: tsx prisma/seed.ts --reset — يحذف بيانات العرض ثم يعيد إدراجها */
const seedReset = process.argv.includes("--reset") || process.env.SEED_RESET === "true"

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error("DIRECT_URL / DATABASE_URL is missing in .env")
  }

  const adapter = new PrismaPg(url)
  const db = new PrismaClient({ adapter })

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(8, 0, 0, 0)

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(14, 30, 0, 0)

  const supplierNames = ["مؤسسة البلاستيك الحديث", "توريد الخليج", "شركة النهضة للمواد"]

  const itemDefs = [
    { name: "بولي بروبلين PP", unit: "KG" as const, minThreshold: 250, openingQuantity: 1200 },
    { name: "بولي إيثيلين PE", unit: "KG" as const, minThreshold: 200, openingQuantity: 650 },
    { name: "ماستر باتش أسود", unit: "KG" as const, minThreshold: 40, openingQuantity: 25 },
    { name: "كربونات كالسيوم", unit: "TON" as const, minThreshold: 2, openingQuantity: 8 },
    { name: "جركن 5 لتر", unit: "PIECE" as const, minThreshold: 500, openingQuantity: 1200 },
    { name: "غطاء جركن 5 لتر", unit: "PIECE" as const, minThreshold: 800, openingQuantity: 700 },
    { name: "علبة 1 لتر", unit: "PIECE" as const, minThreshold: 1000, openingQuantity: 2400 },
  ]

  try {
    await db.$transaction(async (tx) => {
      if (seedReset) {
        // eslint-disable-next-line no-console
        console.log("SEED_RESET: جاري حذف الحركات والمواد والموردين…")
        await tx.transaction.deleteMany()
        await tx.item.deleteMany()
        await tx.supplier.deleteMany()
      } else {
        const existingTx = await tx.transaction.count()
        if (existingTx > 0) {
          // eslint-disable-next-line no-console
          console.log("Seed skipped: transactions already exist. Use: npm run db:seed:reset")
          return
        }
      }

      const suppliers = await Promise.all(
        supplierNames.map((name) =>
          tx.supplier.create({
            data: { name, phone: null },
          })
        )
      )

      const items = await Promise.all(
        itemDefs.map((it) =>
          tx.item.create({
            data: {
              name: it.name,
              unit: it.unit,
              minThreshold: dec(it.minThreshold),
              currentQuantity: dec(it.openingQuantity),
            },
          })
        )
      )

      const byName = (n: string) => items.find((i) => i.name === n)!
      const pp = byName("بولي بروبلين PP")
      const master = byName("ماستر باتش أسود")
      const cap = byName("غطاء جركن 5 لتر")
      const box = byName("علبة 1 لتر")
      const jerry = byName("جركن 5 لتر")

      const moves: Array<{
        itemId: string
        type: TransactionType
        quantity: number
        supplierId: string | null
        note: string
        createdAt: Date
      }> = [
        {
          itemId: pp.id,
          type: TransactionType.WITHDRAW,
          quantity: 180,
          supplierId: null,
          note: "استهلاك إنتاج (أمس)",
          createdAt: yesterday,
        },
        {
          itemId: jerry.id,
          type: TransactionType.ADD,
          quantity: 450,
          supplierId: suppliers[1]!.id,
          note: "توريد (أمس)",
          createdAt: yesterday,
        },
        {
          itemId: master.id,
          type: TransactionType.ADD,
          quantity: 20,
          supplierId: suppliers[0]!.id,
          note: "استلام توريد صباحاً",
          createdAt: todayStart,
        },
        {
          itemId: master.id,
          type: TransactionType.WITHDRAW,
          quantity: 30,
          supplierId: null,
          note: "استهلاك إنتاج اليوم",
          createdAt: new Date(todayStart.getTime() + 60 * 60 * 1000),
        },
        {
          itemId: cap.id,
          type: TransactionType.ADD,
          quantity: 300,
          supplierId: suppliers[2]!.id,
          note: "توريد اليوم",
          createdAt: new Date(todayStart.getTime() + 2 * 60 * 60 * 1000),
        },
        {
          itemId: box.id,
          type: TransactionType.ADD,
          quantity: 600,
          supplierId: suppliers[1]!.id,
          note: "توريد اليوم",
          createdAt: new Date(todayStart.getTime() + 3 * 60 * 60 * 1000),
        },
        {
          itemId: jerry.id,
          type: TransactionType.WITHDRAW,
          quantity: 900,
          supplierId: null,
          note: "تسليم/صرف اليوم",
          createdAt: new Date(todayStart.getTime() + 4 * 60 * 60 * 1000),
        },
      ]

      for (const m of moves) {
        await tx.transaction.create({
          data: {
            itemId: m.itemId,
            type: m.type,
            quantity: dec(m.quantity),
            supplierId: m.supplierId,
            note: m.note,
            createdAt: m.createdAt,
          },
        })
      }

      // إعادة حساب الأرصدة: رصيد افتتاحي + صافي الحركات (استعلام واحد لكل المخزون)
      const allTx = await tx.transaction.findMany()
      const byItem = new Map<string, Prisma.Decimal[]>()
      for (const l of allTx) {
        const q = new Prisma.Decimal(l.quantity.toString())
        const signed = l.type === TransactionType.ADD ? q : new Prisma.Decimal(0).sub(q)
        const arr = byItem.get(l.itemId) ?? []
        arr.push(signed)
        byItem.set(l.itemId, arr)
      }
      for (const i of items) {
        const opening = new Prisma.Decimal(i.currentQuantity.toString())
        const parts = byItem.get(i.id) ?? []
        const delta = parts.reduce((a, b) => a.add(b), new Prisma.Decimal(0))
        await tx.item.update({
          where: { id: i.id },
          data: { currentQuantity: opening.add(delta) },
        })
      }
    }, { maxWait: 20000, timeout: 120000 })
  } finally {
    await db.$disconnect()
  }
}

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Seed completed.")
  })
  .catch((e) => {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2021") {
      // eslint-disable-next-line no-console
      console.error(
        "Database schema is not applied yet. Run one of:\n" +
          "  - npm run db:push\n" +
          "  - npm run db:migrate\n" +
          "Then re-run:\n" +
          "  - npm run db:seed\n"
      )
      process.exit(1)
    }
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
