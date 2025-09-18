-- CreateTable
CREATE TABLE "public"."ServerChange" (
    "id" BIGSERIAL NOT NULL,
    "changeTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "payload" JSONB NOT NULL,

    CONSTRAINT "ServerChange_pkey" PRIMARY KEY ("id")
);
