DeepPet V8.60 — Netlify deployment and change report

Deploy: Unzip, then upload the complete directory containing index.html, app.js, breed-catalog.js, styles.css, assets/, and netlify/ to Netlify. For a Git-connected deployment netlify.toml builds the dist/ directory via node build.mjs. Do not upload index.html alone.

ONBOARDING
- Five latest supplied DeepPet poster assets are preserved under assets/onboarding/latest_originals/page_01..05.png and adapted to portrait images.
- 25 localized stills (5 pages x zh, zht, en, ko, ja) are under assets/onboarding/<locale>/intro_XX.webp.
- The foreground headings, subheads, benefits and Get Started control are localized. IMPORTANT: the original posters include illustrative English labels within their miniature app screenshots. Those pixels are still present in the localized adaptations; they are not a fully translated screenshot. Replacing the source screenshots with screenshots of the current live APP would be required for strict pixel-level localization.
- Each full refresh/page open shows the five pages; internal navigation does not reopen it. Get Started is only on page five.
- First page and APP language automatically map from the device's first preferred language: zh-CN/zh-SG => Simplified Chinese, zh-TW/HK/MO or Hant => Traditional Chinese, en => English, ko => Korean, ja => Japanese, other => English. Settings > Language persists a manual override across reloads.

DEWORMING
- Health > Deworming Records (driven by data-action=health-detail data-page=deworming).
- Unique localStorage-backed records for each pet index with brand/product, internal/external/both, treatment date, next reminder date, optional notes, add/edit/delete and confirmation.
- Fifteen built-in demo pets have different sample brand, date and reminder rows. Newly added pets and New Pet start with none.
- Next date is an IN-APP reminder, not an OS push notification when the site is closed.
- No automatic deworming dosage is provided. Doses are species-, weight-, product- and clinician-dependent; user records what was actually used.

TEST EVIDENCE
- JS syntax checks, Netlify static build, on-disk dependency checks, 25 localized image decode tests, Node VM logic tests for device locales and pet-specific CRUD/isolation: passed.
- Browser end-to-end could NOT be completed in this current execution runtime: Chromium navigation was blocked by administrator for both http:// and file://. Public Netlify and iPhone Safari tests NOT performed.
- Existing legacy submodules were not exhaustively retested. Treat this as a deployable update, not a claim of 100% full-app QA.
