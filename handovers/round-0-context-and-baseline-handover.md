# Round 0 Handover: Context and Baseline

## Summary

Baseline design context and whole-app critique/audit completed. No application UI or behavior code changed.

Created:

- `PRODUCT.md`
- `DESIGN.md`
- `.impeccable/design.json`
- `.impeccable/critique/2026-07-20T01-45-26Z__client-src.md`
- `DESIGN-REDESIGN-PLAN.md`

The product is a bilingual Arabic/English heritage field guide for travelers, students, local guides, and curators. Direction: documentary editorial product UI, vivid and cinematic but usable in the field.

## Findings by priority

### P0

- Map markers are click-only divs and popup content is interpolated through `setHTML`. Core map workflow needs semantic keyboard access, safe popup construction, live status, and equal list representation.

### P1

- Desktop navigation hides Itinerary and Notebook by slicing first seven items.
- Home and Monuments use geometric `م` placeholders instead of verified documentary covers.
- Repeating stripe pattern and colored side-stripe notice conflict with design rules.
- Offline CTA is dead; curated Compare cards are inert; Itinerary lifecycle incomplete.
- Bilingual parity weak in Itinerary creation, Curator Studio fields, and 404 recovery.
- Mobile zoom disabled by `maximum-scale=1`.
- Icon-only delete/remove controls and placeholder-only fields need accessible labels and target sizing.
- No functional dark token theme despite theme context.
- Reduced-motion handling leaves smooth scrolling and visual effects active.
- Error boundary can expose raw stack details.

### P2

- Duplicate Google font loading.
- Story media lacks lazy loading/decoding consistency.
- Monuments search fires on every keystroke.
- Map lifecycle reinitializes too broadly.
- Muted/status colors need contrast verification.
- No skip link.
- Map region needs explicit accessible labeling.
- Public, personal, Studio, and 404 surfaces have inconsistent visual maturity.

## Scores

### Design critique

- Nielsen: **21/40**, Acceptable.
- Cognitive-load failures: **6/8**, high.
- AI-slop risk: medium-high due repeated headers, card grids, placeholders, stripe patterns, and generic CTA grammar.

### Technical audit

- Accessibility: **2/4**.
- Performance: **2/4**.
- Theming: **1/4**.
- Responsive design: **3/4**.
- Anti-patterns: **1/4**.
- Total: **9/20**, Poor.

### Deterministic detector

`detect.mjs --json client/src/pages client/src/components` returned `[]`. Manual source review still found CSS and interaction issues outside detector coverage.

### Persistence

Critique snapshot written:

`.impeccable/critique/2026-07-20T01-45-26Z__client-src.md`

Trend: first run for `client-src`, score `21`.

## Decisions

1. Treat app as product UI with documentary/editorial surfaces.
2. Use task-grouped nav: Explore, Learn, Plan/Personal, Studio.
3. Make verified media primary discovery language.
4. Make map/list equal representations, list-first for mobile/accessibility.
5. Keep motion cinematic but state-driven; implement reduced-motion parity.
6. Preserve cultural notices, provenance, attribution, and bilingual reading structure.
7. Do not implement redesign in Round 0.

## Verification evidence

- Impeccable context script completed successfully after using absolute skill path.
- Existing `PRODUCT.md` loaded.
- Existing CSS, app shell, representative pages, and design references inspected.
- Deterministic detector executed; result `[]`.
- Critique persistence executed successfully.
- Trend command executed; first run score `21`.
- No tests/build/browser walkthrough run in baseline-only round.

## Affected routes

All routes reviewed conceptually. Highest-impact surfaces:

- `/`
- `/monuments`
- `/monuments/:slug`
- `/map`
- `/walks`
- `/walks/:slug`
- `/periods`
- `/compare`
- `/detective`
- `/stories`
- `/stories/:slug`
- `/itinerary`
- `/notebook`
- `/studio`
- `/404` and catch-all

## Remaining work

Round 1: navigation, shared shell, PageIntro variants, shared state patterns, and public/personal/studio boundary.

Recommended next commands:

1. `impeccable shape navigation and shared shell`
2. Implement grouped navigation and shared PageIntro.
3. `impeccable audit navigation and shared shell`
4. Proceed to token/layout cleanup only after shell handover.

## Resume prompt

```text
Read PRODUCT.md, DESIGN.md, DESIGN-REDESIGN-PLAN.md, and handovers/round-0-context-and-baseline-handover.md.

Execute Round 1 only: navigation and shared shell.

1. Shape grouped task navigation for Explore, Learn, Personal/Plan, and Studio.
2. Keep mobile side menu. Expose Itinerary and Notebook on desktop through intentional grouping.
3. Create shared PageIntro variants for Arrival, Explore, Editorial, Utility, and Studio.
4. Create shared result-toolbar and loading/empty/error state patterns where current pages repeat them.
5. Preserve route deep links, language/RTL behavior, and existing data/API contracts.
6. Do not redesign map internals, media pipeline, itinerary lifecycle, or tokens in this round.
7. Use semantic HTML, visible focus, and 44px touch targets.
8. Verify implementation with targeted typecheck/build/tests or explain exact blockers.
9. Run bilingual and responsive smoke checks for representative routes.
10. Write handover at handovers/round-1-navigation-and-shell-handover.md with summary, files, decisions, verification evidence, affected routes, remaining work, and next resume prompt.

Do not claim completion without executed verification evidence.
```
