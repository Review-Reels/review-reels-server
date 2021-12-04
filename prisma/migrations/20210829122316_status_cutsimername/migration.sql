/*
  Warnings:

  - Added the required column `customerName` to the `EmailTracker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `EmailTracker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EmailTracker` ADD COLUMN `customerName` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` BOOLEAN NOT NULL;
