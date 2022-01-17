-- AlterTable
ALTER TABLE `EmailTracker` ADD COLUMN `subject` VARCHAR(191),
    MODIFY `customerName` VARCHAR(191) NOT NULL DEFAULT '';
