-- Query performance: composite indexes for report and dashboard filters

CREATE INDEX IF NOT EXISTS "transactions_created_at_type_idx"
  ON "transactions" ("created_at", "type");

CREATE INDEX IF NOT EXISTS "transactions_item_type_created_at_idx"
  ON "transactions" ("item_id", "type", "created_at");
