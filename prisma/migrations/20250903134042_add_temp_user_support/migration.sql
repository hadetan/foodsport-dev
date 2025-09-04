/*
  Warnings:

  - A unique constraint covering the columns `[temp_user_id,activity_id]` on the table `user_activities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_activities" DROP CONSTRAINT "user_activities_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "temp_user_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_activities" ADD COLUMN     "temp_user_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."temp_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "total_calories_burned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_email_key" ON "public"."temp_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_activities_temp_user_id_activity_id_key" ON "public"."user_activities"("temp_user_id", "activity_id");

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_temp_user_id_fkey" FOREIGN KEY ("temp_user_id") REFERENCES "public"."temp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_temp_user_id_fkey" FOREIGN KEY ("temp_user_id") REFERENCES "public"."temp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
