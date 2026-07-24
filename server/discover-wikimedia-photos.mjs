import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const outputPath = path.resolve(
  process.env.WIKIMEDIA_PHOTO_DISCOVERY_OUTPUT ??
    "docs/research/merged-research_output/wikimedia-photo-discovery.json"
);
const userAgent =
  "MinaretsOfCairoResearch/1.0 (Wikimedia Commons rights-aware discovery)";
const acceptedLicenses = /^(CC BY(?:-SA)?(?: [0-9.]+)?(?: PL)?|CC0|Public domain|PDM|PD-US)/i;
const genericCreators = /^(wikimedia contributor|unknown|anonymous|user)$/i;
const stopWords = new Set([
  "al", "and", "at", "bin", "complex", "cairo", "district", "ibn", "in",
  "island", "mosque", "museum", "of", "palace", "street", "the", "with",
]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const stripHtml = value =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
const normalize = value =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const tokens = value =>
  normalize(value)
    .split(/\s+/)
    .filter(token => token.length > 2 && !stopWords.has(token));
const titleFromPage = page => page.title.replace(/^File:/i, "");
const fileExtension = value => path.extname(value.split("?")[0]).toLowerCase();

function scorePage(page, place) {
  const titleTokens = new Set(tokens(titleFromPage(page)));
  const placeTokens = new Set([
    ...tokens(place.nameEn),
    ...tokens(place.slug.replaceAll("-", " ")),
  ]);
  const matches = [...placeTokens].filter(token => titleTokens.has(token));
  const title = normalize(titleFromPage(page));
  const exactName = normalize(place.nameEn).length > 5 && title.includes(normalize(place.nameEn));
  return matches.length * 10 + (exactName ? 20 : 0) + (title.includes("cairo") ? 2 : 0);
}

async function commonsSearch(place) {
  const query = `"${place.nameEn}" Cairo`;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "20");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata|sha1");
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`Commons API ${response.status}`);
  const data = await response.json();
  return (data.query?.pages ?? []).sort(
    (left, right) => scorePage(right, place) - scorePage(left, place)
  );
}

function toCandidate(place, page, info) {
  const metadata = info.extmetadata ?? {};
  const creator = stripHtml(metadata.Artist?.value);
  const license = stripHtml(metadata.LicenseShortName?.value);
  const licenseUrl = stripHtml(metadata.LicenseUrl?.value);
  const sourcePage = info.descriptionurl;
  const sourceUrl = info.url;
  const sourceTitle = titleFromPage(page);
  const score = scorePage(page, place);
  if (score < 10 || !sourcePage || !sourceUrl || !creator || genericCreators.test(creator)) return null;
  if (!acceptedLicenses.test(license) || /-NC|-ND/i.test(license)) return null;
  if (!/^image\/(jpeg|png|webp)$/i.test(info.mime ?? "")) return null;
  if ((info.width ?? 0) < 700 || (info.height ?? 0) < 500) return null;
  const assetId = `wikimedia-${place.slug}-${info.sha1 ?? createHash("sha1").update(sourceUrl).digest("hex")}`.slice(0, 128);
  const attribution = `${sourceTitle} — ${creator}, ${license}, via Wikimedia Commons`;
  return {
    assetId,
    placeSlug: place.slug,
    placeNameEn: place.nameEn,
    placeNameAr: place.nameAr,
    role: "gallery",
    sourceUrl,
    sourcePage,
    sourceTitle,
    creator,
    license,
    licenseUrl,
    attribution,
    altEn: `${sourceTitle} — documentary view of ${place.nameEn}.`,
    altAr: `صورة توثيقية لـ ${place.nameAr ?? place.nameEn}.`,
    captionEn: `${sourceTitle} — ${place.nameEn}.`,
    captionAr: `${sourceTitle} — ${place.nameAr ?? place.nameEn}.`,
    mediaType: "photo",
    visualType: "exterior",
    documentaryStatus: "documentary",
    width: info.width,
    height: info.height,
    mimeType: info.mime,
    checksum: info.sha1,
    verifiedAt: new Date().toISOString().slice(0, 10),
    status: "source-verified",
    provenance: "wikimedia_api_discovery",
    provenanceGroup: "wikimedia_api_discovery",
    rightsEvidence: {
      sourcePage,
      sourceUrl,
      creator,
      license,
      licenseUrl,
      attribution,
      verifiedBy: "wikimedia_api_discovery",
      evidenceStatus: "complete",
      sourceId: `photo:${assetId}:source-page`,
    },
    acceptanceStatus: "discovered-review",
    reasons: [
      "Discovered from a live Wikimedia Commons file page.",
      "Curator must confirm place relevance and visual role before publication.",
    ],
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const output = [];
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index]);
      await sleep(1500);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return output;
}

const sql = postgres(process.env.DATABASE_URL, { max: 5 });
try {
  const places = await sql`
    SELECT slug, "nameEn", "nameAr"
    FROM "places"
    WHERE status = 'published'
    ORDER BY slug
  `;
  const existing = JSON.parse(
    await fs.readFile(
      path.resolve("docs/research/merged-research_output/photos.json"),
      "utf8"
    )
  );
  const previousPath = outputPath;
  let previousCandidates = [];
  try {
    previousCandidates = JSON.parse(await fs.readFile(previousPath, "utf8")).candidates ?? [];
  } catch {
    previousCandidates = [];
  }
  const existingSources = new Set(
    [...(existing.accepted ?? []), ...(existing.alternate ?? []), ...previousCandidates]
      .map(item => item.sourcePage ?? item.sourcePageUrl)
      .filter(Boolean)
  );
  const results = await mapWithConcurrency(places, 1, async place => {
    try {
      const pages = await commonsSearch(place);
      const candidates = pages
        .map(page => toCandidate(place, page, page.imageinfo?.[0] ?? {}))
        .filter(Boolean)
        .filter(item => !existingSources.has(item.sourcePage))
        .slice(0, 5);
      return { slug: place.slug, candidates };
    } catch (error) {
      return { slug: place.slug, candidates: [], error: String(error.message ?? error) };
    }
  });
  const newCandidates = results.flatMap(result => result.candidates);
  const candidates = [
    ...previousCandidates,
    ...newCandidates.filter(
      candidate => !previousCandidates.some(item => item.sourcePage === candidate.sourcePage)
    ),
  ];
  const report = {
    generatedAt: new Date().toISOString(),
    source: "Wikimedia Commons API",
    publishedPlaces: places.length,
    candidates: candidates.length,
    newCandidates: newCandidates.length,
    placesWithCandidates: results.filter(result => result.candidates.length > 0).length,
    placesWithoutCandidates: results.filter(result => result.candidates.length === 0).map(result => result.slug),
    errors: results.filter(result => result.error),
  };
  await fs.writeFile(outputPath, JSON.stringify({ schemaVersion: 1, report, candidates }, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await sql.end();
}
