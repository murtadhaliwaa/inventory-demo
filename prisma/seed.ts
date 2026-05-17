import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma"

/** `npm run db:seed:clear` — يحذف بيانات العرض (حركات، مواد، موردين) */
const seedClear =
  process.argv.includes("--clear") ||
  process.argv.includes("--reset") ||
  process.env.SEED_CLEAR === "true" ||
  process.env.SEED_RESET === "true"

async function clearDemoData(db: PrismaClient) {
  await db.$transaction(
    async (tx) => {
      const { count: txCount } = await tx.transaction.deleteMany()
      const { count: itemCount } = await tx.item.deleteMany()
      const { count: supplierCount } = await tx.supplier.deleteMany()
      // eslint-disable-next-line no-console
      console.log(
        `تم الحذف: ${txCount} حركة، ${itemCount} مادة، ${supplierCount} مورد.`
      )
    },
    { maxWait: 20000, timeout: 120000 }
  )
}

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error("DIRECT_URL / DATABASE_URL is missing in .env")
  }

  const adapter = new PrismaPg(url)
  const db = new PrismaClient({ adapter })

  try {
    if (!seedClear) {
      // eslint-disable-next-line no-console
      console.log(
        "لا توجد بيانات افتراضية للإدراج. لحذف بيانات العرض استخدم: npm run db:seed:clear"
      )
      return
    }
    await clearDemoData(db)
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
          "  - npm run db:migrate\n"
      )
      process.exit(1)
    }
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
