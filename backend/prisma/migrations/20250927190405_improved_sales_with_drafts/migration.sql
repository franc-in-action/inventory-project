-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('PENDING', 'COMPLETE', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "public"."SaleStatus" NOT NULL DEFAULT 'PENDING';
