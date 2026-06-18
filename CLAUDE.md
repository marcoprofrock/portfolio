# CLAUDE.md — Portfolio Project Notes

## Project Overview
Personal portfolio for Marco Pröfrock — Creative at Scholz & Friends, Stuttgart.
Hosted on GitHub Pages: https://github.com/marcoprofrock/portfolio.git

## Tech Stack
- Single-page HTML (`index.html`) with inline CSS/JS
- No build tools, no frameworks
- Local fonts (`Inter` via `@font-face`, preloaded)
- Google Analytics GA4 (consent-based, tag G-9G9TJLTWJ8)
- GitHub Pages hosting

## Key Files
- `index.html` — Main portfolio page (timeline intro, projects, awards, photo gallery, Mac chat)
- `io/index.html` — Hidden SP.IO application page with permanent side-by-side chat
- `intro.html` — Reference prototype for timeline animation (not linked)
- `privacy.html` — GDPR privacy policy
- `500ls/index.html` — Interactive 500l/s typeface tester (clone of index.html, root-relative `/assets`, noindex). Not linked from live index.html yet.
- `assets/fonts/500ls/500ls-01…13.otf` — The 13 final 500l/s display cuts (one per Stuttgart spring), `@font-face`'d as families `ls01…ls13`
- `assets/08_Photography/index.json` — Photo gallery manifest (regenerated from disk)
- `assets/11_MiniMac/03_isolated_html/minimac-animatio-emotion.html` — Mini Mac animation reference

## Architecture
### Intro Timeline
- Scroll-driven animation (500vh scroll container)
- Pixel-art Mac character (`#chatTrigger`) starts centered, moves right, shrinks to corner
- 3 stations (2021, 2023, 2024) fade in/out at scroll progress milestones
- After timeline ends (progress >= 0.97), Mac gets `.settled` class → becomes clickable chat trigger

### Mini Mac Walk System
- After settling, Mac idles for 5s then walks to opposite side of screen
- Walk animation: sit → stand → turn → side-walk → turn → sit
- 8 face expressions (happy, wink, surprised, bored, cheeky, sideEye, excited, dead)
- Speech bubbles with "click me" messages
- Clickable on both left and right side → opens Mac chat overlay
- `MutationObserver` watches for `.settled` class to activate/deactivate walk system

### Mac Chat Overlay
- Retro 1984 Macintosh UI with Q&A pool
- Free-text input forwards to Formspree (hello@marco.ad)
- Contact info shown after 2+ questions

### Photo Gallery
- Loaded from `index.json` manifest
- Fisher-Yates shuffle on load
- Horizontal scroll track with lightbox

### 500l/s Typeface Tester (`/500ls/`)
- Lives in `500ls/index.html` — a full clone of `index.html` with root-relative `/assets` paths + `noindex,nofollow` (robots.txt Disallow `/500ls/`). Embedded as a `.tt` panel inside the `#p-500ls` project block, which is `open` by default on this page. Module CSS injected before `</head>`, JS before `</body>`.
- Source of truth for the behaviour is `33_BA_500ls/12_BA_ABGABE_klein/07_Anhang_G_Headline_Extended_Script_randomizer.jsx` (the Illustrator randomizer), NOT just the thesis. Keep them in sync if cuts/colors change.
- 13 cuts = 13 Stuttgart springs, each with a fixed colour. Cut→HEX (from the script): 01 #EDEC3F · 02 #9DE89F · 03 #62C2B1 · 04 #FFC03F · 05 #FFAE3B · 06 #FFE552 · 07 #FCCF61 · 08 #D4E458 · 09 #0076AD · 10 #00ABC2 · 11 #3F526F · 12 #235BA8 · 13 #008DB1. Fonts are `@font-face` families `ls01…ls13` → `assets/fonts/500ls/500ls-NN.otf`.
- **Dachmarke (mix):** each glyph gets a random cut **+ that cut's colour as a pair**, never the same cut twice in a row. **Einzelschnitt:** one cut+colour for all glyphs (caption shows spring + HEX).
- **Baseline wave:** per-glyph `translateY(±wf · pct em)`, slider 0–100 % (= Illustrator `fontSize · pct`). Default OFF (straight baseline).
- UI chrome is **English** (the spring names stay in German). Controls: text field, Cut select ("Mixed — all 13 cuts" = Dachmarke + the 13 springs under "Single cut (spring)"), Case (Original/UPPER/lower/RaNdOm — case is stable per glyph), Baseline wave slider, "↻ Shuffle". Mix caption: "13 cuts · randomly mixed · no cut twice in a row". Default sample text "Stuttgart Mineral Water". Per-position randomness is stored in a `rolls[]` array so typing/sliding doesn't reshuffle existing glyphs; Shuffle regenerates it.
- Default load = mix + colour + straight baseline. Tester window background = brandbook **Cloud Dancer** `#F0EEE9` (genuine PANTONE 11-4201 TCX off-white; brandbook prints it as #FFFFFF but pure white would vanish on the light theme) on BOTH dark/light themes.
- Build was done with a throwaway Python script (path-rewrite + injections); the generated `500ls/index.html` is the committed artefact. To regenerate after an `index.html` change, re-run the same transform.

## Conventions
- Auto-push after each prompt (unless told otherwise)
- Git identity: Marco Pröfrock <hello@marco.ad>
- CLAUDE.md updated and pushed with every change
- German is the user's language; code comments in English

## GDPR Compliance
- No cookies before user consent (cookie banner with overlay)
- GA4 loads only after consent, stored in localStorage
- Local fonts (no Google Fonts CDN)
- No external tracking scripts (ipapi.co removed)
- Privacy policy at `/privacy.html`, linked from footer

## Session Log
- **2026-05-05**: Integrated Mini Mac walk animation system from `minimac-animatio-emotion.html` into portfolio. Mac now walks between left/right sides when idle, shows speech bubbles, changes expressions. Clickable on both sides to open chat. Created CLAUDE.md.
- **2026-05-05**: Extended timeline scroll from 500vh→900vh for longer dwell on stations. Spread station ranges wider (10–35%, 35–58%, 58–80%). Made year labels much larger (28–48px) and positioned them between Mac and GIF on desktop.
- **2026-05-05**: Fixed broken intro — smart/curly quotes (U+2018/2019/201C/201D) had leaked into JS causing silent parse error. Replaced all with straight quotes in script blocks.
- **2026-05-06**: Style adaptation — increased spacing across all sections (projects, about, CV, awards table, photo strip) to match airy intro aesthetic. Station fly-in/fly-out: now slides from top (in) and down (out) with scale 88%→100%→88% for scroll feedback. Extended station dwell time.
- **2026-05-19**: ADC Talent Award 2026 results — 3 of 4 shortlists upgraded to Nagel (color tbd), 1 stays as Auszeichnung. Updated project award badges + credits and awards table: 500l/s (1× Nagel gewonnen), Windkulturerbe (2× Nagel gewonnen), U-Turn (1× Auszeichnung). Awards table row now reads "Nagel · Nagel · Nagel · Auszeichnung".
- **2026-05-29**: Added talks entry (24.07.2026 Pop Up ADC Creative Club, Areal Süd, Windkulturerbe, Upcoming badge). Sorted talks & awards tables newest-first (ADC Talent 2026 on top). Built hidden light-mode TEST page at `/light/` (noindex, clone of index.html with absolute /assets paths). Adds a subtle pill toggle centered in the header that switches `html.light`; light mode overrides CSS vars (bg #fff, text #0e0e0e) and flips white award/project SVG logos to black via `filter: brightness(0)`. Choice persists in localStorage; default stays dark. Main index.html unchanged. Light mode also strips all drop shadows (box-shadow/filter drop-shadow) — white speech bubbles get a 0.5px hairline border instead so they stay legible on white. Plan: `/light/` is the in-progress next version that will eventually REPLACE the live index.html; keep iterating there, leave index.html untouched until the swap.
- **2026-05-29**: `/light/` About section — Experience & Education now sit side-by-side in a `.cv-pair` 2-col grid on desktop (collapses to 1 col ≤720px) to cut the excessive desktop whitespace. Test page only.
- **2026-05-29**: `/light/` experiment — removed ALL divider lines (border-top/bottom) in CV rows, Memberships, Awards table and Talks table; rows now separated by padding only. Override block appended at end of main `<style>` so it wins over the mobile media-query borders too. Test page only — pending Marco's verdict.
- **2026-06-01**: Took `/io/` page offline (git rm -r io → 404). Technical SEO layer on live `index.html` (0 visual changes): added canonical (https://www.marco.ad/), author meta, full Open Graph + Twitter `summary_large_image` (og:image = about portrait `/assets/06_about/02_c217dbac.webp`, .webp caveat noted — JPG 1200×630 to follow), JSON-LD Schema.org Person (jobTitle "Creative / Art Director", worksFor Scholz & Friends, alumniOf HdM + IADT, sameAs LinkedIn+Instagram from footer, award[] from awards table). Added `.visually-hidden` class + hidden H1 "Marco Pröfrock — Creative / Art Director, Stuttgart" at top of `<main>`; demoted visible "Work" H1→H2 (`.section-title` is class-based, optics unchanged) → now 1×H1, 3×H2. Created `sitemap.xml` (/, /privacy.html only) and `robots.txt` (disallow /light/ /oslo/, Sitemap ref). Added `noindex,nofollow` to `intro.html`. Alt-audit: filled 17 project gallery images with project-name alt; left 47 decorative alts empty (logos w/ adjacent labels or aria-hidden, station GIFs, YouTube thumbs already labeled via button aria-label).
- **2026-06-12**: ADC Talent Award 2026 final colors — all 3 Nägel are **Bronze**. Replaced "Nagel" → "Bronzener Nagel" in awards table row (now "Bronzener Nagel · Bronzener Nagel · Bronzener Nagel · Auszeichnung"), project credits (500l/s "1× Bronzener Nagel gewonnen", Windkulturerbe "2× Bronzener Nagel gewonnen") and JSON-LD award[]. Applied across index.html, light/ and oslo/. U-Turn stays Auszeichnung.
- **2026-06-18**: Awards wording simplified "Bronzener Nagel" → **"Bronze"** (table "Bronze · Bronze · Bronze · Auszeichnung", credits "1×/2× Bronze gewonnen", JSON-LD). **Light mode shipped LIVE as main page**: ported all light-mode features from `/light/` into `index.html` (early theme script in head, full `html.light` CSS override block + header `.theme-toggle` + toggle JS, `.cv-pair` Experience/Education side-by-side desktop grid, divider-line removal block) WITHOUT losing the SEO layer (canonical/OG/JSON-LD/hidden-H1/alt). Default stays dark, toggle persists in localStorage. Removed now-redundant `/light/` dir (git rm) and dropped its robots.txt Disallow (kept /oslo/). Verified via preview: light CSS applies (bg #fff, fg #0e0e0e), award logos brightness(0), dividers 0px, no station shadow, cv-pair 2-col desktop, toggle works, 1×H1, canonical present, noindex absent.
- **2026-06-19**: Light-mode contrast tweaks (live index.html). Mini Mac body recolored beige→black via `html.light #chatTrigger [fill="#d4c8a0"] { fill: #0e0e0e; }` (covers static + JS-built SVGs; CSS fill overrides presentation attr; orange screen untouched). Intro GIF station window borders bumped from 0.5px rgba(14,14,14,0.14) → 1px rgba(14,14,14,0.4) to match the vertical `#timeline-hairline`. Verified via preview computed styles.
- **2026-06-19**: Added interactive **500l/s typeface tester** at `/500ls/` (full clone of index.html with root-relative `/assets` paths + `noindex,nofollow`; robots.txt Disallow `/500ls/`). Bundled the 13 final OTF cuts from `33_BA_500ls/17_Design_Final/02_TypeFinal/260110_500l:s/` into `assets/fonts/500ls/500ls-01…13.otf` (~160 KB total), `@font-face`'d as families `ls01…ls13`. Tester is embedded inside the `#p-500ls` project block (that `<details>` is `open` by default on this page) as a `.tt` panel; module CSS/JS injected before `</head>`/`</body>`. Authoritative behaviour ported from `Anhang_G_Headline_Extended_Script_randomizer.jsx`: **Dachmarke (mix)** assigns each glyph a random cut + that cut's fixed spring colour (HEX from the script: 01 #EDEC3F … 13 #008DB1), with no same-cut twice in a row; **Einzelschnitt** locks one cut+colour; random **baseline-shift** slider 0–100 % = `translateY(±wf·pct em)` per glyph (the wave). Controls: text field, Schnitt select (Dachmarke + 13 springs), Schreibweise (Original/GROSS/klein/zufällig — case stable per glyph), Baseline-Welle slider, "Neu würfeln". Default load = mix + colour + straight baseline (wave off). The tester window sits on brandbook **Cloud Dancer** bg `#F0EEE9` on BOTH dark/light themes (brandbook prints it as #FFFFFF, but pure white would vanish on the light theme, so used the genuine 11-4201 TCX off-white). Live `index.html` is NOT linked to `/500ls/` yet — pending Marco's go to add a "Try the typeface →" link in the 500l/s project block. Verified via preview: fonts load, 0 consecutive repeats, colour/cut pairing correct, wave applies, Cloud Dancer bg both themes, no console errors.
