# Minarets of Cairo — Project TODO

## Current Status and Roadmap

_Last updated: 2026-07-19_

### Current status

- Supabase is connected and the PostgreSQL schema is operational.
- 41 published places are currently available; target is 48+.
- 14 stories and 14 comparisons are currently available; the next content batch adds one story for every new place.
- Media covers are integrated for 40 of 41 places through ImageKit and Supabase.
- Al-Azhar Park intentionally has no media until a future image is supplied.
- Authentication is postponed to V2. V1 remains usable for guest browsing and local features.

### Active roadmap

#### 1. Complete content package — next milestone

- Add broader coverage: minimum 10 new published places, targeting 12–15 when quality remains high.
- Add one complete story for every new published place.
- Add the 72 researched candidate records.
- Research partner/ChatGPT supplies the verified package; Codex validates, imports, and tests it.
- Required validation: exact slugs, bilingual fields, dates, source records, claim mapping, and database integrity.

#### 2. Enrich monument and media content

- Add galleries, credits, licenses, and final alt-text coverage.
- Complete nearby places, materials, vocabulary, timelines, diagrams, and long-form stories.

#### 3. Complete walks and visitor workflows

- Add coordinates, transfers, rest points, exits, and sensitive-area guidance.
- Improve itinerary preferences and deterministic warnings.
- Finish guest notebook, collections, export, and offline packs.

#### 4. Complete field and curator features

- Finish field mode, photography companion, and curator workflows.

#### 5. Final quality and release preparation

- Run RTL, keyboard, focus, contrast, visual, and end-to-end QA.
- Complete formatting, CI, deployment configuration, and production validation.

### Execution responsibility split

- Research/media partner: research, written content, source evidence, image generation or collection, and external media URLs.
- User: upload approved images to ImageKit and provide the final public URLs.
- Codex: code, schema validation, manifest preparation, Supabase import, tests, QA, commits, and deployment checks.

## Phase 3: Design System, Database Schema, Bilingual Foundation
- [x] Global CSS design tokens (palette, typography, spacing) — Stone, Light, Manuscript theme
- [x] Google Fonts: Source Serif 4, Source Sans 3, Cairo, Noto Naskh Arabic
- [x] RTL/LTR context provider and language switcher
- [x] i18n translation system (en/ar) with LanguageContext + useLang hook
- [x] Database schema: periods, districts, placeTypes, places, sources, walks, comparisons, detectiveActivities, stories, userFavorites, userCollections, userNotes, userVisits, userItineraries, auditLog
- [x] Drizzle migrations applied
- [x] Seed data: 11 periods, 41 places, 8 districts, 18 walks, 14 comparisons, 10 detective activities, 14 stories
- [x] App layout with bilingual top navigation (SiteLayout)

## Phase 4: Cinematic Home & Navigation
- [x] Cinematic hero with "Minarets of Cairo" heading and bilingual tagline
- [x] Historical period ribbon (Rashidun → Abbasid → Tulunid → Fatimid → Ayyubid → Bahri Mamluk → Burji Mamluk → Ottoman → 19th c.)
- [x] Bilingual tagline (EN/AR) with language toggle
- [x] Entry points: Monuments, Map, Walks, Compare, Play, Stories
- [x] Responsive top navigation with language toggle
- [x] Footer with attribution and source methodology
- [x] Featured Monuments section on home
- [x] Visual Stories section on home
- [x] CTA section (Build Itinerary / My Notebook)

## Phase 5: Monument Story Pages
- [x] 41 published monument records with bilingual names and content
- [x] Monument detail page: names, aliases, dates, founder, function, phases
- [x] History brief (bilingual)
- [x] Key dates timeline
- [x] "Do not misunderstand" clarification notes
- [x] Architecture details section
- [x] Monuments index page with search and filtering (period, district, type)
- [x] Active Worship badges
- [x] GPS coordinates for all 22 places

## Phase 6: Map, Walks, and Period Explorer
- [x] MapLibre GL JS interactive map with OSM raster tiles
- [x] Era-based and district filtering
- [x] Monument markers with popups
- [x] Accessible list-view alternative
- [x] 18 curated district walks with full metadata
- [x] Walk detail page: duration, distance, difficulty, stops, accessibility
- [x] Active-worship stop indicators
- [x] Stale-information warnings
- [x] Historical-period explorer (11 eras with date bands and monument counts)

## Phase 7: Comparison, Detective, and Stories
- [x] Side-by-side comparison tool (2–4 places)
- [x] 14 curated comparison sets
- [x] 10 detective activities (beginner/intermediate/advanced)
- [x] 14 stories, including visual stories
- [x] Stories listing page
- [x] StoryDetail page

## Phase 8: Itinerary Builder, Notebook
- [x] Itinerary builder with stop management
- [x] Personal notebook: favorites, notes, visited tabs
- [x] Guest local mode (no account required for browsing)
- [ ] Optional account sync (Manus OAuth) — postponed to V2

## Phase 9: Curator Studio
- [x] Place and translation editor (admin only)
- [x] Source registry
- [x] Publication workflow (publish/unpublish)
- [x] Full audit history

## Phase 10: Tests, Accessibility, Polish
- [x] Vitest tests: 20 tests passing (heritage.test.ts + auth.logout.test.ts)
- [x] Bilingual data integrity tests
- [x] Translation key fixes in SiteLayout

## Known Limitations / Future Work
- [x] ImageKit/Supabase cover integration for 40 of 41 places
- [ ] Complete media galleries and add the Al-Azhar Park image
- [ ] Audio guide page (nav item present, page not yet built)
- [ ] Offline PWA service worker for walk download
- [ ] More monument records (currently 41, target 48+)
- [ ] Complete content package: 15 stories and 72 researched candidates
- [ ] Curator media ingestion improvements beyond the current verified-package workflow
- [ ] Full RTL layout testing on all pages
