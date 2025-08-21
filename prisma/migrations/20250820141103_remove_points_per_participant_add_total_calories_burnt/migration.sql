/*
  Warnings:

  - You are about to drop the column `points_per_participant` on the `activities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."activities" DROP COLUMN "points_per_participant",
ADD COLUMN     "total_calories_burnt" INTEGER NOT NULL DEFAULT 0;
