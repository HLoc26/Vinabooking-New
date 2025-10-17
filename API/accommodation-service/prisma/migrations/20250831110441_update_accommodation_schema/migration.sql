/*
  Warnings:

  - You are about to drop the `Amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccommodationToAmenities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_AccommodationToAmenities` DROP FOREIGN KEY `_AccommodationToAmenities_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AccommodationToAmenities` DROP FOREIGN KEY `_AccommodationToAmenities_B_fkey`;

-- DropTable
DROP TABLE `Amenities`;

-- DropTable
DROP TABLE `_AccommodationToAmenities`;

-- CreateTable
CREATE TABLE `Amenity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('WIFI', 'POOL', 'GYM', 'PARKING', 'KITCHEN', 'AC') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccommodationAmenity` (
    `id` VARCHAR(191) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,
    `type` ENUM('WIFI', 'POOL', 'GYM', 'PARKING', 'KITCHEN', 'AC') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccommodationAmenity` ADD CONSTRAINT `AccommodationAmenity_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `Accommodation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccommodationAmenity` ADD CONSTRAINT `AccommodationAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
