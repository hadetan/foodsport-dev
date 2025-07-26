/*
  Warnings:

  - You are about to drop the column `current_participants` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `organizer_name` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `activity_level` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `badge_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `calorie_goal` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `current_streak` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `daily_goal` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_goal` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `total_activities` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `total_donations` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `weekly_goal` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `yearly_goal` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activities" DROP COLUMN "current_participants",
DROP COLUMN "organizer_name";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "activity_level",
DROP COLUMN "badge_count",
DROP COLUMN "calorie_goal",
DROP COLUMN "current_streak",
DROP COLUMN "daily_goal",
DROP COLUMN "monthly_goal",
DROP COLUMN "total_activities",
DROP COLUMN "total_donations",
DROP COLUMN "weekly_goal",
DROP COLUMN "yearly_goal";
