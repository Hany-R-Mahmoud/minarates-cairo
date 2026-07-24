CREATE TABLE "placeAliases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"aliasSlug" varchar(128) NOT NULL,
	"canonicalSlug" varchar(128) NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "placeAliases_aliasSlug_unique" UNIQUE("aliasSlug")
);
--> statement-breakpoint
CREATE TABLE "placeClaims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"claimId" varchar(256) NOT NULL,
	"placeSlug" varchar(128) NOT NULL,
	"storySlug" varchar(128),
	"claimType" varchar(64) NOT NULL,
	"textEn" text NOT NULL,
	"textAr" text,
	"confidence" varchar(64) DEFAULT 'unknown',
	"status" varchar(64) DEFAULT 'pending' NOT NULL,
	"sourceRefs" jsonb,
	"provenance" jsonb,
	"reasons" jsonb,
	"reviewNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "placeClaims_claimId_unique" UNIQUE("claimId")
);
--> statement-breakpoint
CREATE TABLE "researchReviewItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"recordId" varchar(256) NOT NULL,
	"placeSlug" varchar(128) NOT NULL,
	"kind" varchar(64) NOT NULL,
	"status" varchar(64) DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"provenance" jsonb,
	"sourceUrls" jsonb,
	"reasons" jsonb,
	"reviewNote" text,
	"reviewedBy" integer,
	"reviewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "researchReviewItems_recordId_unique" UNIQUE("recordId")
);
--> statement-breakpoint
CREATE TABLE "placeFeatures" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	"featureId" varchar(256) NOT NULL,
	"placeSlug" varchar(128) NOT NULL,
	"labelEn" varchar(256) NOT NULL,
	"labelAr" varchar(256),
	"status" varchar(64) DEFAULT 'pending' NOT NULL,
	"sourceRefs" jsonb,
	"provenance" jsonb,
	"reviewNote" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "placeFeatures_featureId_unique" UNIQUE("featureId")
);
--> statement-breakpoint
CREATE INDEX "placeFeatures_placeSlug_status_idx" ON "placeFeatures" USING btree ("placeSlug", "status");
--> statement-breakpoint
CREATE INDEX "researchReviewItems_kind_status_idx" ON "researchReviewItems" USING btree ("kind", "status");
--> statement-breakpoint
ALTER TABLE "placeAliases" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "placeClaims" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "researchReviewItems" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "placeFeatures" ENABLE ROW LEVEL SECURITY;
