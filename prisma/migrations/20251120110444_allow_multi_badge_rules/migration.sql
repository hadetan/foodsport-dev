/*
  Warnings:

  - Added the required column `updated_at` to the `badge_rules` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "badge_rules_badge_id_key";

-- AlterTable
ALTER TABLE "badge_rules" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "badge_rules_badge_id_idx" ON "badge_rules"("badge_id");
