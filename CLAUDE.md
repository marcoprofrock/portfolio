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
