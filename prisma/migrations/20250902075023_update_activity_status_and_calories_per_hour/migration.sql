/*
  Warnings:

  - The values [upcoming,closed,completed,cancelled] on the enum `ActivityStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityStatus_new" AS ENUM ('active', 'draft');
ALTER TABLE "public"."activities" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."activities" ALTER COLUMN "status" TYPE "public"."ActivityStatus_new" USING ("status"::text::"public"."ActivityStatus_new");
ALTER TYPE "public"."ActivityStatus" RENAME TO "ActivityStatus_old";
ALTER TYPE "public"."ActivityStatus_new" RENAME TO "ActivityStatus";
DROP TYPE "public"."ActivityStatus_old";
ALTER TABLE "public"."activities" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "public"."activities" ALTER COLUMN "calories_per_hour" DROP DEFAULT,
ALTER COLUMN "calories_per_hour" SET DATA TYPE TEXT;
