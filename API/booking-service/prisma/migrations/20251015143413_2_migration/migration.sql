/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `BookingItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[referenceNo]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceNo` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `BookingItem` DROP FOREIGN KEY `BookingItem_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `BookingItem` DROP FOREIGN KEY `BookingItem_roomId_fkey`;

-- DropIndex
DROP INDEX `Booking_userId_fkey` ON `Booking`;

-- AlterTable
ALTER TABLE `Booking` DROP PRIMARY KEY,
    ADD COLUMN `referenceNo` INTEGER NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PENDING', 'CANCELLED', 'BOOKED', 'COMPLETED') NOT NULL DEFAULT 'BOOKED',
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `BookingItem`;

-- DropTable
DROP TABLE `Room`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `BookingDetail` (
    `id` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `note` VARCHAR(191) NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `itemType` ENUM('ROOM', 'BED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Booking_referenceNo_key` ON `Booking`(`referenceNo`);

-- AddForeignKey
ALTER TABLE `BookingDetail` ADD CONSTRAINT `BookingDetail_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
