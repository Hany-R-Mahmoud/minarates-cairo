CREATE TABLE "auditLog" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auditLog_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"action" varchar(128) NOT NULL,
	"entityType" varchar(64),
	"entityId" integer,
	"beforeData" jsonb,
	"afterData" jsonb,
	"ipAddress" varchar(64),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comparisons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"titleEn" varchar(256) NOT NULL,
	"titleAr" varchar(256) NOT NULL,
	"descriptionEn" text,
	"descriptionAr" text,
	"explanationEn" text,
	"explanationAr" text,
	"placeIds" jsonb,
	"comparisonAspects" jsonb,
	"status" varchar(64) DEFAULT 'draft',
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comparisons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "detectiveActivities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "detectiveActivities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"titleEn" varchar(256) NOT NULL,
	"titleAr" varchar(256) NOT NULL,
	"descriptionEn" text,
	"descriptionAr" text,
	"activityType" varchar(64) NOT NULL,
	"placeId" integer,
	"promptEn" text,
	"promptAr" text,
	"imageUrl" varchar(512),
	"imageAttribution" text,
	"options" jsonb,
	"correctAnswer" varchar(256),
	"explanationEn" text,
	"explanationAr" text,
	"difficulty" varchar(64) DEFAULT 'intermediate',
	"status" varchar(64) DEFAULT 'draft',
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "detectiveActivities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "districts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"nameEn" varchar(128) NOT NULL,
	"nameAr" varchar(128) NOT NULL,
	"descriptionEn" text,
	"descriptionAr" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dynasties" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dynasties_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"nameEn" varchar(128) NOT NULL,
	"nameAr" varchar(128) NOT NULL,
	"periodId" integer,
	"startYear" integer,
	"endYear" integer,
	"descriptionEn" text,
	"descriptionAr" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dynasties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mediaAssets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mediaAssets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"assetId" varchar(128) NOT NULL,
	"placeId" integer,
	"uploadedBy" integer,
	"mediaType" varchar(32) DEFAULT 'photo',
	"originalFilename" varchar(512),
	"cdnKey" varchar(512),
	"url" varchar(1024),
	"width" integer,
	"height" integer,
	"mimeType" varchar(64),
	"fileSizeBytes" integer,
	"checksum" varchar(128),
	"creator" varchar(256),
	"sourcePage" varchar(1024),
	"license" varchar(128),
	"licenseUrl" varchar(512),
	"attribution" text,
	"modifications" text,
	"altEn" text,
	"altAr" text,
	"captionEn" text,
	"captionAr" text,
	"visualType" varchar(64) DEFAULT 'exterior',
	"documentaryStatus" varchar(64) DEFAULT 'documentary',
	"focalPointX" numeric(4, 3),
	"focalPointY" numeric(4, 3),
	"approved" boolean DEFAULT false,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mediaAssets_assetId_unique" UNIQUE("assetId")
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "periods_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"nameEn" varchar(128) NOT NULL,
	"nameAr" varchar(128) NOT NULL,
	"startYear" integer NOT NULL,
	"endYear" integer,
	"descriptionEn" text,
	"descriptionAr" text,
	"colorToken" varchar(64),
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "periods_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "placeTypes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "placeTypes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"nameEn" varchar(128) NOT NULL,
	"nameAr" varchar(128) NOT NULL,
	"icon" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "placeTypes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "places_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"nameEn" varchar(256) NOT NULL,
	"nameAr" varchar(256) NOT NULL,
	"nameAlt" text,
	"periodId" integer,
	"dynastyId" integer,
	"districtId" integer,
	"placeTypeId" integer,
	"foundedYear" integer,
	"foundedYearEnd" integer,
	"dateCertainty" varchar(64) DEFAULT 'approximate',
	"dateDisplayEn" varchar(128),
	"dateDisplayAr" varchar(128),
	"patronEn" varchar(256),
	"patronAr" varchar(256),
	"architectEn" varchar(256),
	"architectAr" varchar(256),
	"originalFunctionEn" varchar(256),
	"originalFunctionAr" varchar(256),
	"currentFunctionEn" varchar(256),
	"currentFunctionAr" varchar(256),
	"briefEn" text,
	"briefAr" text,
	"clarificationEn" text,
	"clarificationAr" text,
	"keyDates" jsonb,
	"architecturalPhases" jsonb,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"locationPrecision" varchar(64) DEFAULT 'approximate',
	"activeWorship" boolean DEFAULT false,
	"funerarySensitive" boolean DEFAULT false,
	"ticketed" boolean,
	"photographyAllowed" varchar(64) DEFAULT 'unknown',
	"openingHoursEn" text,
	"openingHoursAr" text,
	"practicalInfoFreshness" timestamp,
	"practicalInfoSource" varchar(512),
	"accessibilityConfidence" varchar(64) DEFAULT 'unknown',
	"accessibilityNotesEn" text,
	"accessibilityNotesAr" text,
	"recommendedDurationMin" integer,
	"recommendedDurationMax" integer,
	"coverImageUrl" varchar(512),
	"coverImageAlt" varchar(512),
	"coverImageAltAr" varchar(512),
	"coverImageAttribution" text,
	"coverImageLicense" varchar(128),
	"status" varchar(64) DEFAULT 'draft',
	"publishedAt" timestamp,
	"priorityVisualStoryEn" text,
	"priorityVisualStoryAr" text,
	"sourceIds" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "places_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"titleEn" varchar(512) NOT NULL,
	"titleAr" varchar(512),
	"authors" text,
	"publisher" varchar(256),
	"year" integer,
	"url" varchar(1024),
	"sourceType" varchar(64) DEFAULT 'academic',
	"reliabilityNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"titleEn" varchar(256) NOT NULL,
	"titleAr" varchar(256) NOT NULL,
	"summaryEn" text,
	"summaryAr" text,
	"bodyEn" text,
	"bodyAr" text,
	"coverImageUrl" varchar(512),
	"coverImageAttribution" text,
	"descriptionEn" text,
	"descriptionAr" text,
	"placeId" integer,
	"storyType" varchar(64),
	"chaptersJson" text,
	"relatedPlaceIds" jsonb,
	"periodIds" jsonb,
	"tags" jsonb,
	"status" varchar(64) DEFAULT 'draft',
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "userCollections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userCollections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"nameEn" varchar(256) NOT NULL,
	"nameAr" varchar(256),
	"descriptionEn" text,
	"descriptionAr" text,
	"placeIds" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userFavorites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userFavorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"placeId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userItineraries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userItineraries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"nameEn" varchar(256) NOT NULL,
	"nameAr" varchar(256),
	"days" integer DEFAULT 1,
	"preferences" jsonb,
	"items" jsonb,
	"hasStaleInfo" boolean DEFAULT false,
	"hasWorshipSites" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userNotes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userNotes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"placeId" integer,
	"content" text NOT NULL,
	"language" varchar(64) DEFAULT 'en',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userVisited" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "userVisited_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"placeId" integer NOT NULL,
	"visitedAt" timestamp DEFAULT now() NOT NULL,
	"noteEn" text,
	"noteAr" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(64) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "walks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "walks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(128) NOT NULL,
	"nameEn" varchar(256) NOT NULL,
	"nameAr" varchar(256) NOT NULL,
	"descriptionEn" text,
	"descriptionAr" text,
	"durationMinutes" integer,
	"distanceMeters" integer,
	"difficulty" varchar(64) DEFAULT 'moderate',
	"districtId" integer,
	"periodIds" jsonb,
	"stops" jsonb,
	"accessibilityNotesEn" text,
	"accessibilityNotesAr" text,
	"stairsAndSurfaces" text,
	"hasStaleInfo" boolean DEFAULT false,
	"staleInfoNoteEn" text,
	"staleInfoNoteAr" text,
	"requiresFuneraryApproval" boolean DEFAULT false,
	"offlineSizeKb" integer,
	"coverImageUrl" varchar(512),
	"coverImageAttribution" text,
	"status" varchar(64) DEFAULT 'draft',
	"sortOrder" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "walks_slug_unique" UNIQUE("slug")
);
