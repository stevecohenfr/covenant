/*
  Warnings:

  - You are about to drop the column `usageRights` on the `Collab` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Collab" DROP COLUMN "usageRights",
ADD COLUMN     "accessoriesDetails" TEXT,
ADD COLUMN     "usageDuration" TEXT,
ADD COLUMN     "usagePaidMedia" BOOLEAN,
ADD COLUMN     "usageRegions" TEXT[];
