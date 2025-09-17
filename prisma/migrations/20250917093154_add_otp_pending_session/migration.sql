/*
  Warnings:

  - You are about to drop the column `code` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_time` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `is_used` on the `otps` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_code` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sent_to` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OtpStatus" AS ENUM ('active', 'used', 'cancelled', 'expired');

-- AlterTable
ALTER TABLE "public"."otps" DROP COLUMN "code",
DROP COLUMN "expiry_time",
DROP COLUMN "is_used",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hashed_code" TEXT NOT NULL,
ADD COLUMN     "max_attempts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "sent_to" TEXT NOT NULL,
ADD COLUMN     "status" "public"."OtpStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "public"."pending_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_id" TEXT NOT NULL,
    "encrypted_access_token" TEXT NOT NULL,
    "encrypted_refresh_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."pending_sessions" ADD CONSTRAINT "pending_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_sessions" ADD CONSTRAINT "pending_sessions_otp_id_fkey" FOREIGN KEY ("otp_id") REFERENCES "public"."otps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
