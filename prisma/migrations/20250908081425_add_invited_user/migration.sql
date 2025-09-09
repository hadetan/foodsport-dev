-- AlterTable
ALTER TABLE "public"."calorie_submissions" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."charities" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."temp_users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "invited_user_id" TEXT,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."invited_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "inviter_id" TEXT,
    "temp_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invited_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invited_users_email_activity_id_key" ON "public"."invited_users"("email", "activity_id");

-- AddForeignKey
ALTER TABLE "public"."invited_users" ADD CONSTRAINT "invited_users_temp_user_id_fkey" FOREIGN KEY ("temp_user_id") REFERENCES "public"."temp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invited_users" ADD CONSTRAINT "invited_users_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "public"."invited_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
