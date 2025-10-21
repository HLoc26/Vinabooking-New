/*
  Warnings:

  - You are about to drop the column `type` on the `ImageVariant` table. All the data in the column will be lost.
  - Added the required column `variant` to the `ImageVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ImageVariant_type_imageId_idx` ON `ImageVariant`;

-- AlterTable
ALTER TABLE `ImageVariant` DROP COLUMN `type`,
    ADD COLUMN `variant` ENUM('ORIGINAL', 'THUMBNAIL', 'WEBP', 'OPTIMIZED') NOT NULL;

-- CreateIndex
CREATE INDEX `ImageVariant_variant_imageId_idx` ON `ImageVariant`(`variant`, `imageId`);
