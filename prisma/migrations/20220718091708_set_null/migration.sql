-- DropForeignKey
ALTER TABLE `EmailTracker` DROP FOREIGN KEY `emailtracker_ibfk_3`;

-- AlterTable
ALTER TABLE `EmailTracker` MODIFY `reviewResponseId` VARCHAR(191);

-- AddForeignKey
ALTER TABLE `EmailTracker` ADD FOREIGN KEY (`reviewResponseId`) REFERENCES `ReviewResponse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
