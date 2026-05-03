/*
  Warnings:

  - You are about to drop the column `logo` on the `RestaurantSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RestaurantSettings" DROP COLUMN "logo",
ADD COLUMN     "logoUrl" TEXT;
