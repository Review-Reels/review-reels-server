-- CreateTable
CREATE TABLE `EmailTracker` (
    `id` VARCHAR(191) NOT NULL,
    `reviewResponseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewRequestId` VARCHAR(191),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmailTracker` ADD FOREIGN KEY (`reviewResponseId`) REFERENCES `ReviewResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmailTracker` ADD FOREIGN KEY (`reviewRequestId`) REFERENCES `ReviewRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
