import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  periods, districts, placeTypes, places, sources, walks, comparisons,
  detectiveActivities, stories, userFavorites as favorites, userCollections as collections,
  userNotes as privateNotes, userVisited as visitedRecords, userItineraries as itineraries,
  auditLog, mediaAssets,
} from "../drizzle/schema";
import { eq, and, ilike, inArray, desc, asc, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ─── Heritage Routers ──────────────────────────────────────────────────────────

const periodsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(periods).orderBy(asc(periods.sortOrder));
  }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(periods).where(eq(periods.slug, input.slug)).limit(1);
    return result[0] ?? null;
  }),
});

const districtsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(districts).orderBy(asc(districts.nameEn));
  }),
});

const placesRouter = router({
  list: publicProcedure
    .input(z.object({
      periodId: z.number().optional(),
      districtId: z.number().optional(),
      placeTypeId: z.number().optional(),
      status: z.literal("published").optional().default("published"),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };
      const conditions = [eq(places.status, input.status)];
      if (input.periodId) conditions.push(eq(places.periodId, input.periodId));
      if (input.districtId) conditions.push(eq(places.districtId, input.districtId));
      if (input.placeTypeId) conditions.push(eq(places.placeTypeId, input.placeTypeId));
      if (input.search) {
        conditions.push(
          sql`(${ilike(places.nameEn, `%${input.search}%`)} OR ${ilike(places.nameAr, `%${input.search}%`)})`
        );
      }
      const items = await db.select().from(places)
        .where(and(...conditions))
        .orderBy(asc(places.nameEn))
        .limit(input.limit)
        .offset(input.offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(places).where(and(...conditions));
      return { items, total: Number(countResult[0]?.count ?? 0) };
    }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(places)
      .where(and(eq(places.slug, input.slug), eq(places.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),

  byId: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(places)
      .where(and(eq(places.id, input.id), eq(places.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),

  withMeta: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const placeResult = await db.select().from(places)
      .where(and(eq(places.slug, input.slug), eq(places.status, "published")))
      .limit(1);
    const place = placeResult[0];
    if (!place) return null;
    const [period, district, placeType, media] = await Promise.all([
      place.periodId ? db.select().from(periods).where(eq(periods.id, place.periodId)).limit(1) : [],
      place.districtId ? db.select().from(districts).where(eq(districts.id, place.districtId)).limit(1) : [],
      place.placeTypeId ? db.select().from(placeTypes).where(eq(placeTypes.id, place.placeTypeId)).limit(1) : [],
      db.select({
        id: mediaAssets.id,
        assetId: mediaAssets.assetId,
        mediaType: mediaAssets.mediaType,
        url: mediaAssets.url,
        width: mediaAssets.width,
        height: mediaAssets.height,
        altEn: mediaAssets.altEn,
        altAr: mediaAssets.altAr,
        captionEn: mediaAssets.captionEn,
        captionAr: mediaAssets.captionAr,
        visualType: mediaAssets.visualType,
        documentaryStatus: mediaAssets.documentaryStatus,
        creator: mediaAssets.creator,
        sourcePage: mediaAssets.sourcePage,
        license: mediaAssets.license,
        licenseUrl: mediaAssets.licenseUrl,
        attribution: mediaAssets.attribution,
        modifications: mediaAssets.modifications,
      })
        .from(mediaAssets)
        .where(and(
          eq(mediaAssets.placeId, place.id),
          eq(mediaAssets.approved, true),
          isNotNull(mediaAssets.url),
        ))
        .orderBy(asc(mediaAssets.id)),
    ]);
    return {
      place,
      period: period[0] ?? null,
      district: district[0] ?? null,
      placeType: placeType[0] ?? null,
      media,
    };
  }),

  // Admin: upsert
  upsert: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      slug: z.string(),
      nameEn: z.string(),
      nameAr: z.string(),
      periodId: z.number().optional(),
      districtId: z.number().optional(),
      placeTypeId: z.number().optional(),
      briefEn: z.string().optional(),
      briefAr: z.string().optional(),
      status: z.enum(["published", "draft", "review"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(places).set({ ...input, updatedAt: new Date() } as any).where(eq(places.id, input.id));
        await db.insert(auditLog).values({ entityType: "place", entityId: input.id, action: "update", userId: ctx.user.id, afterData: { summary: `Updated place ${input.slug}` } } as any);
        return { success: true };
      } else {
        const result = await db.insert(places)
          .values({ ...input, publishedAt: input.status === "published" ? new Date() : undefined } as any)
          .returning({ id: places.id });
        const newId = result[0]?.id ?? 0;
        await db.insert(auditLog).values({ entityType: "place", entityId: newId, action: "create", userId: ctx.user.id, afterData: { summary: `Created place ${input.slug}` } } as any);
        return { success: true, id: newId };
      }
    }),
});

const walksRouter = router({
  list: publicProcedure
    .input(z.object({ status: z.literal("published").optional().default("published") }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(walks).where(eq(walks.status, input.status)).orderBy(asc(walks.sortOrder));
    }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(walks)
      .where(and(eq(walks.slug, input.slug), eq(walks.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),
});

const comparisonsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(comparisons).where(eq(comparisons.status, "published")).orderBy(asc(comparisons.sortOrder));
  }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(comparisons)
      .where(and(eq(comparisons.slug, input.slug), eq(comparisons.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),
  custom: publicProcedure.input(z.object({ placeIds: z.array(z.number()).min(2).max(4) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(places)
      .where(and(inArray(places.id, input.placeIds), eq(places.status, "published")));
  }),
});

const detectiveRouter = router({
  list: publicProcedure
    .input(z.object({ difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(detectiveActivities.status, "published")];
      if (input.difficulty) conditions.push(eq(detectiveActivities.difficulty, input.difficulty));
      return db.select().from(detectiveActivities).where(and(...conditions)).orderBy(asc(detectiveActivities.sortOrder));
    }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(detectiveActivities)
      .where(and(eq(detectiveActivities.slug, input.slug), eq(detectiveActivities.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),
});

const storiesRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(stories).where(eq(stories.status, "published")).orderBy(asc(stories.sortOrder));
  }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(stories)
      .where(and(eq(stories.slug, input.slug), eq(stories.status, "published")))
      .limit(1);
    return result[0] ?? null;
  }),
});

const notebookRouter = router({
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(favorites).where(eq(favorites.userId, ctx.user.id));
  }),
  toggleFavorite: protectedProcedure
    .input(z.object({ placeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select().from(favorites)
        .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.placeId, input.placeId))).limit(1);
      if (existing.length > 0) {
        await db.delete(favorites).where(and(eq(favorites.userId, ctx.user.id), eq(favorites.placeId, input.placeId)));
        return { favorited: false };
      } else {
        await db.insert(favorites).values({ userId: ctx.user.id, placeId: input.placeId });
        return { favorited: true };
      }
    }),

  getCollections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(collections).where(eq(collections.userId, ctx.user.id)).orderBy(desc(collections.createdAt));
  }),
  createCollection: protectedProcedure
    .input(z.object({ nameEn: z.string(), nameAr: z.string().optional(), descriptionEn: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(collections).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
  addToCollection: protectedProcedure
    .input(z.object({ collectionId: z.number(), placeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const col = await db.select().from(collections).where(and(eq(collections.id, input.collectionId), eq(collections.userId, ctx.user.id))).limit(1);
      if (!col.length) throw new TRPCError({ code: "FORBIDDEN" });
      // Add placeId to the collection's placeIds JSON array
      const col2 = await db.select().from(collections).where(eq(collections.id, input.collectionId)).limit(1);
      const existingIds: number[] = (col2[0]?.placeIds as number[]) ?? [];
      if (!existingIds.includes(input.placeId)) {
        await db.update(collections).set({ placeIds: [...existingIds, input.placeId], updatedAt: new Date() }).where(eq(collections.id, input.collectionId));
      }
      return { success: true };
    }),

  getNotes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(privateNotes).where(eq(privateNotes.userId, ctx.user.id)).orderBy(desc(privateNotes.updatedAt));
  }),
  upsertNote: protectedProcedure
    .input(z.object({ id: z.number().optional(), placeId: z.number().optional(), content: z.string(), lang: z.enum(["en", "ar"]).optional().default("en") }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.id) {
        await db.update(privateNotes).set({ content: input.content, updatedAt: new Date() }).where(and(eq(privateNotes.id, input.id), eq(privateNotes.userId, ctx.user.id)));
      } else {
        await db.insert(privateNotes).values({ userId: ctx.user.id, placeId: input.placeId ?? null, content: input.content, language: input.lang } as any);
      }
      return { success: true };
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(privateNotes).where(and(eq(privateNotes.id, input.id), eq(privateNotes.userId, ctx.user.id)));
      return { success: true };
    }),

  getVisited: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(visitedRecords).where(eq(visitedRecords.userId, ctx.user.id)).orderBy(desc(visitedRecords.visitedAt));
  }),
  markVisited: protectedProcedure
    .input(z.object({ placeId: z.number(), visitedAt: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(visitedRecords)
        .values({ userId: ctx.user.id, placeId: input.placeId, visitedAt: input.visitedAt ? new Date(input.visitedAt) : new Date() })
        .onConflictDoNothing();
      return { success: true };
    }),
});

const itineraryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(itineraries).where(eq(itineraries.userId, ctx.user.id)).orderBy(desc(itineraries.createdAt));
  }),
  create: protectedProcedure
    .input(z.object({
      nameEn: z.string(),
      nameAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      durationDays: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(itineraries).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
  addStop: protectedProcedure
    .input(z.object({ itineraryId: z.number(), placeId: z.number(), day: z.number().optional().default(1), order: z.number().optional().default(1), notesEn: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const itin = await db.select().from(itineraries).where(and(eq(itineraries.id, input.itineraryId), eq(itineraries.userId, ctx.user.id))).limit(1);
      if (!itin.length) throw new TRPCError({ code: "FORBIDDEN" });
      // Store stops as JSON in the itinerary's stopsJson field
      const existing = itin[0];
      const stops: any[] = (existing.items as any[]) ?? [];
      stops.push({ placeId: input.placeId, day: input.day, order: input.order, notesEn: input.notesEn });
      await db.update(itineraries).set({ items: stops, updatedAt: new Date() }).where(eq(itineraries.id, input.itineraryId));
      return { success: true };
    }),
});

const curatorRouter = router({
  getAuditLog: protectedProcedure
    .input(z.object({ entityType: z.string().optional(), limit: z.number().optional().default(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input.entityType) conditions.push(eq(auditLog.entityType, input.entityType));
      return db.select().from(auditLog)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(auditLog.createdAt))
        .limit(input.limit);
    }),
  publishPlace: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(places).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(places.id, input.id));
      await db.insert(auditLog).values({ entityType: "place", entityId: input.id, action: "publish", userId: ctx.user.id, afterData: { summary: "Published place" } } as any);
      return { success: true };
    }),
  unpublishPlace: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(places).set({ status: "draft", updatedAt: new Date() }).where(eq(places.id, input.id));
      await db.insert(auditLog).values({ entityType: "place", entityId: input.id, action: "unpublish", userId: ctx.user.id, afterData: { summary: "Unpublished place" } } as any);
      return { success: true };
    }),
  listMedia: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt as any)).limit(100);
  }),
  addMedia: protectedProcedure
    .input(z.object({
      placeId: z.number().optional(),
      url: z.string(),
      altEn: z.string(),
      altAr: z.string().optional(),
      attribution: z.string().optional(),
      license: z.string().optional(),
      mediaType: z.enum(["photo", "plan", "illustration", "map"]).optional().default("photo"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(mediaAssets)
        .values({ ...input, uploadedBy: ctx.user.id } as any)
        .returning({ id: mediaAssets.id });
      const newId = result[0]?.id ?? 0;
      await db.insert(auditLog).values({ entityType: "media", entityId: newId, action: "create", userId: ctx.user.id, afterData: { summary: `Added media: ${input.url}` } } as any);
      return { success: true, id: newId };
    }),
  listSources: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    return db.select().from(sources).orderBy(asc(sources.titleEn));
  }),
  addSource: protectedProcedure
    .input(z.object({
      slug: z.string(),
      titleEn: z.string(),
      titleAr: z.string().optional(),
      authors: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number().optional(),
      url: z.string().optional(),
      sourceType: z.enum(["academic", "museum", "institution", "conservation", "archive", "government", "journalism", "oral"]).optional().default("academic"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(sources).values(input as any);
      return { success: true };
    }),
  listAllPlaces: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    return db.select().from(places).orderBy(asc(places.nameEn));
  }),
});

const placeTypesRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(placeTypes).orderBy(asc(placeTypes.nameEn));
  }),
});

// ─── App Router ────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  periods: periodsRouter,
  districts: districtsRouter,
  placeTypes: placeTypesRouter,
  places: placesRouter,
  walks: walksRouter,
  comparisons: comparisonsRouter,
  detective: detectiveRouter,
  stories: storiesRouter,
  notebook: notebookRouter,
  itinerary: itineraryRouter,
  curator: curatorRouter,
});

export type AppRouter = typeof appRouter;
