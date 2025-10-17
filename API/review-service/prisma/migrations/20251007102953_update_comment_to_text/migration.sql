/*
  Warnings:

  - You are about to drop the column `reviewDate` on the `Review` table. All the data in the column will be lost.
  - The primary key for the `ReviewReply` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `replyDate` on the `ReviewReply` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ReviewReply` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Review` DROP COLUMN `reviewDate`;

-- AlterTable
ALTER TABLE `ReviewReply` DROP PRIMARY KEY,
    DROP COLUMN `replyDate`,
    DROP COLUMN `updatedAt`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `comment` TEXT NOT NULL,
    ADD PRIMARY KEY (`id`);
