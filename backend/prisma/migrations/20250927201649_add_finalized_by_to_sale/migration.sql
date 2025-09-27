-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "finalizedBy" TEXT,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_finalizedBy_fkey" FOREIGN KEY ("finalizedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
