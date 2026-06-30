import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma"
import pg from "pg"

const globalFor = globalThis as unknown as { db?: PrismaClient; pgPool?: pg.Pool }

/**
 * Prisma 7 — اتصال PostgreSQL عبر `@prisma/adapter-pg` (Supabase pooler موصى به في DATABASE_URL)
 */
function getPool(): pg.Pool {
  if (globalFor.pgPool) {
    return globalFor.pgPool
  }
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL غير مضبوط — نسخ من .env.example إلى .env")
  }
  const pool = new pg.Pool({
    connectionString: url,
    max: process.env.NODE_ENV === "development" ? 5 : 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })
  globalFor.pgPool = pool
  return pool
}

function getDb(): PrismaClient {
  if (globalFor.db) {
    return globalFor.db
  }
  const adapter = new PrismaPg(getPool())
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
  globalFor.db = client
  return client
}

export const db = getDb() as PrismaClient
