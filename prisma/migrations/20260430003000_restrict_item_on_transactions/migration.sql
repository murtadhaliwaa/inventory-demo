-- منع حذف مادة ما دامت لها حركات (حماية السجل التاريخي)
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_item_id_fkey";
ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "items"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
