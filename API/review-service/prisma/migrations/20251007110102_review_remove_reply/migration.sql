/*
  Warnings:

  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `ReviewReply` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `acoommodationId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ReviewReply` DROP FOREIGN KEY `ReviewReply_reviewId_fkey`;

-- AlterTable
ALTER TABLE `Review` DROP PRIMARY KEY,
    ADD COLUMN `acoommodationId` VARCHAR(191) NOT NULL,
    ADD COLUMN `parentId` VARCHAR(191) NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `star` INTEGER NULL,
    MODIFY `comment` TEXT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `ReviewReply`;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Review`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
