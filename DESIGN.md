---
name: Minarets of Cairo
description: A vivid bilingual field guide for walking through Cairo's civilization.
colors:
  stone-950: "oklch(14% 0.025 45)"
  stone-900: "oklch(18% 0.025 45)"
  stone-700: "oklch(35% 0.020 45)"
  stone-500: "oklch(55% 0.015 45)"
  stone-300: "oklch(75% 0.010 45)"
  stone-50: "oklch(96% 0.005 45)"
  parchment-50: "oklch(97% 0.018 75)"
  parchment-100: "oklch(94% 0.022 75)"
  parchment-200: "oklch(90% 0.028 75)"
  parchment-300: "oklch(84% 0.032 75)"
  terracotta-500: "oklch(55% 0.16 42)"
  terracotta-600: "oklch(48% 0.17 42)"
  terracotta-700: "oklch(40% 0.15 42)"
  gold-400: "oklch(74% 0.14 80)"
  teal-500: "oklch(55% 0.12 195)"
  teal-600: "oklch(48% 0.13 195)"
  background: "{colors.parchment-50}"
  foreground: "{colors.stone-900}"
  card: "oklch(99% 0.010 75)"
  border: "{colors.parchment-300}"
  primary: "{colors.terracotta-600}"
  secondary: "{colors.teal-600}"
  accent: "{colors.gold-400}"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  arabic-display:
    fontFamily: "Amiri, Noto Naskh Arabic, serif"
    fontSize: "clamp(2.5rem, 7vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.35
  arabic-body:
    fontFamily: "Amiri, Noto Naskh Arabic, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  pill: "9999px"
spacing:
  xs: "0.375rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.stone-50}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.stone-50}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
    height: "2.75rem"
  card-documentary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1.25rem"
  input-field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.625rem 0.75rem"
    height: "2.75rem"
---

# Design System: Minarets of Cairo

## 1. Overview

**Creative North Star: "The Moving Archive"**

Minarets of Cairo is a product UI with the atmosphere of a documentary field guide. The interface should feel like an archive that moves with the traveler: rooted in evidence, alive with place, and easy to use while walking through a historic neighborhood. Verified photography, map context, period color, captions, and bilingual typography carry more identity than ornament.

The system is curious, reverent, and vivid. It uses dark stone surfaces for arrival and cinematic focus, parchment and white surfaces for reading and planning, terracotta for decisive action, teal for orientation, and gold for rare moments of discovery. Brightness comes from contrast, real imagery, and clear wayfinding rather than saturated decoration. Motion may create a sense of arrival and continuity, but content remains visible without it and every transition has a reduced-motion alternative.

This system explicitly rejects generic SaaS dashboards, sterile databases, tourist checklist interfaces, decorative ancient-Egypt clichés, overloaded card grids, fake imagery, AI-generated filler, and unequal English/Arabic experiences.

**Key Characteristics:**

- Documentary editorial hierarchy.
- Bilingual English/Arabic parity with generous Arabic rhythm.
- Real place imagery and visible evidence.
- Controlled cinematic motion that serves navigation and state.
- Bright discovery moments inside a restrained product vocabulary.

## 2. Colors

A stone-and-parchment foundation gives Cairo's documentary content room to speak. Terracotta, teal, and gold are semantic signals, not decoration.

### Primary

- **Old Brick Terracotta** (`{colors.terracotta-600}`): Primary actions, active selections, route emphasis, and the strongest call to action.
- **Deep Terracotta** (`{colors.terracotta-700}`): Hover and pressed states where additional contrast is needed.

### Secondary

- **Nile Teal** (`{colors.teal-600}`): Secondary actions, geographic orientation, map/list state, and supporting wayfinding.
- **Deep Teal** (`{colors.teal-500}`): Supporting state and selected period treatments.

### Tertiary

- **Sunlit Gold** (`{colors.gold-400}`): Rare discovery emphasis, selection highlights, and period accents. It is never the default text color on light surfaces.

### Neutral

- **Night Stone** (`{colors.stone-950}`): Cinematic hero surfaces, image overlays, and high-contrast arrival moments.
- **Ink Stone** (`{colors.stone-900}`): Primary text and headings on light surfaces.
- **Working Stone** (`{colors.stone-700}`): Secondary text where contrast remains compliant.
- **Muted Stone** (`{colors.stone-500}`): Supporting metadata only after contrast verification.
- **Pale Stone** (`{colors.stone-300}`): Dividers and non-text borders, never body copy.
- **Quiet Parchment** (`{colors.parchment-50}`): Main reading canvas.
- **Layered Parchment** (`{colors.parchment-100}` and `{colors.parchment-200}`): Toolbars, muted sections, and input backgrounds.
- **Document Border** (`{colors.border}`): Structural borders and separators.

### Named Rules

**The Evidence Color Rule.** Accent color marks action, selection, status, or place context. It never exists only to make a card look lively.

**The Brightness-Through-Place Rule.** When a screen needs more brightness, add verified photography, a clear period accent, or a stronger surface contrast before adding more saturated decoration.

## 3. Typography

**Display Font:** Playfair Display (with Georgia fallback)
**Body Font:** Source Sans 3 (with system-ui fallback)
**Arabic Editorial Font:** Amiri with Noto Naskh Arabic fallback

**Character:** Latin headings feel historical without becoming theatrical. Source Sans 3 keeps controls, filters, metadata, and dense curator workflows familiar. Amiri and Noto Naskh Arabic provide a real editorial reading voice with more vertical space and line-height than Latin copy.

### Hierarchy

- **Display** (600, `clamp(2.5rem, 7vw, 5rem)`, 1.1): Cinematic arrival headlines and major story openings. Never use for controls.
- **Headline** (600, 2.25rem, 1.2): Page introductions, monument names, and major section headings.
- **Title** (600, 1.25rem, 1.35): Cards, route names, panel headings, and compact editorial blocks.
- **Body** (400, 1rem, 1.6): Explanatory, historical, and practical copy. Keep prose near 65–75ch.
- **Label** (500, 0.875rem, 1.4, slight tracking): Buttons, filters, metadata labels, status text, and navigation.
- **Arabic display** (700, `clamp(2.5rem, 7vw, 5rem)`, 1.35): Arabic hero and monument titles.
- **Arabic body** (400, 1.0625rem, 1.9): Arabic reading copy, captions, and notices.

### Named Rules

**The Two-Voice Rule.** Use serif or Arabic editorial type for place and story. Use Source Sans 3 for product actions, navigation, status, and data.

**The Reading-Room Rule.** Arabic text receives generous line-height and sufficient measure. Never compress Arabic to match Latin block height.

## 4. Elevation

Depth is primarily tonal. Parchment, card white, stone, and dark hero surfaces establish hierarchy before shadows do. Shadows remain ambient and restrained, reserved for interactive lift, floating controls, and key overlays. A card should not need a heavy shadow and a strong border at the same time.

### Shadow Vocabulary

- **Heritage ambient** (`0 2px 8px oklch(14% 0.025 45 / 0.12), 0 1px 3px oklch(14% 0.025 45 / 0.08)`): Resting documentary cards where separation from parchment is necessary.
- **Document lift** (`0 4px 16px oklch(14% 0.025 45 / 0.10), 0 1px 4px oklch(14% 0.025 45 / 0.06)`): Hovered cards or focused image-led surfaces.
- **Elevated overlay** (`0 8px 32px oklch(14% 0.025 45 / 0.14), 0 2px 8px oklch(14% 0.025 45 / 0.08)`): Dialogs, menus, and map popovers only.

### Named Rules

**The Quiet Depth Rule.** Surfaces are calm at rest. Elevation appears only when a layer floats, receives focus, or changes state.

**The No-Ghost-Card Rule.** Never pair a 1px decorative border with a shadow of 16px or more on the same card or button.

## 5. Components

### Buttons

- **Shape:** Compact, gently rounded controls (`0.5rem`); full pills are reserved for status tags.
- **Primary:** Old Brick Terracotta with light text, `0.625rem 1.25rem` padding, minimum 44px height.
- **Secondary:** Nile Teal for supporting actions and geographic/route context.
- **Ghost:** Transparent at rest, tonal surface on hover, visible focus ring, never an underline animation.
- **Hover / Focus:** 160–220ms ease-out color or icon shift. Focus uses a 2px terracotta ring with 2px offset.
- **Active / Disabled / Loading:** Pressed state changes tone, disabled state lowers contrast without hiding text, loading preserves button width and exposes busy state.

### Chips

- **Style:** Small status and filter markers with quiet tonal backgrounds and contrast-safe text. Use pills (`9999px`) only when the element is clearly a tag or status.
- **State:** Selected filters use terracotta or teal background with explicit text/state, not color alone. Unselected filters remain rectangular controls when they perform an action.
- **Period tags:** Era colors remain paired with readable period names and do not become the only source of meaning.

### Cards / Containers

- **Corner Style:** 6–12px radius; never oversized rounding on content cards.
- **Background:** Card white on parchment, dark stone on cinematic surfaces, and tonal parchment for grouped utility regions.
- **Shadow Strategy:** Heritage ambient at rest, document lift on interaction, no broad decorative shadows.
- **Border:** Use one quiet structural border when necessary. Do not use colored side stripes.
- **Internal Padding:** 1rem compact, 1.25rem standard, 1.5rem for editorial blocks.
- **Media:** Prefer verified documentary covers over geometric placeholders. Preserve stable aspect ratio, meaningful alt text, caption, creator, and attribution access.

### Inputs / Fields

- **Style:** Card-white or layered-parchment background, 1px document border, 0.5rem radius, visible label, minimum 44px height.
- **Focus:** 2px ring using primary focus token; do not rely on border color alone.
- **Error / Disabled:** Inline bilingual error beside the field, preserved user value, explicit disabled contrast, and no technical error codes as the only explanation.
- **Search:** Search input remains visually connected to result count, clear action, and loading state.

### Navigation

- **Style:** Public shell uses a compact header with documentary wordmark, grouped task navigation, language control, and clear current location. Desktop exposes Explore, Learn, Personal, and Studio groups. Mobile uses a side menu.
- **States:** Active route uses terracotta or a quiet tonal surface plus text/icon, not an underline-fill flourish. Focus is always visible.
- **Motion:** Header and route transitions may use short opacity and directional movement. Never delay access to content for choreography.
- **RTL:** Navigation order, icon placement, side menu motion, and reading order mirror correctly in Arabic.

### Page Introductions

- **Arrival:** Dark stone or image-led composition, one primary next action, controlled cinematic entrance.
- **Explore:** Title, purpose, search/filter controls, result context, and direct map/list choice.
- **Editorial:** Place/story title, date or period context, source cues, and media opening.
- **Utility:** Compact title, task status, and direct controls without decorative hero treatment.

### Documentary Media

- Every image has a meaningful bilingual alt strategy, stable layout dimensions, lazy loading where appropriate, caption/creator treatment, and attribution access.
- Image transitions may crossfade or slide when user changes selected media. Reduced-motion mode removes transform choreography.

## 6. Do's and Don'ts

### Do:

- **Do** let verified photography, maps, captions, context, and source notes carry the identity.
- **Do** preserve English/Arabic parity in content, actions, hierarchy, and states.
- **Do** use terracotta for primary actions, teal for supporting orientation, and gold for rare discovery emphasis.
- **Do** keep body text contrast at or above 4.5:1 and verify overlay text against every image treatment.
- **Do** make loading, empty, error, success, disabled, and authentication states explicit.
- **Do** use cinematic entrance motion only when it communicates arrival or continuity; keep content visible if motion fails.
- **Do** provide reduced-motion behavior that disables smooth scrolling, shimmer, parallax, and transform-heavy reveals.
- **Do** use semantic HTML before ARIA and provide list alternatives for maps.
- **Do** use real verified media before decorative placeholders.
- **Do** design for both research at home and fast lookup while walking in bright outdoor conditions.

### Don't:

- **Don't** use generic SaaS dashboards or productivity-tool visual language for public heritage experiences.
- **Don't** flatten monuments into sterile databases or tourist checklists.
- **Don't** use decorative ancient-Egypt or generic heritage clichés without historical purpose.
- **Don't** use overloaded card grids, fake imagery, or AI-generated visual filler.
- **Don't** create separate English and Arabic experiences with unequal meaning or functionality.
- **Don't** use repeating stripe backgrounds, gradient text, decorative glassmorphism, or full-page motion choreography.
- **Don't** use colored side-stripe borders on notices, cards, or list items.
- **Don't** combine a 1px decorative border with a 16px-plus shadow on cards or buttons.
- **Don't** over-round cards, sections, inputs, or panels. Content cards stop at 12px radius.
- **Don't** use display fonts for controls, labels, navigation, or dense curator UI.
- **Don't** use color, hover, pointer position, or animation as the only way to understand or operate a feature.
- **Don't** expose dead actions such as fake Offline downloads or non-functional Compare cards.
