/*
  Warnings:

  - You are about to drop the `Accommodation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccommodationAmenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Amenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Accommodation` DROP FOREIGN KEY `Accommodation_addressId_fkey`;

-- DropForeignKey
ALTER TABLE `AccommodationAmenity` DROP FOREIGN KEY `AccommodationAmenity_accommodationId_fkey`;

-- DropForeignKey
ALTER TABLE `AccommodationAmenity` DROP FOREIGN KEY `AccommodationAmenity_amenityId_fkey`;

-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_accommodationId_fkey`;

-- DropTable
DROP TABLE `Accommodation`;

-- DropTable
DROP TABLE `AccommodationAmenity`;

-- DropTable
DROP TABLE `Address`;

-- DropTable
DROP TABLE `Amenity`;

-- DropTable
DROP TABLE `Image`;

-- CreateTable
CREATE TABLE `accommodations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('HOTEL', 'APARTMENT', 'VILLA', 'HOSTEL', 'RESORT', 'HOMESTAY') NULL,
    `pricePerNight` DECIMAL(10, 2) NULL,
    `capacity` INTEGER UNSIGNED NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `ownerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `addressId` VARCHAR(191) NULL,

    UNIQUE INDEX `accommodations_addressId_key`(`addressId`),
    INDEX `accommodations_type_idx`(`type`),
    INDEX `accommodations_pricePerNight_idx`(`pricePerNight`),
    INDEX `accommodations_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NULL,
    `postalCode` VARCHAR(20) NULL,
    `country` VARCHAR(100) NOT NULL,
    `latitude` DECIMAL(9, 6) NULL,
    `longitude` DECIMAL(9, 6) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `addresses_city_idx`(`city`),
    INDEX `addresses_postalCode_idx`(`postalCode`),
    INDEX `addresses_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accommodations` ADD CONSTRAINT `accommodations_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
