-- AlterTable
ALTER TABLE `User` ADD COLUMN `authType` VARCHAR(191) NOT NULL DEFAULT 'native',
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `ReviewRequest` (
    `id` VARCHAR(191) NOT NULL,
    `askMessage` VARCHAR(191),
    `videoUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewResponse` (
    `id` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `whatYouDo` VARCHAR(191),
    `videoUrl` VARCHAR(191) NOT NULL,
    `requestMessageId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReviewRequest` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewResponse` ADD FOREIGN KEY (`requestMessageId`) REFERENCES `ReviewRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
