-- CreateEnum
CREATE TYPE "SocialShareStatus" AS ENUM ('pending', 'verified', 'expired');

-- CreateTable
CREATE TABLE "social_shares" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "redirect_url" TEXT NOT NULL,
    "status" "SocialShareStatus" NOT NULL DEFAULT 'pending',
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,
    "last_click_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_shares_token_key" ON "social_shares"("token");

-- CreateIndex
CREATE INDEX "social_shares_user_id_idx" ON "social_shares"("user_id");

-- AddForeignKey
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
