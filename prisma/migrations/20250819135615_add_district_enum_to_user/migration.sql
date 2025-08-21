-- CreateEnum
CREATE TYPE "public"."District" AS ENUM ('Central_and_Western', 'Eastern', 'Southern', 'Wan_Chai', 'Kowloon_City', 'Kwun_Tong', 'Sham_Shui_Po', 'Wong_Tai_Sin', 'Yau_Tsim_Mong', 'Islands', 'Kwai_Tsing', 'North', 'Sai_Kung', 'Sha_Tin', 'Tai_Po', 'Tsuen_Wan', 'Tuen_Mun', 'Yuen_Long');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "district" "public"."District";
