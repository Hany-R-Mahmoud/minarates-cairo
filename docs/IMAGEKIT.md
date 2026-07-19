# ImageKit media workflow

ImageKit is the delivery layer. Supabase stores the media record, provenance, rights, bilingual alt text and approval state.

## Current workflow

1. Run `pnpm media:manifest` after the canonical place dataset changes.
2. Codex verifies each source URL against a canonical source page and completes the rights fields.
3. Codex assigns an asset ID such as `cover-ibn-tulun`.
4. Upload the original manually to ImageKit at the manifest path, for example:
   `/places/ibn-tulun/cover.jpg`.
5. Put the returned public ImageKit URL in the manifest's `cdnUrl` field.
6. The trusted content loader imports only records with complete provenance, bilingual alt text, a reachable CDN URL and a verified license.

`pnpm media:manifest` preserves existing source, rights, approval and CDN fields by asset ID, so regenerating the manifest will not erase completed work. Run `pnpm media:check` for a report, and `pnpm media:check:strict` when the manifest is complete enough for a release/CI gate.

After the manifest contains source-verified records and their ImageKit URLs, run `pnpm media:sync` to upsert them into Supabase. Incomplete records are skipped and never become public media.

Never publish a bare CDN URL without its matching asset ID and source record. The CDN URL proves delivery, not copyright.

## Delivery rules

- Use public URLs for V1 so offline packs can cache them.
- Keep originals under ImageKit's free transformation limit: 20 MB and 25 megapixels.
- The application will request responsive widths of 480, 800, 1280 and 1600 pixels.
- Use ImageKit automatic format selection (`f-auto`) and quality 80 (`q-80`).
- Keep documentary images separate from diagrams, maps, archival images and decorative assets.
- Keep a backup of originals outside Git and outside the application database.

## Gallery tiers

- Major monuments: 6–8 approved images.
- Standard places: 2–4 approved images.
- Every published place: one cover, bilingual alt text, attribution, license and source page.

ImageKit custom tags are optional. The authoritative metadata remains in Supabase and the versioned manifest.
