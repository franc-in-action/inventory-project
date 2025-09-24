-- AlterTable
ALTER TABLE "public"."Purchase" ADD COLUMN     "receivedBy" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
