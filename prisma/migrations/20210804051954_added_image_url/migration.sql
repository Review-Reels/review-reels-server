-- AlterTable
ALTER TABLE `ReviewRequest` ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ReviewResponse` ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL DEFAULT '';
