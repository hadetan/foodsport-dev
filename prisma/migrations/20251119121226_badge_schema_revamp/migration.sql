/*
  Warnings:

  - You are about to drop the column `badge_type` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `criteria_value` on the `badges` table. All the data in the column will be lost.
  - You are about to drop the column `rarity` on the `badges` table. All the data in the column will be lost.
  - Added the required column `place` to the `badges` table without a default value. This is not possible if the table is not empty.
  - Made the column `image_url` on table `badges` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BadgeRuleType" AS ENUM ('calorie_single_activity', 'calorie_cumulative', 'activity_participation_count', 'activity_specific_participation', 'consecutive_days_calories', 'invite_count', 'social_share');

-- CreateEnum
CREATE TYPE "UserBadgeStatus" AS ENUM ('earned', 'pending', 'redeemed');

-- CreateEnum
CREATE TYPE "BadgeRedemptionStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "badges" DROP COLUMN "badge_type",
DROP COLUMN "criteria_value",
DROP COLUMN "rarity",
ADD COLUMN     "activity_id" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "description_zh" TEXT,
ADD COLUMN     "fs_points_cost" INTEGER,
ADD COLUMN     "is_limited_edition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name_zh" TEXT,
ADD COLUMN     "place" INTEGER NOT NULL,
ALTER COLUMN "image_url" SET NOT NULL;

-- AlterTable
ALTER TABLE "temp_users" ADD COLUMN     "pending_calories_for_fs_points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_badges" ADD COLUMN     "points_spent" INTEGER,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" "UserBadgeStatus" NOT NULL DEFAULT 'earned';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pending_calories_for_fs_points" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "BadgeType";

-- CreateTable
CREATE TABLE "badge_rules" (
    "id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "rule_type" "BadgeRuleType" NOT NULL,
    "target_value" INTEGER,
    "params" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_redemptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "points_paid" INTEGER NOT NULL,
    "status" "BadgeRedemptionStatus" NOT NULL DEFAULT 'completed',
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badge_rules_badge_id_key" ON "badge_rules"("badge_id");

-- CreateIndex
CREATE INDEX "badge_redemptions_user_id_idx" ON "badge_redemptions"("user_id");

-- CreateIndex
CREATE INDEX "badge_redemptions_badge_id_idx" ON "badge_redemptions"("badge_id");

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_rules" ADD CONSTRAINT "badge_rules_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_redemptions" ADD CONSTRAINT "badge_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_redemptions" ADD CONSTRAINT "badge_redemptions_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
