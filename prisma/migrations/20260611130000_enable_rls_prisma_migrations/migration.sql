-- Supabase security advisor: _prisma_migrations must not be public via PostgREST.
-- Enable RLS with no policies — blocks anon/authenticated; postgres role bypasses RLS for Prisma.

ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
