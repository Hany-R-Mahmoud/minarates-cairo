# Round 1.5 Accessibility and Motion Handover

## Summary

Implemented targeted accessibility, safety, and reduced-motion fixes without changing `SiteLayout.tsx`.

## Files created/modified

- `client/index.html` — removed the `maximum-scale=1` viewport restriction.
- `client/src/index.css` — removed global smooth scrolling, removed the repeating geometric stripe pattern and colored side-stripe notice treatment, and made reduced-motion mode disable animation, transitions, hover/active transforms, shimmer, and smooth scrolling.
- `client/src/pages/MapPage.tsx` — map markers now expose keyboard-focusable button semantics and activate with Enter/Space. Popup content is built with DOM APIs and `textContent` rather than interpolated HTML.
- `client/src/components/ErrorBoundary.tsx` — removed raw error stack rendering and replaced it with a safe recovery message.
- `client/src/pages/Compare.tsx` — added accessible remove-button names and a visible label for the monument selector.
- `client/src/pages/Notebook.tsx` — labeled notebook tabs and note fields; added accessible names to icon-only delete controls.
- `client/src/pages/Monuments.tsx` — added visible filter labels and search labeling. Existing concurrent media/accessibility changes were preserved.
- `client/src/pages/CuratorStudio.tsx` — added visible labels and IDs for media and source form fields.

## Key decisions

- Preserved existing behavior and API contracts.
- Used `Popup#setDOMContent` to prevent popup content injection/XSS risk while retaining the map popup behavior.
- Did not alter `SiteLayout.tsx`, which remains owned by another agent.
- Removed the geometric pattern class from CSS; remaining consumers receive a plain background until their owning page changes replace the class.

## Verification

- `pnpm exec vite build` passed.
- `git diff --check` passed.
- Targeted search found no remaining `maximum-scale`, popup `setHTML`, repeating-gradient stripe, smooth-scroll, or side-stripe declarations in `client/src`.
- `pnpm check` is blocked by an unrelated pre-existing `SiteLayout.tsx` TypeScript error: `DropdownMenuContent` does not accept the `dir` prop at `client/src/components/SiteLayout.tsx:120`.

## Routes affected

- `/map`
- `/compare`
- `/notebook`
- `/monuments`
- `/studio`
- Global error fallback and global motion behavior affect all routes.

## Remaining work

- Another agent owns `SiteLayout.tsx`; its existing TypeScript error should be resolved there.
- Page-specific `geometric-pattern` class consumers outside this scope may be cleaned up by their owning page agent if desired.

## Resume prompt

Review the Round 1.5 diff, especially keyboard marker behavior, DOM-built map popup content, reduced-motion CSS, and form label associations. Re-run `pnpm check` after the `SiteLayout.tsx` owner resolves its unrelated `dir` prop error.
