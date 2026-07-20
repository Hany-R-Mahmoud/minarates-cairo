# Round 1 Handover: Navigation and Shell

## Summary

Implemented Round 1 navigation and shared-shell work. Desktop navigation now uses intentional task groups and exposes Itinerary and Notebook. Mobile navigation remains a side menu with the same grouped destinations. Added an accessible skip link and main-content landmark. Added a low-risk reusable `PageIntro` component and applied variants to representative explore, editorial, utility, and studio surfaces.

No backend or API contracts changed. Existing routes and deep links remain unchanged.

## Files created

- `client/src/components/PageIntro.tsx`
- `handovers/round-1-navigation-and-shell-handover.md`

## Files modified

- `client/src/components/SiteLayout.tsx`
  - Replaced desktop flat/sliced navigation with Explore, Learn, and Plan dropdown groups.
  - Keeps role-gated Studio link visible only to admins.
  - Keeps mobile Sheet side menu and exposes all grouped destinations, including Itinerary and Notebook.
  - Adds route-prefix active states for deep links.
  - Adds bilingual skip link targeting `#main-content`.
  - Adds focusable `main` landmark.
- `client/src/pages/Monuments.tsx`
  - Uses shared Explore PageIntro.
- `client/src/pages/Stories.tsx`
  - Uses shared Editorial PageIntro.
- `client/src/pages/Walks.tsx`
  - Uses shared Explore PageIntro.
- `client/src/pages/Itinerary.tsx`
  - Uses shared Utility PageIntro in authenticated and unauthenticated states.
- `client/src/pages/Notebook.tsx`
  - Uses shared Utility PageIntro in authenticated and unauthenticated states.
- `client/src/pages/CuratorStudio.tsx`
  - Uses shared Studio PageIntro in authenticated and unauthenticated states.

## Key decisions

1. Use dropdown task groups on desktop rather than adding a second navigation bar; this keeps the shell compact while making personal tools intentional.
2. Keep the existing mobile Sheet and route list behavior; only add grouping and touch-target sizing.
3. Use CSS `dir` wrappers inside dropdown content so Arabic ordering remains correct without passing unsupported props to the Radix wrapper.
4. Keep PageIntro deliberately presentational. It supports Arrival, Explore, Editorial, Utility, and Studio variants without coupling to data/API behavior. Only low-risk repeated title bands were migrated in this round.
5. Preserve existing bilingual page copy and route paths.

## Verification evidence

- `pnpm check` passed (`tsc --noEmit`).
- `pnpm build` passed. Existing build warnings remain for unset analytics placeholders, CSS import ordering, and large chunks; none are caused by this round's TypeScript changes.
- `git diff --check` passed.
- Manual source verification confirmed:
  - `/itinerary` and `/notebook` remain routed in `client/src/App.tsx`.
  - Mobile `Sheet` remains present with RTL-aware side selection.
  - Deep-link active matching uses exact route or route-prefix matching.
  - Skip link and `main#main-content` are present.
  - PageIntro applies bilingual typography and container direction through `useLang`.

No browser walkthrough was run in this round.

## Affected routes

- `/monuments`
- `/stories`
- `/walks`
- `/itinerary`
- `/notebook`
- `/studio`

The shared `SiteLayout` navigation and skip link affect all routes, including deep links and the catch-all route. Existing route definitions are unchanged.

## Remaining work

- Run responsive browser smoke checks for desktop dropdowns, mobile Sheet navigation, skip-link focus, and English/Arabic direction.
- Consider migrating remaining repeated title bands after visual review confirms the variant vocabulary.
- Do not combine this round with map internals, media pipeline, itinerary lifecycle, or token cleanup work.

## Next resume prompt

```text
Read PRODUCT.md, DESIGN.md, DESIGN-REDESIGN-PLAN.md, handovers/round-0-context-and-baseline-handover.md, and handovers/round-1-navigation-and-shell-handover.md.

Audit Round 1 navigation and shell implementation in the real app. Verify desktop grouped navigation, Itinerary and Notebook visibility, admin-only Studio visibility, mobile Sheet behavior, skip-link focus, deep-link active states, and English/Arabic RTL parity. Then identify the smallest next approved round; do not modify map internals, media pipeline, itinerary lifecycle, or tokens unless explicitly scoped.
```
