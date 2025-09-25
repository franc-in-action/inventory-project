-- CreateTable
CREATE TABLE "public"."ProductVendor" (
    "productId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "vendorPrice" DOUBLE PRECISION,
    "leadTimeDays" INTEGER,

    CONSTRAINT "ProductVendor_pkey" PRIMARY KEY ("productId","vendorId")
);

-- AddForeignKey
ALTER TABLE "public"."ProductVendor" ADD CONSTRAINT "ProductVendor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVendor" ADD CONSTRAINT "ProductVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
