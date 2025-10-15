/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BookingItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roomId` on the `BookingItem` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[referenceNo]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceNo` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `BookingItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitType` to the `BookingItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `BookingItem` DROP FOREIGN KEY `BookingItem_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `BookingItem` DROP FOREIGN KEY `BookingItem_roomId_fkey`;

-- DropIndex
DROP INDEX `Booking_userId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `BookingItem_bookingId_fkey` ON `BookingItem`;

-- DropIndex
DROP INDEX `BookingItem_roomId_fkey` ON `BookingItem`;

-- AlterTable
ALTER TABLE `Booking` DROP PRIMARY KEY,
    ADD COLUMN `referenceNo` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PENDING', 'CANCELLED', 'BOOKED', 'COMPLETED') NOT NULL DEFAULT 'BOOKED',
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `BookingItem` DROP PRIMARY KEY,
    DROP COLUMN `roomId`,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `unitId` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitType` ENUM('ROOM', 'BED') NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `bookingId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Room`;

-- DropTable
DROP TABLE `User`;

-- CreateIndex
CREATE UNIQUE INDEX `Booking_referenceNo_key` ON `Booking`(`referenceNo`);

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
