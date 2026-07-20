import { config } from "dotenv";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to canonicalize place slugs");

const PLACE_SLUG_ALIASES = {
  "al-aqmar-mosque": "mosque-al-aqmar",
  "al-azhar-mosque": "mosque-al-azhar",
  "al-hussein-mosque": "mosque-al-hussein",
  "al-rifai-mosque": "mosque-al-rifai",
  "cairo-citadel": "citadel-of-cairo",
  "faraj-ibn-barquq-khanqah": "complex-barquq-muizz",
  "sultan-hasan-mosque": "complex-sultan-hasan",
  "muhammad-ali-mosque": "mosque-muhammad-ali-citadel",
  "museum-islamic-art": "museum-of-islamic-art",
  "qalawun-complex": "complex-qalawun",
  "sabil-abd-al-rahman-katkhuda": "sabil-kuttab-abd-al-rahman-katkhuda",
};

const parseJson = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
};

const remapIds = (value, idMap) => {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return { value, changed: false };
  const remapped = parsed.map((id) => idMap.get(Number(id)) ?? id);
  const changed = remapped.some((id, index) => id !== parsed[index]);
  return {
    value: typeof value === "string" ? JSON.stringify(remapped) : remapped,
    changed,
  };
};

const sql = postgres(databaseUrl, { max: 1 });

try {
  const result = await sql.begin(async (transaction) => {
    const aliasRows = [];
    for (const [aliasSlug, canonicalSlug] of Object.entries(PLACE_SLUG_ALIASES)) {
      const rows = await transaction`
        SELECT alias."id" AS alias_id, alias."slug" AS alias_slug,
               canonical."id" AS canonical_id, canonical."slug" AS canonical_slug
        FROM "places" alias
        JOIN "places" canonical ON canonical."slug" = ${canonicalSlug}
        WHERE alias."slug" = ${aliasSlug}
      `;
      if (rows.length !== 1) {
        throw new Error(`Expected one alias/canonical pair for ${aliasSlug} -> ${canonicalSlug}`);
      }
      aliasRows.push(rows[0]);
    }

    const idMap = new Map(aliasRows.map((row) => [Number(row.alias_id), Number(row.canonical_id)]));
    let walkUpdates = 0;
    let storyUpdates = 0;
    let comparisonUpdates = 0;

    const walkRows = await transaction`SELECT "id", "stops" FROM "walks"`;
    for (const row of walkRows) {
      const stops = parseJson(row.stops);
      if (!Array.isArray(stops)) continue;
      let changed = false;
      const updatedStops = stops.map((stop) => {
        if (!stop || typeof stop !== "object" || typeof stop.placeSlug !== "string") return stop;
        const canonicalSlug = PLACE_SLUG_ALIASES[stop.placeSlug];
        if (!canonicalSlug) return stop;
        changed = true;
        return { ...stop, placeSlug: canonicalSlug };
      });
      if (changed) {
        await transaction`
          UPDATE "walks" SET "stops" = ${JSON.stringify(updatedStops)}::json, "updatedAt" = now()
          WHERE "id" = ${row.id}
        `;
        walkUpdates += 1;
      }
    }

    const storyRows = await transaction`SELECT "id", "placeId", "relatedPlaceIds" FROM "stories"`;
    for (const row of storyRows) {
      const remapped = remapIds(row.relatedPlaceIds, idMap);
      const placeId = row.placeId === null ? null : idMap.get(Number(row.placeId)) ?? row.placeId;
      const placeChanged = placeId !== row.placeId;
      if (remapped.changed || placeChanged) {
        await transaction`
          UPDATE "stories"
          SET "placeId" = ${placeId}, "relatedPlaceIds" = ${remapped.value === null ? null : typeof remapped.value === "string" ? remapped.value : JSON.stringify(remapped.value)}::json,
              "updatedAt" = now()
          WHERE "id" = ${row.id}
        `;
        storyUpdates += 1;
      }
    }

    const comparisonRows = await transaction`SELECT "id", "placeIds" FROM "comparisons"`;
    for (const row of comparisonRows) {
      const remapped = remapIds(row.placeIds, idMap);
      if (!remapped.changed) continue;
      await transaction`
        UPDATE "comparisons" SET "placeIds" = ${typeof remapped.value === "string" ? remapped.value : JSON.stringify(remapped.value)}::json
        WHERE "id" = ${row.id}
      `;
      comparisonUpdates += 1;
    }

    for (const row of aliasRows) {
      await transaction`
        UPDATE "places" SET "status" = 'archived', "updatedAt" = now()
        WHERE "id" = ${row.alias_id} AND "status" <> 'archived'
      `;
    }

    return {
      archivedAliases: aliasRows.length,
      walkUpdates,
      storyUpdates,
      comparisonUpdates,
      canonicalSlugs: aliasRows.map((row) => row.canonical_slug),
    };
  });

  console.log(JSON.stringify(result));
} finally {
  await sql.end({ timeout: 5 });
}
