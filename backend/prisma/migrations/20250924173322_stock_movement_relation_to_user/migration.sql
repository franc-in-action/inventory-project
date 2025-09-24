-- AlterTable
ALTER TABLE "public"."StockMovement" ADD COLUMN     "performedBy" TEXT NOT NULL DEFAULT 'unknown';

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
