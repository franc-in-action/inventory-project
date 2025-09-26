/*
  Warnings:

  - A unique constraint covering the columns `[paymentNumber]` on the table `IssuedPayment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentNumber]` on the table `ReceivedPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."IssuedPayment" ADD COLUMN     "paymentNumber" TEXT NOT NULL DEFAULT 'TEMP';

-- AlterTable
ALTER TABLE "public"."ReceivedPayment" ADD COLUMN     "paymentNumber" TEXT NOT NULL DEFAULT 'TEMP';

-- CreateIndex
CREATE UNIQUE INDEX "IssuedPayment_paymentNumber_key" ON "public"."IssuedPayment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReceivedPayment_paymentNumber_key" ON "public"."ReceivedPayment"("paymentNumber");
