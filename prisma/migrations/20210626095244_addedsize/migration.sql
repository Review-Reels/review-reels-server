/*
  Warnings:

  - Added the required column `size` to the `ReviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `ReviewResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ReviewRequest` ADD COLUMN `size` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `ReviewResponse` ADD COLUMN `size` BIGINT NOT NULL;
