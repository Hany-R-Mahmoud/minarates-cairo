import {
  boolean,
  integer as int,
  jsonb as json,
  numeric as decimal,
  pgTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

const enumText = <const T extends readonly [string, ...string[]]>(
  name: string,
  values: T
) => varchar(name, { length: 64, enum: values });

// ============================================================
// IDENTITY
// ============================================================

export const users = pgTable("users", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: enumText("role", ["user", "admin", "curator", "editor", "researcher"])
    .default("user")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}).enableRLS();

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// HISTORICAL TAXONOMY
// ============================================================

export const periods = pgTable("periods", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  nameAr: varchar("nameAr", { length: 128 }).notNull(),
  startYear: int("startYear").notNull(),
  endYear: int("endYear"),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  colorToken: varchar("colorToken", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type Period = typeof periods.$inferSelect;

export const dynasties = pgTable("dynasties", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  nameAr: varchar("nameAr", { length: 128 }).notNull(),
  periodId: int("periodId"),
  startYear: int("startYear"),
  endYear: int("endYear"),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type Dynasty = typeof dynasties.$inferSelect;

export const districts = pgTable("districts", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  nameAr: varchar("nameAr", { length: 128 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type District = typeof districts.$inferSelect;

export const placeTypes = pgTable("placeTypes", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 128 }).notNull(),
  nameAr: varchar("nameAr", { length: 128 }).notNull(),
  icon: varchar("icon", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type PlaceType = typeof placeTypes.$inferSelect;

// ============================================================
// PLACES
// ============================================================

export const places = pgTable("places", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 256 }).notNull(),
  nameAr: varchar("nameAr", { length: 256 }).notNull(),
  nameAlt: text("nameAlt"), // JSON array of aliases
  periodId: int("periodId"),
  dynastyId: int("dynastyId"),
  districtId: int("districtId"),
  placeTypeId: int("placeTypeId"),

  // Dates
  foundedYear: int("foundedYear"),
  foundedYearEnd: int("foundedYearEnd"),
  dateCertainty: enumText("dateCertainty", [
    "certain",
    "approximate",
    "disputed",
    "unknown",
  ]).default("approximate"),
  dateDisplayEn: varchar("dateDisplayEn", { length: 128 }),
  dateDisplayAr: varchar("dateDisplayAr", { length: 128 }),

  // Patron
  patronEn: varchar("patronEn", { length: 256 }),
  patronAr: varchar("patronAr", { length: 256 }),
  architectEn: varchar("architectEn", { length: 256 }),
  architectAr: varchar("architectAr", { length: 256 }),

  // Functions
  originalFunctionEn: varchar("originalFunctionEn", { length: 256 }),
  originalFunctionAr: varchar("originalFunctionAr", { length: 256 }),
  currentFunctionEn: varchar("currentFunctionEn", { length: 256 }),
  currentFunctionAr: varchar("currentFunctionAr", { length: 256 }),

  // History briefs (90-160 words EN)
  briefEn: text("briefEn"),
  briefAr: text("briefAr"),

  // Clarification note
  clarificationEn: text("clarificationEn"),
  clarificationAr: text("clarificationAr"),

  // Key dates (JSON array of {year, labelEn, labelAr})
  keyDates: json("keyDates"),

  // Architectural phases (JSON array)
  architecturalPhases: json("architecturalPhases"),

  // Location
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  locationPrecision: enumText("locationPrecision", [
    "exact",
    "approximate",
    "district",
  ]).default("approximate"),

  // Status flags
  activeWorship: boolean("activeWorship").default(false),
  funerarySensitive: boolean("funerarySensitive").default(false),
  ticketed: boolean("ticketed"),
  photographyAllowed: enumText("photographyAllowed", [
    "yes",
    "exterior_only",
    "no",
    "ask",
    "unknown",
  ]).default("unknown"),

  // Practical info
  openingHoursEn: text("openingHoursEn"),
  openingHoursAr: text("openingHoursAr"),
  practicalInfoFreshness: timestamp("practicalInfoFreshness"),
  practicalInfoSource: varchar("practicalInfoSource", { length: 512 }),

  // Accessibility
  accessibilityConfidence: enumText("accessibilityConfidence", [
    "high",
    "medium",
    "low",
    "unknown",
  ]).default("unknown"),
  accessibilityNotesEn: text("accessibilityNotesEn"),
  accessibilityNotesAr: text("accessibilityNotesAr"),

  // Visit
  recommendedDurationMin: int("recommendedDurationMin"),
  recommendedDurationMax: int("recommendedDurationMax"),

  // Cover image
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  coverImageAlt: varchar("coverImageAlt", { length: 512 }),
  coverImageAltAr: varchar("coverImageAltAr", { length: 512 }),
  coverImageAttribution: text("coverImageAttribution"),
  coverImageLicense: varchar("coverImageLicense", { length: 128 }),

  // Publication
  status: enumText("status", [
    "draft",
    "review",
    "published",
    "archived",
  ]).default("draft"),
  publishedAt: timestamp("publishedAt"),

  // Priority visual story
  priorityVisualStoryEn: text("priorityVisualStoryEn"),
  priorityVisualStoryAr: text("priorityVisualStoryAr"),

  // Sources (JSON array of source IDs)
  sourceIds: json("sourceIds"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export type Place = typeof places.$inferSelect;
export type InsertPlace = typeof places.$inferInsert;

// ============================================================
// SOURCES
// ============================================================

export const sources = pgTable("sources", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  titleEn: varchar("titleEn", { length: 512 }).notNull(),
  titleAr: varchar("titleAr", { length: 512 }),
  authors: text("authors"),
  publisher: varchar("publisher", { length: 256 }),
  year: int("year"),
  url: varchar("url", { length: 1024 }),
  sourceType: enumText("sourceType", [
    "academic",
    "institution",
    "archive",
    "museum",
    "conservation",
    "government",
    "journalism",
    "oral",
  ]).default("academic"),
  reliabilityNote: text("reliabilityNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type Source = typeof sources.$inferSelect;

export const placeAliases = pgTable("placeAliases", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  aliasSlug: varchar("aliasSlug", { length: 128 }).notNull().unique(),
  canonicalSlug: varchar("canonicalSlug", { length: 128 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type PlaceAlias = typeof placeAliases.$inferSelect;

export const placeClaims = pgTable("placeClaims", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  claimId: varchar("claimId", { length: 256 }).notNull().unique(),
  placeSlug: varchar("placeSlug", { length: 128 }).notNull(),
  storySlug: varchar("storySlug", { length: 128 }),
  claimType: varchar("claimType", { length: 64 }).notNull(),
  textEn: text("textEn").notNull(),
  textAr: text("textAr"),
  confidence: enumText("confidence", ["high", "medium", "low", "unknown"]).default("unknown"),
  status: enumText("status", ["accepted", "alternate", "pending", "rejected"]).default("pending").notNull(),
  sourceRefs: json("sourceRefs"),
  provenance: json("provenance"),
  reasons: json("reasons"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export type PlaceClaim = typeof placeClaims.$inferSelect;

export const placeFeatures = pgTable("placeFeatures", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  featureId: varchar("featureId", { length: 256 }).notNull().unique(),
  placeSlug: varchar("placeSlug", { length: 128 }).notNull(),
  labelEn: varchar("labelEn", { length: 256 }).notNull(),
  labelAr: varchar("labelAr", { length: 256 }),
  status: enumText("status", ["accepted", "alternate", "pending", "rejected"]).default("pending").notNull(),
  sourceRefs: json("sourceRefs"),
  provenance: json("provenance"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => ({
  placeStatusIdx: index("placeFeatures_placeSlug_status_idx").on(table.placeSlug, table.status),
})).enableRLS();

export type PlaceFeature = typeof placeFeatures.$inferSelect;

export const researchReviewItems = pgTable("researchReviewItems", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  recordId: varchar("recordId", { length: 256 }).notNull().unique(),
  placeSlug: varchar("placeSlug", { length: 128 }).notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  status: enumText("status", ["pending", "approved", "rejected", "deferred"]).default("pending").notNull(),
  payload: json("payload").notNull(),
  provenance: json("provenance"),
  sourceUrls: json("sourceUrls"),
  reasons: json("reasons"),
  reviewNote: text("reviewNote"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => ({
  kindStatusIdx: index("researchReviewItems_kind_status_idx").on(table.kind, table.status),
})).enableRLS();

export type ResearchReviewItem = typeof researchReviewItems.$inferSelect;

// ============================================================
// MEDIA
// ============================================================

export const mediaAssets = pgTable("mediaAssets", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  assetId: varchar("assetId", { length: 128 })
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  placeId: int("placeId"),
  uploadedBy: int("uploadedBy"),
  mediaType: varchar("mediaType", {
    length: 32,
    enum: ["photo", "plan", "illustration", "map"] as const,
  }).default("photo"),

  // File info
  originalFilename: varchar("originalFilename", { length: 512 }),
  cdnKey: varchar("cdnKey", { length: 512 }),
  url: varchar("url", { length: 1024 }),
  width: int("width"),
  height: int("height"),
  mimeType: varchar("mimeType", { length: 64 }),
  fileSizeBytes: int("fileSizeBytes"),
  checksum: varchar("checksum", { length: 128 }),

  // Attribution
  creator: varchar("creator", { length: 256 }),
  sourcePage: varchar("sourcePage", { length: 1024 }),
  license: varchar("license", { length: 128 }),
  licenseUrl: varchar("licenseUrl", { length: 512 }),
  attribution: text("attribution"),
  modifications: text("modifications"),

  // Alt text
  altEn: text("altEn"),
  altAr: text("altAr"),
  captionEn: text("captionEn"),
  captionAr: text("captionAr"),

  // Classification
  visualType: enumText("visualType", [
    "exterior",
    "interior",
    "portal",
    "minaret",
    "dome",
    "courtyard",
    "detail",
    "plan",
    "map",
    "archival",
    "street",
    "aerial",
    "material",
    "inscription",
    "other",
  ]).default("exterior"),
  documentaryStatus: enumText("documentaryStatus", [
    "documentary",
    "archival",
    "illustration",
    "decorative",
    "generated",
  ]).default("documentary"),

  // Focal point
  focalPointX: decimal("focalPointX", { precision: 4, scale: 3 }),
  focalPointY: decimal("focalPointY", { precision: 4, scale: 3 }),

  // Status
  approved: boolean("approved").default(false),
  rejectionReason: text("rejectionReason"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export type MediaAsset = typeof mediaAssets.$inferSelect;

// ============================================================
// WALKS
// ============================================================

export const walks = pgTable("walks", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  nameEn: varchar("nameEn", { length: 256 }).notNull(),
  nameAr: varchar("nameAr", { length: 256 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),

  // Metrics
  durationMinutes: int("durationMinutes"),
  distanceMeters: int("distanceMeters"),
  difficulty: enumText("difficulty", [
    "easy",
    "moderate",
    "challenging",
  ]).default("moderate"),

  // Metadata
  districtId: int("districtId"),
  periodIds: json("periodIds"),
  stops: json("stops"), // JSON array of {placeId, orderIndex, noteEn, noteAr, activeWorship}

  // Accessibility
  accessibilityNotesEn: text("accessibilityNotesEn"),
  accessibilityNotesAr: text("accessibilityNotesAr"),
  stairsAndSurfaces: text("stairsAndSurfaces"),

  // Warnings
  hasStaleInfo: boolean("hasStaleInfo").default(false),
  staleInfoNoteEn: text("staleInfoNoteEn"),
  staleInfoNoteAr: text("staleInfoNoteAr"),
  requiresFuneraryApproval: boolean("requiresFuneraryApproval").default(false),

  // Offline
  offlineSizeKb: int("offlineSizeKb"),

  // Cover
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  coverImageAttribution: text("coverImageAttribution"),

  status: enumText("status", ["draft", "review", "published"]).default("draft"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export type Walk = typeof walks.$inferSelect;

// ============================================================
// COMPARISONS
// ============================================================

export const comparisons = pgTable("comparisons", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  titleAr: varchar("titleAr", { length: 256 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  explanationEn: text("explanationEn"),
  explanationAr: text("explanationAr"),
  placeIds: json("placeIds"), // 2-4 place IDs
  comparisonAspects: json("comparisonAspects"), // JSON array of {labelEn, labelAr, values}
  status: enumText("status", ["draft", "published"]).default("draft"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type Comparison = typeof comparisons.$inferSelect;

// ============================================================
// DETECTIVE ACTIVITIES
// ============================================================

export const detectiveActivities = pgTable("detectiveActivities", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  titleAr: varchar("titleAr", { length: 256 }).notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  activityType: enumText("activityType", [
    "find_detail",
    "match_silhouette",
    "street_or_qibla",
    "build_complex",
    "which_century",
    "material_microscope",
    "layer_reveal",
    "route_riddle",
    "patron_network",
    "vocabulary_deck",
  ]).notNull(),
  placeId: int("placeId"),
  promptEn: text("promptEn"),
  promptAr: text("promptAr"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  imageAttribution: text("imageAttribution"),
  options: json("options"), // JSON array of answer options
  correctAnswer: varchar("correctAnswer", { length: 256 }),
  explanationEn: text("explanationEn"),
  explanationAr: text("explanationAr"),
  difficulty: enumText("difficulty", [
    "beginner",
    "intermediate",
    "advanced",
  ]).default("intermediate"),
  status: enumText("status", ["draft", "published"]).default("draft"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type DetectiveActivity = typeof detectiveActivities.$inferSelect;

// ============================================================
// STORIES
// ============================================================

export const stories = pgTable("stories", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  titleEn: varchar("titleEn", { length: 256 }).notNull(),
  titleAr: varchar("titleAr", { length: 256 }).notNull(),
  summaryEn: text("summaryEn"),
  summaryAr: text("summaryAr"),
  bodyEn: text("bodyEn"),
  bodyAr: text("bodyAr"),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  coverImageAttribution: text("coverImageAttribution"),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  placeId: int("placeId"),
  storyType: varchar("storyType", { length: 64 }),
  chaptersJson: text("chaptersJson"),
  relatedPlaceIds: json("relatedPlaceIds"),
  periodIds: json("periodIds"),
  tags: json("tags"),
  status: enumText("status", ["draft", "published"]).default("draft"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export type Story = typeof stories.$inferSelect;

// ============================================================
// USER PLANNING (Guest-local + optional sync)
// ============================================================

export const userFavorites = pgTable("userFavorites", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId").notNull(),
  placeId: int("placeId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export const userCollections = pgTable("userCollections", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId").notNull(),
  nameEn: varchar("nameEn", { length: 256 }).notNull(),
  nameAr: varchar("nameAr", { length: 256 }),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  placeIds: json("placeIds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export const userNotes = pgTable("userNotes", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId").notNull(),
  placeId: int("placeId"),
  content: text("content").notNull(),
  language: enumText("language", ["en", "ar"]).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

export const userVisited = pgTable("userVisited", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId").notNull(),
  placeId: int("placeId").notNull(),
  visitedAt: timestamp("visitedAt").defaultNow().notNull(),
  noteEn: text("noteEn"),
  noteAr: text("noteAr"),
}).enableRLS();

export const userItineraries = pgTable("userItineraries", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId").notNull(),
  nameEn: varchar("nameEn", { length: 256 }).notNull(),
  nameAr: varchar("nameAr", { length: 256 }),
  days: int("days").default(1),
  preferences: json("preferences"),
  items: json("items"), // JSON array of itinerary items
  hasStaleInfo: boolean("hasStaleInfo").default(false),
  hasWorshipSites: boolean("hasWorshipSites").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}).enableRLS();

// ============================================================
// AUDIT LOG
// ============================================================

export const auditLog = pgTable("auditLog", {
  id: int("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  beforeData: json("beforeData"),
  afterData: json("afterData"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}).enableRLS();

export type AuditLog = typeof auditLog.$inferSelect;
