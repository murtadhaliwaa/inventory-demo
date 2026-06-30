/**
 * ضبط أدوار المشرفين في Supabase Auth (مرة واحدة).
 * npm run setup:admins
 */
import "dotenv/config"
import pg from "pg"

const ADMIN_META = { wms_role: "admin", wms_admin: true }

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!url) throw new Error("DIRECT_URL غير مضبوط")

  const adminEmails = (process.env.WMS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.length === 0) {
    throw new Error("WMS_ADMIN_EMAILS فارغ — أضف بريدات المشرفين في .env")
  }

  const pool = new pg.Pool({ connectionString: url })

  try {
    const { rows: users } = await pool.query<{
      id: string
      email: string | null
      raw_app_meta_data: Record<string, unknown> | null
    }>(`SELECT id, email, raw_app_meta_data FROM auth.users ORDER BY created_at`)

    if (users.length === 0) {
      console.log("لا مستخدمين في Supabase Auth بعد — أنشئ حساباً من /login أولاً.")
      return
    }

    console.log(`المستخدمون (${users.length}):`)
    for (const u of users) {
      console.log(`  - ${u.email ?? u.id}`)
    }

    for (const email of adminEmails) {
      const res = await pool.query(
        `UPDATE auth.users
         SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || $1::jsonb
         WHERE lower(email) = lower($2)
         RETURNING id, email`,
        [JSON.stringify(ADMIN_META), email]
      )
      if (res.rowCount === 0) {
        console.warn(`⚠ لم يُعثر على مستخدم بالبريد: ${email}`)
      } else {
        console.log(`✓ مشرف: ${email}`)
      }
    }

    const otherEmails = users
      .map((u) => u.email?.toLowerCase())
      .filter((e): e is string => Boolean(e) && !adminEmails.includes(e))

    for (const email of otherEmails) {
      const u = users.find((x) => x.email?.toLowerCase() === email)
      const role = (u?.raw_app_meta_data as { wms_role?: string } | null)?.wms_role
      if (role === "admin" || role === "operator" || role === "viewer") continue

      await pool.query(
        `UPDATE auth.users
         SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || $1::jsonb
         WHERE lower(email) = lower($2)`,
        [JSON.stringify({ wms_role: "operator" }), email]
      )
      console.log(`✓ مشغّل (افتراضي): ${email}`)
    }

    console.log("تم ضبط الأدوار.")
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
