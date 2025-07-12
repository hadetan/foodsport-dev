/*
  Warnings:

  - Added the required column `socialMediaUrl` to the `social_media_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "social_media_images" ADD COLUMN     "socialMediaUrl" TEXT NOT NULL;
