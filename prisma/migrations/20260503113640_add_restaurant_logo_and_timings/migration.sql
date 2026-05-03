-- AlterTable
ALTER TABLE "RestaurantSettings" ADD COLUMN     "closingTime" TEXT NOT NULL DEFAULT '22:00',
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "openingTime" TEXT NOT NULL DEFAULT '11:00';
