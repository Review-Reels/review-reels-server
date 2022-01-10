-- AlterTable
ALTER TABLE `EmailTracker` ALTER COLUMN `customerName` DROP DEFAULT,
    MODIFY `subject` VARCHAR(191) DEFAULT '';
