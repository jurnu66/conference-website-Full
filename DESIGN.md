# DESIGN.md — Mini-Conference · 300-1412 Seminar in CPE · CDTI

Rules for anyone (or any AI tool) editing this site. Keep the look consistent with cdti.ac.th.

## Brand
- Formal but bright: blue and yellow from the CDTI logo lead, on a gray-blue page (#F2F3F7). **No black**: use deep blue for text.
- Two languages: Thai site at `dist/`, English at `dist/en/`, built from the same data. The ไทย/EN switch sits in the gray utility pill (top right) and links to the same page in the other language. Text fields in the data file are `{ th, en }`; plain strings show in both.

## Color tokens (`app/src/css/style.css`): blue + yellow from CDTI e-Learning (persevere)
Source: persevere.cdti.ac.th and its CDTI logo (#4D79BC blue, #F3EB1A yellow). Page background #F2F3F7 is the sample the team picked.

Rules:
- Blue and yellow lead. Big areas (announcement bar, banners, "สำหรับผู้เขียน" section, news card, chair card, table headers, footer) use the blue band.
- Only ONE blue family (hue ~220): `--band` for large areas, `--primary` for buttons/links/cards. Never mix in a grayish blue.
- Yellow: main buttons (with deep-blue text), numbers and headings on blue, small accent bars and dots.
- No large pure-white areas: sections alternate `--page` and `--tint`. White is for the header, cards and content blocks.

| Token | Hex | Use |
|---|---|---|
| `--page` | #F2F3F7 | page background |
| `--tint` | #E9ECF3 | alternate section background (instead of white) |
| `--band` | #1F4EAF | large blue areas (white text 7.6:1, yellow text 6:1) |
| `--band-ink` | #E6EDFC | secondary text on the blue band |
| `--primary` | #2C66E0 | buttons, links, active states, photo cards |
| `--primary-dark` | #2357C4 | hover, links on `--tint` |
| `--yellow` | #F3EB1A | main CTA buttons, accents on blue |
| `--yellow-dark` | #E6DD0E | hover for yellow buttons |
| `--deep` | #1E3A6E | headings and text on yellow (blue instead of black) |
| `--sky-50` | #EAF1FE | icon tiles, hover |
| `--text` | #2A3550 | body text |
| `--muted` | #5E6A7E | secondary text and placeholders |

Do not add new colors in components; use the tokens.

## Type
- Font: Niramit (same as cdti.ac.th), 400/500/600/700. Body 17px, line-height 1.7.

## Shape & depth
- Radius 10 / 18 / 28px. Cards white on the gray page; on white sections cards use the gray page color.
- Soft blue-tinted shadows. Large colored areas use only `--band`.

## Structure
- Layout copies cdti.ac.th: blue announcement bar → white header (logo left, gray utility pill + main nav with outlined "ส่งบทความ" button) → blue photo banner with overlapping white quick-link card → news block (blue feature card + rows with blue circle arrows) → blue section with photo cards → blue footer with a yellow top line.
- Home = one long page with a sticky section nav (ECTI-FIT style) + "ดูทั้งหมด" links to sub-pages.
- Sub-pages via dropdown menu (CCAT style): About ▸ Charter / Committee / Archive, Papers ▸ CFP / Submission, Program, Registration, Venue, Contact.

## Images
- Photos live in `app/src/img/` and are listed with their source page in `images` in the data file. All four are real photos from cdti.ac.th (computer engineering program and Faculty of Digital Technology pages).
- Logo: `app/src/img/cdti-logo.svg`, the official file from cdti.ac.th. Header: logo | divider | conference acronym (logo only on phones). Footer: logo on a white tile.
- To swap a photo: put the file in `src/img`, change `file` in the data file, run `npm run build`. Width and height are read from the file automatically.
- Do not use the news photos on those pages (they show royal ceremonies and named people).

## Content
- All content lives in `app/src/data/conference-data.js`. Then run `npm run build` in `app/`.
- Placeholders: `[...]`, `รอประกาศ` / `TBA`, `---`. They render faded automatically. Do not invent facts.
- Plain, short Thai sentences. No marketing language.

## Accessibility
- All text meets WCAG AA 4.5:1. Check new colors before adding them.
- Dropdowns close when focus leaves; the mobile drawer traps focus and makes the page behind it inert; tabs support arrows, Home, End and keep the choice in `?tab=`.
- Images get width/height from the file at build time; the first banner image loads with `fetchpriority="high"`.
- Touch targets ≥ 44px, visible focus ring, respects reduced motion, works at 375px width.
