import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma"

const globalFor = globalThis as unknown as { db?: PrismaClient }

/**
 * Prisma 7 — اتصال PostgreSQL عبر `@prisma/adapter-pg` (Supabase: نفس `DATABASE_URL`)
 */
function getDb(): PrismaClient {
  if (globalFor.db) {
    return globalFor.db
  }
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL غير مضبوط — نسخ من .env.example إلى .env")
  }
  const adapter = new PrismaPg(url)
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
  globalFor.db = client
  return client
}

export const db = getDb() as PrismaClient
