/*
  Warnings:

  - You are about to drop the column `tnc_id` on the `activities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."activities" DROP CONSTRAINT "activities_tnc_id_fkey";

-- AlterTable
ALTER TABLE "public"."activities" DROP COLUMN "tnc_id";

-- CreateTable
CREATE TABLE "public"."_ActivityToTnc" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityToTnc_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityToTnc_B_index" ON "public"."_ActivityToTnc"("B");

-- AddForeignKey
ALTER TABLE "public"."_ActivityToTnc" ADD CONSTRAINT "_ActivityToTnc_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActivityToTnc" ADD CONSTRAINT "_ActivityToTnc_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
