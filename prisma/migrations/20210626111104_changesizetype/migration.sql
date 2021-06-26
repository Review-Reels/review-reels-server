/*
  Warnings:

  - You are about to alter the column `size` on the `ReviewRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `size` on the `ReviewResponse` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `ReviewRequest` MODIFY `size` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ReviewResponse` MODIFY `size` INTEGER NOT NULL;
