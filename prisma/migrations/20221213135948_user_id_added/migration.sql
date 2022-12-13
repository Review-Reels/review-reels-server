/*
  Warnings:

  - Added the required column `userId` to the `ReviewLibrary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ReviewLibrary` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `ReviewLibrary` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
