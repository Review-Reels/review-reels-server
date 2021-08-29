/*
  Warnings:

  - Added the required column `emailId` to the `EmailTracker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EmailTracker` ADD COLUMN `emailId` VARCHAR(191) NOT NULL;
