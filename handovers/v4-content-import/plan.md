# v4 Content Import

## Goal

Import the ten v4 places, stories, historical sources, and ImageKit media into the existing PostgreSQL-backed app without changing unrelated user work.

## Decisions

- Candidates remain research-only package data; no public database table is added in this run.
- Temporary candidate source IDs remain warnings until later research validation.
- `low-to-medium` accessibility confidence normalizes to `low`.
- Package field names map to current Drizzle columns during import.
- Existing records are preserved; imports are idempotent by slug/asset ID.

## Risks

- Existing taxonomy lacks Bulaq and al-Khalifa districts.
- Current database has no claims/candidates tables.
- Practical visitor data remains unknown and must stay null/unknown.
