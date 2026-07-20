# Minarets of Cairo
## Whole-App Design Redesign Plan

**Status:** Findings and recommendations only. No app redesign implementation included.

**Prepared for:** A later implementation pass by another model/agent.

**Primary register:** Product UI with editorial, cultural-tour, and field-guide surfaces.

**Source of truth:** `PRODUCT.md`, current codebase, current verified media manifests, and this plan.

---

## 1. Redesign intent

Reframe app from a collection of heritage-themed pages into a coherent bilingual travel field guide for walking through Cairo's civilization.

Target feeling:

> A traveler, student, guide, or curator stands in Cairo during bright late-afternoon light, moving between shaded historic streets, using a trusted field guide that turns each monument into a connected story, route, and next step.

Design direction:

- **Visual lane:** documentary editorial product UI.
- **Color strategy:** committed but controlled. Keep stone, parchment, terracotta, gold, and teal identity, then use bright accents deliberately for wayfinding, active states, and cultural-period distinctions. Do not turn every surface into saturated color.
- **Energy:** cinematic arrival, fluid navigation, responsive feedback, bright discovery moments.
- **Primary material:** verified documentary photography, map context, period color, captions, provenance, and bilingual typography.
- **Avoid:** generic SaaS, sterile archive tables, tourist checklist patterns, decorative heritage clichés, fake imagery, repeated ornamental motifs, and motion without user meaning.

Allow information architecture changes. Preserve deep links and content behavior unless replacement flow is clearly better and documented.

---

## 2. Current app map

### App shell

- `client/src/App.tsx`
  - Providers: error boundary, language, theme, tooltip, toaster.
  - All routes wrapped by `SiteLayout`.
- `client/src/components/SiteLayout.tsx`
  - Public navigation, desktop/mobile navigation, language/theme controls, footer.
- `client/src/components/DashboardLayout.tsx`
  - Separate authenticated/admin shell, currently generic and placeholder-like.
- `client/src/index.css`
  - Global tokens, custom heritage classes, typography, motion, shadows, period colors, layout helpers.
- `client/src/components/ui/*`
  - Large shadcn-style primitive set. Current app mixes primitives with custom heritage classes.

### Route clusters

| Cluster | Routes | Main redesign goal |
|---|---|---|
| Orientation | `/`, `/periods` | Strong arrival, historical orientation, clear next paths |
| Discovery | `/monuments`, `/map` | Search, filters, result scale, map/list parity |
| Editorial | `/monuments/:slug`, `/stories`, `/stories/:slug` | Media-led reading, citations, source trust |
| Field experience | `/walks`, `/walks/:slug`, `/itinerary` | Practical route planning, visit readiness, fluid itinerary actions |
| Learning | `/compare`, `/detective` | Clear learning tasks, feedback, progression |
| Personal | `/notebook` | Useful saved research, notes, empty/auth states |
| Governance | `/studio` | Dense but clear curator workflow, provenance, bilingual editing |
| System | `/404` | On-brand, bilingual recovery |

`client/src/pages/ComponentShowcase.tsx` exists but is not routed. Decide later whether to expose it as an internal design-system route or keep it development-only.

---

## 3. Current strengths to preserve

1. **Distinct heritage palette.** Stone, parchment, terracotta, gold, and teal tokens already create an identity in `client/src/index.css:8-87`.
2. **Bilingual foundation.** RTL direction and Arabic font handling are deliberate in `client/src/index.css:106-124` and `client/src/components/SiteLayout.tsx`.
3. **Strong homepage narrative.** Home already moves from cinematic hero to periods, exploration paths, featured monuments, stories, and CTA in `client/src/pages/Home.tsx:41-281`.
4. **Strongest editorial benchmark.** Monument detail includes bilingual content, verified media, captions, attribution, historical tabs, metadata, and practical notices in `client/src/pages/MonumentDetail.tsx:181-430`.
5. **Ethical context.** Active worship, funerary areas, stale information, photography, and accessibility notices are present in monument and walk details.
6. **Loading and empty foundations.** Several listing pages already use skeletons and empty states.
7. **Media provenance.** `content/media/media-manifest.json` contains bilingual alt text, captions, attribution, licenses, dimensions, checksums, and verification status.
8. **Reduced-motion hook exists.** `client/src/index.css:380-385` provides a starting point, but behavior needs expansion.

---

## 4. Findings and recommendations

### P0: Trust, safety, and interaction correctness

#### P0.1 Map interaction is not fully accessible

**Evidence:** `client/src/pages/MapPage.tsx:65-89` uses marker `<div>` elements with click listeners.

**Problem:** Keyboard and assistive-technology users cannot reliably activate markers. Spatial view lacks an equivalent accessible interaction model.

**Recommendation:**

- Use focusable buttons with bilingual accessible names.
- Support Enter and Space activation.
- Provide visible focus states.
- Keep a synchronized list view as the primary accessible fallback.
- Announce selected place and filter-result changes.

#### P0.2 Map popup content is injected unsafely

**Evidence:** `client/src/pages/MapPage.tsx:77-84` interpolates place data into `setHTML`.

**Problem:** Unescaped content crosses a DOM trust boundary.

**Recommendation:** Escape dynamic strings or build popup DOM through safe APIs. Preserve bilingual names without raw HTML interpolation.

#### P0.3 Reduced-motion behavior is incomplete

**Evidence:** `client/src/index.css:101` enables smooth scrolling; `client/src/index.css:380-385` only reduces durations.

**Problem:** Future cinematic motion could remain disorienting even when durations are shortened.

**Recommendation:** Add an explicit reduced-motion plan that disables smooth scrolling, shimmer, parallax, clip-path reveals, transform-heavy entrances, and decorative motion. Keep necessary state changes instant or opacity-only.

#### P0.4 Dead or misleading primary actions

**Evidence:**

- Walk detail `Download Offline` only shows a coming-soon toast: `client/src/pages/WalkDetail.tsx:21-23,96-104`.
- Curated comparison cards look interactive but have no action: `client/src/pages/Compare.tsx:188-207`.
- Itinerary lacks visible edit, delete, reorder, day-management, and note actions: `client/src/pages/Itinerary.tsx:77-160,194-251`.

**Recommendation:** Complete flows before making them visually prominent. Otherwise downgrade/remove actions and state the limitation clearly.

### P1: Whole-app experience

#### P1.1 Navigation hides important destinations

**Evidence:** Desktop nav slices first seven items in `client/src/components/SiteLayout.tsx:63-65`; mobile exposes all items at `143-154`.

**Problem:** Itinerary and Notebook disappear from desktop primary navigation.

**Recommendation:** Rebuild navigation around task groups:

- **Explore:** Monuments, Map, Walks, Periods.
- **Learn:** Stories, Compare, Detective.
- **Personal:** Itinerary, Notebook.
- **Studio:** Curator Studio, role-gated.

Use desktop grouping or a deliberate secondary menu. Keep mobile side menu. Do not expose raw route names or implementation labels.

#### P1.2 Repeated dark title bands flatten page identity

**Evidence:** Similar shell appears in `Monuments.tsx:40-51`, `Stories.tsx:11-22`, `Walks.tsx:40-51`, and other pages.

**Problem:** Every route begins with same visual grammar, so orientation becomes repetitive.

**Recommendation:** Create shared `PageIntro` variants:

- **Arrival:** cinematic media and one clear next action.
- **Explore:** title, search/filter controls, result context.
- **Editorial:** title, source/date/context metadata, media-led opening.
- **Utility:** compact title, task status, direct controls.
- **Studio:** dense authenticated variant.

Vary composition through meaningful content, not decorative novelty.

#### P1.3 Placeholder monument cards waste verified media

**Evidence:** `client/src/pages/Home.tsx:178-190` and `client/src/pages/Monuments.tsx:119-134` use geometric `م` placeholders. Stories already render cover imagery.

**Problem:** App feels like prototype despite strong media package.

**Recommendation:** Use verified documentary covers in Home and Monuments. Normalize image transforms through `shared/media.ts`. Keep meaningful placeholder only when asset is genuinely unavailable. Show source/credit accessibly, not as visual clutter.

#### P1.4 Media pipeline is inconsistent

**Evidence:** Monument detail uses ImageKit width variants in `MonumentDetail.tsx:198-202`; Stories, StoryDetail, and CuratorStudio use raw URLs.

**Recommendation:** Create shared `ResponsiveMedia` / `EditorialImage` contract:

- source URL and width variants,
- bilingual alt text,
- caption and creator,
- license/provenance affordance,
- stable aspect-ratio behavior,
- loading and failed-image state.

Validate v3 CDN mappings before depending on them. Current v3 `cdn-urls.json` contains null mappings; existing populated media manifest remains safer until validated.

#### P1.5 Catalog silently caps results

**Evidence:** Monuments, Map, and Compare request up to 100 items, e.g. `Monuments.tsx:27-35`.

**Problem:** Larger catalog can be truncated without clear pagination or load-more behavior.

**Recommendation:** Add server-side search/filter/pagination or explicit load-more. Show result scope honestly. Keep map and list query state synchronized.

#### P1.6 Map markers can become stale

**Evidence:** `MapPage.tsx:19-28,61-107` effect dependency tracks `placesWithCoords.length`, not marker data/coordinates.

**Recommendation:** Depend on stable serialized marker inputs or relevant data fields. Add visual transition when filter result changes. Keep list as truth on mobile.

#### P1.7 404 breaks visual and language system

**Evidence:** `client/src/pages/NotFound.tsx:13-47` uses generic slate/blue/red and English-only copy.

**Recommendation:** Rebuild as bilingual heritage-system recovery page with one clear return action and optional search/discovery links.

### P1: Accessibility and content clarity

- Replace icon-only delete/remove controls with accessible names and adequate touch targets: `Compare.tsx:74-76`, `Notebook.tsx:122-127,214-219`.
- Replace placeholder-only form guidance with visible labels: `Monuments.tsx:56-63`, `Itinerary.tsx:85-104`, `Notebook.tsx:160-185`.
- Replace clickable `<div>` patterns with semantic links/buttons.
- Darken muted text tokens where contrast fails on parchment or white surfaces.
- Add `aria-busy` to loading regions and live announcements for mutations.
- Give map mobile layout a shorter, intentional height rather than fixed `minHeight: 500px`.
- Add comparison-table horizontal-scroll guidance and sticky feature column.
- Localize Curator Studio fields and align them with bilingual editing model.

### P2: Design-system cleanup

#### P2.1 Mixed component vocabularies

Custom classes and shadcn primitives diverge in radius, shadows, borders, and spacing. Compare `client/src/index.css:190-202` with `client/src/components/ui/card.tsx:5-15`.

**Recommendation:** Decide one shared contract for:

- surface levels,
- radius scale,
- border policy,
- shadow policy,
- button heights and states,
- focus ring,
- spacing rhythm,
- typography roles.

Use primitives underneath. Remove legacy consumer class hooks when centralized styles replace them.

#### P2.2 Decorative patterns trigger avoidable visual noise

**Evidence:** `repeating-linear-gradient` in `.geometric-pattern`, `client/src/index.css:354-357`.

**Recommendation:** Remove repeating stripe backgrounds. Use documentary image texture, quiet tonal fields, architectural crop, or whitespace. No gradient text, side-stripe accents, ghost-card border-plus-wide-shadow treatment, or oversized card radii.

#### P2.3 Hard-coded exceptions

**Evidence:** `client/src/components/ManusDialog.tsx:54-84` uses hard-coded colors, radius, and shadows. Map markers also use hard-coded colors at `MapPage.tsx:67-83`.

**Recommendation:** Map all visual values to semantic tokens. Isolate admin/auth exceptions only if they have an intentional product reason.

---

## 5. Proposed visual system

### Color

Keep identity, refine role usage:

- **Canvas:** true light neutral or restrained parchment; avoid making every surface warm.
- **Ink:** dark stone with contrast-safe semantic text ramp.
- **Primary action:** terracotta.
- **Secondary navigation/state:** teal.
- **Discovery highlight:** gold, used sparingly.
- **Period colors:** keep era mapping, ensure text contrast and non-color labels.
- **Dark cinematic surfaces:** deep stone, used for arrival, detail hero, and selected story moments.
- **Brightfulness:** introduce bright fields through photography, selected period accents, active map states, and clear CTA moments, not saturated backgrounds everywhere.

Use OKLCH tokens. Test normal text at 4.5:1 and large text at 3:1 minimum.

### Typography

- Keep one clear UI family for labels, controls, and data.
- Keep serif/Arabic editorial family for titles and cultural reading moments.
- Keep Arabic line-height more generous than Latin.
- Use fixed product scale for controls and compact UI.
- Use balanced headings and avoid extreme display sizes.
- Never use display faces for buttons, labels, or dense admin UI.

### Shape and surfaces

- One compact radius scale. Cards: approximately 8–16px maximum. Pills only for statuses/tags.
- Prefer tonal surface contrast and one restrained elevation layer over border-plus-large-shadow.
- Avoid nested cards. Use sections, dividers, whitespace, and media composition.
- Keep full-width borders only where they clarify structure.
- Replace side-stripe notices with icon + label + tonal background or top rule.

### Media

Media becomes primary visual language:

- Large documentary image at arrival and detail surfaces.
- Consistent crop contracts for cards.
- Captions and creator/license information remain available.
- No fabricated image fallback when real asset is missing.
- Image loading should reveal content without layout shift.

### Motion

Motion target: cinematic, fluid, bright, purposeful.

Use:

- Route transition: 180–280ms opacity + small directional movement.
- Hero arrival: one controlled media/text reveal, 500–800ms, not full-page choreography.
- Gallery: image crossfade or directional slide tied to selected media.
- Map/list: shared-element-like transition or short crossfade tied to view switch.
- Filters: result count and list update transition, not delayed loading.
- Itinerary: positional animation for add/reorder/remove.
- Detective: immediate answer feedback and explanation reveal.
- Periods: accordion/timeline state transition.
- Hover: quiet tonal shift, image crop shift, or icon movement. No underline-fill animation.

Rules:

- Every animation has reduced-motion alternative.
- No infinite decorative motion.
- No bounce or elastic easing.
- No page-load choreography that blocks task entry.
- Motion must communicate arrival, continuity, selection, state, or spatial change.

---

## 6. Subskill execution sequence

Run later through another model/agent. Each round must produce implementation plus evidence before handover.

### Round 0 — Context and baseline

1. Run `impeccable document` to generate `DESIGN.md` from current code and tokens.
2. Run `impeccable critique whole app` against routes and shared shell.
3. Run `impeccable audit whole app` for accessibility, responsive behavior, performance, and state completeness.
4. Reconcile critique/audit findings with this plan. Do not blindly implement conflicting suggestions.

**Deliverable:** `DESIGN.md`, critique result, audit result, prioritized backlog.

### Round 1 — Information architecture and shell

1. `impeccable shape navigation, shared shell, and page-introduction system`.
2. Implement navigation grouping, desktop visibility, mobile side menu, active state, language parity.
3. Build shared `PageIntro` variants and shared result toolbar/state patterns.
4. Normalize public, personal, and studio shell boundaries.
5. `impeccable adapt navigation and shared shell`.
6. `impeccable audit navigation and shared shell`.

**Affected routes:** all routes through `App.tsx`, `SiteLayout`, authenticated `/itinerary`, `/notebook`, `/studio`.

### Round 2 — Tokens, typography, and surfaces

1. `impeccable typeset whole app`.
2. `impeccable colorize whole app`.
3. `impeccable layout shared surfaces and page rhythm`.
4. Replace custom/shadcn divergence with one component vocabulary.
5. Remove repeating stripe pattern, side-stripe accents, inconsistent hard-coded colors, and ghost-card treatments.
6. Add contrast and reduced-motion token checks.
7. `impeccable audit design system and responsive layout`.

**Affected files:** primarily `client/src/index.css`, `client/src/components/ui/*`, shared layout and reusable components; verify all routes.

### Round 3 — Orientation and discovery

1. `impeccable shape home, periods, monuments, and map as one discovery flow`.
2. `impeccable layout home and discovery surfaces`.
3. Replace fake monument card imagery with validated verified media.
4. Add scalable search/filter/pagination or explicit load-more.
5. Make map/list state synchronized and accessible.
6. Fix marker keyboard behavior and popup safety.
7. `impeccable animate discovery transitions`.
8. `impeccable adapt discovery surfaces`.
9. `impeccable audit home, monuments, periods, and map`.

**Affected routes:** `/`, `/periods`, `/monuments`, `/map`.

### Round 4 — Editorial storytelling

1. `impeccable shape monument detail and story reading experience`.
2. `impeccable layout editorial reading surfaces`.
3. Standardize responsive media, captions, attribution, source notes, and bilingual reading rhythm.
4. Preserve cultural notices and practical freshness signals.
5. `impeccable animate editorial media entrance and gallery transitions`.
6. `impeccable adapt editorial surfaces`.
7. `impeccable audit monument and story routes`.

**Affected routes:** `/monuments/:slug`, `/stories`, `/stories/:slug`.

### Round 5 — Field planning

1. `impeccable shape walks, walk detail, itinerary, and map handoff`.
2. Complete or remove Offline action honestly.
3. Add itinerary edit/delete/reorder/day/notes behavior.
4. Add route accessibility, duration, practical freshness, and visit-readiness hierarchy.
5. `impeccable animate route and itinerary transitions`.
6. `impeccable adapt field planning for mobile`.
7. `impeccable harden field planning states`.
8. `impeccable audit walks and itinerary`.

**Affected routes:** `/walks`, `/walks/:slug`, `/itinerary`, `/map`.

### Round 6 — Learning and personal surfaces

1. `impeccable shape compare, detective, and notebook workflows`.
2. Make curated Compare cards functional or remove pointer affordance.
3. Improve comparison table mobile behavior.
4. Improve Detective feedback, progress, retry, and completion states.
5. Improve Notebook labels, editing, deletion, auth, empty, and loading states.
6. `impeccable animate learning feedback and notebook mutations`.
7. `impeccable harden learning and personal surfaces`.
8. `impeccable audit compare, detective, and notebook`.

**Affected routes:** `/compare`, `/detective`, `/notebook`.

### Round 7 — Curator Studio and system states

1. `impeccable shape curator studio content workflow`.
2. `impeccable harden curator studio`.
3. Localize editor fields, make provenance visible, clarify validation and save states.
4. Rebuild `NotFound` in bilingual heritage system.
5. Normalize `ManusDialog` or explicitly isolate it as a separate trusted admin/auth surface.
6. `impeccable audit studio and system states`.

**Affected routes:** `/studio`, `/404`, catch-all route, auth/error dialogs.

### Round 8 — Final quality pass

1. `impeccable animate whole app`.
2. `impeccable polish whole app`.
3. `impeccable harden whole app`.
4. `impeccable audit whole app`.
5. Run English and Arabic route walkthroughs at desktop, tablet, and mobile widths.
6. Verify reduced-motion mode, keyboard traversal, contrast, loading/empty/error states, media attribution, and route preservation.

---

## 7. Implementation guardrails for later agent

- Read `PRODUCT.md`, this plan, and generated `DESIGN.md` before editing.
- Do not redesign all routes in one uncontrolled pass. Work round by round.
- Preserve backend behavior and API contracts unless a flow is explicitly being completed.
- Preserve route deep links. If routes change, add compatibility redirects and document them.
- Use verified media only. Validate CDN mappings before wiring new assets.
- Do not use full-screen screenshot PNGs as UI implementation.
- Do not introduce gradient text, repeating stripe backgrounds, side-stripe accents, excessive card rounding, ghost-card border/shadow combinations, decorative glassmorphism, or all-page entrance choreography.
- Keep Arabic and English content/action parity.
- Every interactive state needs default, hover, focus, active, disabled, loading, and error behavior where relevant.
- Do not hide content behind motion. Default content must remain visible if animation fails.
- Every motion addition needs reduced-motion behavior.
- Use semantic HTML before ARIA.
- Escape or safely construct all dynamic map/popup content.
- Replace dead affordances with working actions or remove them.
- Report affected routes after every round.
- Write a handover after every execution round at `handovers/round-N-{description}-handover.md`.
- Handover must include: summary, files changed, decisions, verification evidence, affected routes, remaining work, and resume prompt.
- Do not claim completion without executed verification evidence.

---

## 8. Verification checklist

### Visual system

- [ ] One coherent token vocabulary across custom and primitive components.
- [ ] Contrast verified for body, muted, placeholder, status, and overlay text.
- [ ] No forbidden decorative patterns.
- [ ] Typography hierarchy works in English and Arabic.
- [ ] Cards are not used as default for every section.
- [ ] Real media appears where verified assets exist.

### Responsive behavior

- [ ] Desktop navigation exposes all important task groups.
- [ ] Mobile side menu remains usable and clear.
- [ ] Map has accessible list-first fallback on small screens.
- [ ] Comparison table remains usable without accidental clipping.
- [ ] Long Arabic and English headings do not overflow.
- [ ] Touch targets work for field use.

### Accessibility

- [ ] Keyboard traversal covers navigation, maps, filters, galleries, dialogs, and mutations.
- [ ] Focus states visible on light and dark surfaces.
- [ ] Icon-only controls have accessible names.
- [ ] Forms have visible labels.
- [ ] Loading, empty, error, success, and auth states are announced or clearly exposed.
- [ ] Reduced-motion mode disables nonessential movement and smooth scrolling.
- [ ] No feature relies on color, hover, or pointer only.

### Content and trust

- [ ] English/Arabic parity verified route by route.
- [ ] Alt text, captions, attribution, licenses, and verification status preserved.
- [ ] Practical/stale information notices remain visible where relevant.
- [ ] Active worship and funerary-area etiquette remains respectful and clear.
- [ ] No fake or unverified imagery introduced.

### Functional

- [ ] Curated Compare actions work.
- [ ] Offline action is real or clearly downgraded/removed.
- [ ] Itinerary supports intended editing lifecycle.
- [ ] Map filters update markers and list correctly.
- [ ] Catalog scale behavior is explicit.
- [ ] 404 recovery links work.

### Evidence

- [ ] `pnpm` verification commands recorded and passed where applicable.
- [ ] Browser walkthrough evidence recorded textually.
- [ ] No browser verification PNGs committed unless explicitly requested.
- [ ] Every round has handover file under `handovers/`.

---

## 9. Suggested first implementation prompt

```text
Read PRODUCT.md and DESIGN-REDESIGN-PLAN.md before changing code.

Execute Round 0 only:
1. Generate DESIGN.md from current code using impeccable document.
2. Review current routes, shared shell, tokens, media manifests, and representative pages.
3. Run critique and audit against whole app.
4. Reconcile results with DESIGN-REDESIGN-PLAN.md.
5. Create a prioritized implementation backlog. Do not redesign UI yet.
6. Record findings in a handover file at handovers/round-0-context-and-baseline-handover.md.

Handover must include:
- summary
- files created/modified
- findings grouped by P0/P1/P2
- decisions and conflicts resolved
- verification commands/evidence actually run
- affected routes
- remaining work
- resume prompt for Round 1

Do not claim completion without running verification. Do not use placeholder assumptions for media, route behavior, or accessibility.
```

---

## 10. Open decisions for later execution

Defaults are recommended; change only with explicit reason:

1. **Primary navigation:** grouped task navigation, not flat route list.
2. **Design register:** product UI with documentary editorial surfaces.
3. **Color strategy:** committed identity with restrained semantic usage.
4. **Motion level:** cinematic but state-driven, with reduced-motion parity.
5. **Media policy:** verified documentary media over geometric placeholders.
6. **Desktop personal navigation:** visible through grouped navigation or secondary menu.
7. **Studio surface:** same token system, denser layout, role-gated actions.
8. **Mobile map:** list-first fallback with optional map view, not map-only interaction.

If future implementation reveals conflict between visual novelty and field usability, field usability wins.
