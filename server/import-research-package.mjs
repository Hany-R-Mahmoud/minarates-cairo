import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const DEFAULT_PACKAGE_DIR = "docs/research/merged-research_output";
const PLACE_ALIASES = {
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
  "aqunsqur-blue-mosque": "aqsunqur-blue-mosque",
};
const PLACEHOLDER =
  /unknown|requires (official|field) verification|verification required|not available/i;

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const slugify = value =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 128);
const sourceSlug = source =>
  source.sourceId === "src-unesco"
    ? "unesco-historic-cairo"
    : `research-${slugify(source.sourceId)}`.slice(0, 128);
const canonicalSlug = slug => PLACE_ALIASES[slug] ?? slug;
const sourceKey = value => {
  const raw = String(value ?? "");
  const suffix = raw.split(":").at(-1) ?? raw;
  return suffix === "unesco" ||
    suffix === "src-unesco" ||
    suffix === "unesco-historic-cairo"
    ? "unesco-historic-cairo"
    : `research-${slugify(suffix)}`.slice(0, 128);
};
const isPlaceholder = value =>
  typeof value === "string" && PLACEHOLDER.test(value);
const jsonText = value => JSON.stringify(value ?? null);
const mediaReviewId = item => {
  const key =
    item.sourcePageUrl ??
    item.sourcePage ??
    item.directImageUrl ??
    item.sourceUrl ??
    item.title;
  return `photo:${item.placeSlug}:${createHash("sha1").update(String(key)).digest("hex").slice(0, 24)}`;
};

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(
      "node server/import-research-package.mjs [--dry-run|--apply] [--approve-complete-photos] [package-dir]"
    );
    process.exit(0);
  }
  if (args.includes("--apply") && args.includes("--dry-run"))
    throw new Error("Choose only one import mode");
  const packageArg = args.find(arg => !arg.startsWith("--"));
  return {
    apply: args.includes("--apply"),
    approveCompletePhotos: args.includes("--approve-complete-photos"),
    packageDir: path.resolve(
      packageArg ?? process.env.RESEARCH_PACKAGE_DIR ?? DEFAULT_PACKAGE_DIR
    ),
  };
}

function loadPackage(packageDir) {
  const places = readJson(path.join(packageDir, "all_places.json"));
  const claims = readJson(path.join(packageDir, "claims.json"));
  const photos = readJson(path.join(packageDir, "photos.json"));
  const sources = readJson(path.join(packageDir, "sources.json")).sources;
  const unresolved = readJson(path.join(packageDir, "unresolved.json")).records;
  const discoveryPath = path.join(packageDir, "wikimedia-photo-discovery.json");
  const discovered = fs.existsSync(discoveryPath)
    ? readJson(discoveryPath).candidates ?? []
    : [];
  if (
    !Array.isArray(places) ||
    !Array.isArray(claims.accepted) ||
    !Array.isArray(claims.alternate) ||
    !Array.isArray(photos.accepted) ||
    !Array.isArray(photos.alternate) ||
    !Array.isArray(sources) ||
    !Array.isArray(unresolved)
  ) {
    throw new Error(
      "Research package does not match the merged-research_output contract"
    );
  }
  return {
    places,
    acceptedClaims: claims.accepted,
    alternateClaims: claims.alternate,
    acceptedPhotos: photos.accepted,
    alternatePhotos: [...photos.alternate, ...discovered],
    sources,
    unresolved,
  };
}

function buildPlan(data) {
  const aliases = new Map(Object.entries(PLACE_ALIASES));
  for (const place of data.places)
    for (const alias of place.slugAliases ?? []) aliases.set(alias, place.slug);
  const knownSourceRefs = new Set(
    data.sources
      .map(source => source.sourceId)
      .concat(["unesco-historic-cairo", "src-unesco"])
  );
  const normalizeClaim = claim => {
    const sourceRefs = claim.sourceIds ?? [];
    const missingRefs = sourceRefs.filter(
      ref =>
        !knownSourceRefs.has(ref) &&
        !knownSourceRefs.has(String(ref).split(":").at(-1))
    );
    const placeholder =
      isPlaceholder(claim.textEn) || isPlaceholder(claim.textAr);
    const reasons = [...(claim.reasons ?? [])];
    if (placeholder)
      reasons.push("Placeholder text requires editorial verification");
    if (missingRefs.length)
      reasons.push(`Unresolved source references: ${missingRefs.join(", ")}`);
    return {
      ...claim,
      placeSlug: canonicalSlug(claim.placeSlug),
      status: placeholder || missingRefs.length ? "alternate" : "accepted",
      reasons: reasons.length ? reasons : null,
      sourceRefs,
    };
  };
  const acceptedClaims = data.acceptedClaims.map(claim => {
    return normalizeClaim(claim);
  });
  const alternateClaims = data.alternateClaims.map(claim => ({
    ...normalizeClaim(claim),
    status: "alternate",
  }));
  const featureRows = data.places.flatMap(place =>
    (place.architecturalElements ?? [])
      .filter(element => typeof element === "string" && !isPlaceholder(element))
      .map(element => ({
        featureId: `${canonicalSlug(place.slug)}:${slugify(element)}`,
        placeSlug: canonicalSlug(place.slug),
        labelEn: element,
        labelAr: null,
        status: place.status === "PUBLISHED_MEDIA" ? "accepted" : "alternate",
        sourceRefs: (place.sources ?? []).map(
          source => source.sourceId ?? source
        ),
        provenance: place.provenance ?? place.status,
        reviewNote:
          place.status === "PUBLISHED_MEDIA"
            ? null
            : `${place.status} place record requires editorial verification`,
      }))
  );
  const features = Array.from(
    new Map(featureRows.map(feature => [feature.featureId, feature])).values()
  );
  const reviewItems = [
    ...data.acceptedPhotos.map(item => ({
      recordId: `photo:${item.assetId}`,
      placeSlug: canonicalSlug(item.placeSlug),
      kind: "photo",
      payload: item,
      provenance: item.provenance,
      sourceUrls: [item.sourcePage, item.sourceUrl].filter(Boolean),
      reasons: ["Curator approval required before gallery publication"],
    })),
    ...data.alternatePhotos.map(item => ({
      recordId: mediaReviewId(item),
      placeSlug: canonicalSlug(item.placeSlug),
      kind: "photo",
      payload: item,
      provenance: item.provenance,
      sourceUrls: [
        item.sourcePageUrl,
        item.directImageUrl,
        item.sourcePage,
        item.sourceUrl,
      ].filter(Boolean),
      reasons: item.reasons,
    })),
    ...data.unresolved.map(item => ({
      recordId: item.recordId,
      placeSlug: canonicalSlug(item.slug ?? "__package__"),
      kind: item.kind,
      payload: item,
      provenance: item.provenance,
      sourceUrls: [],
      reasons: item.items,
    })),
    ...data.places
      .filter(place => place.status !== "PUBLISHED_MEDIA")
      .map(place => ({
        recordId: `place:${canonicalSlug(place.slug)}`,
        placeSlug: canonicalSlug(place.slug),
        kind: "place-record",
        payload: place,
        provenance: place.baseline?.provenance ?? place.status,
        sourceUrls: [],
        reasons: place.unresolved ?? [
          `${place.status} record requires editorial verification`,
        ],
      })),
    ...acceptedClaims
      .filter(claim => claim.status === "alternate")
      .map(claim => ({
        recordId: `claim:${claim.claimId}`,
        placeSlug: claim.placeSlug,
        kind: "claim-quality",
        payload: claim,
        provenance: claim.provenance,
        sourceUrls: claim.sourceRefs ?? [],
        reasons: claim.reasons,
      })),
  ];
  const acceptedPhotos = data.acceptedPhotos.map(item => ({
    ...item,
    placeSlug: canonicalSlug(item.placeSlug),
  }));
  return {
    aliases,
    acceptedClaims: [...acceptedClaims, ...alternateClaims],
    acceptedPhotos,
    features,
    reviewItems,
  };
}

const typeMap = {
  scholarly_database: "academic",
  scholarly: "academic",
  web: "journalism",
};
const sourceType = value =>
  typeMap[value] ??
  ([
    "academic",
    "institution",
    "archive",
    "museum",
    "conservation",
    "government",
    "journalism",
    "oral",
  ].includes(value)
    ? value
    : "academic");

function report(data, plan) {
  const publicClaims = plan.acceptedClaims.filter(
    claim => claim.status === "accepted"
  ).length;
  const stagedClaims = plan.acceptedClaims.length - publicClaims;
  return {
    packageDir: data.packageDir,
    counts: {
      places: data.places.length,
      sources: data.sources.length,
      acceptedPhotos: plan.acceptedPhotos.length,
      acceptedClaims: publicClaims,
      stagedClaims,
      reviewItems: plan.reviewItems.length,
    },
    gates: {
      acceptedMediaRequiresRightsEvidence: plan.acceptedPhotos.every(
        item => item.rightsEvidence?.evidenceStatus === "complete"
      ),
      stagedPhotos:
        plan.reviewItems.filter(item => item.kind === "photo").length ===
        data.acceptedPhotos.length + data.alternatePhotos.length,
      unresolvedIsStaged: data.unresolved.every(item =>
        plan.reviewItems.some(review => review.recordId === item.recordId)
      ),
      sourceRefsResolved: plan.acceptedClaims.every(claim =>
        (claim.sourceRefs ?? []).every(ref =>
          data.sources.some(
            source =>
              source.sourceId === ref ||
              String(ref).split(":").at(-1) === source.sourceId
          )
        )
      ),
    },
  };
}

const columns = names => names.map(name => `"${name}"`).join(",");
const placeholders = (count, start = 1) =>
  Array.from({ length: count }, (_, index) => `$${start + index}`).join(",");

async function upsertRows(tx, table, names, rows, conflict, updates) {
  if (!rows.length) return;
  const values = rows
    .map(
      (_, rowIndex) =>
        `(${placeholders(names.length, rowIndex * names.length + 1)})`
    )
    .join(",");
  const set = (updates ?? names.filter(name => name !== conflict))
    .map(name => `"${name}"=EXCLUDED."${name}"`)
    .join(",");
  await tx.unsafe(
    `INSERT INTO "${table}" (${columns(names)}) VALUES ${values} ON CONFLICT ("${conflict}") DO UPDATE SET ${set}`,
    rows.flat()
  );
}

const MEDIA_TYPES = new Set(["photo", "plan", "illustration", "map"]);
const VISUAL_TYPES = new Set([
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
]);
const DOCUMENTARY_STATUSES = new Set([
  "documentary",
  "archival",
  "illustration",
  "decorative",
  "generated",
]);

async function approveCompletePhotos(tx, plan) {
  const eligible = plan.acceptedPhotos.filter(
    item => item.rightsEvidence?.evidenceStatus === "complete" && item.sourceUrl
  );
  const publishedPlaces =
    await tx`SELECT "id", "slug" FROM "places" WHERE "status" = 'published'`;
  const placeIds = new Map(
    publishedPlaces.map(place => [place.slug, place.id])
  );
  const eligibleForPublication = eligible.filter(item =>
    placeIds.has(item.placeSlug)
  );
  const skippedPlaceSlugs = [
    ...new Set(
      eligible
        .filter(item => !placeIds.has(item.placeSlug))
        .map(item => item.placeSlug)
    ),
  ];
  const mediaRows = eligibleForPublication.map(item => [
    item.assetId,
    placeIds.get(item.placeSlug),
    null,
    item.cdnUrl ?? item.sourceUrl,
    MEDIA_TYPES.has(item.mediaType) ? item.mediaType : "photo",
    item.width ?? null,
    item.height ?? null,
    item.mimeType ?? null,
    item.fileSizeBytes ?? null,
    item.checksum ?? null,
    item.creator ?? null,
    item.sourcePage ?? null,
    item.license ?? null,
    item.licenseUrl ?? null,
    item.attribution ?? null,
    item.modifications ?? null,
    item.altEn ?? null,
    item.altAr ?? null,
    item.captionEn ?? null,
    item.captionAr ?? null,
    VISUAL_TYPES.has(item.visualType) ? item.visualType : "exterior",
    DOCUMENTARY_STATUSES.has(item.documentaryStatus)
      ? item.documentaryStatus
      : "documentary",
    true,
  ]);
  const mediaColumns = [
    "assetId",
    "placeId",
    "uploadedBy",
    "url",
    "mediaType",
    "width",
    "height",
    "mimeType",
    "fileSizeBytes",
    "checksum",
    "creator",
    "sourcePage",
    "license",
    "licenseUrl",
    "attribution",
    "modifications",
    "altEn",
    "altAr",
    "captionEn",
    "captionAr",
    "visualType",
    "documentaryStatus",
    "approved",
  ];
  if (mediaRows.length) {
    const values = mediaRows
      .map(
        (_, rowIndex) =>
          `(${placeholders(mediaColumns.length, rowIndex * mediaColumns.length + 1)})`
      )
      .join(",");
    await tx.unsafe(
      `INSERT INTO "mediaAssets" (${columns(mediaColumns)}) VALUES ${values}
      ON CONFLICT ("assetId") DO UPDATE SET
        "placeId" = COALESCE("mediaAssets"."placeId", EXCLUDED."placeId"),
        "creator" = EXCLUDED."creator",
        "sourcePage" = EXCLUDED."sourcePage",
        "license" = EXCLUDED."license",
        "licenseUrl" = EXCLUDED."licenseUrl",
        "attribution" = EXCLUDED."attribution",
        "approved" = true,
        "updatedAt" = NOW()`,
      mediaRows.flat()
    );
  }
  let approvedQueueItems = 0;
  for (const item of eligibleForPublication) {
    const result = await tx.unsafe(
      `UPDATE "researchReviewItems"
      SET "status" = 'approved', "reviewNote" = $1, "reviewedBy" = NULL, "reviewedAt" = NOW(), "updatedAt" = NOW()
      WHERE "recordId" = $2 AND "kind" = 'photo' AND "status" = 'pending'`,
      [
        "Approved from complete source-verified rights evidence.",
        `photo:${item.assetId}`,
      ]
    );
    approvedQueueItems += result.count;
  }
  return {
    eligible: eligible.length,
    published: eligibleForPublication.length,
    approvedQueueItems,
    skippedPlaceSlugs,
  };
}

async function applyPackage(data, plan, options) {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required for --apply");
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    return await sql.begin(async tx => {
      const existingSources = await tx`SELECT "slug" FROM "sources"`;
      const existingSourceSlugs = new Set(existingSources.map(row => row.slug));
      const sourceRows = data.sources.map(source => [
        sourceSlug(source),
        source.title ?? source.sourceId,
        null,
        source.author ?? null,
        source.publisher ?? null,
        source.year ??
          (source.publicationDate
            ? Number(String(source.publicationDate).slice(0, 4))
            : null),
        source.url ?? null,
        sourceType(source.sourceType),
        source.notes ?? null,
      ]);
      await upsertRows(
        tx,
        "sources",
        [
          "slug",
          "titleEn",
          "titleAr",
          "authors",
          "publisher",
          "year",
          "url",
          "sourceType",
          "reliabilityNote",
        ],
        sourceRows,
        "slug"
      );

      const placeRows = await tx`SELECT "id", "slug" FROM "places"`;
      const aliases = [...plan.aliases.entries()].map(
        ([aliasSlug, canonical]) => [
          aliasSlug,
          canonicalSlug(canonical),
          "Merged research alias",
        ]
      );
      await upsertRows(
        tx,
        "placeAliases",
        ["aliasSlug", "canonicalSlug", "note"],
        aliases,
        "aliasSlug"
      );

      const claimRows = plan.acceptedClaims.map(claim => [
        claim.claimId,
        claim.placeSlug,
        claim.storySlug ?? null,
        claim.claimType ?? "history",
        claim.textEn || "Untranslated claim requires editorial review.",
        claim.textAr ?? null,
        ["high", "medium", "low"].includes(claim.confidence)
          ? claim.confidence
          : "unknown",
        claim.status,
        (claim.sourceRefs ?? []).map(sourceKey),
        claim.provenance ?? [],
        claim.reasons ?? null,
        null,
      ]);
      await upsertRows(
        tx,
        "placeClaims",
        [
          "claimId",
          "placeSlug",
          "storySlug",
          "claimType",
          "textEn",
          "textAr",
          "confidence",
          "status",
          "sourceRefs",
          "provenance",
          "reasons",
          "reviewNote",
        ],
        claimRows,
        "claimId",
        [
          "placeSlug",
          "storySlug",
          "claimType",
          "textEn",
          "textAr",
          "confidence",
          "sourceRefs",
          "provenance",
          "reasons",
        ]
      );

      const featureRows = plan.features.map(feature => [
        feature.featureId,
        feature.placeSlug,
        feature.labelEn,
        feature.labelAr,
        feature.status,
        feature.sourceRefs.map(sourceKey),
        feature.provenance,
        feature.reviewNote,
      ]);
      await upsertRows(
        tx,
        "placeFeatures",
        [
          "featureId",
          "placeSlug",
          "labelEn",
          "labelAr",
          "status",
          "sourceRefs",
          "provenance",
          "reviewNote",
        ],
        featureRows,
        "featureId",
        ["placeSlug", "labelEn", "labelAr", "sourceRefs", "provenance"]
      );

      const reviewRows = plan.reviewItems.map(item => [
        item.recordId,
        item.placeSlug,
        item.kind,
        "pending",
        item.payload,
        item.provenance ?? null,
        item.sourceUrls ?? [],
        item.reasons ?? null,
        null,
        null,
        null,
      ]);
      await upsertRows(
        tx,
        "researchReviewItems",
        [
          "recordId",
          "placeSlug",
          "kind",
          "status",
          "payload",
          "provenance",
          "sourceUrls",
          "reasons",
          "reviewNote",
          "reviewedBy",
          "reviewedAt",
        ],
        reviewRows,
        "recordId",
        ["placeSlug", "kind", "payload", "provenance", "sourceUrls", "reasons"]
      );
      const approvedPhotos = options.approveCompletePhotos
        ? await approveCompletePhotos(tx, plan)
        : null;
      return {
        sourceRows: sourceRows.length,
        aliases: aliases.length,
        claims: claimRows.length,
        features: featureRows.length,
        reviewItems: reviewRows.length,
        existingSources: existingSourceSlugs.size,
        mappedPlaces: placeRows.filter(row =>
          plan.reviewItems.every(item => item.placeSlug !== row.slug)
        ).length,
        approvedPhotos,
      };
    });
  } finally {
    await sql.end();
  }
}

async function main() {
  const args = parseArgs();
  const data = { ...loadPackage(args.packageDir), packageDir: args.packageDir };
  const plan = buildPlan(data);
  const output = report(data, plan);
  if (args.apply) output.applied = await applyPackage(data, plan, args);
  console.log(JSON.stringify(output, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
