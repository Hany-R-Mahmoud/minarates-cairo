# Minarets of Cairo — Project TODO

## Phase 3: Design System, Database Schema, Bilingual Foundation
- [x] Global CSS design tokens (palette, typography, spacing) — Stone, Light, Manuscript theme
- [x] Google Fonts: Source Serif 4, Source Sans 3, Cairo, Noto Naskh Arabic
- [x] RTL/LTR context provider and language switcher
- [x] i18n translation system (en/ar) with LanguageContext + useLang hook
- [x] Database schema: periods, districts, placeTypes, places, sources, walks, comparisons, detectiveActivities, stories, userFavorites, userCollections, userNotes, userVisits, userItineraries, auditLog
- [x] Drizzle migrations applied
- [x] Seed data: 11 periods, 22 places, 8 districts, 18 walks, 4 comparisons, 10 detective activities, 5 stories
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
- [x] 22 published monument records with bilingual names and content
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
- [x] 4 curated comparison sets
- [x] 10 detective activities (beginner/intermediate/advanced)
- [x] 5 visual stories
- [x] Stories listing page
- [x] StoryDetail page

## Phase 8: Itinerary Builder, Notebook
- [x] Itinerary builder with stop management
- [x] Personal notebook: favorites, notes, visited tabs
- [x] Guest local mode (no account required for browsing)
- [x] Optional account sync (Manus OAuth)

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
- [ ] Images: monument photos are placeholder — requires real Wikimedia Commons integration
- [ ] Audio guide page (nav item present, page not yet built)
- [ ] Offline PWA service worker for walk download
- [ ] More monument records (currently 22, target 48+)
- [ ] Curator media ingestion pipeline (Wikimedia Commons API)
- [ ] Full RTL layout testing on all pages
