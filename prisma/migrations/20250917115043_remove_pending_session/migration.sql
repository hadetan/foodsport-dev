/*
  Warnings:

  - You are about to drop the `pending_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."pending_sessions" DROP CONSTRAINT "pending_sessions_otp_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pending_sessions" DROP CONSTRAINT "pending_sessions_user_id_fkey";

-- DropTable
DROP TABLE "public"."pending_sessions";
