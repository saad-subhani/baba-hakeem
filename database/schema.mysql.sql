-- Structure only: no admin passwords, orders, or customer records.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `slug_base` varchar(140) NOT NULL DEFAULT '',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_cat_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `image_path` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `stock_status` varchar(50) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT NULL,
  `sort_order` int(11) DEFAULT NULL,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT NULL,
  `product_type` varchar(10) NOT NULL DEFAULT 'simple',
  `regular_price` decimal(12,2) DEFAULT NULL,
  `sell_price` decimal(12,2) DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(320) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `overview` text DEFAULT NULL,
  `usage` text DEFAULT NULL,
  `faqs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`faqs`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `product_variations` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `label` varchar(120) NOT NULL,
  `regular_price` decimal(12,2) DEFAULT NULL,
  `sell_price` decimal(12,2) DEFAULT NULL,
  `image` varchar(600) DEFAULT NULL,
  `image_path` varchar(300) DEFAULT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_pv_product` (`product_id`),
  CONSTRAINT `fk_pv_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(36) NOT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `stock_reserved` tinyint(1) DEFAULT 0,
  `customer_email` varchar(254) DEFAULT '',
  `payment_method` varchar(30) DEFAULT '',
  `transaction_id` varchar(120) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `line_total` decimal(12,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` varchar(36) NOT NULL,
  `customer_name` varchar(120) NOT NULL,
  `customer_email` varchar(254) DEFAULT '',
  `customer_phone` varchar(24) DEFAULT '',
  `category` varchar(50) NOT NULL,
  `order_reference` varchar(50) DEFAULT '',
  `message` text NOT NULL,
  `status` varchar(20) DEFAULT 'New',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `order_email_outbox` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `kind` varchar(20) NOT NULL DEFAULT 'customer',
  `recipient_email` varchar(254) DEFAULT '',
  `status` varchar(20) DEFAULT 'pending',
  `attempts` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `claimed_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `next_attempt_at` datetime DEFAULT NULL,
  `last_error` text DEFAULT NULL,
  `provider_message_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `previous_quantity` int(11) NOT NULL,
  `new_quantity` int(11) NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `reason` varchar(200) DEFAULT '',
  `changed_by` varchar(255) DEFAULT '',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `order_status_events` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `previous_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) NOT NULL,
  `note` text DEFAULT NULL,
  `changed_by` varchar(255) DEFAULT '',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `blogs` (
  `id` varchar(36) NOT NULL,
  `title` varchar(240) NOT NULL,
  `slug` varchar(260) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'Wellness',
  `excerpt` varchar(500) NOT NULL DEFAULT '',
  `content` mediumtext NOT NULL,
  `featured_image` varchar(700) NOT NULL DEFAULT '',
  `meta_title` varchar(200) NOT NULL DEFAULT '',
  `meta_description` varchar(320) NOT NULL DEFAULT '',
  `status` enum('Draft','Published') NOT NULL DEFAULT 'Draft',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_blog_slug` (`slug`),
  KEY `idx_blog_public` (`status`,`published_at`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `reviewer_name` varchar(120) NOT NULL,
  `rating` tinyint(3) unsigned NOT NULL,
  `title` varchar(180) NOT NULL,
  `body` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('Published','Pending','Hidden') NOT NULL DEFAULT 'Published',
  `is_sample` tinyint(1) NOT NULL DEFAULT 0,
  `source_key` varchar(96) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `source_key` (`source_key`),
  KEY `idx_product_reviews_public` (`product_id`,`status`,`created_at`,`id`),
  KEY `idx_product_reviews_admin` (`status`,`created_at`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_pages` (
  `id` varchar(36) NOT NULL,
  `page_key` varchar(80) NOT NULL,
  `html_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(320) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_page_key` (`page_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `store_bank_details` (
  `id` tinyint(3) unsigned NOT NULL,
  `account_title` varchar(160) NOT NULL DEFAULT '',
  `bank_name` varchar(120) NOT NULL DEFAULT '',
  `logo_url` varchar(700) NOT NULL DEFAULT '',
  `iban` varchar(80) NOT NULL DEFAULT '',
  `account_number` varchar(80) NOT NULL DEFAULT '',
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `store_contact_settings` (
  `id` tinyint(3) unsigned NOT NULL,
  `whatsapp_number` varchar(40) NOT NULL DEFAULT '',
  `phone_number` varchar(40) NOT NULL DEFAULT '',
  `email` varchar(254) NOT NULL DEFAULT '',
  `address` varchar(600) NOT NULL DEFAULT '',
  `facebook_url` varchar(700) NOT NULL DEFAULT '',
  `instagram_url` varchar(700) NOT NULL DEFAULT '',
  `tiktok_url` varchar(700) NOT NULL DEFAULT '',
  `youtube_url` varchar(700) NOT NULL DEFAULT '',
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `video_testimonials` (
  `id` varchar(36) NOT NULL,
  `customer_name` varchar(160) NOT NULL,
  `location` varchar(120) NOT NULL DEFAULT '',
  `product_name` varchar(180) NOT NULL DEFAULT '',
  `quote` varchar(600) NOT NULL DEFAULT '',
  `video_url` varchar(700) NOT NULL,
  `poster_url` varchar(700) NOT NULL DEFAULT '',
  `status` enum('Draft','Published') NOT NULL DEFAULT 'Draft',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_video_testimonials_public` (`status`,`sort_order`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
