/*
  Warnings:

  - You are about to drop the column `photo_url` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `points_earned` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `submission_date` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `verification_status` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `verified_at` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `verified_by` on the `calorie_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `verified_calories` on the `calorie_submissions` table. All the data in the column will be lost.
  - Made the column `submitted_calories` on table `calorie_submissions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "calorie_submissions" DROP COLUMN "photo_url",
DROP COLUMN "points_earned",
DROP COLUMN "submission_date",
DROP COLUMN "updated_at",
DROP COLUMN "verification_status",
DROP COLUMN "verified_at",
DROP COLUMN "verified_by",
DROP COLUMN "verified_calories",
ALTER COLUMN "submitted_calories" SET NOT NULL;
