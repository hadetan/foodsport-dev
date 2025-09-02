/*
  Warnings:

  - The values [kayak,hiking,yoga,fitness,running,cycling,swimming,dancing,boxing,other] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityType_new" AS ENUM ('Running', 'Hiking', 'Water_Sport', 'Volunteering', 'Racket_Sport', 'Yoga', 'Dance', 'Fitness', 'Cycling', 'Mindfulness', 'Team_Sport', 'Virtual', 'Multi_Sports');
ALTER TABLE "public"."activities" ALTER COLUMN "activity_type" TYPE "public"."ActivityType_new" USING ("activity_type"::text::"public"."ActivityType_new");
ALTER TYPE "public"."ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "public"."ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;
