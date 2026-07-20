# v4 Import Review

## Scope

Reviewed the importer, package script, merged media manifests, and import handover artifacts. The review is limited to the v4 content integration and does not include unrelated working-tree UI changes.

## Result

The v4 integration is safe to commit and push after the recorded verification checks. The importer is explicit about content-layer-to-Drizzle mappings, uses slug/asset-key upserts, runs database writes in one transaction, keeps the 72 research-only candidates out of the public database, and populates readable bilingual story bodies from the package chapters.

## Accepted limitations

- Candidate records reference temporary source IDs that are not present in the package source registry. The importer reports this and skips all 72 candidates.
- The package's claim-quality and Arabic-leakage findings remain content-review work; they do not enter the public database in this run.
- Visitor hours, prices, photography permissions, accessibility routes, and approximate coordinates remain unknown or unverified.
- The optional higher-resolution Aqsunqur replacement is not activated.
- The pre-existing Al-Azhar Park media record remains incomplete because it has no CDN URL.

## Review fixes applied

- Story imports now populate `bodyEn` and `bodyAr` as chapter-formatted Markdown in addition to `chaptersJson`.
- Century ranges such as `15th–18th centuries` and `early 13th century` now map to explicit approximate year ranges instead of being silently dropped.
