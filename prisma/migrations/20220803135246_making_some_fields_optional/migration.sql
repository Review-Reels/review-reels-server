-- AlterTable
ALTER TABLE `Subscription` MODIFY `url_params` JSON,
    MODIFY `resource_name` VARCHAR(191);
