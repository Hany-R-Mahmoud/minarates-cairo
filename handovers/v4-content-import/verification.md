# v4 Import Verification

## Database and media

- Content importer dry-run and apply completed successfully.
- Supabase totals after import: 51 places, 24 stories, 26 historical sources, 50 approved media records, and 10 districts.
- Imported content: 10 places, 10 stories, and 20 new historical sources; the existing UNESCO source was reused.
- All ten imported places are published, mapped to existing period/type taxonomies, and have normalized `accessibilityConfidence: low`.
- All ten imported stories have a place relationship and populated chapter JSON.
- All ten imported stories also have readable bilingual body fields; the live Aqsunqur story response returned both bodies.
- Century-style dates were preserved for Bayt al-Razzaz (1400–1799), Gayer-Anderson (1500–1699), and Imam al-Shafii (1200–1299).
- `pnpm media:sync` linked 50 approved media assets; one pre-existing incomplete asset was skipped.
- Live HTTP/API smoke check passed on the development server: homepage returned HTTP 200, `places.bySlug` returned Aqsunqur, `places.withMeta` returned its ImageKit cover/media, and `stories.list` returned the imported story.

## Automated checks

- `node --check server/import-content-package.mjs` — passed.
- `pnpm db:check` — passed; schema ready and expected heritage counts readable.
- `pnpm media:check` — passed in report mode; strict mode remains blocked by the pre-existing Al-Azhar Park missing CDN URL.
- `pnpm test` — passed: 2 files, 23 tests.
- `pnpm build` — passed. Existing non-blocking warnings concern analytics environment values, CSS import ordering, script type, and bundle size.
- `pnpm check` — passed after the importer fix.
