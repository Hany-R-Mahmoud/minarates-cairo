import { readFile } from "node:fs/promises";
import path from "node:path";

const manifestPath = path.resolve("content/media/media-manifest.json");
const strict = process.argv.includes("--strict");

const contents = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(contents);
const errors = [];
const incomplete = [];
const assetIds = new Set();

if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (!Array.isArray(manifest.assets)) errors.push("assets must be an array");

for (const [index, asset] of (manifest.assets ?? []).entries()) {
  const label = asset.assetId || `asset-${index + 1}`;
  if (assetIds.has(asset.assetId)) errors.push(`${label}: assetId is duplicated`);
  assetIds.add(asset.assetId);

  for (const field of ["assetId", "placeSlug", "role", "imageKitPath", "altEn", "altAr"]) {
    if (typeof asset[field] !== "string" || asset[field].trim() === "") {
      incomplete.push(`${label}: missing ${field}`);
    }
  }

  if (asset.cdnUrl !== null && asset.cdnUrl !== undefined) {
    try {
      const url = new URL(asset.cdnUrl);
      if (url.hostname !== "ik.imagekit.io" && !url.hostname.endsWith(".ik.imagekit.io")) {
        errors.push(`${label}: cdnUrl is not an ImageKit URL`);
      }
    } catch {
      errors.push(`${label}: cdnUrl is not a valid URL`);
    }
  } else {
    incomplete.push(`${label}: missing cdnUrl`);
  }

  for (const field of ["sourcePage", "license", "licenseUrl", "attribution"]) {
    if (typeof asset[field] !== "string" || asset[field].trim() === "") {
      incomplete.push(`${label}: missing ${field}`);
    }
  }

  if (!['approved', 'source-verified'].includes(asset.status)) incomplete.push(`${label}: status is ${asset.status || "unset"}`);
}

if (errors.length > 0) {
  console.error(`Media manifest errors (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
}

console.log(`Media manifest: ${manifest.assets?.length ?? 0} assets, ${incomplete.length} incomplete`);
if (incomplete.length > 0) {
  console.log(strict ? "Strict check failed; complete the listed metadata before publishing." : "Report only; use --strict to fail CI on incomplete media.");
  for (const item of incomplete) console.log(`- ${item}`);
}

if (errors.length > 0 || (strict && incomplete.length > 0)) process.exitCode = 1;
