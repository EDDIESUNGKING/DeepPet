DeepPet V8.65 — UX / terminology / first-reading / deworming update

Based on the full V8.64 app, preserving the original five onboarding PNG images, all 15 demo pets, New Pet, empty profile, 4 main tabs, existing charts, health records and existing Netlify configuration.

Changes:
1. Traditional Chinese navigation: 今日狀態 / 深入分析 / 健康管理 / 我的.
   Simplified Chinese: 今日状态 / 深入分析 / 健康管理 / 我的.
   English remains Home / Deep / Health / Me; Korean labels are localized.
2. Removed the unrelated "First visit? Try DeepPet in 60 seconds" tutorial button from all 15 existing pets' home pages.
3. New Pet alone displays "First Heart Moment · 60 seconds" until its initial simulated reading is stored; after that the button becomes "View result". Existing pets go straight to their heartbeat results.
4. Home score explanations clarify the score components based on the implemented model (physiology: heart/breathing, sleep, energy/activity; rhythm: calm, load balance, rhythm stability).
5. Deep date range choices and dates made clearer: Day/3D/7D/14D/30D in English; Day uses the selected date, not an incorrect Today label. Locale-specific readable date display; chart sample selection unchanged.
6. Health includes a concise pet-specific Upcoming care group linked to medication, vaccination and deworming record views, alongside the existing Today to-do list. No new duplicate care subsystem.
7. Deworming record now retains body weight at treatment and an optional dose used, with a weight-band display. The app does NOT invent dosage amounts or automatically prescribe medications.
8. Five onboarding PNG files intentionally unchanged: multilingual onboarding images remain a later task, as requested.

Testing: source-level syntax; 48 combinations of four main tabs x 4 languages x 3 phone widths; 15 existing pets no first-time CTA; New Pet before/after simulated reading; deworming record saved and isolated; 5 Deep ranges and historic day; four-language score consistency. QA_V865.json contains test results.

Limits: This is a simulation prototype. No real collar SDK, background notifications or production backend is attached. Public Netlify deployment and iPhone Safari device behavior were not tested in this container. Existing general-app strings may still require a separate comprehensive human localization pass; onboarding English wording was deliberately not changed.

Deploy: upload extracted folder containing index.html, app.js, styles.css, assets, netlify.toml, build.mjs. If using a Git-based Netlify deployment, build command is node build.mjs and publish directory is dist.
