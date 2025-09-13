-- CreateTable
CREATE TABLE "public"."pre_profiles" (
    "id" TEXT NOT NULL,
    "supabase_user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT,
    "lastname" TEXT,
    "picture_url" TEXT,
    "raw_metadata" JSONB,
    "onboardingState" TEXT DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pre_profiles_supabase_user_id_key" ON "public"."pre_profiles"("supabase_user_id");
