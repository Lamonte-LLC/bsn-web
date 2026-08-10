# BSN Design System — bsnpr.com

Design token and style reference for **BSN (Baloncesto Superior Nacional de Puerto Rico)**.
Extracted from the production codebase (`bsn-web`, Next.js 15 + Tailwind CSS v4) and cross-referenced
against the Figma handoff (`design_handoff_playoffs2/colors_and_type.css`).

Use this document as the single source of truth when generating new BSN designs.

---

## 1. Brand character

| Attribute | Direction |
|---|---|
| Tone | Sports-broadcast energy, Caribbean, editorial. Confident, never corporate. |
| Signature move | Deep near-black **ink** (`#0F171F`) hero band with a soft radial light-bleed at the top, sitting above an off-white **paper** page body. Content cards float *up* into the dark band with negative margins. |
| Typography | Ultra-condensed display face carries almost all headings, scores, nav and team names. A humanist sans carries body, data and metadata. High contrast between the two is the point. |
| Density | Data-dense. Sports tables, box scores, standings, leaders. Whitespace is earned, not sprayed. |
| Surfaces | Two worlds: **glass on ink** (translucent cards over the hero gradient) and **paper cards** (white cards, hairline borders, whisper-soft shadows). |
| Language | Spanish (`<html lang="es">`). All UI copy in Spanish. |

**Anti-patterns to avoid:** heavy drop shadows, saturated gradient buttons, rounded-3xl bubble UI,
generic blue/indigo accents, emoji as iconography, centered-everything marketing layouts.

---

## 2. Typography

### 2.1 Families

Three families, loaded via `next/font/google` in [layout.tsx](src/app/layout.tsx), exposed as CSS
variables and as Tailwind utilities through `@theme inline` in [globals.css](src/app/globals.css).

| Role | Family | Weights loaded | CSS variable | Tailwind class | Usage count |
|---|---|---|---|---|---|
| **Display** | `Special Gothic Condensed One` | 400 only | `--font-special-gothic-condensed-one` | `font-special-gothic-condensed-one` | 115 explicit + global default |
| **Body / data** | `Barlow` | 400, 500, 600, 700 | `--font-barlow` | `font-barlow` | 301 |
| **Condensed support** | `Barlow Condensed` | 400 only | `--font-barlow-condensed` | `font-barlow-condensed` | 37 |

```css
/* Fallback stacks used in raw CSS */
--font-display: var(--font-special-gothic-condensed-one), 'Special Gothic Condensed One', Arial, Helvetica, sans-serif;
--font-body:    var(--font-barlow), Barlow, system-ui, -apple-system, sans-serif;
--font-tight:   var(--font-barlow-condensed), 'Barlow Condensed', Barlow, system-ui, sans-serif;
```

> ⚠️ **Critical inherited default.** `body` sets
> `font-family: var(--font-special-gothic-condensed-one), Arial, Helvetica, sans-serif`.
> **Any text without an explicit `font-*` class renders in the condensed display face.**
> This is intentional — headings, scores, nav links and team names are written as bare
> `text-[24px] text-white` with no font class. Add `font-barlow` explicitly whenever you want body type.

`Special_Gothic_Condensed_One` is configured with `adjustFontFallback: false` (its metrics are too
narrow for automatic fallback adjustment — leave this off).

### 2.2 Weight rules

- **Display face has one weight (400).** Never apply `font-bold`/`font-semibold` to it — it will
  synthesize and look wrong. Scale by size, not weight.
- **Barlow** weight usage in production: `font-medium` (500) ×69 · `font-semibold` (600) ×59 ·
  `font-normal` (400) ×55 · `font-bold` (700) ×9.
  - 500 → default body, labels, metadata
  - 600 → emphasized rows, card headers, sub-labels
  - 700 → news headlines only

### 2.3 Type scale (measured from production usage)

Sizes are used as arbitrary values (`text-[13px]`), not the Tailwind scale. Ranked by frequency:

| Token | px | Frequency | Typical use |
|---|---|---|---|
| `--text-2xs` | 10px | rare | all-caps eyebrows (`presentado por`) |
| `--text-xs` | 11–12px | 22× | records (W-L), deep metadata, team labels |
| **`--text-sm`** | **13px** | **222× — most used** | Barlow body, table cells, dates, captions |
| `--text-base` | 14px | 25× | primary body, card header meta |
| **`--text-md`** | **15px** | **90×** | Display buttons/pills, secondary nav, desktop meta |
| `--text-lg` | 16px | 20× | nav links, standings labels, leader names |
| `--text-xl` | 17–18px | 47× | leaders card title, box score player names |
| `--text-2xl` | 20px | 32× | desktop nav links, leader stat values |
| `--text-3xl` | 22px | 50× | **section heading (mobile)** |
| `--text-4xl` | 23–24px | 70× | **section heading (desktop)**, card scores |
| `--text-5xl` | 26px | 18× | footer menu links, mobile leader values |
| `--text-6xl` | 32px | 14× | desktop match-card scores, leader values |
| `--text-7xl` | 33–34px | 9× | mobile menu links, news hero headline |
| `--text-8xl` | 38–42px | 11× | page H1 (`Estadísticas`, `Jugadores`) |
| `--text-9xl` | 64–72px | 5× | oversized stat numerals |

### 2.4 Named text styles

```css
/* Display — Special Gothic Condensed One, weight 400 */
.page-title      { font-size: 38px; letter-spacing: 0.4px; }              /* mobile  */
.page-title-lg   { font-size: 42px; letter-spacing: 0.4px; }              /* desktop */
.section-title   { font-size: 22px; }                                     /* mobile  */
.section-title-lg{ font-size: 24px; }                                     /* desktop */
.nav-link        { font-size: 20px; color: #fff; }                        /* desktop nav */
.nav-link-mobile { font-size: 33px; color: #fff; }                        /* drawer  */
.footer-link     { font-size: 26px; color: #fff; }
.score           { font-size: 24px; }                                     /* 32px on md+ */
.button-label    { font-size: 15px; }
.card-title      { font-size: 17px; color: rgba(15,23,31,0.7); }

/* Body — Barlow */
.headline-hero   { font-weight: 700; font-size: 19px; line-height: 1.5; } /* 34px/2.25 on md+ */
.body            { font-weight: 500; font-size: 14px; line-height: 1.15; }
.body-sm         { font-weight: 400; font-size: 13px; line-height: 1.15; }
.meta            { font-weight: 500; font-size: 12px; color: rgba(15,23,31,0.6); }
.eyebrow         { font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1.6px; }
.table-header    { font-weight: 500; font-size: 13px; text-transform: uppercase; }
```

### 2.5 Tracking

Display type gets **positive** tracking; Barlow body gets **negative** or near-zero.

| Value | Where |
|---|---|
| `0.3px` (15×) | display headings, card titles |
| `0.05em` (13×) | uppercase display labels |
| `-0.14px` / `-0.13px` (20×) | Barlow body, news copy |
| `1.17px` / `1px` / `1.6px` | all-caps eyebrows and round labels |
| `0.4px` | page H1 |
| `0.32px` / `0.16px` | section subtitles |

### 2.6 Line height

`1.00` flat (scores, numerals) · `1.10` tight (news headlines) · `1.15` snug (Barlow body) ·
`1.25` normal (dates, subheads) · `1.30` relaxed (paragraphs) · `1.40` leader names.

Numerals in stat cells use `font-variant-numeric: tabular-nums`.

---

## 3. Color

### 3.1 Core tokens

Declared in [globals.css](src/app/globals.css):

```css
:root {
  --background: #fdfdfd;   /* paper */
  --foreground: #171717;   /* ink text */
}
html { background: #191919; }              /* overscroll gutter */
body { background: #0F171F; color: var(--foreground); }
```

### 3.2 Ink (dark surfaces)

| Token | Hex | Usage |
|---|---|---|
| **`--ink`** | **`#0F171F`** | **Signature dark. 113× — body, hero band, footer, active pills, theme-color meta.** |
| `--ink-2` | `#11161D` | gradient secondary stop |
| `--ink-3` | `#17222D` | card on dark surface |
| `--ink-app` | `#191919` | html background, iOS webview bottom sheet |
| `--ink-panel` | `#141414` | app-webview panel |
| `--ink-panel-2` | `#181818` | app-webview table header band |
| `--ink-panel-3` | `#1B1B1B` | app-webview totals row |
| `--ink-drawer` | `#171819` | mobile menu drawer |
| `--ink-drawer-btn` | `#252933` | drawer close button |

### 3.3 Paper (light surfaces)

| Token | Hex | Usage |
|---|---|---|
| **`--paper`** | **`#FDFDFD`** | primary page background (`min-h-screen bg-[#fdfdfd]`) |
| `--paper-card` | `#FFFFFF` | cards on paper (64× `bg-white`) |
| `--paper-2` | `#FCFCFC` | alternating row A |
| `--paper-3` | `#FAFAFA` | 21× — hover rows, subtle fills |
| `--paper-4` | `#F9F9F9` | alternating row B |
| `--paper-5` | `#F8F8F8` | mobile ad wells |
| `--paper-6` | `#F6F6F6` | glossary block |
| `--paper-7` | `#F3F3F3` | table header band (light) |
| `--paper-8` | `#F4F4F4` | desktop ad well |
| `--paper-9` | `#ECECEC` | totals row (light) |
| `--paper-warm` | `#F4EFE6` | cream feature band (playoffs leaders) |
| `--paper-cool` | `#F4F5F7` | cool gray band (playoffs series sheet) |

### 3.4 Foreground on paper

The system leans on **black at alpha** and **ink at alpha** rather than gray hexes.

| Token | Value | Frequency | Usage |
|---|---|---|---|
| `--fg` | `#000000` | 92× (`text-black`) | primary headings |
| `--fg-ink-90` | `rgba(15,23,31,0.9)` | 44× | leader names, table primary cells |
| `--fg-ink-80` | `rgba(15,23,31,0.8)` | — | news titles |
| `--fg-ink-70` | `rgba(15,23,31,0.7)` | 12× | card titles, secondary labels |
| `--fg-ink-60` | `rgba(15,23,31,0.6)` | 11× | dates |
| `--fg-ink-55` | `rgba(15,23,31,0.55)` | 6× | tertiary meta |
| `--fg-ink-50` | `rgba(15,23,31,0.5)` | 10× | team name under leader |
| `--fg-ink-40` | `rgba(15,23,31,0.4)` | 10× | dimmed / losing side |
| `--fg-black-60` | `rgba(0,0,0,0.6)` | **57× — most-used alpha** | body meta, subtitles |
| `--fg-black-50` | `rgba(0,0,0,0.5)` | 38× | inactive tabs |
| `--fg-black-70` | `rgba(0,0,0,0.7)` | 28× | bib numbers, eyebrows |
| `--fg-black-65` | `rgba(0,0,0,0.65)` | 12× | inactive Tag label |
| `--fg-mute` | `#717171` | 11× | footnotes |

### 3.5 Foreground on ink

| Token | Value | Usage |
|---|---|---|
| `--fg-inv` | `#FFFFFF` | 127× (`text-white`) — primary on dark |
| `--fg-inv-90` | `rgba(255,255,255,0.9)` | card header labels |
| `--fg-inv-80` | `rgba(255,255,255,0.8)` | hero subhead, card dates |
| `--fg-inv-70` | `rgba(255,255,255,0.7)` | 19× — team city, hover-out state |
| `--fg-inv-60` | `rgba(255,255,255,0.6)` | inactive segmented tab |
| `--fg-inv-50` | `rgba(255,255,255,0.5)` | 29× — losing score, W-L record, inactive tabs |
| `--fg-inv-30` | `rgba(255,255,255,0.3)` | disabled |

### 3.6 Borders & dividers

| Token | Value | Frequency | Usage |
|---|---|---|---|
| **`--border-glass`** | **`rgba(125,125,125,0.13)`** | **27×** | glass card stroke — the signature card outline |
| `--border-glass-2` | `rgba(125,125,125,0.24)` | 10× | footer social buttons |
| `--border-glass-3` | `rgba(125,125,125,0.4)` | 5× | hero image stroke, ad frames |
| `--border-card` | `#EAEAEA` | 19× | white card outline |
| `--border-card-2` | `#E5E5E5` | 5× | leaders card, avatar ring |
| `--border-pill` | `#D5D5D5` | 12× | inactive Tag / pill button |
| `--border-row` | `#D9D9D9` | — | table row |
| `--border-hairline` | `rgba(0,0,0,0.07)` | **46×** | light hairline divider |
| `--border-hairline-2` | `rgba(0,0,0,0.088)` | — | box-score row divider |
| `--border-hairline-3` | `rgba(0,0,0,0.05)` | — | leaders list divider (0.5px) |
| `--border-inv-05` | `rgba(255,255,255,0.05)` | 5× | divider inside glass card |
| `--border-inv-12` | `rgba(255,255,255,0.12)` | 4× | footer top rule, header menu button |
| `--border-inv-21` | `rgba(255,255,255,0.21)` | 4× | glass pill button stroke |
| `--border-inv-35` | `rgba(255,255,255,0.35)` | — | glass pill (active) |
| `--border-nav` | `rgba(55,55,55,0.5)` | — | header bottom divider (optional) |
| `--border-hover` | `rgba(47,47,47,1)` | 12× | team tile hover border |

### 3.7 Accents & semantics

| Token | Hex | Usage |
|---|---|---|
| `--live` | `#FF0000` | live indicator, play triangle, LIVE pill |
| `--red` | `#E51F1F` | brand red fills/text |
| `--red-hover` | `#D03535` | hover red / loss |
| `--blue` | `#60B0F5` | hero radial light-bleed accent |
| `--link-blue` | `#1772D9` → `#1257A8` hover | inline action links |
| `--green` | `#16A14A` | win indicator |
| `--green-bg` | `#EBF5ED` | win chip background |
| `--red-bg` | `#FFEDED` | loss chip background |
| `--gold` | `#FEC200` | championship star, final accents |
| `--warn` | `#F59E0B` | warning |

### 3.8 Team brand colors

Source of truth: [src/app/boletos/teams.ts](src/app/boletos/teams.ts) (`BOLETOS_TEAMS_META.borderColor`).
Used for logo rings, bracket pip strips, team-accent details. **Never as large fills** — logos carry the identity.

| Code | Team | Hex |
|---|---|---|
| `SGE` | Atléticos de San Germán | `#F75400` |
| `SCE` | Cangrejeros de Santurce | `#FA4515` |
| `ARE` | Capitanes de Arecibo | `#FFB900` |
| `CAG` | Criollos de Caguas | `#DDB7E7` |
| `CAR` | Gigantes de Carolina/Canóvanas | `#FEC200` |
| `MAY` | Indios de Mayagüez | `#F5E0BF` |
| `PON` | Leones de Ponce | `#B82027` |
| `GBO` | Mets de Guaynabo | `#245AA3` |
| `MAN` | Osos de Manatí | `#347CAF` |
| `QUE` | Piratas de Quebradillas | `#F9170C` |
| `AGU` | Santeros de Aguada | `#67CA59` |
| `BAY` | Vaqueros de Bayamón | `#468AD9` |

---

## 4. Gradients & glass

### 4.1 `.bg-bsn` — the signature hero band

Applied to every page's `<header>` wrapper. Four stacked layers:

```css
.bg-bsn {
  background:
    radial-gradient(50% 80% at 50% 0%, rgba(96,176,245,0.10) 0%, rgba(96,176,245,0) 70%),
    radial-gradient(60% 90% at 50% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%),
    linear-gradient(180deg, rgba(17,22,29,0.20) 0%, rgba(10,14,20,0) 100%),
    #0F171F;
}
```

A cool blue bloom + a white bloom, both anchored to the **top center**, over flat ink.

### 4.2 Glass cards over ink

```css
.glass-match-card       { background-color: rgba(54,54,54,0.36); box-shadow: 0 8px 32px rgba(0,0,0,0.13); }
.glass-match-card-pill  { background-color: rgba(15,15,15,0.28); }

/* Blur only on hover-capable, fine-pointer devices — WebKit iOS composites
   backdrop-filter + transformed ancestors to black inside carousels. */
@media (hover: hover) and (pointer: fine) {
  .glass-match-card      { background-color: rgba(54,54,54,0.26); backdrop-filter: blur(40px); }
  .glass-match-card-pill { background-color: rgba(15,15,15,0.19); backdrop-filter: blur(40px); }
}
```

Always paired with `border: 1px solid rgba(125,125,125,0.13)` and `border-radius: 12px`.

### 4.3 Image scrim

```css
background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 0.01%, rgba(0,0,0,0.8) 60%);
```

### 4.4 Edge-fade mask (carousels)

```css
mask-image: linear-gradient(to right, #000 0%, #000 75%, transparent 100%);  /* mobile */
mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%);  /* ≥768px */
```

---

## 5. Radii

| Token | Value | Frequency | Usage |
|---|---|---|---|
| `--radius-xs` | 4px | — | selects, tiny chips |
| `--radius-sm` | 6px | 11× | sponsor pill background, small chips |
| `--radius-md` | 8px | 6× | news thumbnails |
| `--radius-card-sm` | 10px | 39× | team tiles, nested cards, bracket cards |
| **`--radius-card`** | **12px** | **56× — the default** | **every content card, hero image, ad frame** |
| `--radius-lg` | 14–16px | 2× | feature/series cards |
| `--radius-pill-sm` | 18px | 5× | glass pill button (match card CTA) |
| `--radius-pill` | 100px | 27× | `Tag`, filter pills, segmented controls |
| `--radius-full` | 9999px | 52× (`rounded-full`) | avatars, icon buttons, indicators |

---

## 6. Shadows

Deliberately faint on paper; only glass gets real depth.

```css
--shadow-card:    0 1px 3px 0 rgba(20,24,31,0.04);   /* #14181F0A — 16×, default card */
--shadow-button:  0 1px 2px 0 rgba(20,24,31,0.05);   /* #14181F0D — 4×  */
--shadow-raised:  0 2px 14px rgba(14,20,32,0.08);    /* 4× — dropdowns, floating rows */
--shadow-popover: 0 1px 15px 0 rgba(88,88,88,0.10);  /* #5858581A — nav popover */
--shadow-glass:   0 8px 32px rgba(0,0,0,0.13);       /* glass card over ink */
--shadow-feature: 0 12px 32px rgba(15,23,31,0.08);   /* feature / series card */

/* Layered soft card (leaders) */
--shadow-soft: 0 1px 1px rgba(20,24,31,0.02), 0 4px 12px rgba(20,24,31,0.04);

/* Header icon button on ink */
--shadow-ink-button: 0 0 1.5px rgba(0,0,0,0.10),
                     0 1px 6px rgba(0,0,0,0.15),
                     inset 0 0.5px 0.5px rgba(255,255,255,0.06);
```

---

## 7. Spacing

4px base. Ranked by real usage (arbitrary Tailwind values):

`2px` · `3px` · `5px` · `6px` · `7px` · **`8px`** · `9px` · **`10px`** · **`12px`** · `13px` ·
`14px` · `15px` · `16px` · `17px` · `18px` · **`20px`** · `24px` · `25px` · `26px` · `28px` ·
**`30px`** · `40px` · `50px` · `52px` · `60px`

The workhorses: **10px, 12px, 20px, 30px** (section rhythm), with **8px** for tight inline gaps.

**Section vertical rhythm:** `mb-4` mobile → `mb-8` md → `mb-10`/`mb-17` lg.
**Header padding:** `py-[10px]` mobile → `py-[20px]` sm+.
**Card body padding:** `px-[15px]` mobile → `px-[20px]` md+.

---

## 8. Layout

### 8.1 `.container` utility

Custom utility in [globals.css](src/app/globals.css) — **not** Tailwind's default container:

```css
@utility container {
  margin: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  @variant lg { max-width: 68rem; }   /* 1088px */
  @variant xl { max-width: 79rem; }   /* 1264px */
  @variant 2xl { max-width: 79rem; }  /* 1264px — caps here */
}
```

Figma frame reference: 1440px wide, 104px gutters, 1232px content, 815px main column / 397px side rail.

### 8.2 Breakpoints (Tailwind v4 defaults)

| Name | Min-width | Role in BSN |
|---|---|---|
| `sm` | 640px | header padding step |
| `md` | 768px | **primary mobile/desktop switch** — nav, card sizing, type scale |
| `lg` | 1024px | 12-col grid activates, sidebar appears, container caps at 68rem |
| `xl` | 1280px | container 79rem, desktop leaderboard ads |
| `2xl` | 1536px | container stays 79rem |

JS-side (`useScreenDetector`): `isMobile ≤768`, `isTablet ≤1024`, `isDesktop >1024`.

### 8.3 Page shell

```tsx
<div className="min-h-screen bg-[#fdfdfd]">
  <header className="bg-bsn">          {/* dark hero band */}
    <div className="border-b" style={{ borderColor: divider ? 'rgba(55,55,55,0.5)' : 'transparent' }}>
      <Header />
    </div>
    {subheader}                        {/* extra dark-band content */}
  </header>
  <main>{children}</main>              {/* paper */}
  <Footer />                           {/* bg-[#0F171F] */}
</div>
```

**Signature composition move:** the first content section pulls up into the dark band with a negative
top margin, so white cards overlap the ink:

```tsx
<section className="container mb-4 -mt-[95px] lg:mb-7 lg:-mt-[60px]">
```

Paired with generous subheader bottom padding (`pb-[109px] lg:pb-[84px]`) to create the overlap room.

### 8.4 Main grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
  <div className="lg:col-span-8">{/* main column */}</div>
  <div className="lg:col-span-4">{/* side rail */}</div>
</div>
```

---

## 9. Component patterns

### 9.1 Card (glass, on ink)

[src/shared/client/components/ui/Card.tsx](src/shared/client/components/ui/Card.tsx)

```tsx
<Card>                       // glass-match-card + border-[rgba(125,125,125,0.13)] + rounded-[12px]
  <CardHeader className="border-b border-b-[rgba(255,255,255,0.05)] mx-[15px] py-[8px] md:mx-[20px]" />
  <CardBody className="pt-[3px]" />   // px-[15px] md:px-[20px]
  <CardFooter />                      // bg-[rgba(76,76,76,0.2)] rounded-b-xl px-5 py-3
</Card>
```

The header divider uses **inset horizontal margins** (`mx-[15px]`) rather than full-bleed — a
recurring detail.

### 9.2 Match card

Fixed widths: `w-[220px]` mobile / `w-[308px]` md+. Three variants share one skeleton:

| Variant | Header left | Score treatment | CTA |
|---|---|---|---|
| `CompletedMatchCard` | `Final` / `Final 2OT` (Barlow Condensed 600) | Loser at `rgba(255,255,255,0.5)`, winner white + caret icon | "Ver resultados" |
| `LiveMatchCard` | Lottie live animation + period/clock | Both white | "Ver en vivo" + red `#ff0000` play triangle |
| `ScheduledMatchCard` | date (Barlow 500) | tip-off time in display face | "Ver previa" |

Score type: `text-[24px] md:text-[32px]` in the display face (no font class).
Channel logos (Punto 2 / YouTube / BSN App / Telemundo) render at `height: 14px` in the header right.

**Glass pill CTA** — the recurring dark-surface button:

```tsx
<div className="glass-match-card-pill border border-[rgba(255,255,255,0.21)] block text-center rounded-[18px] p-[2px] md:p-[5px]">
  <span className="text-sm text-white md:text-[15px]">Ver resultados</span>
</div>
```

Focus ring on the wrapping link:
`focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F171F]`

### 9.3 Tag / filter pill

[src/shared/client/components/ui/Tag.tsx](src/shared/client/components/ui/Tag.tsx)

```
inactive → bg #FFFFFF · border #D5D5D5 · text rgba(0,0,0,0.65)
active   → bg #0F171F · border #0F171F · text #FFFFFF
shape    → rounded-[100px] px-[18px] py-[7px]
```

### 9.4 Leaders card (paper)

```tsx
<div className="border border-[#E5E5E5] flex-1 rounded-[12px] bg-white">
  <div className="flex justify-between items-center py-[18px] pl-[20px] pr-[25px]">
    <h2 className="font-special-gothic-condensed-one text-[17px] text-[rgba(15,23,31,0.7)]">{title}</h2>
    <h4 className="font-barlow text-xs text-[rgba(0,0,0,0.6)]">{subtitle}</h4>
  </div>
  <ul>  {/* rows divided by border-b-[0.5px] border-[rgba(0,0,0,0.05)] */}
</div>
```

Row anatomy: rank (Barlow Condensed 15px, `rgba(0,0,0,0.8)`) → circular avatar with
`border-[#E5E5E5]` ring → name (`rgba(15,23,31,0.9)`) + team logo 12px + team name
(Barlow 500 12px, `rgba(15,23,31,0.5)`) → stat value right-aligned in display face.

**Rank 1 is emphasized:** avatar 45px vs 30px, name 17px vs 16px, value `26px md:32px` vs `20px md:24px`.

### 9.5 News

- **Hero:** `rounded-[12px]`, `pt-[53.20%]` aspect box, `border-[rgba(125,125,125,0.4)]`, scrim overlay on md+,
  headline Barlow 700 `text-[19px]/6 md:text-[34px]/9`, excerpt Barlow 500.
- **List item:** row-reverse on mobile / row on sm+, thumbnail `aspect-16/9 rounded-[8px] w-[105px] object-cover`,
  title Barlow 600 `text-sm/5` → `lg:font-medium lg:text-[rgba(15,23,31,0.7)]`.

### 9.6 Standings table

Column widths `40% / 12% × 5`. Headers and team names in display face at `text-base`;
numeric cells `font-barlow text-sm text-right`. Rank chip: 25×25 circle,
`bg-[rgba(54,54,54,0.18)]`, `border-[rgba(125,125,125,0.13)]`, `font-barlow font-semibold text-sm`.

### 9.7 Header

Logo `w-[68px] md:w-[113px]`. Desktop nav links `text-[20px] text-white` (display face), gaps
`gap-[20px] lg:gap-[30px]`.

Mobile menu button:
```css
width: 42px; height: 42px; border-radius: 9999px;
background: rgba(255,255,255,0.12);
border: 1px solid rgba(255,255,255,0.12);
box-shadow: 0 0 1.5px rgba(0,0,0,0.1), 0 1px 6px rgba(0,0,0,0.15),
            inset 0 0.5px 0.5px rgba(255,255,255,0.06);
```

Mobile drawer: full-screen `bg-[#171819]`, links `text-[33px] text-white`,
`divide-y divide-[rgba(255,255,255,0.05)]`, close button `bg-[#252933]` 42px circle.

Equipos popover: `bg-white border-[#E2E2E2] rounded-[12px] shadow-[0px_1px_15px_0px_#5858581A]`,
3-col grid of `rounded-[10px]` team tiles that hover to `border-[rgba(47,47,47,1)]`.

Secondary CTA (outline pill on ink):
```
font-special-gothic-condensed-one text-[17px] text-white/85 hover:text-white
border border-white/20 hover:border-white/40 rounded-full px-3.5 py-1.5 transition-colors
```

### 9.8 Footer

`bg-[#0F171F] pt-[50px] pb-[34px]`. 12-col grid: brand+social (3) / menu (3) / teams (6).
Social buttons: 40px circles, `border-[rgba(125,125,125,0.24)]`.
Menu links display face `text-[26px] text-white`. Column labels
`font-barlow font-medium text-[13px] text-neutral-600` uppercase.
Team grid `grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[6px]`, avatars 45px.
Legal rule: `border-t border-t-[rgba(255,255,255,0.12)]`, copy `font-barlow text-xs text-neutral-500`.

### 9.9 Page hero (light page, dark band)

```tsx
<h1 className="font-special-gothic-condensed-one text-white text-[38px] tracking-[0.4px] mb-4 lg:text-[42px] lg:mb-5">
```
Tabs beneath: display face `text-[20px] lg:text-[22px]`, active `text-white` with a
`h-[1.5px] bg-white rounded-full` underline; inactive `text-white/50 hover:text-white/75`.
Section padding `pt-8 pb-6` mobile / `pt-[50px] pb-11` desktop.

### 9.10 Section heading (most common pattern, 25×)

```tsx
<div className="flex flex-row justify-between items-center mb-4 md:mb-[26px]">
  <h3 className="text-[22px] text-black md:text-[24px]">Highlights</h3>
</div>
```

Display face (no font class), `text-black` or `text-[#0F171F]`.

### 9.11 Loading

`ShimmerLine` — `w-full bg-gray-300 rounded-lg animate-pulse`, height prop (default `16px`).

---

## 10. Motion

Restrained. Color and opacity only; no layout animation.

```css
--ease:        cubic-bezier(0.4, 0, 0.2, 1);
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast:    120ms;
--dur:         150ms;   /* dominant — transition-colors duration-150 */
--dur-medium:  200ms;   /* popovers */
--hover-opacity:  0.82;
--active-opacity: 0.45;
```

Production usage: `transition-colors` (12×), `duration-150` (5×), `transition-opacity`,
`transition-transform` (chevron rotation), `animate-pulse` (shimmer).
Headless UI popovers: `transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0`.
LIVE pill dot: 1.6s ease-in-out blink, opacity 1 → 0.35 → 1.

---

## 11. Iconography & assets

| Path | Contents |
|---|---|
| `/assets/images/bsn-logo.svg` | primary wordmark |
| `/assets/images/teams/` | 12 team logos by 3-letter code |
| `/assets/images/icons/` | UI icons — PNG (@1x/@2x) and SVG |
| `/assets/images/icons/channels/` | `punto2.svg`, `youtube.svg`, `bsnapp.svg`, `telemundo.svg` — render at 14px height |
| `/assets/images/icons/social/` | instagram, facebook, youtube, x, tiktok |
| `/assets/animations/lottie/` | `live-stream.json` (16×16 in card headers), `spinner.json` |
| `/assets/images/sponsors/` | sponsor marks |

Slider arrows are CSS background images: `icon-slider-prev.png` / `icon-slider-next.png`, on a
36×36 circle, `bg-[rgba(38,38,38,0.95)]`, `border-[rgba(255,255,255,0.32)]`, hidden below 768px.

---

## 12. Third-party surface: Sportradar widgets

Roughly 2/3 of [globals.css](src/app/globals.css) restyles Sportradar (`sw-*`) widget classes injected
via GTM. Two host contexts, each with its own palette:

| Host | Scope class | Surface |
|---|---|---|
| Public web | `.widget` | light — `#fdfdfd` base, `#f3f3f3` header band, `#ffffff` rows, `#ececec` totals |
| iOS app webview | `.sport-radar-fixture-mobile-widget` | dark — `#141414` panel, `#191919` banner, `#181818` header band, `#1B1B1B` totals |

Conventions applied to both:
- Player names and scores → display face; all stat cells and headers → Barlow.
- Rows go **edge-to-edge** via `margin-inline: -1rem` + `width: calc(100% + 2rem)`, with `1rem`
  padding restored on the first/last columns.
- Row dividers are painted as a **background gradient** (`linear-gradient(to bottom, transparent 0,
  transparent calc(100% - 1px), rgba(0,0,0,0.088) …)`) so the widget's inline `box-shadow` can't override them.
- Sticky name column gets `border-right` at the same divider opacity as a horizontal-scroll cue.
- Sub-tabs: transparent, display face 22px, inactive `rgba(0,0,0,0.5)`, active `#000` + `1.5px` bottom border.
- Multi-switch pills: `rounded-[100px]`, `border #D5D5D5`, active `bg/border #0F171F` + white text.
- Team stat cards: 3-col → 5-col (`lg`) → 7-col (`xl`) grid, `rounded-[10px] sm:rounded-[12px]`,
  label Barlow 500 11/13px, value display face 20/28px.

---

## 13. Rules for generated designs

1. **Never hardcode a hex that isn't in this document.** Reuse the tokens above.
2. **Assume the display face is the default.** Add `font-barlow` explicitly for body text.
3. **One weight for display type.** Scale by size; never bold it.
4. Cards on paper: `bg-white` + `border-[#EAEAEA]` (or `#E5E5E5`) + `rounded-[12px]` + `shadow-card`.
5. Cards on ink: `glass-match-card` + `border-[rgba(125,125,125,0.13)]` + `rounded-[12px]`.
6. Dark backgrounds are `#0F171F` — not black, not slate-900.
7. Use ink/black **at alpha** for text hierarchy, not gray hexes.
8. Team color is an accent (ring, strip, pip) — never a background fill.
9. Every score/stat numeral: display face + `tabular-nums`.
10. Copy is Spanish. Match the existing voice: `Ver resultados`, `Ver previa`, `Ver en vivo`,
    `Estadísticas`, `Calendario`, `Jugadores`, `Boletos`, `No hay datos disponibles.`
11. Responsive step is `md` (768px) for type and card sizing; `lg` (1024px) for grid structure.
12. Keep motion to color/opacity at 150ms.

---

*Generated from the `bsn-web` repository. Token frequencies are actual occurrence counts in
`src/**/*.tsx` and `src/app/globals.css`.*
