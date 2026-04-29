-- CreateIndex
CREATE INDEX "transactions_created_at_id_idx" ON "transactions"("created_at", "id");

-- Perf: لوحات التحكم/التقرير اليومي تعرض المواد الناقصة مرتبة بالاسم
-- شرط (current_quantity <= min_threshold) لا يُفهرس جيداً عادةً، لذا نستخدم partial index
CREATE INDEX IF NOT EXISTS "items_low_stock_name_idx"
ON "items" ("name")
WHERE "current_quantity" <= "min_threshold";
