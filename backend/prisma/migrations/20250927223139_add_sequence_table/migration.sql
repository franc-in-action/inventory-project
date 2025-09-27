-- CreateTable
CREATE TABLE "public"."Sequence" (
    "id" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);
