-- DropForeignKey
ALTER TABLE "public"."otps" DROP CONSTRAINT "otps_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."otps" ADD COLUMN     "temp_user_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otps" ADD CONSTRAINT "otps_temp_user_id_fkey" FOREIGN KEY ("temp_user_id") REFERENCES "public"."temp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
