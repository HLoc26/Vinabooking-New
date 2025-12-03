/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomAmenity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_roomId_fkey`;

-- DropForeignKey
ALTER TABLE `RoomAmenity` DROP FOREIGN KEY `RoomAmenity_roomId_fkey`;

-- DropTable
DROP TABLE `Image`;

-- DropTable
DROP TABLE `Room`;

-- DropTable
DROP TABLE `RoomAmenity`;

-- CreateTable
CREATE TABLE `rooms` (
    `id` VARCHAR(191) NOT NULL,
    `accommodationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `maxCapacity` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `size` DECIMAL(5, 2) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `count` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `rooms_accommodationId_idx`(`accommodationId`),
    INDEX `rooms_price_idx`(`price`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
