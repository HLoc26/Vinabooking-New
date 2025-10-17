-- CreateTable
CREATE TABLE `Image` (
    `id` VARCHAR(191) NOT NULL,
    `s3Key` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `size` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageReference` (
    `id` VARCHAR(191) NOT NULL,
    `imageId` VARCHAR(191) NOT NULL,
    `entityType` ENUM('ACCOMMODATION', 'USER_PROFILE', 'ROOM', 'REVIEW') NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ImageReference_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageVariant` (
    `id` VARCHAR(191) NOT NULL,
    `s3Key` VARCHAR(191) NOT NULL,
    `type` ENUM('THUMBNAIL', 'WEBP', 'OPTIMIZED') NOT NULL,
    `imageId` VARCHAR(191) NOT NULL,

    INDEX `ImageVariant_type_imageId_idx`(`type`, `imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ImageReference` ADD CONSTRAINT `ImageReference_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageVariant` ADD CONSTRAINT `ImageVariant_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
