-- DropForeignKey
ALTER TABLE `EmailTracker` DROP FOREIGN KEY `emailtracker_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ReviewRequest` DROP FOREIGN KEY `reviewrequest_ibfk_1`;

-- AddForeignKey
ALTER TABLE `ReviewRequest` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailTracker` ADD FOREIGN KEY (`reviewResponseId`) REFERENCES `ReviewResponse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
