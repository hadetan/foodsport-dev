-- AlterTable
ALTER TABLE "public"."otps" ADD COLUMN     "admin_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."otps" ADD CONSTRAINT "otps_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
