/*
  Warnings:

  - You are about to drop the column `paymentId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServerChange` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."LedgerType" ADD VALUE 'PAYMENT_ISSUED';

-- DropForeignKey
ALTER TABLE "public"."LedgerEntry" DROP CONSTRAINT "LedgerEntry_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LedgerEntry" DROP CONSTRAINT "LedgerEntry_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LedgerEntry" DROP CONSTRAINT "LedgerEntry_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LedgerEntry" DROP CONSTRAINT "LedgerEntry_saleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_saleId_fkey";

-- AlterTable
ALTER TABLE "public"."LedgerEntry" DROP COLUMN "paymentId",
ADD COLUMN     "issuedPaymentId" TEXT,
ADD COLUMN     "receivedPaymentId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "public"."Vendor" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."ServerChange";

-- CreateTable
CREATE TABLE "public"."ReceivedPayment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceivedPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IssuedPayment" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssuedPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ReceivedPayment" ADD CONSTRAINT "ReceivedPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceivedPayment" ADD CONSTRAINT "ReceivedPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssuedPayment" ADD CONSTRAINT "IssuedPayment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssuedPayment" ADD CONSTRAINT "IssuedPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_receivedPaymentId_fkey" FOREIGN KEY ("receivedPaymentId") REFERENCES "public"."ReceivedPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_issuedPaymentId_fkey" FOREIGN KEY ("issuedPaymentId") REFERENCES "public"."IssuedPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
