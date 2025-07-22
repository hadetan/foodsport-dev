/*
  Warnings:

  - You are about to drop the column `role` on the `admin_user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_organizer_id_fkey";

-- AlterTable
ALTER TABLE "admin_user" DROP COLUMN "role";

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "admin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
