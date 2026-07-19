import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const outputPath = path.resolve("content/media/media-manifest.json");
const verificationPath = path.resolve("content/media/source-verification.json");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to export the media manifest");
}

const sql = postgres(databaseUrl, { max: 1 });

async function readExistingAssets() {
  try {
    const contents = await readFile(outputPath, "utf8");
    const manifest = JSON.parse(contents);
    if (!Array.isArray(manifest.assets)) {
      throw new Error("the existing media manifest has no assets array");
    }
    return new Map(manifest.assets.map((asset) => [asset.assetId, asset]));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw new Error(`Cannot safely read existing media manifest: ${error.message}`);
  }
}

async function readSourceVerification() {
  const contents = await readFile(verificationPath, "utf8");
  return JSON.parse(contents);
}

try {
  const existingAssets = await readExistingAssets();
  const verifiedSources = await readSourceVerification();
  const rows = await sql`
    SELECT
      id,
      slug,
      "nameEn",
      "nameAr",
      "coverImageUrl",
      "coverImageAlt",
      "coverImageAltAr",
      "coverImageAttribution",
      "coverImageLicense"
    FROM "places"
    WHERE status = 'published'
    ORDER BY slug
  `;

  const assets = rows.map((place) => {
    const assetId = `cover-${place.slug}`;
    const existing = existingAssets.get(assetId) ?? {};
    const verified = verifiedSources[place.nameEn] ?? null;
    const sourcePage = verified?.sourceTitle
      ? `https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${verified.sourceTitle}`).replaceAll("%20", "_")}`
      : existing.sourcePage ?? null;
    const isExistingVerified = Boolean(existing.sourcePage && existing.licenseUrl);
    return {
      assetId,
      placeId: place.id,
      placeSlug: place.slug,
      placeNameEn: place.nameEn,
      placeNameAr: place.nameAr,
      role: "cover",
      imageKitPath: `/places/${place.slug}/cover.jpg`,
      sourceUrl: verified?.sourceUrl ?? (isExistingVerified ? existing.sourceUrl : null),
      sourcePage,
      cdnUrl: existing.cdnUrl ?? null,
      creator: verified?.creator ?? existing.creator ?? null,
      license: verified?.license ?? (isExistingVerified ? existing.license : null),
      licenseUrl: verified?.licenseUrl ?? existing.licenseUrl ?? null,
      attribution: verified ? `${verified.creator} / Wikimedia Commons / ${verified.license}` : existing.attribution ?? null,
      altEn: existing.altEn ?? place.coverImageAlt ?? `View of ${place.nameEn} in Cairo`,
      altAr: existing.altAr ?? place.coverImageAltAr ?? `منظر لـ${place.nameAr} في القاهرة`,
      status: verified ? "source-verified" : existing.status ?? "needs-source-verification",
    };
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ schemaVersion: 1, assets }, null, 2)}\n`, "utf8");
  console.log(`Exported ${assets.length} cover assets to ${outputPath}`);
} finally {
  await sql.end({ timeout: 5 });
}
