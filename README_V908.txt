DeepPet Version 9.08 — Startup, calendar, status and chart interaction fixes

HOW TO DEPLOY
1. For Netlify Drag & Drop, use the Static_Direct_Upload ZIP and unzip it to a folder, then upload the folder contents as a static website. Alternatively connect the complete source to Netlify and run node build.mjs, publish dist.
2. The complete source ZIP includes editable HTML/CSS/JavaScript, optimized high-resolution assets, and build.mjs.
3. Use a clean deployment or refresh once after replacing the previous version; the generated CSS and JS bundles have content-hashed filenames.

WHAT CHANGED
- Retains the V9.07 startup hardening: lazy/high-resolution onboarding image loading, lighter bundled JavaScript, Milo as first pet, and a visible retry UI if startup scripts fail.
- Four status labels for displayed health score/risk: 健康 / 輕風險 / 中風險 / 高風險 (Simplified: 健康 / 轻风险 / 中风险 / 高风险; English: Healthy / Low Risk / Middle Risk / High Risk). Score cutoffs remain >=90 green, 80–89 blue, 60–79 orange, below 60 red.
- Heart/breathing 7-day and 30-day detail periods use the same full-fill colored calendar with white check for healthy days, or a white indicator for a nonhealthy tier.
- Sleep 7-day/30-day details also use the same calendar. When selecting a day, the interactive sleep plot and green/gray half-hour rest track share a common axis and synced selected slot.
- Energy 7-day/30-day cards now open a dedicated calendar overview via View detailed data; selecting any day opens the corresponding day graph, which has hover/tap exact readings. Recovery and rest/steadiness retain score trends rather than redundant calendars.
- All heart/breathing/energy full-day and zoomed daily charts have date, minute and exact (one-decimal) demo reading on pointer hover or tap, with cursor. Energy's period daily-score trend has interactive day-level scores.
- Energy's day-to-day score variation is computed deterministically from recorded demo activity/rest variation, not randomized. Main composite and category scores continue to be mathematically consistent with their children. Rest/steadiness explanation cites RMSSD/SDNN from the same valid days.
- The 14-day individual health baseline remains available; it is not a Deep analysis time-range option. Deep only offers single day / 7 days / 30 days.

VERIFICATION
- Bundled asset load: five onboarding slides decoded at original 941x1672 resolution; Get Started enters Milo Home; four primary tabs and three Deep periods open with no JS errors or missing resource errors.
- 135 score/card checks: 15 example pets x 3 Deep categories x 3 ranges, zero average/tier/size/overflow mismatches.
- 72 calendar and per-day pointer-readout checks on 15 example pets for 7-day (and three representative pets for 30-day), no mismatched score/reading or script exception.
- 36 language/pet/category/range UI combinations, no blank content/JS errors; interactive heart 7-day, energy 30-day, sleep 30-day, navigation back paths and sleep synchronization sampled.
- Explicit status text scan across four pages and Deep tabs in Simplified Chinese and English found no obsolete displayed 'Normal' / 'Low concern' / 'Moderate concern' / 'High concern' labels in sampled screens.

LIMITATIONS
- Demo data only. The waveform circles and numerical readings are synchronized to the same simulated signals, but are NOT clinically validated apnea, arrhythmia, cardiac arrest or sudden death detection.
- Real Bluetooth / 4G collar SDK, live GPS, device-to-device messaging, payments, and external persistence cannot be end-to-end validated in this offline browser build.
- Absolute zero loading latency cannot be guaranteed across all phones/networks; measured times are local Chromium rendering times.
