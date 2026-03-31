CREATE TABLE `fishspots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`fishs` text NOT NULL,
	`image` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
