-- مورد: دولة + ملاحظات بدلاً من الجوال
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "country_code" VARCHAR(8) NOT NULL DEFAULT 'SA';
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "phone";
CREATE INDEX IF NOT EXISTS "suppliers_country_code_idx" ON "suppliers"("country_code");
