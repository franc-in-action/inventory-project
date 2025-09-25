-- DropForeignKey
ALTER TABLE "public"."ProductVendor" DROP CONSTRAINT "ProductVendor_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ProductVendor" ADD CONSTRAINT "ProductVendor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
