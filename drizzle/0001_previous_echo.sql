CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`beforeData` json,
	`afterData` json,
	`ipAddress` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`titleAr` varchar(256) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`explanationEn` text,
	`explanationAr` text,
	`placeIds` json,
	`comparisonAspects` json,
	`status` enum('draft','published') DEFAULT 'draft',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comparisons_id` PRIMARY KEY(`id`),
	CONSTRAINT `comparisons_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `detectiveActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`titleAr` varchar(256) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`activityType` enum('find_detail','match_silhouette','street_or_qibla','build_complex','which_century','material_microscope','layer_reveal','route_riddle','patron_network','vocabulary_deck') NOT NULL,
	`placeId` int,
	`promptEn` text,
	`promptAr` text,
	`imageUrl` varchar(512),
	`imageAttribution` text,
	`options` json,
	`correctAnswer` varchar(256),
	`explanationEn` text,
	`explanationAr` text,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`status` enum('draft','published') DEFAULT 'draft',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detectiveActivities_id` PRIMARY KEY(`id`),
	CONSTRAINT `detectiveActivities_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `districts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`nameEn` varchar(128) NOT NULL,
	`nameAr` varchar(128) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `districts_id` PRIMARY KEY(`id`),
	CONSTRAINT `districts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `dynasties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`nameEn` varchar(128) NOT NULL,
	`nameAr` varchar(128) NOT NULL,
	`periodId` int,
	`startYear` int,
	`endYear` int,
	`descriptionEn` text,
	`descriptionAr` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dynasties_id` PRIMARY KEY(`id`),
	CONSTRAINT `dynasties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `mediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetId` varchar(128) NOT NULL,
	`placeId` int,
	`originalFilename` varchar(512),
	`cdnKey` varchar(512),
	`url` varchar(1024),
	`width` int,
	`height` int,
	`mimeType` varchar(64),
	`fileSizeBytes` int,
	`checksum` varchar(128),
	`creator` varchar(256),
	`sourcePage` varchar(1024),
	`license` varchar(128),
	`licenseUrl` varchar(512),
	`attribution` text,
	`modifications` text,
	`altEn` text,
	`altAr` text,
	`captionEn` text,
	`captionAr` text,
	`visualType` enum('exterior','interior','portal','minaret','dome','courtyard','detail','plan','map','archival','street','aerial','material','inscription','other') DEFAULT 'exterior',
	`documentaryStatus` enum('documentary','archival','illustration','decorative','generated') DEFAULT 'documentary',
	`focalPointX` decimal(4,3),
	`focalPointY` decimal(4,3),
	`approved` boolean DEFAULT false,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaAssets_assetId_unique` UNIQUE(`assetId`)
);
--> statement-breakpoint
CREATE TABLE `periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`nameEn` varchar(128) NOT NULL,
	`nameAr` varchar(128) NOT NULL,
	`startYear` int NOT NULL,
	`endYear` int,
	`descriptionEn` text,
	`descriptionAr` text,
	`colorToken` varchar(64),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `periods_id` PRIMARY KEY(`id`),
	CONSTRAINT `periods_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `placeTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`nameEn` varchar(128) NOT NULL,
	`nameAr` varchar(128) NOT NULL,
	`icon` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `placeTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `placeTypes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `places` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`nameEn` varchar(256) NOT NULL,
	`nameAr` varchar(256) NOT NULL,
	`nameAlt` text,
	`periodId` int,
	`dynastyId` int,
	`districtId` int,
	`placeTypeId` int,
	`foundedYear` int,
	`foundedYearEnd` int,
	`dateCertainty` enum('certain','approximate','disputed','unknown') DEFAULT 'approximate',
	`dateDisplayEn` varchar(128),
	`dateDisplayAr` varchar(128),
	`patronEn` varchar(256),
	`patronAr` varchar(256),
	`architectEn` varchar(256),
	`architectAr` varchar(256),
	`originalFunctionEn` varchar(256),
	`originalFunctionAr` varchar(256),
	`currentFunctionEn` varchar(256),
	`currentFunctionAr` varchar(256),
	`briefEn` text,
	`briefAr` text,
	`clarificationEn` text,
	`clarificationAr` text,
	`keyDates` json,
	`architecturalPhases` json,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`locationPrecision` enum('exact','approximate','district') DEFAULT 'approximate',
	`activeWorship` boolean DEFAULT false,
	`funerarySensitive` boolean DEFAULT false,
	`ticketed` boolean,
	`photographyAllowed` enum('yes','exterior_only','no','ask','unknown') DEFAULT 'unknown',
	`openingHoursEn` text,
	`openingHoursAr` text,
	`practicalInfoFreshness` timestamp,
	`practicalInfoSource` varchar(512),
	`accessibilityConfidence` enum('high','medium','low','unknown') DEFAULT 'unknown',
	`accessibilityNotesEn` text,
	`accessibilityNotesAr` text,
	`recommendedDurationMin` int,
	`recommendedDurationMax` int,
	`coverImageUrl` varchar(512),
	`coverImageAlt` varchar(512),
	`coverImageAltAr` varchar(512),
	`coverImageAttribution` text,
	`coverImageLicense` varchar(128),
	`status` enum('draft','review','published','archived') DEFAULT 'draft',
	`publishedAt` timestamp,
	`priorityVisualStoryEn` text,
	`priorityVisualStoryAr` text,
	`sourceIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `places_id` PRIMARY KEY(`id`),
	CONSTRAINT `places_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`titleEn` varchar(512) NOT NULL,
	`titleAr` varchar(512),
	`authors` text,
	`publisher` varchar(256),
	`year` int,
	`url` varchar(1024),
	`sourceType` enum('academic','institution','archive','museum','conservation','government','journalism','oral') DEFAULT 'academic',
	`reliabilityNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `sources_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`titleEn` varchar(256) NOT NULL,
	`titleAr` varchar(256) NOT NULL,
	`summaryEn` text,
	`summaryAr` text,
	`bodyEn` text,
	`bodyAr` text,
	`coverImageUrl` varchar(512),
	`coverImageAttribution` text,
	`relatedPlaceIds` json,
	`periodIds` json,
	`tags` json,
	`status` enum('draft','published') DEFAULT 'draft',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userCollections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nameEn` varchar(256) NOT NULL,
	`nameAr` varchar(256),
	`descriptionEn` text,
	`descriptionAr` text,
	`placeIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userCollections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`placeId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userItineraries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nameEn` varchar(256) NOT NULL,
	`nameAr` varchar(256),
	`days` int DEFAULT 1,
	`preferences` json,
	`items` json,
	`hasStaleInfo` boolean DEFAULT false,
	`hasWorshipSites` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userItineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`placeId` int,
	`content` text NOT NULL,
	`language` enum('en','ar') DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userVisited` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`placeId` int NOT NULL,
	`visitedAt` timestamp NOT NULL DEFAULT (now()),
	`noteEn` text,
	`noteAr` text,
	CONSTRAINT `userVisited_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`nameEn` varchar(256) NOT NULL,
	`nameAr` varchar(256) NOT NULL,
	`descriptionEn` text,
	`descriptionAr` text,
	`durationMinutes` int,
	`distanceMeters` int,
	`difficulty` enum('easy','moderate','challenging') DEFAULT 'moderate',
	`districtId` int,
	`periodIds` json,
	`stops` json,
	`accessibilityNotesEn` text,
	`accessibilityNotesAr` text,
	`stairsAndSurfaces` text,
	`hasStaleInfo` boolean DEFAULT false,
	`staleInfoNoteEn` text,
	`staleInfoNoteAr` text,
	`requiresFuneraryApproval` boolean DEFAULT false,
	`offlineSizeKb` int,
	`coverImageUrl` varchar(512),
	`coverImageAttribution` text,
	`status` enum('draft','review','published') DEFAULT 'draft',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walks_id` PRIMARY KEY(`id`),
	CONSTRAINT `walks_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','curator','editor','researcher') NOT NULL DEFAULT 'user';