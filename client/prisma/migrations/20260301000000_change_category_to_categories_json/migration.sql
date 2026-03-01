-- AlterTable: Convert category (VARCHAR) to categories (JSON array)
-- Step 1: Add new JSON column
ALTER TABLE `products` ADD COLUMN `categories` JSON NULL;

-- Step 2: Migrate existing data — wrap single category string into JSON array
UPDATE `products` SET `categories` = JSON_ARRAY(`category`);

-- Step 3: Make new column NOT NULL
ALTER TABLE `products` MODIFY COLUMN `categories` JSON NOT NULL;

-- Step 4: Drop old column and indexes
DROP INDEX `products_category_idx` ON `products`;
DROP INDEX `products_category_isActive_idx` ON `products`;
ALTER TABLE `products` DROP COLUMN `category`;
