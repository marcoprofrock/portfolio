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
