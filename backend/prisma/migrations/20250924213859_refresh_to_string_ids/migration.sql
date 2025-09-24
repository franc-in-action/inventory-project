/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_saleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Purchase" DROP CONSTRAINT "Purchase_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseItem" DROP CONSTRAINT "PurchaseItem_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sale" DROP CONSTRAINT "Sale_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- AlterTable
ALTER TABLE "public"."Customer" DROP CONSTRAINT "Customer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Customer_id_seq";

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "saleId" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Purchase" DROP CONSTRAINT "Purchase_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vendorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Purchase_id_seq";

-- AlterTable
ALTER TABLE "public"."PurchaseItem" ALTER COLUMN "purchaseId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Sale" DROP CONSTRAINT "Sale_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sale_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Sale_id_seq";

-- AlterTable
ALTER TABLE "public"."SaleItem" ALTER COLUMN "saleId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."StockMovement" ALTER COLUMN "performedBy" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Vendor" DROP CONSTRAINT "Vendor_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vendor_id_seq";

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
