-- Supabase security: enable RLS on public inventory tables.
-- Prisma (postgres role) bypasses RLS; anon is blocked; authenticated can SELECT for Realtime.

ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_items" ON "public"."items";
DROP POLICY IF EXISTS "authenticated_read_suppliers" ON "public"."suppliers";
DROP POLICY IF EXISTS "authenticated_read_transactions" ON "public"."transactions";

CREATE POLICY "authenticated_read_items"
  ON "public"."items"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_read_suppliers"
  ON "public"."suppliers"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_read_transactions"
  ON "public"."transactions"
  FOR SELECT
  TO authenticated
  USING (true);

-- Realtime: ensure tables are in the publication (no-op if already added).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "public"."items";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "public"."transactions";
  END IF;
END $$;
