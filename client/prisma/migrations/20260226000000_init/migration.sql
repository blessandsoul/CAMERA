-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `originalPrice` DOUBLE NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'GEL',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `images` JSON NOT NULL,
    `nameKa` VARCHAR(500) NOT NULL,
    `nameRu` VARCHAR(500) NOT NULL,
    `nameEn` VARCHAR(500) NOT NULL,
    `descriptionKa` TEXT NULL,
    `descriptionRu` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `content` LONGTEXT NULL,
    `relatedProducts` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_category_idx`(`category`),
    INDEX `products_isActive_idx`(`isActive`),
    INDEX `products_isFeatured_idx`(`isFeatured`),
    INDEX `products_category_isActive_idx`(`category`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_specs` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `keyKa` VARCHAR(200) NOT NULL,
    `keyRu` VARCHAR(200) NOT NULL,
    `keyEn` VARCHAR(200) NOT NULL,
    `value` VARCHAR(500) NOT NULL,

    INDEX `product_specs_productId_idx`(`productId`),
    INDEX `product_specs_keyKa_value_idx`(`keyKa`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `coverImage` VARCHAR(191) NOT NULL DEFAULT '',
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `readMin` INTEGER NOT NULL DEFAULT 5,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_isPublished_idx`(`isPublished`),
    INDEX `articles_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `total` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orders_status_idx`(`status`),
    INDEX `orders_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `order_items_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inquiries_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `titleKa` VARCHAR(300) NOT NULL,
    `titleRu` VARCHAR(300) NOT NULL,
    `titleEn` VARCHAR(300) NOT NULL,
    `locationKa` VARCHAR(300) NOT NULL,
    `locationRu` VARCHAR(300) NOT NULL,
    `locationEn` VARCHAR(300) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `cameras` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(191) NOT NULL DEFAULT '',
    `year` VARCHAR(10) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `projects_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_config` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `categories` JSON NOT NULL,
    `filters` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `contact` JSON NOT NULL,
    `business` JSON NOT NULL,
    `hours` JSON NOT NULL,
    `stats` JSON NOT NULL,
    `social` JSON NOT NULL,
    `announcement` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

