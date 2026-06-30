# Production checklist

Snapshot from a full-site audit on 2026-06-30 (content vs. customer brief, architecture,
backend/endpoints, animations). Update or check off items as they're resolved — this file
isn't auto-maintained.

## 🔴 Blocking — must do before going live

- [ ] **Real contact info** — `js/config.js`: `CONTACT_EMAIL` is still `"info@example.com"`
      and `LINKEDIN_URL` is `"#"`. Both are live on the production footer.
- [ ] **About Us stats** — `js/i18n.js` `about.stat1/2/3` ("10+ years", "50+ dashboards",
      "7 domains") aren't sourced from the customer's brief. Confirm real numbers or remove
      the stat cards — as-is they're unverified factual claims on a marketing site.
- [ ] **Apps Script Script Properties configured** (not in the repo — confirm directly in the
      Apps Script project):
  - [ ] `ADMIN_TOKEN` set to a strong, non-guessable value
  - [ ] `RECAPTCHA_SECRET` set (if missing, captcha verification is silently skipped and
        forms are spam-exposed)
  - [ ] `CV_FOLDER_ID` and `NOTIFY_EMAIL` set as intended for production
- [ ] **Deploy the latest `apps-script/Code.gs` as a new Apps Script version** — the admin
      login rate-limiting, constant-time token check, and reCAPTCHA fail-closed handling
      (added 2026-06-30) only take effect after a redeploy; pushing to `main` does not touch
      the Apps Script backend.
- [ ] **Real news content in the Sheet** — `SAMPLE_NEWS` (fallback only) is dated
      2026-04-20 → 2026-06-22, already in the past. Make sure the live Google Sheet has
      current news before launch, or "Insights" looks stale on day one.

## 🟡 Should fix — correctness/quality, not strictly blocking

- [ ] **About text2 missing paragraph** — `js/i18n.js` `about.text2` (EN+RU) is missing the
      brief's closing paragraph ("Whether you are improving financial visibility,
      strengthening operational performance, or preparing for future growth...").
- [ ] **Watch overview video** — `js/config.js` `OVERVIEW_VIDEO_URL` is empty; the button
      currently just scrolls to Services. Add the real video URL if one exists, or confirm
      the scroll-fallback is the intended final behavior.

## 🟢 Nice to have — cleanup/polish

- [ ] Remove the stray `.pptx-preview/` directory (leftover artifact, not gitignored).
- [ ] Decide on the final production domain — `build.py`'s `SITE` constant, `robots.txt`,
      and canonical/OG URLs all still point at `https://bugvayne.github.io/bireco/`. Update
      once a custom domain (matching the Clear Metrics brand) is live.
- [ ] Get explicit customer sign-off on the shortened/paraphrased industry and
      "Why Choose Us" card copy — close to the brief in meaning but not verbatim.

## ✅ Already fixed (2026-06-30 audit)

- [x] `index.html` hardcoded fallback text (hero, industries, About Us) synced with
      `js/i18n.js`/customer copy
- [x] `build.py` `service_row_html`/`news_card_html` now emit the same `.reveal`/
      `--reveal-delay` markup as `js/main.js`, so prerendered pages animate consistently
- [x] Admin login rate limiting added (`Code.gs`, lockout after 10 failed attempts / 15 min)
- [x] Admin token comparison switched to constant-time (`Code.gs`)
- [x] reCAPTCHA verification now fails closed on non-200/unparseable responses (`Code.gs`)
