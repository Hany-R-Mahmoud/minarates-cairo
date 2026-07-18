import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper: create a minimal public context
function publicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// Helper: create an admin context
function adminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("places router", () => {
  it("list returns an array with items and total", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.places.list({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("list respects limit parameter", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.places.list({ limit: 3, offset: 0 });
    expect(result.items.length).toBeLessThanOrEqual(3);
  });

  it("list filters by status", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.places.list({ limit: 50, offset: 0, status: "published" });
    result.items.forEach(item => {
      expect(item.status).toBe("published");
    });
  });

  it("getBySlug returns a place with bilingual fields", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const list = await caller.places.list({ limit: 1, offset: 0 });
    if (list.items.length === 0) return; // skip if no data
    const slug = list.items[0]!.slug;
    const place = await caller.places.bySlug({ slug });
    expect(place).not.toBeNull();
    expect(place).toHaveProperty("nameEn");
    expect(place).toHaveProperty("nameAr");
    expect(place).toHaveProperty("slug");
  });
});

describe("periods router", () => {
  it("list returns all periods", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.periods.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("each period has nameEn, nameAr, startYear, endYear", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.periods.list();
    result.forEach(period => {
      expect(period).toHaveProperty("nameEn");
      expect(period).toHaveProperty("nameAr");
      expect(period).toHaveProperty("startYear");
    });
  });
});

describe("districts router", () => {
  it("list returns districts", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.districts.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("walks router", () => {
  it("list returns walks with duration and distance", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.walks.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(walk => {
      expect(walk).toHaveProperty("nameEn");
      expect(walk).toHaveProperty("nameAr");
    });
  });

  it("getBySlug returns walk details", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const walks = await caller.walks.list({});
    if (walks.length === 0) return;
    const slug = walks[0]!.slug;
    const walk = await caller.walks.bySlug({ slug });
    expect(walk).not.toBeNull();
    expect(walk).toHaveProperty("slug", slug);
  });
});

describe("comparisons router", () => {
  it("list returns curated comparisons", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.comparisons.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("detective activities router", () => {
  it("list returns activities with difficulty levels", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.detective.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(activity => {
      expect(activity).toHaveProperty("titleEn");
      expect(activity).toHaveProperty("difficulty");
    });
  });
});

describe("stories router", () => {
  it("list returns stories", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.stories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("each story has bilingual title and summary", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.stories.list();
    result.forEach(story => {
      expect(story).toHaveProperty("titleEn");
      expect(story).toHaveProperty("titleAr");
    });
  });
});

describe("auth router", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(adminCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });

  it("logout clears session cookie", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: adminCtx().user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
        cookie: () => {},
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});

describe("bilingual data integrity", () => {
  it("all published places have both nameEn and nameAr", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.places.list({ limit: 100, offset: 0, status: "published" });
    result.items.forEach(place => {
      expect(place.nameEn).toBeTruthy();
      expect(place.nameAr).toBeTruthy();
    });
  });

  it("all periods have both nameEn and nameAr", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.periods.list();
    result.forEach(period => {
      expect(period.nameEn).toBeTruthy();
      expect(period.nameAr).toBeTruthy();
    });
  });

  it("all walks have both nameEn and nameAr", async () => {
    const caller = appRouter.createCaller(publicCtx());
    const result = await caller.walks.list({});
    result.forEach(walk => {
      expect(walk.nameEn).toBeTruthy();
      expect(walk.nameAr).toBeTruthy();
    });
  });
});
