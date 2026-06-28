# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bilingual (EN/RU) static marketing site for a BI consultancy (brand: **Bireco**), with a serverless Google Apps Script backend. No build step is required to develop — `index.html` / `news.html` are real, openable pages. There is no framework, bundler, or `package.json`; the JS is plain browser scripts loaded via `<script>` tags.

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

`js/config.js` holds `APPS_SCRIPT_URL`, `RECAPTCHA_SITE_KEY`, `OVERVIEW_VIDEO_URL`, `CONTACT_EMAIL`, `LINKEDIN_URL`. Backend secrets (`ADMIN_TOKEN`, `RECAPTCHA_SECRET`, `NOTIFY_EMAIL`, `CV_FOLDER_ID`) live in Apps Script **Script Properties**, not in the repo. After editing `apps-script/Code.gs`, a redeploy as a **new version** in Apps Script is required for changes to take effect (it is not deployed from this repo).

## Forms & admin (backend behavior)

A single contact form (modal on Services/CTA, inline in the hero) posts JSON to Apps Script as `text/plain` (avoids CORS preflight). The Careers "Send CV" button reuses it with extra profile/CV-upload fields; uploads go to Google Drive and a link is written to the `Leads` sheet. Spam defense: reCAPTCHA v2 (server-verified) + honeypot field + rate limits (`LEAD_LIMIT_*` in `Code.gs`). Admin auth is a 2-hour sliding session (`SESSION_TTL_SEC`); the `ADMIN_TOKEN` is sent only at login, then a session id is used. Sheet writes are guarded by `LockService`.

## CSS

Single stylesheet `css/styles.css`; theme colors are CSS variables at the top (`--navy`, `--blue`, `--ice`, ...). Section backgrounds alternate via `.section` / `.section.alt` — preserve the alternation when inserting new sections.
