/*
  Warnings:

  - You are about to drop the column `capacity` on the `accommodations` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerNight` on the `accommodations` table. All the data in the column will be lost.
  - You are about to alter the column `ownerId` on the `accommodations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(36)`.
  - You are about to drop the column `state` on the `addresses` table. All the data in the column will be lost.
  - You are about to alter the column `latitude` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,6)` to `Decimal(10,8)`.
  - You are about to alter the column `longitude` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,6)` to `Decimal(11,8)`.
  - Made the column `type` on table `accommodations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `countryCode` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullAddress` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `accommodations_pricePerNight_idx` ON `accommodations`;

-- DropIndex
DROP INDEX `addresses_city_idx` ON `addresses`;

-- AlterTable
ALTER TABLE `accommodations` DROP COLUMN `capacity`,
    DROP COLUMN `pricePerNight`,
    ADD COLUMN `rentalType` ENUM('ENTIRE_PLACE', 'PRIVATE_ROOM', 'SHARED_ROOM') NULL DEFAULT 'ENTIRE_PLACE',
    MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `type` ENUM('HOTEL', 'APARTMENT', 'VILLA', 'VACATION_HOME', 'GUESTHOUSE', 'HOSTEL', 'BED_AND_BREAKFAST', 'HOMESTAY', 'CAMPGROUND', 'COUNTRY_HOUSE', 'BOAT', 'LUXURY_TENT', 'CABIN', 'MOTEL', 'RESORT', 'FARMSTAY', 'CAPSULE_HOTEL', 'TREEHOUSE', 'TOWNHOUSE', 'OTHER') NOT NULL,
    MODIFY `ownerId` VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `state`,
    ADD COLUMN `countryCode` CHAR(2) NOT NULL,
    ADD COLUMN `district` VARCHAR(100) NULL,
    ADD COLUMN `fullAddress` VARCHAR(500) NOT NULL,
    ADD COLUMN `placeId` VARCHAR(255) NULL,
    ADD COLUMN `ward` VARCHAR(100) NULL,
    MODIFY `latitude` DECIMAL(10, 8) NULL,
    MODIFY `longitude` DECIMAL(11, 8) NULL;

-- CreateTable
CREATE TABLE `facilities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('GENERAL', 'FOOD_AND_DRINK', 'PUBLIC_FACILITIES', 'SERVICES', 'SAFETY', 'ACCESSIBILITY', 'ENTERTAINMENT', 'OUTDOOR', 'TRANSPORTATION', 'WELLNESS', 'SPECIAL_AMENITIES', 'SUSTAINABILITY', 'OTHER') NOT NULL DEFAULT 'GENERAL',
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `facilities_type_idx`(`type`),
    UNIQUE INDEX `facilities_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facility_configs` (
    `id` VARCHAR(191) NOT NULL,
    `fee` DECIMAL(10, 2) NULL DEFAULT 0,
    `note` TEXT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `facilityId` VARCHAR(191) NOT NULL,

    INDEX `facility_configs_accommodationId_idx`(`accommodationId`),
    INDEX `facility_configs_facilityId_idx`(`facilityId`),
    UNIQUE INDEX `facility_configs_accommodationId_facilityId_key`(`accommodationId`, `facilityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `accommodations_rentalType_idx` ON `accommodations`(`rentalType`);

-- CreateIndex
CREATE INDEX `addresses_city_ward_idx` ON `addresses`(`city`, `ward`);

-- CreateIndex
CREATE INDEX `addresses_countryCode_city_idx` ON `addresses`(`countryCode`, `city`);

-- AddForeignKey
ALTER TABLE `facility_configs` ADD CONSTRAINT `facility_configs_accommodationId_fkey` FOREIGN KEY (`accommodationId`) REFERENCES `accommodations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facility_configs` ADD CONSTRAINT `facility_configs_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `facilities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
