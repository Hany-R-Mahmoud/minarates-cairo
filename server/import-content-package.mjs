import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const DEFAULT_PACKAGE_DIR = "minarets_of_cairo_content_package_v4";
const UNESCO_SLUG = "unesco-historic-cairo";
const DISTRICT_MAP = {
  "Darb al-Ahmar": "darb-al-ahmar",
  "Al-Saliba / Sayyida Zaynab": "al-saliba",
  "Southern Cemetery / al-Khalifa": "al-khalifa",
  "al-Khalifa": "al-khalifa",
  "al-Muizz / Burjuan": "al-muizz",
  "near Bab Zuweila": "al-muizz",
  Bulaq: "bulaq",
  "Cairo Citadel": "citadel",
  "Northern Cemetery": "northern-cemetery",
};
const TYPE_MAP = {
  "mosque and funerary complex": "complex",
  "historic domestic complex": "house",
  "historic houses and museum": "museum",
  "mausoleum and active shrine": "mausoleum",
  mausoleum: "mausoleum",
  "mosque, sabil and kuttab": "complex",
  "sabil-kuttab": "sabil",
  mosque: "mosque",
  "funerary, religious, educational and charitable complex": "complex",
};
const PERIOD_MAP = {
  "Bahri Mamluk with Ottoman decorative phase": "mamluk-bahri",
  "Mamluk and Ottoman Cairo": "mamluk-burji",
  "Ottoman Cairo with modern museum history": "ottoman-late",
  "Ayyubid Cairo with later phases": "ayyubid",
  "Ayyubid–Mamluk transition": "ayyubid",
  "Muhammad Ali and nineteenth-century Cairo": "muhammad-ali",
  "Late Ottoman Cairo": "ottoman-late",
  "Ottoman Cairo": "ottoman-early",
  "Early Ottoman Cairo": "ottoman-early",
  "Burji Mamluk Cairo": "mamluk-burji",
};

const quote = name => `"${name}"`;
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const jsonText = value => (value == null ? null : JSON.stringify(value));

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(
      JSON.stringify({
        usage:
          "node server/import-content-package.mjs [--dry-run|--apply] [package-dir]",
      })
    );
    process.exit(0);
  }
  const apply = args.includes("--apply");
  const dryRun = args.includes("--dry-run");
  if (apply && dryRun)
    throw new Error("Choose only one of --dry-run or --apply");
  const packageArg = args.find(arg => !arg.startsWith("--"));
  return {
    apply,
    packageDir: path.resolve(
      packageArg ?? process.env.CONTENT_PACKAGE_DIR ?? DEFAULT_PACKAGE_DIR
    ),
  };
}

function loadPackage(packageDir) {
  const sources = readJson(path.join(packageDir, "sources.json")).sources;
  const places = fs
    .readdirSync(path.join(packageDir, "published-places"))
    .filter(file => file.endsWith(".json"))
    .sort()
    .map(file => readJson(path.join(packageDir, "published-places", file)));
  const stories = fs
    .readdirSync(path.join(packageDir, "stories"))
    .filter(file => file.endsWith(".json"))
    .sort()
    .map(file => readJson(path.join(packageDir, "stories", file)));
  const candidates = fs
    .readdirSync(path.join(packageDir, "candidates"))
    .filter(file => file.endsWith(".json"))
    .sort()
    .map(file => readJson(path.join(packageDir, "candidates", file)));
  const media = readJson(path.join(packageDir, "media-manifest.json")).assets;
  const historicalSources = sources.filter(source => !source.mediaOnly);
  if (
    places.length !== 10 ||
    stories.length !== 10 ||
    historicalSources.length !== 21
  ) {
    throw new Error(
      `Unexpected package counts: places=${places.length}, stories=${stories.length}, historicalSources=${historicalSources.length}`
    );
  }
  if (!historicalSources.some(source => source.sourceId === UNESCO_SLUG)) {
    throw new Error(`Package is missing required UNESCO source ${UNESCO_SLUG}`);
  }
  const candidateSourceRefs = [
    ...new Set(
      candidates.flatMap(candidate => candidate.availableSourceRecords ?? [])
    ),
  ].sort();
  return {
    sources,
    historicalSources,
    places,
    stories,
    candidates,
    media,
    candidateSourceRefs,
  };
}

function sqlValues(rows, width) {
  let parameter = 1;
  return rows
    .map(
      () =>
        `(${Array.from({ length: width }, () => `$${parameter++}`).join(",")})`
    )
    .join(",");
}

async function bulkUpsert(
  tx,
  table,
  columns,
  rows,
  conflict,
  updateColumns = columns.filter(column => column !== conflict)
) {
  const updates = updateColumns
    .map(column => `${quote(column)}=EXCLUDED.${quote(column)}`)
    .join(",");
  const query = `INSERT INTO ${quote(table)} (${columns.map(quote).join(",")}) VALUES ${sqlValues(rows, columns.length)} ON CONFLICT (${quote(conflict)}) DO UPDATE SET ${updates}`;
  await tx.unsafe(query, rows.flat());
}

async function bulkInsertDoNothing(tx, table, columns, rows, conflict) {
  const query = `INSERT INTO ${quote(table)} (${columns.map(quote).join(",")}) VALUES ${sqlValues(rows, columns.length)} ON CONFLICT (${quote(conflict)}) DO NOTHING`;
  await tx.unsafe(query, rows.flat());
}

function required(map, key, label) {
  const value = map.get(key);
  if (value == null)
    throw new Error(`Missing ${label} taxonomy row for ${key}`);
  return value;
}

function foundedYears(place) {
  const value = place.foundedYearOrRange ?? "";
  const range = value.match(/^\s*(\d{3,4})\s*[–—-]\s*(\d{3,4})/);
  if (range) return [Number(range[1]), Number(range[2])];
  const year = value.match(/^\s*(\d{3,4})\b/);
  if (year) return [Number(year[1]), null];
  const centuries = value.match(/(\d{1,2})(?:st|nd|rd|th)\s*[–—-]\s*(\d{1,2})(?:st|nd|rd|th)\s+centur/);
  if (centuries) return [(Number(centuries[1]) - 1) * 100, Number(centuries[2]) * 100 - 1];
  const century = value.match(/(\d{1,2})(?:st|nd|rd|th)\s+centur/);
  return century
    ? [(Number(century[1]) - 1) * 100, Number(century[1]) * 100 - 1]
    : [null, null];
}

function storyBodies(chapters) {
  const body = (language) => (chapters ?? [])
    .map(chapter => `## ${chapter[language === "ar" ? "titleAr" : "titleEn"]}\n\n${chapter[language === "ar" ? "bodyAr" : "bodyEn"]}`)
    .join("\n\n");
  return { en: body("en"), ar: body("ar") };
}

function normalizeConfidence(value) {
  return value === "low-to-medium" ? "low" : (value ?? "unknown");
}

function sourceIds(ids, sourceSlugByPackageId, sourceIdBySlug, context) {
  return ids.map(packageId => {
    const slug = sourceSlugByPackageId.get(packageId);
    const id = slug == null ? null : sourceIdBySlug.get(slug);
    if (id == null)
      throw new Error(`Unresolved source ${packageId} for ${context}`);
    return id;
  });
}

async function applyPackage(packageData) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for --apply");
  const sql = postgres(databaseUrl, { max: 1 });
  try {
    return await sql.begin(async tx => {
      await bulkInsertDoNothing(
        tx,
        "districts",
        ["slug", "nameEn", "nameAr", "descriptionEn", "descriptionAr"],
        [
          [
            "bulaq",
            "Bulaq",
            "بولاق",
            "Historic Nile-port district west of central Cairo.",
            "حي تاريخي على النيل غرب وسط القاهرة.",
          ],
          [
            "al-khalifa",
            "al-Khalifa",
            "الخليفة",
            "Southern Cemetery district with living funerary communities.",
            "حي القرافة الجنوبية ومجتمعاتها الجنائزية الحية.",
          ],
        ],
        "slug"
      );

      const [periodRows, districtRows, typeRows] = await Promise.all([
        tx`SELECT "id", "slug" FROM "periods"`,
        tx`SELECT "id", "slug" FROM "districts"`,
        tx`SELECT "id", "slug" FROM "placeTypes"`,
      ]);
      const periods = new Map(periodRows.map(row => [row.slug, row.id]));
      const districts = new Map(districtRows.map(row => [row.slug, row.id]));
      const types = new Map(typeRows.map(row => [row.slug, row.id]));

      const packageSourceIds = new Map(
        packageData.sources.map(source => [
          source.sourceId,
          source.sourceId === "src-unesco" ? UNESCO_SLUG : source.sourceId,
        ])
      );
      const newSources = packageData.historicalSources.filter(
        source => source.sourceId !== UNESCO_SLUG
      );
      await bulkUpsert(
        tx,
        "sources",
        [
          "slug",
          "titleEn",
          "authors",
          "publisher",
          "year",
          "url",
          "sourceType",
        ],
        newSources.map(source => [
          source.sourceId,
          source.title,
          source.author ?? null,
          source.publisher ?? null,
          source.year ?? null,
          source.url ?? null,
          source.sourceType,
        ]),
        "slug"
      );
      const sourceSlugs = [
        ...new Set([UNESCO_SLUG, ...newSources.map(source => source.sourceId)]),
      ];
      const sourceRows =
        await tx`SELECT "id", "slug" FROM "sources" WHERE "slug" = ANY(${sourceSlugs})`;
      const sourceIdBySlug = new Map(sourceRows.map(row => [row.slug, row.id]));
      required(sourceIdBySlug, UNESCO_SLUG, "source");

      const placeColumns = [
        "slug",
        "nameEn",
        "nameAr",
        "nameAlt",
        "periodId",
        "dynastyId",
        "districtId",
        "placeTypeId",
        "foundedYear",
        "foundedYearEnd",
        "dateCertainty",
        "dateDisplayEn",
        "dateDisplayAr",
        "patronEn",
        "patronAr",
        "architectEn",
        "architectAr",
        "originalFunctionEn",
        "originalFunctionAr",
        "currentFunctionEn",
        "currentFunctionAr",
        "briefEn",
        "briefAr",
        "clarificationEn",
        "clarificationAr",
        "keyDates",
        "architecturalPhases",
        "lat",
        "lng",
        "locationPrecision",
        "activeWorship",
        "funerarySensitive",
        "ticketed",
        "photographyAllowed",
        "openingHoursEn",
        "openingHoursAr",
        "accessibilityConfidence",
        "accessibilityNotesEn",
        "accessibilityNotesAr",
        "recommendedDurationMin",
        "recommendedDurationMax",
        "coverImageUrl",
        "coverImageAlt",
        "coverImageAltAr",
        "coverImageAttribution",
        "coverImageLicense",
        "priorityVisualStoryEn",
        "priorityVisualStoryAr",
        "status",
        "publishedAt",
        "sourceIds",
      ];
      const places = packageData.places.map(place => {
        const [foundedYear, foundedYearEnd] = foundedYears(place);
        const districtSlug = DISTRICT_MAP[place.district];
        const typeSlug = TYPE_MAP[place.placeType];
        const periodSlug = PERIOD_MAP[place.historicalPeriod];
        if (!districtSlug || !typeSlug || !periodSlug)
          throw new Error(`Unmapped taxonomy for place ${place.slug}`);
        const cover = packageData.media.find(asset => asset.placeSlug === place.slug);
        if (!cover?.cdnUrl) throw new Error(`Missing CDN cover for place ${place.slug}`);
        return [
          place.slug,
          place.nameEn,
          place.nameAr,
          jsonText(place.alternateNames ?? []),
          required(periods, periodSlug, "period"),
          null,
          required(districts, districtSlug, "district"),
          required(types, typeSlug, "place type"),
          foundedYear,
          foundedYearEnd,
          place.dateCertainty ?? "unknown",
          place.dateDisplayEn ?? null,
          place.dateDisplayAr ?? null,
          place.patronEn ?? null,
          place.patronAr ?? null,
          place.architectEn ?? null,
          place.architectAr ?? null,
          place.originalFunctionEn ?? null,
          place.originalFunctionAr ?? null,
          place.currentFunctionEn ?? null,
          place.currentFunctionAr ?? null,
          place.historicalBriefEn ?? null,
          place.historicalBriefAr ?? null,
          place.clarificationNoteEn ?? null,
          place.clarificationNoteAr ?? null,
          jsonText(place.keyDates ?? []),
          jsonText(place.architecturalPhases ?? []),
          place.latitude == null ? null : String(place.latitude),
          place.longitude == null ? null : String(place.longitude),
          place.locationPrecision ?? "approximate",
          place.activeWorship ?? false,
          place.funerarySensitive ?? false,
          place.ticketed ?? null,
          place.photographyAllowed ?? "unknown",
          typeof place.openingHours === "string" ? place.openingHours : null,
          null,
          normalizeConfidence(place.accessibilityConfidence),
          place.accessibilityNotesEn ?? null,
          place.accessibilityNotesAr ?? null,
          place.recommendedDurationMin ?? null,
          place.recommendedDurationMax ?? null,
          cover.cdnUrl,
          cover.altEn ?? null,
          cover.altAr ?? null,
          cover.attribution ?? null,
          cover.license ?? null,
          place.priorityVisualStoryEn ?? null,
          place.priorityVisualStoryAr ?? null,
          "published",
          new Date(),
          jsonText(
            sourceIds(
              place.sourceIds ?? [],
              packageSourceIds,
              sourceIdBySlug,
              place.slug
            )
          ),
        ];
      });
      await bulkUpsert(
        tx,
        "places",
        placeColumns,
        places,
        "slug",
        placeColumns.filter(column => !["slug", "publishedAt"].includes(column))
      );
      const placeRows =
        await tx`SELECT "id", "slug" FROM "places" WHERE "slug" = ANY(${packageData.places.map(place => place.slug)})`;
      const placeIdBySlug = new Map(placeRows.map(row => [row.slug, row.id]));
      const storyColumns = [
        "slug",
        "titleEn",
        "titleAr",
        "summaryEn",
        "summaryAr",
        "bodyEn",
        "bodyAr",
        "placeId",
        "storyType",
        "chaptersJson",
        "relatedPlaceIds",
        "periodIds",
        "tags",
        "status",
      ];
      const stories = packageData.stories.map(story => {
        const bodies = storyBodies(story.chapters);
        return [
          story.storySlug,
          story.titleEn,
          story.titleAr,
          story.summaryEn ?? null,
          story.summaryAr ?? null,
          bodies.en || null,
          bodies.ar || null,
          required(placeIdBySlug, story.relatedPlaceSlug, "place"),
          story.storyType ?? null,
          jsonText(story.chapters ?? []),
          jsonText(
            (story.relatedPlaces ?? []).map(slug =>
              required(placeIdBySlug, slug, "related place")
            )
          ),
          jsonText(
            (story.relatedPeriods ?? []).map(period =>
              required(periods, PERIOD_MAP[period], "period")
            )
          ),
          jsonText(story.tags ?? []),
          "published",
        ];
      });
      await bulkUpsert(
        tx,
        "stories",
        storyColumns,
        stories,
        "slug",
        storyColumns.filter(column => column !== "slug")
      );
      return {
        sourcesUpserted: newSources.length,
        districtsEnsured: 2,
        placesUpserted: places.length,
        storiesUpserted: stories.length,
      };
    });
  } finally {
    await sql.end();
  }
}

async function main() {
  const { apply, packageDir } = parseArgs();
  const packageData = loadPackage(packageDir);
  if (packageData.candidateSourceRefs.length > 0) {
    console.warn(
      `[content-import] warning: candidate source refs skipped (non-blocking): ${packageData.candidateSourceRefs.join(", ")}`
    );
  }
  const result = apply
    ? await applyPackage(packageData)
    : {
        sourcesUpserted: 20,
        districtsEnsured: 2,
        placesUpserted: 10,
        storiesUpserted: 10,
      };
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      packageDir,
      ...result,
      historicalSources: 21,
      reusedSource: UNESCO_SLUG,
      mediaSourcesSkipped: packageData.sources.filter(
        source => source.mediaOnly
      ).length,
      candidatesSkipped: packageData.candidates.length,
      candidateSourceRefs: packageData.candidateSourceRefs,
    })
  );
}

main().catch(error => {
  console.error(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    })
  );
  process.exitCode = 1;
});
