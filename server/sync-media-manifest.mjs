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
  ["assetId", "placeId", "imageKitPath", "sourcePage", "creator", "license", "licenseUrl", "attribution", "altEn", "altAr"].every((field) => hasText(String(asset[field] ?? ""))),
);
const skippedAssets = manifest.assets.length - readyAssets.length;

try {
  for (const asset of readyAssets) {
    await sql`
      INSERT INTO "mediaAssets" (
        "assetId", "placeId", "mediaType", "cdnKey", "url",
        "creator", "sourcePage", "license", "licenseUrl", "attribution",
        "altEn", "altAr", "visualType", "documentaryStatus", "approved", "updatedAt"
      ) VALUES (
        ${asset.assetId}, ${asset.placeId}, 'photo', ${asset.imageKitPath}, ${asset.cdnUrl},
        ${asset.creator}, ${asset.sourcePage}, ${asset.license}, ${asset.licenseUrl}, ${asset.attribution},
        ${asset.altEn}, ${asset.altAr}, 'exterior', 'documentary', true, now()
      )
      ON CONFLICT ("assetId") DO UPDATE SET
        "placeId" = EXCLUDED."placeId",
        "mediaType" = EXCLUDED."mediaType",
        "cdnKey" = EXCLUDED."cdnKey",
        "url" = EXCLUDED."url",
        "creator" = EXCLUDED."creator",
        "sourcePage" = EXCLUDED."sourcePage",
        "license" = EXCLUDED."license",
        "licenseUrl" = EXCLUDED."licenseUrl",
        "attribution" = EXCLUDED."attribution",
        "altEn" = EXCLUDED."altEn",
        "altAr" = EXCLUDED."altAr",
        "approved" = true,
        "updatedAt" = now()
    `;
  }
  console.log(`Synced ${readyAssets.length} approved media assets to Supabase; skipped ${skippedAssets} incomplete assets.`);
} finally {
  await sql.end({ timeout: 5 });
}
