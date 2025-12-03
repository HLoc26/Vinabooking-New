-- CreateTable
CREATE TABLE `UserAuthProvider` (
    `email` VARCHAR(191) NOT NULL,
    `provider` ENUM('Credentials', 'Google') NOT NULL DEFAULT 'Credentials',

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
