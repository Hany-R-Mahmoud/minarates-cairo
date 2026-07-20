import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const manifestPath = path.resolve("content/media/media-manifest.json");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL is required to sync the media manifest");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.assets)) {
  throw new Error("Media manifest must use schemaVersion 1 and contain an assets array");
}

const sql = postgres(databaseUrl, { max: 1 });
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const isImageKitUrl = (value) => {
  if (!hasText(value)) return false;
  try {
    const hostname = new URL(value).hostname;
    return hostname === "ik.imagekit.io" || hostname.endsWith(".ik.imagekit.io");
  } catch {
    return false;
  }
};
const readyAssets = manifest.assets.filter((asset) =>
  ["approved", "source-verified"].includes(asset.status) &&
  isImageKitUrl(asset.cdnUrl) &&
  ["assetId", "placeSlug", "imageKitPath", "sourcePage", "creator", "license", "licenseUrl", "attribution", "altEn", "altAr"].every((field) => hasText(String(asset[field] ?? ""))),
);
const skippedAssets = manifest.assets.length - readyAssets.length;

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

const canonicalPlaceSlug = (slug) => PLACE_SLUG_ALIASES[slug] ?? slug;

try {
  const placeRows = await sql`SELECT "id", "slug" FROM "places" WHERE "status" = 'published'`;
  const placeIdsBySlug = new Map(placeRows.map((place) => [place.slug, place.id]));
  const unresolvedSlugs = [...new Set(readyAssets.map((asset) => canonicalPlaceSlug(asset.placeSlug)))]
    .filter((slug) => !placeIdsBySlug.has(slug));
  if (unresolvedSlugs.length > 0) {
    throw new Error(`Published place not found for slug(s): ${unresolvedSlugs.join(", ")}`);
  }

  await sql.begin(async (transaction) => {
    for (const asset of readyAssets) {
      const placeSlug = canonicalPlaceSlug(asset.placeSlug);
      await transaction`
        INSERT INTO "mediaAssets" (
          "assetId", "placeId", "mediaType", "originalFilename", "cdnKey", "url",
          "width", "height", "mimeType", "fileSizeBytes", "checksum",
          "creator", "sourcePage", "license", "licenseUrl", "attribution",
          "altEn", "altAr", "captionEn", "captionAr", "modifications",
          "visualType", "documentaryStatus", "approved", "updatedAt"
        ) VALUES (
          ${asset.assetId}, ${placeIdsBySlug.get(placeSlug)}, ${asset.mediaType ?? 'photo'},
          ${asset.localFile ? path.basename(asset.localFile) : null}, ${asset.imageKitPath}, ${asset.cdnUrl},
          ${asset.width ?? null}, ${asset.height ?? null}, ${asset.mimeType ?? null}, ${asset.fileSizeBytes ?? null}, ${asset.checksum ?? null},
          ${asset.creator}, ${asset.sourcePage}, ${asset.license}, ${asset.licenseUrl}, ${asset.attribution},
          ${asset.altEn}, ${asset.altAr}, ${asset.captionEn ?? null}, ${asset.captionAr ?? null}, ${asset.modifications ?? null},
          ${asset.visualType ?? 'exterior'}, ${asset.documentaryStatus ?? 'documentary'}, true, now()
        )
        ON CONFLICT ("assetId") DO UPDATE SET
          "placeId" = EXCLUDED."placeId",
          "mediaType" = EXCLUDED."mediaType",
          "originalFilename" = EXCLUDED."originalFilename",
          "cdnKey" = EXCLUDED."cdnKey",
          "url" = EXCLUDED."url",
          "width" = EXCLUDED."width",
          "height" = EXCLUDED."height",
          "mimeType" = EXCLUDED."mimeType",
          "fileSizeBytes" = EXCLUDED."fileSizeBytes",
          "checksum" = EXCLUDED."checksum",
          "creator" = EXCLUDED."creator",
          "sourcePage" = EXCLUDED."sourcePage",
          "license" = EXCLUDED."license",
          "licenseUrl" = EXCLUDED."licenseUrl",
          "attribution" = EXCLUDED."attribution",
          "altEn" = EXCLUDED."altEn",
          "altAr" = EXCLUDED."altAr",
          "captionEn" = EXCLUDED."captionEn",
          "captionAr" = EXCLUDED."captionAr",
          "modifications" = EXCLUDED."modifications",
          "visualType" = EXCLUDED."visualType",
          "documentaryStatus" = EXCLUDED."documentaryStatus",
          "approved" = true,
          "updatedAt" = now()
      `;

      if (asset.assetId.startsWith("cover-")) {
        await transaction`
          UPDATE "places"
          SET "coverImageUrl" = ${asset.cdnUrl},
              "coverImageAlt" = ${asset.altEn},
              "coverImageAltAr" = ${asset.altAr},
              "coverImageAttribution" = ${asset.attribution},
              "coverImageLicense" = ${asset.license},
              "updatedAt" = now()
          WHERE "id" = ${placeIdsBySlug.get(placeSlug)}
        `;
      }
    }

    await transaction`
      UPDATE "places"
      SET "coverImageUrl" = NULL,
          "coverImageAlt" = NULL,
          "coverImageAltAr" = NULL,
          "coverImageAttribution" = NULL,
          "coverImageLicense" = NULL,
          "updatedAt" = now()
      WHERE "status" = 'published'
        AND "coverImageUrl" IS NOT NULL
        AND "coverImageUrl" NOT LIKE 'https://ik.imagekit.io/%'
    `;
  });
  console.log(`Synced ${readyAssets.length} approved media assets to Supabase; skipped ${skippedAssets} incomplete assets.`);
} finally {
  await sql.end({ timeout: 5 });
}
