/*
  Warnings:

  - You are about to drop the column `responseJson` on the `ReviewLibrary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ReviewLibrary` DROP COLUMN `responseJson`,
    ADD COLUMN `libraryConfigJson` JSON;
