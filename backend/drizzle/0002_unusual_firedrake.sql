CREATE TABLE `video_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`video_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_answer` text NOT NULL,
	`explanation` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
