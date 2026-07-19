# Minarets of Cairo — revised media patch

Generated: **2026-07-19**

## What changed in this patch

- Renamed all local image files to descriptive, place-specific filenames.
- Prioritized clearer minaret-led and architecturally stronger covers from the verified image pool.
- Replaced the two Citadel covers with a more iconic view centered on the Mosque of Muhammad Ali inside the Citadel.
- Corrected the Bayt al-Suhaymi cover orientation.
- Kept all authoritative place slugs, asset IDs, and canonical ImageKit upload paths intact.
- Left all `cdnUrl` values as `null`.

## Coverage

- **Published place records covered:** 41 / 41
- **Images included:** 41
- **Verified assets:** 41
- **Unresolved authoritative assets:** 0

## License breakdown

- **CC BY 2.0:** 3 assets
- **CC BY 3.0:** 13 assets
- **CC BY 3.0 PL:** 1 assets
- **CC BY-SA 3.0:** 12 assets
- **CC BY-SA 4.0:** 12 assets

## Notes on naming

Inside the ZIP, every local image is now named in the pattern:

`images/<placeSlug>/<placeSlug>-cover-<subject>.jpg`

This makes the file purpose obvious while preserving the canonical upload path recorded in `imageKitPath`.
