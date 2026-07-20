# Round 2 — Discovery/media handover

## Summary

Implemented the discovery/media slice for the home, monuments, stories, and story detail surfaces. Existing API contracts remain unchanged.

- Removed geometric monument placeholders from `Home.tsx` and `Monuments.tsx`.
- Render monument media only when the API row includes a URL, descriptive alt text, attribution, and license.
- Added an explicit no-image treatment when verified monument media is unavailable.
- Normalized story cover images with ImageKit URLs/srcsets, responsive sizes, lazy loading for listing cards, and async decoding.
- Kept the story detail cover eager with high fetch priority because it is the page hero.
- Preserved story image rendering when the existing story API provides a cover URL; missing story covers receive an honest no-image treatment.

## Files changed

- `client/src/pages/Home.tsx`
  - Added verified-media gating for featured monument cards.
  - Added responsive ImageKit image loading and no-image treatment.
- `client/src/pages/Monuments.tsx`
  - Added verified-media gating for monument cards.
  - Added responsive ImageKit image loading and no-image treatment.
  - Retained existing `PageIntro` and filter accessibility changes already present in the working tree.
- `client/src/pages/Stories.tsx`
  - Added responsive ImageKit cover loading, lazy/async image behavior, and no-image treatment.
  - Retained existing `PageIntro` change already present in the working tree.
- `client/src/pages/StoryDetail.tsx`
  - Added responsive ImageKit cover loading with eager/high-priority hero behavior.
- `handovers/round-2-discovery-media-handover.md`
  - This handover.

## Verification

- `pnpm check` — passed.
- `pnpm media:check` — passed as report-only; existing manifest reports 1 incomplete asset: `cover-al-azhar-park` has no `cdnUrl`.
- `git diff --check` — passed.

## Routes affected

- `/`
- `/monuments`
- `/stories`
- `/stories/:slug`

## Constraints honored

- Did not modify `SiteLayout.tsx`, `index.css`, `MapPage.tsx`, `Compare.tsx`, `Notebook.tsx`, or `CuratorStudio.tsx`.
- No commit created.

## Remaining work

- If the product later exposes approved, fully attributed story media metadata in the API, add a stricter story-media provenance gate matching the monument contract. Current story API exposes only `coverImageUrl` and attribution, so existing story images are preserved rather than incorrectly rejected.
- Resolve the pre-existing `cover-al-azhar-park` CDN gap if strict media checks are required.
