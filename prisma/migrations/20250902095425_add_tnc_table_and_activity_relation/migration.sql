-- AlterTable
ALTER TABLE "public"."activities" ADD COLUMN     "tnc_id" TEXT;

-- CreateTable
CREATE TABLE "public"."tncs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "admin_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tncs_title_key" ON "public"."tncs"("title");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_tnc_id_fkey" FOREIGN KEY ("tnc_id") REFERENCES "public"."tncs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
