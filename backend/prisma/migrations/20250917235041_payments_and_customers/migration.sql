-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_saleId_fkey";

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "credit_limit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "customerId" INTEGER,
ALTER COLUMN "saleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
