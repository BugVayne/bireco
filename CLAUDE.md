# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bilingual (EN/RU) static marketing site for a BI consultancy (brand: **Bireca**), with a serverless Google Apps Script backend. No build step is required to develop — `index.html` / `news.html` are real, openable pages. There is no framework, bundler, or `package.json`; the JS is plain browser scripts loaded via `<script>` tags.

The codebase has three layers that must stay in sync:
1. **Browser runtime** — the `js/*.js` files render content and handle interaction client-side.
2. **SEO prerenderer** — `build.py` re-implements the same rendering in Python to emit static EN/RU pages for crawlers.
3. **Backend** — `apps-script/Code.gs` runs on Google Apps Script and stores news + form leads in a Google Sheet.

## Commands

```bash
# Local dev: just serve the folder (no build). Open index.html / news.html directly,
# or use a static server so relative fetches/paths behave like production:
python -m http.server 8090      # then http://localhost:8090/

# SEO build (optional locally; deploy runs it automatically):
pip install -r requirements.txt
python build.py                 # output -> dist/ (gitignored)
```

There are **no tests, linters, or formatters** configured. The environment is Windows; the default shell is PowerShell (a Bash tool is also available). `node` and `python` are available; `pip` must be invoked as `python -m pip`.

## Deploy — push to `main` is publish

`.github/workflows/deploy.yml` runs `build.py` and publishes `dist/` to GitHub Pages (https://bugvayne.github.io/bireco/) on **every push to `main`**, plus nightly at 03:00 UTC and on manual trigger. There is no separate staging. Commit freely, but **only push when explicitly asked** — a push goes live. The nightly rebuild exists so news added through the admin panel get baked into static pages.

## Content lives in data files, not markup

- **`js/i18n.js`** — the EN/RU dictionary. Markup carries `data-i18n="key"` (sets `textContent`), `data-i18n-placeholder="key"`, or `data-i18n-html="key"`. To add/change visible text, edit the dictionary and reference the key from HTML — do not hardcode strings in `index.html`. `build.py`'s `translate()` honors `data-i18n` and `data-i18n-placeholder` (not `-html`), so prefer plain text keys for prerendered content.
- **`js/services-data.js`** — `window.SERVICES` (the 7 service cards) and `window.SAMPLE_NEWS` (fallback news). Each service's `full[lang]` is an array of blocks: `{ h: "heading" }`, `{ p: "paragraph" }`, or `{ list: [...] }`. This block format is rendered in **two** places — `renderFull()` in `js/main.js` and `render_full()` in `build.py` — and any new block type must be added to both or prerendered pages will diverge from the live page.

## News: source priority

`js/news-api.js` fetches from `SITE_CONFIG.APPS_SCRIPT_URL` if set; otherwise falls back to `window.SAMPLE_NEWS`. Since the backend URL **is** configured in `js/config.js`, the live site shows news from the Google Sheet, and `SAMPLE_NEWS` only appears when the backend is unreachable. To publish real news you add rows via `admin.html` (or the Sheet's `News` tab); editing `SAMPLE_NEWS` does not change the live site. Sheet columns: `id, date, title_en, title_ru, summary_en, summary_ru, body_en, body_ru, image` (dates `YYYY-MM-DD`).

## build.py mirrors the client render

`build.py` reads `js/i18n.js` and `js/services-data.js` directly (regex + `json5`), uses `index.html` / `news.html` as templates, fetches live news from the Apps Script URL (falls back to `SAMPLE_NEWS`), and writes `/`, `/ru/`, `/news/<id>.html`, `/ru/news/<id>.html`, and `sitemap.xml`. The functions `service_row_html`, `news_card_html`, and `render_full` intentionally duplicate the HTML structure produced by `js/main.js`. When you change that DOM structure or CSS class hooks in the client JS, update `build.py` to match. The base URL is the `SITE` constant at the top of `build.py` (also referenced in `robots.txt`).

## Config and per-deployment settings

`js/config.js` holds `APPS_SCRIPT_URL`, `RECAPTCHA_SITE_KEY`, `OVERVIEW_VIDEO_URL`, `CONTACT_EMAIL`, `LINKEDIN_URL`. Backend secrets (`ADMIN_TOKEN`, `RECAPTCHA_SECRET`, `NOTIFY_EMAIL`, `CV_FOLDER_ID`, `IMAGE_FOLDER_ID`) live in Apps Script **Script Properties**, not in the repo. After editing `apps-script/Code.gs`, a redeploy as a **new version** in Apps Script is required for changes to take effect (it is not deployed from this repo).

## Forms & admin (backend behavior)

A single contact form (modal on Services/CTA, inline in the hero) posts JSON to Apps Script as `text/plain` (avoids CORS preflight). The Careers "Send CV" button reuses it with extra profile/CV-upload fields; uploads go to Google Drive and a link is written to the `Leads` sheet. Spam defense: reCAPTCHA v2 (server-verified) + honeypot field + rate limits (`LEAD_LIMIT_*` in `Code.gs`). Admin auth is a 2-hour sliding session (`SESSION_TTL_SEC`); the `ADMIN_TOKEN` is sent only at login, then a session id is used. Sheet writes are guarded by `LockService`.

The admin news form (`admin.html`) can either upload an image file directly or accept a pasted URL. Before upload, `js/admin.js` resizes/recompresses images wider or taller than 1600px to JPEG (quality 0.82) client-side via `<canvas>` (PNG/GIF are left alone) to avoid pushing raw phone-camera-sized files through the pipeline. The result is base64-encoded and sent to Apps Script, where `saveNewsImage()` in `Code.gs` decodes it, writes it to a Drive folder, makes it link-shareable (`DriveApp.Access.ANYONE_WITH_LINK`), and stores it in the `News` sheet's `image` column as a `https://lh3.googleusercontent.com/d/<fileId>` URL — same column/shape as a manually pasted link, so `js/news-api.js` and `build.py` need no changes. This URL format is not an officially documented Drive API — if Google ever changes how it resolves, the admin's URL field still works as a manual fallback. On `update`/`delete`, `trashOwnedImage()` moves the previously stored Drive file to Trash if it was one we uploaded (matched by the `lh3.googleusercontent.com/d/` prefix) and is being replaced or is no longer referenced, so orphaned uploads don't accumulate; externally pasted URLs are never touched.

## CSS

Single stylesheet `css/styles.css`; theme colors are CSS variables at the top (`--plum`, `--purple`, `--lilac`, ...). Section backgrounds alternate via `.section` / `.section.alt` — preserve the alternation when inserting new sections.

## Design & color rules

The brand palette is **violet/purple** (the client asked for purple in place of the original blue). The old names `--navy` / `--blue` / `--ice` were renamed to `--plum` / `--purple` / `--lilac` in the same change, so any pre-existing snippet using the old names is stale.

- **Backgrounds are low-contrast gradients, never flat fills.** `body`, `.section`, `.section.alt`, the header, the footer, cards, and the tinted chips all use gentle multi-stop gradients (plus a faint `rgba(109, 40, 217, …)` radial glow on sections). When adding a new surface, give it a gradient in the same spirit — a flat `background: <color>` will look out of place. Keep the delta between stops small; these are texture, not decoration.
- **No pure white section backgrounds.** The base `.section` gradient runs `#fcfaff → var(--bg-soft) (#f7f4fd) → var(--bg-soft-2) (#f3edfc)`; `.section.alt` runs `#ece1fb → var(--lilac) (#e8dcf9) → #dccdf7` and must stay visibly more saturated than the base, or the alternation disappears. Cards inside sections (`.approach-card`, `.service-row`, news cards, …) use `var(--card-bg)` — a near-white white→`#f9f5ff` gradient — so they still pop against the tinted section; that contrast is intentional, don't flatten it by lightening the section.
- **Don't let tint colors drift back toward gray.** If you introduce a new light tint, keep saturation high enough to read as "violet," not "light gray" — check it doesn't look like a desaturated neutral next to `--lilac`.
- **Buttons use the deep violet.** `--purple` is `#6d28d9` / `--purple-hover` is `#4c1d95`. `.btn-primary` is a `#7c3aed → var(--purple) → #5b21b6` gradient; `.btn-link` and other flat accents use `var(--purple)`. When adding new solid-purple UI (buttons, active states, focus rings), reuse `var(--purple)` / `var(--purple-hover)` — don't hardcode a lighter violet hex.
- **Decorative glow/shadow rgba values must track `--purple` / `--plum`.** Several shadows/gradients (logo mark, hero radial glows, CTA blur, focus rings, card shadows) hardcode the accent as `rgba(109, 40, 217, …)` and the shadow base as `rgba(59, 22, 104, …)` because CSS custom properties can't be used inside `rgba()`. If those variables change again, update these triplets to match or the glows will look mismatched against the solid buttons.
- **`--purple-light` (`#c4b5fd`) is a separate light accent**, used only for text/lines sitting directly on the dark plum hero/CTA background (`.hero .eyebrow`, `.hero h1 .accent`, scroll progress bar, news-card top rule). It's intentionally lighter than `--purple` — don't merge it with the button variable. `--plum-mid` (`#4a1d8f`) is likewise only the light end of the dark CTA/careers gradients, and `--plum-black` (`#0b0418`) only their dark start.
- **The dark blocks are near-black at the top of their gradient.** Hero, `.careers-box`, `.cta-box`, `.page-hero` and the footer all start from `--plum-black` so the page reads deep rather than mid-violet. The hero's texture comes from `.hero-glow-decor` — a stack of radial gradients (violet/fuchsia glows plus almost-black corner blobs) that slowly drifts via `heroGlowDrift`; it replaced the old white line grid, so don't reintroduce a grid pattern there.
- **`--accent` (`#c026d3`, fuchsia) is the secondary chart color**, paired with `--purple` and `#a855f7` in the decorative dashboard (bars, donut). It is not a UI color — don't use it for buttons or links.
- **The decorative dashboard has no green.** Its "positive" signals — the Live dot, the `▲` KPI deltas, the highlighted last bar, the third window dot — use pink (`#ec4899` for text/dots, `#f472b6 → #f9a8d4` for fills) so the widget stays inside the violet/pink brand range. `#dc2626` for `▼` deltas stays. The real success/error colors elsewhere (`.form-status.success`, `.form-success`) are still green — that's semantic feedback, not decoration, so don't repaint those.
- **Per-card accent tints** (`--c` inline style on `.approach-step`, `.why-tile`, `.ind-tile`, and the `tint` field in `js/services-data.js`) are a fixed palette, one color per card. The Approach timeline is a deliberate magenta→violet ramp (`#a21caf, #9333ea, #7c3aed, #6d28d9, #5b21b6`); Why-us / Industries / Services keep a mixed rainbow (fuchsia, cyan, amber, emerald, rose, …) where only the "brand slot" tracks `--purple`'s current value (`#6d28d9`).
