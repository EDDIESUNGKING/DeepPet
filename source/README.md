# DeepPet V10.101 — Complete interactive WebApp source

## V10.101 — Data correctness, wording consistency and local stability
- **Date and pet continuity:** each new app session opens Home, and its next Deep daily view defaults to the *current local day* even if the last session ended on a historic date. Explicit date choices still persist while the app remains open. Entering Deep from another bottom tab resets to Today instead of silently reviving a previous date.
- **Multi-tab edit protection:** the current browser tab remembers the exact local record it opened. If a second tab has saved a newer version, the older tab refuses to overwrite those pet and health records, and asks the owner to reload. Identical rerenders skip unnecessary localStorage writes. Local quota errors return a failed save and show a warning; transactional record editors retain their existing rollback behavior.
- **Same names across current and fallback views:** both the data-rich and data-empty Heart & Breathing cards use **心跳狀況 / 呼吸狀況 / HRV / 心搏節奏穩定度**. Older fallback labels and preventive advice accessibility text now use the same wording. Health's large heading remains **預防性健康管理**, with the separate smaller **個體化健康建議** heading.
- **Truthful 60-second tour:** correct the always-on shorthand to **24/7**. Step 1 keeps its original BCG and second-by-second description, but labels runtime as product-specific targets (**Bluetooth >5 days; 4G 2–3 days**) that depend on usage. Step 4 distinguishes the score-and-age-based AI age estimate from the real use of weight/age for preventive guidance and exam references. Stages 2 and 3 remain unchanged. In this V10.101 build, these statements supersede V10.100's historical 3–5-day promotional text below.
- **Showcase and scope:** the same 15 demonstration pets, Lucky, blank profile, payment demonstration, data fixtures, score coefficients and four main tab structures are retained. Nothing here introduces actual heart or breathing readings for an unpaired owner pet. These are browser-local conflict guards, **not** a cloud multi-account database: account-scoped data synchronization, server concurrency, hardware/battery validation and mobile-device visual acceptance still require their respective production systems.
- Added targeted V10.101 regression checks for session date defaults, second-tab lost updates, redundant writes, storage quota failures and naming parity. All **59/59** automated QA scripts pass.

## V10.100 — Date continuity and concise onboarding promise
- An actual reading is now joined to its **pet identity and ISO calendar date**, not a calendar-grid offset. This repairs sparse-data lookups in the daily detail explanation, historical comparisons and period score cards; unobserved dates remain unscored rather than borrowing another day.
- The deep analysis 7- and 30-day score ring, date stamp, evidence count, explanatory copy and HRV evidence all use the same **window ending on the current local date**. Choosing an earlier single day no longer silently changes a different 7-/30-day metric window. One-day choices still use that exact historical date.
- A deliberately chosen date survives a local midnight rollover, while an automatically selected Today advances with the calendar. Changing pets or selecting a blank profile also clears the previous pet's alert focus/minute, date detail, navigation return point and explicit-date flag.
- Home's remaining legacy heart/breath alert entry points now set the exact waveform minute and remember the source page, consistent with the current emergency cards; ordinary Deep waveform navigation clears these breadcrumbs.
- Only the **60-second onboarding Step 1** receives the requested competitor-interval/second-by-second/power-management/3–5-day statement alongside its existing text. **Step 4** now explicitly combines actual weight, age and routine with the first three steps and names the complete score and AI-estimated biological age. Step 2 and Step 3 copy is retained.
- All earlier V10.99 fixes, four tabs, 15 demonstration pets, Lucky and completely blank profile, and simulated checkout remain intact. Added focused day-switch/pet-switch/rollover regression tests; no new physiological readings or payment semantics are introduced.

## V10.99 — Exact alert landing, plain-language causes, mobile report labels
- Home urgent heart/breath alerts open the **selected date and minute** in the existing waveform detail and scroll to **全天波形與變化時段** (the full-day curve), with a red focus boundary. The detail's Back arrow returns to Home when the alert originated there.
- When heart and breathing fall together, the combined alert opens heart first, preserves the exact event time and presents a direct switch to the simultaneous breathing curve. Legacy activity-event navigation scrolls to its own activity changes and offers Back to Home.
- Severe/mid-level cardio (heart/breath/HRV/rhythm), sleep and Energy & Recovery (energy/recovery/calm) scores now identify their strongest **measured inputs**, show the actual day/value, a same-context reference and the percentage difference, and explain the degree of concern. Seven- and thirty-day descriptions include observed affected dates; details distinguish evidence from a medical diagnosis. If verification is missing, the app states so rather than guessing a cause.
- Sleep descriptions make clear why long rest and just two night interruptions cannot by themselves guarantee a high score; duration, quiet share, night breathing and motion changes are considered only if their verified model inputs exist.
- Exam labels use fixed single-line wording on compact widths; the 70px report score does not wrap its risk label. HCT/AST and other known lab abbreviations are accompanied by the Chinese name and, when present, the measured result and applicable reference interval. Same-day independent reports remain separate in explanations.
- Sleep's 7-/30-day **期間重點** and accompanying copy use regular font weight. Home Today To-do presents shorter, simpler reasons and prioritizes concrete changed indicators instead of an opaque score threshold.
- Preserved the four-page app architecture, all fifteen gallery pets, Lucky, true blank identity, owner-only sensor rules, canonical Health card order and simulated checkout. Automated suite: **57/57 passed**. Browser screenshot/touch and real-device verification are still required in an unrestricted environment.

## V10.98 — Date-safe owner readings and identical empty Sleep structure
- The 15 showroom pets, their generated physiology, histories, portraits, scores and simulated checkout are unchanged. Main navigation and Health Management section order are unchanged.
- Real collar score explanations, day heart/respiration and period HRV (RMSSD/SDNN) are all keyed by **pet + date**. Sparse verified history can no longer be indexed by its calendar position.
- Verified heart/breath readings appear in Heart Moments even when the composite wellness score is still N/A; no waveform or composite score is invented.
- A browser with language/settings saved but no owner-created pet opens the completely blank profile. Explicitly selected gallery pets stay selected on subsequent visits.
- Empty Single-Day Sleep keeps the scored page's dotted score component, alert, previous-night comparison, quiet-rest wave container and 32 half-hour slots, replacing measurements with N/A.
- For **real verified owner days only**, cardio aggregates heart/breath 50/50, and Energy & Recovery aggregates its three metrics equally. Safety alert caps and the separate HRV/rhythm scores remain in force; showroom fixture weights remain untouched.
- The explanation for favorable cardio/energy scores refers to the selected interval instead of unconditionally saying four weeks.
- Node regression tests cover the fixed date map, owner partial-score states, gallery formula preservation and empty-Sleep structural contract. Browser screenshot, BLE/4G hardware and AI image-service tests still require a suitable live environment.

## V10.97 — First-time blank → profile-only N/A → verified data, one layout
- A new browser session now opens the true **空白檔案** instead of silently selecting Milo. All 15 distinct gallery pets and Lucky remain available in the selector and keep their existing fixtures and records.
- A newly registered pet has a genuine profile but **no physiological score** (`null`, not an invented 0). There is no browser-fabricated first 60-second measurement. Only a verified, identity-bound 20 Hz collar day with eligible wear, coverage and time continuity can cause the measured state.
- A verified day clears every stale new-pet/free-care flag (including saved overrides), survives reload, immediately re-renders the active pet and promotes its Deep page to the existing measured component. A valid partial day does not need a completed composite score to use the measured **layout**; missing metrics still show N/A.
- The Home empty Today To-do state now shares its spark icon, brown focus-watch color, count typography and spacing with Lucky/Blank. The Health page uses one renderer and the same section order, card/action icons and report buttons. Only **體檢分析** may contain the fixed 70px dotted exam score; **健康管理** has no large progress circle.
- Blank Health subpages now run the same detail component in an isolated empty identity instead of a generic obsolete template. Blank Me retains the measured layout's buttons and icons while actions that require a pet open profile creation.
- Deep Heart & Breathing reuses the four current metric cards (**心跳狀況 / 呼吸狀況 / HRV / 心搏節奏穩定度**); Energy & Recovery reuses the three current cards (**精力情況 / 恢復情況 / 放鬆與平穩度**). Sparse owner data is matched by **date**, not by array position, and missing values remain N/A.
- Regression: `node --test --test-reporter=dot tests/qa*.js` covers the earlier suites plus the V10.97 lifecycle, no-data parity and route guards. Local Chromium is blocked by the execution environment (`socket() failed: Operation not permitted`); physical-device and pixel-level browser acceptance is still needed before a claim of complete visual verification.

## V10.96 — Home Today To-dos parity and an Exam-only bounded score ring
- The current measured Home uses a `focus-watch` Today To-dos header with a `spark` icon and brown `#8d573b` text. Lucky and the completely blank profile now render the same card class, header row, icon, color, counter and padding; only their personal task list is empty. No separate green `focus-steady` template is used for their empty state.
- Canonical Health renders exam scores with the independent `dp1096-exam-score` component. A valid 0–100 exam score has exactly 54 proportionally lit dots inside a fixed 70×70 px SVG, contained within **體檢分析**. A pet with no exam score has no score-circle SVG. No completion ring is part of the **健康管理** action list.
- The final Health post-render guard removes all legacy `dp916-large-score`, `dp-dot-meter`, and `dp1092-exam-ring` artifacts, including ones previously surviving inside the Exam card. The new component is not removed.
- `tests/qa_v1096_todos_and_exam_geometry.js` executes the Home factories for a measured pet, Lucky and the entirely blank profile; checks icon and color parity; verifies ring bounds and simulates cleanup of seven legacy ring classes. All earlier regression suites are retained.
- Tested with Node automated QA; this environment cannot launch Chromium for real mobile screenshots and touch inspection. See the companion Word report for exact test scope and remaining physical-device acceptance checks.

## V10.95 — Shared Deep metric factories and final Health post-render checks
- Missing-data Heart & Breathing and Energy & Recovery cards reuse the measured page's 4-metric and 3-metric factories; missing readings do not reintroduce old standalone labels.
- Missing-data 7-day/30-day Sleep uses the current calendar and day-detail structure, not the retired compact blank-period template.
- Canonical Health action sections remain consistent across measured pets, Lucky and the blank identity.

## V10.92 — Unified Health layout and corrected examination score position
- Removed the remaining old prevention branch for real and unmeasured pets. All overview states now use the exact same `dp941-prevention` component, with small heading **個體化健康建議** and large heading **預防性健康管理**.
- Removed obsolete heart/breath condition tiles, cardiopulmonary trend/observation actions, and the old Health plan-completion card injection route.
- Preserved the fixed sequence: prevention, examination, upcoming reminders, Health Management. Eight management entries retain their original navigation and data; only the content state varies by pet.
- An assessed examination shows its colored dotted score ring inside **體檢分析**. Missing scores preserve the examination layout without showing a misleading circle or `/100`.
- `tests/qa_v1092_health_unification.js` executes the actual V9.41 prevention and V10.75 canonical renderers together for Milo, Lucky, completely blank, four scored tiers and a measured pet without an exam.

## V10.91 — Final-layer identity checks, clean new profiles and validated data entry

- **Final displayed scores use actual pet identities.** The late-loading research score adapter no longer falls back to pet names when given a detached profile object. Only a real pet entry or the privately marked current profile can select a pet's measured or gallery scores. Two equal display names and a renamed profile remain isolated.
- **New owner pets have no inherited gallery vitals.** The add-pet workflow builds a clean profile from the owner's inputs; it does not spread Luna/Nori or leave behind their heart rate, breathing, rest or recovery reference values. All biometric fields begin unmeasured.
- **The full examination editor validates complete reference ranges.** One blank bound and one numeric bound now stop saving with an actionable message; two blank bounds remain a legitimate unscored report, and zero is an allowed numeric boundary.
- **Medication plans require integer day counts and valid times.** The import form now uses the same schedule guards as the edit form, preventing fractional-day courses and invalid appointment times.
- **Owner pet names render as text.** The no-collar Deep message and detailed waveform header escape name markup, closing two user-controlled HTML injection paths while preserving genuine names.
- `tests/qa_v1091_release.js` exercises the final score override, strict new-pet isolation, examination save behavior, and saved-name escaping; previous test suites are retained.

## V10.90 — Identity-safe scoring, unavailable values and unified score rings

- **Names are labels, not identity keys.** A selected-pet marker is attached non-enumerably to the temporary display profile. Two distinct pets named identically can no longer inherit one another's current-day score. Gallery summaries retain their own numeric fixture when requested separately.
- **New profiles without measurements remain unscored.** A fresh or free-care pet is not shown as a red 0/100 merely because its legacy template contains a zero placeholder.
- **Unified score validity.** Color scheme, grade text, summary composites, all three dotted score-ring renderers and rhythm risk labels now share the same finite 0–100 data gate. Empty strings, whitespace, invalid imports and out-of-range numbers display as unavailable; a genuine measured zero remains zero.
- **Laboratory bounds treat blanks as blanks.** A whitespace-only reference field is never silently parsed as numeric zero when the opposite end of the interval is present. Explicit zero and negative numeric bounds remain valid.
- `tests/qa_v1090_release.js` covers same-name pet isolation, fresh-pet placeholders, four exact scoring bands, empty versus zero score displays, and incomplete reference intervals; all earlier regressions are retained.

## V10.89 — Transactional social data, safer presentation, profile image escaping

- **Friend requests and approvals are saved atomically.** When local storage rejects a write, neither the pending request nor either side of a friendship remains falsely accepted in memory; a success message is shown only after the write succeeds.
- **Both conversation inboxes commit together.** Sent text, compressed photos and audio messages are mirrored between gallery pets only if the entire local save succeeds. Failed writes roll back both messages; failed read receipts also roll back.
- **Owner-authored text is not marketing copy.** The final display-copy cleanup recognizes the pet name and saved care/chat fields. It preserves those exact user-written values even if they contain words such as “Demo”, while continuing to clean static presentation labels.
- **Dynamic portrait URLs are escaped.** Profile, friends, nearby-pet, chat, onboarding tour and weekly-story images cannot break out of their HTML `src` attributes through embedded quote characters.
- `tests/qa_v1089_release.js` checks quota-failure rollback, successful two-sided conversations, preserved owner text and image-attribute escaping. Existing regressions still run unchanged other than release-version expectations.

## V10.88 — Language accessibility, export integrity, reproducible build

- **Korean is selectable.** Korean browser language now loads the existing Korean UI rather than English. The Me language picker, stored language preference and both change-language actions accept `ko` alongside Traditional Chinese, Simplified Chinese, English and Japanese.
- **Intentional empty translations stay empty.** The translation getter no longer turns a deliberately blank presentation label into its raw internal key when falling back through the language dictionaries.
- **Veterinary summaries retain appropriate health cautions.** A printed or downloaded veterinary report now uses neutral health-record language with an explicit non-diagnostic warning in all five locales, without inconsistent showroom labels in the report header, notes, empty-record helper text or footer. User-entered diagnoses, lab values, medicines, notes and dates are not rewritten.
- **The shipped source rebuilds.** `build.mjs` resolves large artwork in the release root, tests image paths against that canonical runtime, includes complete assets in `source/dist`, and updates both the runtime root and source build together. The original package's `source/` folder alone was missing binary assets and failed to compile.
- `tests/qa_v1088_release.js` verifies the five-language gates, explicit-empty translations, export sanitation without record deletion and rebuild inventory. Older release tests remain in place.

## V10.87 — Clean presentation copy, preserve the complete animated experience

- **Restored the full waveform experience.** V10.87 returns to the V10.85 streaming waveform behavior, without V10.86's special 20 Hz unavailable placeholder, owner-pet animation shutdown or conspicuous illustrative-wave labels. The WebApp is a presentation prototype as the product owner intended.
- **No demo/simulation words on customer-facing screens.** A final presentation-language pass removes the relevant visual tags from Home/Deep/Health/Me, details, SVG labels, live toasts, input hints and late-rendered modals in simplified Chinese, traditional Chinese, English, Korean and Japanese. It operates only on UI text and accessibility labels; JS event keys, score modules, record flags and source names are untouched.
- **No redundant presentation ribbon.** The old Health detail ``demo-ribbon`` is no longer created; device, garden, report and disclaimer localization keys use normal customer-facing language while keeping veterinarian-care warnings.
- **Fixed actual time corruption in Heart Moments.** A moment at 00:00 no longer jumps to 12:00, and 23:59 is no longer clamped back into the day. Each available preceding/following 12-minute interval is evaluated independently; unobserved adjacent-day readings remain unavailable.
- **Preserved the meaningful V10.86 null-value fix.** The moment editor no longer renders JavaScript `Math.round(null)` as a misleading zero, while the poster, share and export already use dashes for unavailable measurements.
- **Preserved all showroom assets.** All 15 gallery pets and their differentiated care records, all acute events independent of scores, full graphical waves, score colors, four tabs and Bluetooth-health versus 4G-location split remain intact.
- `tests/qa_v1087_release.js` checks language cleanup, no-change data/event behavior, real-time wave preservation, midnight and late-night moment boundaries, editor nulls and release integrity, in addition to the 43 preceding regression suites.

## V10.85 — Honest unknowns in events, quiet breathing, 24-hour trends and saved moments

- **No false all-clear:** an empty Heart & Breathing Moments list no longer declares a pet near-normal or physiologically steady. Without 120 paired, positive heart and breathing minutes the UI states that a conclusion is unavailable; with sufficient observation but no highlighted moments it says only that no moment was flagged, not that emergencies are impossible.
- **Quiet breathing needs real values:** the single-day calm-breathing percentage excludes zero/non-finite respiratory data, negative/unknown movement and sparse fragments. It requires at least 120 observed quiet-motion minutes, 90 positive breathing samples and 80% paired coverage before summarizing.
- **Moving/resting comparison excludes sensor dropouts:** zero/invalid heart and breathing signals cannot become resting averages and produce artificial movement differences.
- **Honest 24-hour SVG:** each hourly heart/breath/movement summary requires 45 genuinely paired positive respiratory/cardiac minutes. Missing hours appear as gaps, with an explicit count; fewer than two usable hours do not produce an invented chart.
- **Saved Heart Moments no longer become 0 bpm or 0 breaths/min:** a previously saved moment with missing historical raw measurements remains saved, but its before/after readings display an em dash and do not claim a calm or sudden episode without paired evidence. The export/share text follows the same rule.
- **Preserved business logic:** all 15 showroom profiles, rich medicine/vaccination/lab/food/activity examples, four tabs, gallery photos, score formulas, independently timed sudden events and Bluetooth-vs-4G features remain unchanged. No live SDK or mobile pixel-level validation is claimed.
- `tests/qa_v1085_release.js` checks missing-versus-observed event messages, zero/sparse breathing, invalid movement comparisons, 24-hour gaps and SVG finite values, archived Heart Moments, and byte-for-byte unchanged emergency alert modules. All preceding tests are retained.

## V10.84 — Past-session integrity and honest activity insights

- **Historical time-alone sessions now use their own dates:** the solo-period calculation no longer checks today's signal quality before reading a saved historical interval. Each selected day reads that pet's corresponding 1,440-minute channels from the existing provenance-aware bridge.
- **Actual minute coverage for solo analysis:** heart, breathing and motion must be present together and finite; heart and breathing must be positive. At least 80% of the particular solo session must have paired minute evidence before showing a stable-percent or cardio-change count. Short or incomplete sessions show "—" for both, instead of implying a reassuring 0 or high score.
- **Cross-midnight session windows:** the selected local minutes are assembled across their actual calendar days, so a session from 23:00 to 01:00 uses sixty minutes on each day. The session duration still comes from the real start/end timestamps, not a fabricated calendar-day record.
- **Seven-day vitality is no longer invented:** a pet with zero movement records or fewer than three days of usable activity cannot be told that 00:00–02:00 was "usually" the most active time. The function also rejects invalid minutes and excludes charts with no meaningful movement.
- **Scope preserved:** the 15 showroom pets and their abundant example medication, vaccination, exam, food and activity records remain untouched. Daily score bands and independently timed sudden cardiac/respiratory events are not coupled. The Home/Deep/Health/Me layout, app labels, source photos and SKU distinctions remain unchanged.
- `tests/qa_v1084_release.js` exercises cross-midnight history when today's quality is unavailable, 50% sensor coverage, full coverage, missing pet/day channels, zero-activity seven-day cases, fewer than three observed days, and a positive seven-day example. The complete historical regression suites remain included.

## V10.83 — Overnight measurement integrity and 24-hour chart accuracy

- **Unified overnight window:** the Night Guardian's quiet heart-rate and breathing summary now uses 21:00 the previous day through 08:00 of the selected day, matching the existing overnight respiratory curve and longest-rest analysis. The former 20:00–12:00 implementation included unrelated morning observations.
- **No fake quiet readings:** a quiet overnight summary requires valid, positive heart and breathing samples, observed movement and rest classification, plus 60 valid quiet minutes. Without these, the UI displays an em dash rather than a falsely precise nightly value. The respiratory timeline no longer silently substitutes awake readings in empty rest intervals: it leaves honest chart gaps and needs at least three hours of usable quiet breathing in total.
- **Consistent missing-data inspector:** tapping a missing half-hour reads as unavailable without drawing an off-chart or false zero cursor dot. The steadier-rest interval also excludes missing/zero heart or respiratory samples.
- **True 24-hour axes:** the daily event chart plots 24 distinct hourly averages at the centers of their hour intervals. The former 25th hourly sample at 24:00 was a duplicate of 23:00–24:00 and manufactured a flat ending.
- **Explicit scope:** all gallery pets, medication/vaccine/exam/food histories, emergency events and their score independence, main navigation and existing theme remain unchanged. These are integrity fixes for charts and rest summaries, not new medical diagnoses or actual SDK validation.
- `tests/qa_v1083_release.js` dynamically covers the overnight boundary, wrong-window contamination, no-rest/zero-coverage behavior, chart gaps, cursor behavior and duplicate-hour regression, in addition to all 40 previous suites.

## V10.82 — Dated Heart Moment navigation and event source integrity

- **Fixed the dated-event-to-Heart-Moment jump:** selecting a historic acute event now passes its exact pet identity, visit epoch, calendar date and waveform minute through the modal, poster, share/export summary and save action. A later saved moment or today's selected index can no longer replace that historical event.
- **No incorrect duplicate or cross-pet save:** saving the focused event again is idempotent and never inserts an unrelated current-day event. Switching pets, including leaving and returning to the same pet, invalidates the stale moment context. Opening Heart Moments normally starts from its existing default view instead of inheriting the previous abnormal-event selection.
- **Source and score preservation:** gallery scores, sudden-event detection, presentation copy, image art, all 15 pets and health histories remain unchanged. An acute event remains independent of a high or low health score.
- `tests/qa_v1082_release.js` dynamically checks the exact date, minute, poster source, share and save behavior as well as cross-pet isolation; the full historical regression suite is retained.

## V10.81 — Complete image-path and release-identity audit

- **Restored 13 live illustration paths:** the five full-screen onboarding pictures, five feature/nearby-pet scenes and three approved walkthrough images were stored one directory deeper than their actual HTML/CSS/JS references. The build now restores those exact images at their publicly referenced paths, preserving the original art and existing UI without redesigning anything.
- **Canonical version after every screen render:** the last renderer writes the version from `VERSION.txt` after all retained historical UI modules have run, so their older badge text cannot survive on the visible Me screen. No changes to gallery score math, emergency generation, personalized data or care records.
- **Asset regression:** `tests/qa_v1081_release.js` verifies the 13 restored aliases are byte-identical to the artwork, audits literal compiled image paths and confirms the final version badge. Run this after `node build.mjs`; it is included alongside 38 previous suites.
- Browser screenshot/pixel alignment and real-collar SDK testing are still independent acceptance steps.

## V10.80 — Emergency chronology and legacy-version safety

- **Newest first, without score assumptions.** Home now sorts verified second-stamped events and the 15 showroom minute-stamped episodes by actual occurrence time, newest to oldest. Its three-row preview no longer hides a newer incident behind the More action. A high daily score never suppresses sudden events, and a low score never manufactures them.
- **One stable Home layout.** The emergency card stays immediately above Today's Summary whether there are many, one or zero qualifying episodes. Expanding More automatically resets when switching pet, viewing a blank profile or entering a new local day.
- **Removed eleven unused legacy wrappers** whose only runtime effect was repeatedly rewriting older footer/version metadata; one also exposed an unused terminology-check helper. The V10.23 examination review navigation remains intact, as do the score engines, language branches, representative gallery data and all care records. The production bundle still has exactly one version-hashed JavaScript and one CSS entry.
- `tests/qa_v1080_release.js` adds independent checks of mixed minute/second chronology, duplicate suppression, the no-event card position and retired wrappers. Browser-level screenshot inspection and real-device SDK behavior still require a capable host and physical test.

## V10.79 — Sudden events are independent of long-term score

- **Corrects the mistaken V10.78 gating.** A pet with an otherwise high historical health score can have an isolated sudden heart or breathing episode. All 15 showroom pets now retain a separate deterministic, time-stamped acute waveform example regardless of their daily-score band. The five stable pets are no longer categorically excluded from sudden events.
- Low-score gallery profiles still have several distinct minute-linked examples, while medium and stable profiles retain independent timed examples. An alert is generated by the waveform detector from heart/breath/movement series; it is never created or suppressed directly by the score.
- The alert scenario cache marker changes to `v1079-score-independent-acutes` so a previous no-event result from V10.78 cannot survive a version update. Blank/new and real-device profiles remain isolated from simulated showroom waveforms.
- The full rest/sleep channel, profile photos, navigation and Health page fixes from V10.78 remain intact. The revised dynamic regression tests explicitly compare high-score and low-score alert detection using identical waveforms and require score-independent outcomes.

## V10.78 — Healthier showroom scenarios and unified pet portraits

- The five healthy or broadly stable gallery profiles (Milo, Luna, Nori, Max, Bella) no longer receive the legacy automatically injected acute event. Intermediate examples retain one timed event; all seven severely low-score examples retain multiple distinct, independently waveform-detected episodes. This is a deliberate demonstration scenario assignment, **not** a medical inference from a low score.
- The event overlay now preserves the full 1,440-minute rest-state channel used by overnight breathing and sleep timelines, instead of returning only heart, breath and movement. Both all-channel and rest-only consumers are covered by a new regression assertion.
- The pet-switching dialog, both versions of the Me profile and the edit-profile portrait now use the same face resolver as the Home gallery. Existing gallery crop images, custom uploaded portraits, and Lucky's Shiba photo are consistent across all these entries.
- The old `V10.11` build-template title and outdated `?v=10.09` source references are retired. The downloadable runtime still loads exactly one hashed V10.78 CSS and one JS bundle; no old overlay modules are loaded as independent runtime files.
- `tests/qa_v1078_release.js` checks portrait assets and their single owner, current runtime entrypoints, versioned source template, and demo event gating. All previous release suites remain part of the regression run. Exact on-device pixel alignment remains a separate visual acceptance check where the browser permits local previews.

## V10.77 — Retire legacy Health overrides and stabilize Back

- Historical V9.99 reminder decorators no longer rewrite the canonical Health More button after rendering. Full reminders open the current shared detail page, including a stale V10.49 link.
- Old prevention copy and percentage widgets cannot overwrite the current blank / newly registered / measured Health layouts.
- Retired seven unused V9.92–V9.98 source modules that otherwise looked like alternative supported renderers.
- Browser/device Back now observes modal transitions, warns before discarding an unfinished edit, and never reopens a dismissed modal on a later Back/Forward action.
- App back actions and modal dismissals use replacement navigation rather than pushing a fresh copy of the page just left.
- Seven lower-score simulated pets have their own deterministic abnormal-event times and values; the emergency list and drill-down waveform use the same per-pet samples.
- All 15 gallery identities, their baseline score scenarios, existing care/report records and the four top-level tabs are retained.

## V10.76 — Unify active routes and repair score geometry

- One Health component now owns both overview and detail entry for Milo, Lucky, all 15 showroom pets and blank/new pet states. The empty profile gets a neutral record placeholder within the same detail shell; older free-pet and blank Health templates no longer execute on navigation.
- A registered pet can display a profile-derived daily food target even with no collar measurement; a fully blank profile remains N/A. All 15 showroom pets retain their separate simulated care records.
- Preserve the historical fixture schema marker at 833. The alert-scenario revision is tracked independently, preventing a reload from continuously deleting and regenerating daily showcase snapshots.
- Every low-score gallery example has multiple distinct time-stamped, source-linked simulated abnormal episodes; heart and breathing rows are independently detected and can be inspected on the same minute chart. The score alone NEVER manufactures a warning.
- The Home alert-to-waveform route remembers the originating tab. A browser-history route snapshot supports hardware/browser Back on internal page changes and refuses to restore another pet's cached detail view.
- Health exam status is directly under its score ring; Deep detailed score and status use the same right-column width at standard and narrow mobile sizes. Only Deep detailed-status explanations have been simplified; other layout and marketing copy is unchanged.
- Review with `node tests/qa_v1076_release.js`, the historical regression suites, and optionally `DEEPPET_BROWSER_QA=1 node tests/qa_v1074_browser.js` on a machine that can launch Chromium. Simulated detections and scores are not veterinary diagnostic thresholds or live-device guarantees.

Build with `node build.mjs` and pack the complete archive using `node package_latest.mjs`.

## V10.75 — Canonical Health, measurement provenance and event triage

- **One Health page producer:** `assets/js/ux_v1075.js` now supplies the same complete markup to Milo, Lucky, the blank profile, and all new-pet Health entry points. A measurement state may change report values, kcal and available actions, but not the Health section order, document/food/recovery/note icons, pale-yellow diet card, type scale or element hierarchy. The standalone historical empty-Health renderers are not invoked on these top-level routes.
- **Deactivate historical post-render rebuilders:** V9.16 exam/care injection, V10.63 `arrangeCare`, V10.68 `equalHealth`, and V10.70–73 Health normalizers explicitly skip the canonical page. This closes a concrete duplicate-render path that had recreated earlier report, care-progress and management layouts. Some earlier compatibility code remains for historical detail screens; no claim is made that every historical module has been removed.
- **Cross-page prevention trust fix:** the legacy prevention engine previously set `isDemo=true` and queried `demoRecords` for every owner. Real pets now read only wearer-verified 20 Hz daily features; no-data/blank Health profiles show a neutral prevention section in the same card shell, never another pet's breed, fabricated heart/breathing deviation, or a synthetic baseline. The showroom retains its educational scenarios.
- **Provenance:** a real pet's minute detail asks the connected bridge for data by `(pet, date, channel)` and checks verified wear, 1,440 valid minutes and non-synthetic source. Structured payloads are cross-checked against claimed pet/date/channel; a legacy numeric array is labelled **request-bound**, not independently identity-verified. UI displays coverage, and incomplete or untrusted series are not plotted as complete traces. Daily sensor scoring retains its existing, stricter paired-device/session/quality checks. This is not a substitute for native-device end-to-end validation.
- **Event taxonomy:** low category scores feed health-state insights, never emergency rows. Emergency items require an independently timed sustained episode or a rapid second-level episode; duplicate events and mismatched pet/date are rejected. Gallery events remain labelled example scenarios, not authentic collar notifications.
- **Review:** `tests/qa_v1075_release.js` exercises identical markup across three pet states, document/report actions, legacy-normalizer guards, source mismatch, wear/coverage failure, bounded minute metadata, and emergency classification. All JavaScript regression suites also run. Browser screenshot testing and live Bluetooth/4G validation are not represented as passed if the runtime blocks Chromium.

Build the complete current application with `node build.mjs`, run `node tests/qa_v1075_release.js`, and package with `node package_latest.mjs`.

## V10.74 provenance and route-integrity audit

- One actual Health layout for Milo, Lucky and a blank/new pet; only content changes. Keep the V10.72 food, recovery and notes cards and the V10.73 duplicate-removal guard.
- Minute details, Deep minute/hour/day charts, and the legacy range renderer must read verified device-backed records for real/new pets. An existing daily score is not proof of a minute waveform.
- The showroom's 15 demo pets retain their complete fake care records and illustrative curves; a globally connected device bridge does not overwrite them.
- When measured sleep lacks confirmed night-stage or interruption telemetry, do not infer missing facts from the showroom's generated night-slot timeline.
- Emergency alerts depend on measured episodes and signal quality. Low scores alone do not justify inventing a sudden episode or medical warning.
- See `tests/qa_v1074_release.js` for provenance, UI-contract and navigation regression checks.
- For a source-level regression check, run `node build.mjs` first and then `node tests/qa_v1074_release.js` from the `source` directory. For optional full browser screenshots on a workstation allowed to launch Chromium, run `DEEPPET_BROWSER_QA=1 node tests/qa_v1074_browser.js` after the build.

## V10.73 — Cross-app legacy-structure audit

- **Deleted the second giant N/A Deep template from its original renderer**, including the obsolete multi-ring, per-metric and blank-calendar generation paths. Unmeasured Heart & Breathing, Sleep and Energy & Recovery now retain the same category and 1/7/30-day selectors and present one clear empty-state card without synthetic scores.
- **Replaced independent legacy no-data detail pages** in Deep and blank-profile Health with a consistent lightweight detail header, icon and explanation. Removed the path that could prepend an obsolete N/A risk-score card to an otherwise empty detail.
- **Removed the former duplicate exam-report injector** from Health. The single top Exam Analysis card remains authoritative; it does not add a second report menu entry. Old food placeholders no longer overwrite the compact pale-yellow component.
- **Fixed a dead More button** for Health's Upcoming Care list. It now opens the full list and has a back route. Registered but unmeasured profiles now reuse the complete Me navigation structure (profile, baseline, device, store, nearby, family and settings) instead of a second reduced Me screen. A completely blank profile still uses the deliberately restricted Add Pet state.
- **Final DOM guard** deduplicates Health management rows, exam-analysis containers, Me profile/device sections and Home emergency cards, and ensures detailed-data buttons contain only one inline chevron.
- **Coverage:** 31 JavaScript regression suites, 241 literal action names inspected and 155 no-data/detail cases across five languages. Direct browser screenshot interaction was blocked by environment policy, so pixel-by-pixel UI and live collar SDK verification remain outstanding. No new physiological readings, risk scores or emergencies were invented.

## V10.72 — One compact diet and recovery component across all pet profiles

- **Milo, Lucky and the empty profile share the exact same diet card markup and styling.** Light-yellow card, left-hand “饮食目标／每日饮食目标”, right-hand daily calorie target (or “暂无数据” when unmeasured). The old purple expanded card, percentage badge and redundant progress bar are removed from this view. The full food-detail action remains available.
- **Recovery and extra records reuse the same DOM tags, illustration size, row height, typography and subtitles** for measured and unmeasured pets. Both use “生病、术后以及日常恢复追踪” and “记录观察变化与预防反馈” and retain their original navigation actions.
- **Prevent stale templates.** After the common health layout has been assembled, one final render pass replaces only the two inconsistent components and removes duplicate recovery/extra-record entries if a historical template injected them. No demo scores or invented measurements are added to owner profiles.
- **Testing.** Added explicit DOM-parity checks for measured and unmeasured food/recovery/extra-record cards in five language branches, in addition to all previous JavaScript regression suites. Genuine visual screenshot and BLE SDK testing must still be completed on target mobile devices.

## V10.71 — Unified health analysis and source-linked emergency examples

- **Lucky / blank / measured Health:** examination analysis uses one card component, document icon, correct top-right score/risk alignment and one upload-or-create entry. A pet with no collar data may still display its own actual saved examination result. Removed the older “second health-model evidence” label and redundant report menu. The page’s hierarchy and actions are preserved.
- **Care components:** Milo's pale-violet food card, icon colors, row spacing and title/subtitle structure are now shared by every profile. Empty calories show only “No data yet”; recovery and additional-record captions are synchronized.
- **Deep:** detailed-data pages use the same proportional 54-dot score visual as the parent cards. All detailed-data chevrons are single inline arrows; assessment paragraphs are normal weight. Day sleep conclusions are concise and evidence-based.
- **Emergency gallery:** all 15 built-in pets retain source-linked showcase events; low-scoring specimen pets have multiple distinct heart/breathing rises and falls, with the Pug Leo showing multiple timed scenarios. The event classifier distinguishes abrupt changes from gradually sustained deviation based on recent readings. No demo event is assigned to a new user or empty profile, and no score automatically creates an emergency alert.
- **Verification:** all 29 JavaScript QA suites pass. The Pug example produces eight separately timestamped detector findings; alert values match both the full-day series and the selected single-channel graph. Visual checks on a physical phone and live 20 Hz SDK validation are still outstanding.

Build from this directory with `node build.mjs`, then `node package_latest.mjs`; `VERSION.txt` controls the version and the compiled asset names.

## V10.70 — Single source of truth for emergency alerts and empty profiles

- **Home / 今日总结:** abrupt heart-rate and breathing-change notifications appear only under **应急提醒**. Duplicate priority banners, inline score-lane alert messages and numerical-score alert captions were removed without relaxing the underlying event-protection rules.
- **Deep / Lucky / blank profile:** the Heart & Breathing, Sleep, and Energy & Recovery tabs now show exactly one translated no-data message instead of oversized N/A rings, metric grids or placeholder calendars. Day, 7-day, 30-day and category navigation remain available. The day picker highlights Today when selected.
- **Health / layout parity:** measured and unmeasured pets use the same prevention component, examination summary, reminders and care-item structure. The page heading is Health Management; the first module is personalized prevention, the second is examination analysis, the third is upcoming reminders, then the care menu. Food is compact pale-yellow for every profile; medicine/vaccination/deworming descriptions are on their own lines. Redundant report and care-completion cards were removed from this overview.
- **Integrity:** no-data views never borrow another pet's waveform or examination result. All 15 historical gallery pets and their specimen records remain intact. The full archive contains this source tree alongside the compiled WebApp and media assets.
- **Verification:** 28 Node.js regression suites pass; 45 language/category/range empty-state cases have explicit assertions. Browser pixel-level checks were blocked by local organization policy, and real 20 Hz collar/SDK validation remains a separate prerequisite.

Build from this source directory with `node build.mjs`; package the release with `node package_latest.mjs`. The production version is read from `VERSION.txt`.

## V10.67 — Confirm the entire sudden-change episode, not only its last value

- **Closed a source-evidence gap:** each heart/breathing rapid candidate now retains the exact numerical high/low threshold that triggered it. When saving an alert, the app checks *every one* of the claimed consecutive seconds against that original threshold and rejects any gap, nonmatching value, missing threshold or mismatched channel. A final abnormal second alone cannot prove six abnormal seconds.
- **No partial acceptance of corrupt joint alerts:** if a purported simultaneous heart and breathing event includes one invalid component, the whole new event is rejected. Opposing high/low claims for the same channel at one instant are also refused.
- **Honest clock provenance:** a native offset-confirmed event shows “verified local time”; if the bridge has only supplied the local wall clock, the details show “device-reported time” and do not imply that the timezone was independently verified. Time descriptions are handled in the existing five UI locale branches.
- **Failure-independent delivery:** an external urgent-event callback throwing an exception no longer blocks the local event record. Conversely, a local record/render failure does not block delivery to the host callback. Both errors are reported independently through the optional `onAcuteError` handler.
- **Preserved:** the 14-day physiological baseline formulas, pre-baseline conservative fast detector, real-collar SDK transport, single/7/30-day Deep design, optional collapsed history, full Home/Health/Me functions, 15 showcase pets and their historical care records. No extra onboarding or owner data-entry steps were introduced.
- **Validation:** 25 automated QA suites cover independent source thresholds, six-second continuity, callback/storage failure isolation, timezone provenance, cross-pet isolation and the previous release regressions. The prototype is not a medically validated apnea/heart-attack diagnostic or a guaranteed background emergency push service.

## V10.66 — Timestamp reliability, source integrity and event review

- **Correct local time on evidence plots.** The x-axis now follows the alert's verified local date/second, including date rollover, instead of incorrectly labelling the trace with UTC time. The y-axis measurement unit and x-axis time label are distinct.
- **One actual time, one traceable event.** Two abnormal measurements eight seconds apart are no longer merged into a fictitious simultaneous event. Heart/breathing events may merge only when recorded at exactly the same instant and in the same context. A missing rate channel cannot be accepted as if its reading matched the alert.
- **Source evidence is mandatory for new alerts.** Each newly captured warning requires the complete contiguous, recorded second-by-second evidence segment, including at least the claimed consecutive confirmation seconds. Where a native bridge supplies its timezone offset, its wall time must exactly match the epoch; unrelated timestamps are refused. Previously stored legacy alerts are not retroactively altered.
- **Real SDK values remain authoritative.** Opening a second-stamped alert no longer substitutes a showcase pet's illustrative minute reading for a verified device value.
- **Optional 7/30-day recall.** The Heart & Breathing Deep page shows a collapsed, pet-isolated history only when real verified events exist. Each item opens the original time, measured value, baseline and precisely circled seconds graph. Retention now covers a bounded 30 days (up to 96 events per pet), including offline reports uploaded out of order.
- **Automated QA:** 24 release suites pass, including no-data views, all five supported language branches, 14-day personalization, source continuity, incorrect timezone rejection, 8-second event separation, weekly/monthly history and pet switching. No live collar SDK, actual background delivery or veterinary-labelled accuracy validation was available; these remain explicit release gates before marketing the feature as emergency protection.

## V10.65 — Emergency detection and original-second evidence

- **Top priority: rapid, measured deviation.** The 20Hz SDK bridge processes all verified seconds and checks a six-consecutive-second heart-rate and/or respiratory-rate change after a manufacturer-verified rolling metric becomes available. A five-minute sustained window is *not* a gate for sudden alerts. Fitness scores never trigger emergencies. Ordinary activity, post-exercise recovery, incomplete signal and wrong-owner data are excluded.
- **Before/after 14 days:** before the baseline is established, require at least 60 verified same-context quiet seconds, and use conservative provisional deviation thresholds. After 14 distinct preceding days, compare with the pet's own verified same-context 14-day median **in HR/RR units**, weighted with the pre-event recent median. Daily health-score averages are descriptive and are not an HR/RR baseline.
- **Verifiable evidence:** each qualified rapid event stores its actual timestamp and SDK-verified measurements for up to the preceding 24 consecutive seconds. Home shows the measured value and date down to the second. Tapping opens Deep detail: a first card gives the conclusion, time, comparison reference and an independently plotted per-second vital-rate curve with the exact abnormal sample circled. The preexisting all-day/minute graph still only pinpoints its corresponding *minute*; it is not misrepresented as a second-resolution waveform.
- **No fabricated data or diagnoses:** if prior raw-second vital rates are unavailable, the card explicitly says why it cannot draw a precise curve. Sensor silence never equals apnea; BCG-derived data alone cannot verify choking, myocardial infarction or respiratory arrest. The browser can show in-app events only while receiving data, and is **not** a confirmed background push safety service.
- **Owner isolation and copy:** source identity, sample continuity and quality checks carry into the event archive; a real pet without verified minute history never falls back to showcase minute alerts. The owner first sees a short conclusion, with technical caveats behind one disclosure.
- **Release includes** the complete source, pet showcase media, all previous score formulas and the separately documented V10.65 rule changes. The thresholds require veterinary-labelled data and real Bluetooth/4G performance validation before clinical safety promises.

## V10.64 source audit and content corrections

- Fixed an independent no-data navigation defect: new or unmeasured pets now see N/A on Deep waveform/detail pages instead of entering demo-derived old detail routes.
- Kept every existing owner record and gallery showcase fixture isolated by pet.
- Removed a duplicate Today To-do section from measured pets' Health page; Home remains the owner-facing Today To-do destination.
- Made empty Health detail buttons function: blank profiles prompt to create a pet, while named new profiles can open their own care records.
- Consolidated Deep tab labels across Traditional Chinese, Simplified Chinese, English, Japanese, and Korean.
- Removed BCS from the pet editor (matching the Add Pet form) without deleting any historical recorded condition values.
- Kept Health's examination-report access while moving its compact card into the care-management section and reducing repetitive copy.
- Collapsed repeated cardio scoring methodology behind a readable detail affordance, retaining its explanation on demand.

## V10.63 — Onboarding, new-pet photo crop and no-data screen parity

- Four-stage 60-second onboarding now names HRV in the physiological overview, states the full “body rhythm” title, explains how saved and reviewed examination reports inform personalization, and connects the first three analysis steps with actual age/daily routine for wellness and estimated biological age. Stage one adds concise sudden heart/breathing change use cases while explicitly avoiding diagnostic claims.
- New pet name and photo occupy separate fields. A single photo/camera chooser launches a local drag/zoom/crop dialog and replaces the file with a cropped portrait before the existing save path runs. Age, weight and shoulder height have no suggested numeric defaults; BCS is removed from this form, without dropping internal laboratory BCS support.
- Blank and owner-created unmeasured pets use the same Deep three-category icon and color system, Day/7/30 controls, single-day picker, daily calendar, titled main score and metric list. Missing sensor values show N/A, without a misleading /100. All lack of data remains explicit; no waveforms are generated.
- Empty Health follows the same visible order: food first, then medication, vaccine, deworming, weekly/monthly review, vet materials, recovery, notes and examination entry. Both empty and measured pages have one Health Management section heading, and empty-page menus use the same icons and typography. Legacy stray hex fragments are stripped from visible text.
- UI copy normalizes “牠” to “寵物” in traditional Chinese (or “宠物” in simplified), including modal content. Navigation to existing empty details and pet-scoped records is retained.
- Automated QA checks the five existing locale selectors across all three Deep tabs and all three ranges, dated empty calendars, category labels/icons, N/A scoring, Health order and photo crop plumbing. Browser screenshot verification remains outstanding where Chromium cannot launch due environment socket restrictions.

## V10.62 — Prior research prototype

## V10.62 — Fast sudden-change candidates (research prototype)

- **Independent of daily scores:** a high-scoring dog can have a six-second abrupt heart-rate and/or breathing-rate deviation. In V10.62 the 20 Hz factory SDK's verified per-second metrics feed a separate fast branch; V10.61's five-minute sustained branch remains for slower abnormalities. Neither branch manufactures an alert from a low daily score.
- **Six consecutive qualified seconds**, after the manufacturer's own 12-second HR / 30-second RR accumulation and 30 earlier quiet reference seconds with an eligible, owner-matched 14-day context reference; without 14 days, 60 previous quiet seconds and stricter thresholds. Initial candidate thresholds (not veterinarian-validated) are 45% or ≥24 bpm HR, 70% or ≥9 breaths/min RR after a reference is complete; before it, 60%/≥35 bpm and 95%/≥14 breaths/min. A single disconnected/flat sample can never be labeled apnea. For all candidates, there is a stable resting or sleeping activity classification, strong contact evidence, verified metrics and three-minute post-activity gate.
- **Home and drill-down:** verified fast events are owner-isolated, shown before slow events with date/HH:mm:ss even when today's score is high or absent. Existing detail navigation marks the containing minute, with an honest explanation that the exact-second value comes from the SDK second stream; the existing minute graph cannot prove sub-minute shape without native timestamped raw-chart integration. Six seconds is the confirmation *after valid rolling metrics have started*, not six seconds after first wearing the collar.
- **No proven apnea/choking/heart-attack diagnosis:** BCG alone cannot distinguish true absent breathing from a loose collar or some artifacts. Native/background notifications, device connectivity, veterinary threshold validation and an independently measured breath-effort/no-breath detector remain outstanding; browser-only in-app events will not wake an owner when the app is closed. The word **emergency** in the Home category does not constitute a validated medical emergency service.
- **Preserved:** four-tab layouts, all showcase pet data and care histories, original photos, score formulas, onboarding reset and four-language options. Automated source-level regressions cover qualified fast and slow paths, exercise, lost contact, solitary short spikes and pet isolation; physical performance remains untested.

## V10.61 — Prior release (sustained minute changes)

## V10.61 — Personal context, qualified alerts, and onboarding reset

- **Corrected the key distinction:** low daily heart/sleep/recovery scores are not automatically emergencies. Only a measured heart-rate or breathing episode with a specific timestamp, verified signal eligibility, a large and sustained baseline departure, and an appropriate resting context belongs in Home emergency alerts. Long-term or gradually poor status stays in the appropriate ordinary Home/Deep insight.
- **14-day personalization:** use the selected pet's own *preceding*, dated, quality-valid, quiet-time records. Compare day-rest with day-rest and night-rest with night-rest. A context needs 14 eligible prior days before personalized thresholds apply; before that, conservative provisional thresholds apply to 3–13 historical days. With fewer than three, the software requires at least 45 clean, older same-day resting minutes and an even larger deviation, or shows no event if evidence is insufficient. The candidate thresholds are prototype research settings and require validation by species, breed, age, health and veterinary testing before commercial safety claims.
- **Activity gate:** do not alarm for ordinary walks, exercise or immediate post-exercise heart-rate elevation. A one-minute spike, missed signal, wrong date, invalid day or user-created profile without verified wearable measurements cannot create a new synthetic event.
- **Exact alert destination:** independently qualified events reuse the existing deep waveform detail with the correct minute circled; no new buttons, duplicate low-score alerts or fabricated time labels. Live SDK data continues to require the existing independently verified event feed; showroom minute traces are never copied to real pets.
- **Onboarding:** every entry to the four-stage “60 seconds to know DeepPet” tour begins at stage one, despite old local browser cache. Stage one prominently highlights **7/24** and **every second**, clarifies that sustained coverage depends on sound collar fit and valid signal, and removes unsupported specific claims of recognition accuracy.
- **Wording:** limited to shorter stage-one copy and removal of duplicate urgent daily-low rows; established Home, Deep and Health page geometry, score rings, four languages, 15 showcase pets, records and original product photographs remain unchanged.
- **Verification:** V10.61 algorithm and UI regression tests supplement earlier source/test suites. Mobile visual acceptance, real SDK waveform quality, animal-specific alert validation and cross-language screenshot QA are still necessary.

## V10.60 — Superseded low-score behavior (retained for release history)

## V10.60 — Restore today's important low-score notices

- Fixed the regression where the Home urgent-alert card said there were no sudden changes while Mochi, Miso or another measured pet had very low daily scores. The previous version mistakenly removed every daily-score notice while filtering unsupported sudden events.
- All three reconciled Deep daily main scores are independently checked: heart/breathing, sleep/rest, and energy/recovery. A displayed score below 80 creates a concise **Needs attention** row, with critical scores below 60 styled red; rows include the actual date but **never fabricate an event minute**.
- Timed heart-rate/breathing changes still appear first, linking to the exact circled minute in the existing full-day and zoom plots. Daily low-score rows instead open the matching Deep daily category. Both kinds share one card, capped at three rows before a single centered More control.
- The list always uses the selected pet's effective data, clears expansion when switching pets, and refuses to read demo data for blank/new/unpaired profiles. The original scoring coefficients, health records, product photos, pairing, 4G/GPS rights, and other modules are unchanged.
- Software regression coverage: 18 suites, including Mochi's three low statuses, Miso's two low statuses, entry routing, translation text, boundary scores, absent signal and owner isolation. Physical collar tests and browser screenshots still require a capable test environment.

## V10.58 — Compact Deep detail actions, matching scores and health review

- All **three Deep composite score rings** (cardio, sleep, energy/recovery) now use a shared 96 px dotted ring and 30 px score numeral for day, week and month, while preserving separate left-narrative and right-score columns in longer translations.
- Cardio explanations use the pink/red UI accent; energy/recovery explanations use blue. Risk-score colors remain conditional on the actual score, not the page theme.
- Heart-rate, breathing and energy detail cards have a single detailed-data action; their full score reasons and next steps appear above the existing chart inside the destination detail page. Recovery's explanation is inside its existing detailed-data fold, before the chart. Overall score cards retain their single explanatory action.
- Examination score rings and nested result rings use the exact Deep 54-dot proportional arc with a transparent center. A report score of 18 lights approximately 18% of the dots; labels stay centered beneath the score.
- Medication page type and dose-history rows are more compact; nutrition conversion notes have a clearer visual hierarchy.
- Weekly/monthly curves highlight the selected plotted point and show the exact date/value in the chart, with the old bottom readout removed.
- The separate health-plan-completion dashboard is removed. Medication, vaccine and deworming completion tracks now sit in their existing Health menu rows, using an explicit “No plan” when completion cannot be computed. Feeding already has its own kcal ratio and progress bar.
- The update is presentation-focused; all existing scoring rules, pet examples, vet-history fixtures, device catalog, Bluetooth/4G product photography and navigation remain intact.

## V10.57 — Unified device catalog, honest states, clearer owner wording

- Introduced immutable `DP_DEVICE_CATALOG`: each real product has exactly one model key, owner-verified photograph, hardware price, GPS/eSIM permissions, service requirement and separately qualified battery target. `COLLARS` and `SHOP` derive their identities from it; no third or substituted product image is introduced.
- **Unpaired is not Bluetooth.** Me → My Device and its detail view now show a neutral device icon until a model is actually paired. A selected 4G or Bluetooth device is still displayed with its respective original photo after successful pairing.
- Stored/cart items from earlier builds are normalized and invalid obsolete models ignored. The cart retains each original row index so the delete action cannot accidentally remove the wrong product. All hardware and subscription checkout arithmetic uses the catalog, with no GPS subscription for Bluetooth.
- The Store shows core feature bullets immediately, while model-specific coverage, roaming, offline storage uncertainty, and battery testing notes are in a single optional disclosure. Unverified claims of buffered/backfilled data and verified global roaming were removed from visible promises.
- Owner-facing evidence text uses the same risk band as the integer score displayed in the ring; a rounded 90/100 is no longer explained as an 89-point mild risk. If an overall score is good but a measured sub-area is materially low, the owner still sees that specific concern instead of the blanket phrase "no low components."
- Preserved 15 showcase pets, all existing health histories, score formulas, genuine device pairing gates, original user product photos and language variants. Automated coverage includes malformed old carts and no-device state; physical SDK and mobile screen acceptance remain separate steps.

## V10.56 — Official collar photographs and model-safe shopping

- Product imagery is now strictly sourced from the owner's two original 2026-11-17 uploads: image 1 (black/orange striped collar with fully enclosed black pouch) is **4G + GPS**, and image 2 (plain black strap and zippered pouch with orange module) is **Bluetooth Health only**. The exact unedited PNG bytes are retained in `assets/product/` and referenced by one immutable `COLLARS` mapping.
- The existing **Me → My Device**, device detail, Bluetooth/4G pairing choices, scan results, pair confirmation and progress, pairing-success card, product picker, and **DeepPet Store** all resolve the same model identity. The active paired device remains authoritative; choosing a different model while searching does not silently change ownership or grant GPS rights.
- The Store retains Bluetooth **US$189** with no subscription or GPS and 4G + GPS **US$229** plus required **US$5/month or US$49/year** connectivity. Battery design targets are now correctly distinct: **Bluetooth over 5 days**, **4G 2–3 days**, pending final device verification. Unconfirmed claims of specific device weight or seven-day offline cache were removed. The actual photos use `object-fit: contain`, with no crop or photo zoom in mobile tiles.
- The release packager now always includes all historical owner-gallery photos **and** newly supplied product assets; the old zero-media fallback could omit hundreds of pet images as soon as two new files were added. Product QA tests verify the exact SHA-256 of the uploaded images, dimensions, device/store/pairing branches, specification differentiation and compiled release.
- No changes to score weights, health histories, 15 gallery pets, new-pet missing-data rules, four-tab navigation, GPS authorization, or real-device SDK boundaries. Browser screenshot testing remains pending in an execution environment that permits a headless browser; the current environment denies Chromium's local socket creation.

## V10.54 — Correct four-component cardio, urgent events, clean sleep geometry

- **One weighted score contract:** heart (32%), breathing (32%), HRV (20%) and beat-rhythm stability (16%) together form cardio. Both the showcase and reference-comparison adapters use all four available components and the same protective score gate. Energy/recovery already uses the correct 40% energy, 35% recovery and 25% rest/steadiness weighted contract.
- **Sleep day / 7 / 30:** the title and risk explanation stay in a dedicated left column; the centered score ring and grade stay in a dedicated right column. The legacy first-child CSS conflict and redundant explanations have been removed; the period heading reads **期間重點：**.
- **Urgent events:** a previously insufficient fallback searched the full heart/breath trace only if the 20-minute suggested candidate was missing. It now searches for short, sustained, activity-matched excursions when the suggested candidate is below the alert threshold, preserving the exact observed time/value. A co-occurring event is described as concurrent changes—not as a diagnosed emergency.
- **Pet wellness model:** shown under Me only, not Home. The link is **查看分析來源**; the detail expander is **查看本次分析來源** with exactly one chevron. The two separately described source groups list relevant parameters without disclosing weightings or formulas in the consumer screen.
- **Preservation:** all showcase pets and their historical records, the blank new-pet behavior, four tabs, other screens and original media remain intact. The editable source and executable WebApp are provided together.

## V10.53 — Clearer individual evidence, less repeated copy

- **Superseded in V10.54:** the former two-item cardio summary was a regression. Cardio now correctly includes heart, breathing, HRV and beat stability at their documented weights, while the sub-scores remain independently displayed.
- **Different comparison periods:** if a 30-day period has no older reference, the latest seven valid days are compared with the earliest seven *different* valid days; the full 30-day average is not compared against a subset of itself. Observations are not presented as a medical diagnosis or proven cause.
- **No score repetition:** the prominent score ring carries the overall number. Sleep day/week/month, Deep composite cards and weekly/monthly review explanations instead describe factual low days, lowest component and next action. Low scores are not softened by flat trends or long quiet rest time.
- **Consistent, useful language:** the observation heading is uniform across Deep cards; generic assertions like “very healthy” have been removed. Longer explanations scale with actual concern without repeating the exact same next step in both overall and component cards.
- **Unchanged UI and data:** no extra tabs, interactions, prompts, user input, formula changes, sensor assumptions or lab categories. All existing showcase pets, records, images and new-pet empty states are preserved. The delivered ZIP includes the runnable WebApp plus editable source and media, without historical QA files or old runtime bundles.


## V10.52 — Deep risk explanations, sleep layout, chart inspector and vet lab evidence

- **Sleep day / 7 / 30:** the long explanation is inside the title-side text column directly below the horizontal title; the score-side column contains only the score ring and risk status. Former detached text blocks and empty header space are removed.
- **Risk-specific reasons:** heart, breathing, HRV, rhythm, sleep, energy, recovery and calm now use the selected pet's valid daily scores and observed measurements to explain low scores, accompanied by a severity-scaled next step. A long rest or a flat weekly/monthly trend does not conceal a low score.
- **Detail controls:** identical text size and right-facing chevron, with original detail interactions preserved.
- **Weekly/monthly review:** both physiological and rhythm trend charts show the date and value INSIDE the SVG chart, including mouse and touch inspection. The redundant health-event-versus-score card is removed; ordinary records remain untouched.
- **Veterinary report:** four explicit lab risk buckets and expandable result-specific applied reference bounds, measured value and cause. Entries that truly lack valid units/intervals remain ungraded rather than being silently misclassified.
- **My device:** smaller, more refined green icon-plus-percentage display without a tinted pill.
- Version `DeepPet V10.52`; original media, all gallery pets, medicines, vaccines, labs, diet/activity examples, four navigation tabs and score formulas are retained.

## V10.51 — Report page crash fixed; compact sleep explanations

- **Health / examination stability:** The V10.50 per-exam explanation mistakenly called `profile()` from another module's private scope, which could stop the report list and detail page with `ReferenceError`. It now calls the shared `currentDog()` accessor. No examination records, grading formula, or pet-specific fixtures are changed.
- **Deep / sleep day and 7/30 days:** Keep the horizontal label and correctly centered score ring in one two-column row. Use a concise, severity-aware score takeaway beside the ring, and move the full reason plus practical next step to one full-width line block directly below it. This removes unnecessarily tall left-hand text and the visually empty space next to the ring. The same rule applies to all pets and these three date ranges.
- **Low-score interpretation:** 29/100 is explicitly described as persistently poor even if the week-to-week line is flat. Neither trend stability nor lengthy rest duration is mistaken for a healthy score.
- **Regression coverage:** The new V10.51 test reproduces actual report-list/detail rendering with private-scope `profile()` absent, validates pet identity and explanation output, and verifies the compact sleep takeaway for day/7/30. V10.43–V10.50 regression suites are retained.
- **Full image packaging:** Source edits are kept in `source/`, while the 296 original image/icon assets are at the executable archive root. The packager now recovers those assets from the archive root when repackaging from `source/`, with an explicit minimum-asset safety check. This prevents a seemingly valid new ZIP from shipping without pet portraits or onboarding media.

This release deliberately adds no new navigation or owner input and preserves all provided historical health, medication, diet, vaccine, activity, and veterinary fixtures for the established pets; New Pet remains data-free.

## V10.50 — Explain low scores, actionable guidance, and Leo sleep layout

- Leo's sleep day card now fills the previously blank title-left space with an evidence-linked conclusion; the header stays horizontal and the right-hand score ring retains its established geometry. The explanation below the header focuses on what to do next.
- Seven- and thirty-day sleep cards use exactly **期間重點** and distinguish a stable **very low** score from stable good health. A 29/100 score is not described as merely “little change”: persistent sub-60 dates, relative deviation from the dog's baseline, rest duration, interruptions and practical next steps are discussed.
- Heart & Breathing (heart rate, breathing, HRV and rhythm), Energy & Recovery (energy, two-minute recovery and quiet-time steadiness), and their overall cards show score-dependent reasons and owner-friendly next steps at day/7/30 ranges. Content gets more explicit as the score worsens; these are candidate observations, not disease diagnoses.
- Each opened examination report explains which of its actually assessed lab items lowered the overall score and what to verify with a veterinarian. The report list also identifies low-scoring items before opening. A missing reference remains genuinely unavailable, never arbitrarily reclassified.
- Weekly/monthly health recaps add a short explanation beneath each existing score panel: actual lowest components and the practical area to focus on. No new navigation, dashboard modules or feedback requirements.
- Uses the same dated per-pet engine and original lab evidence. All gallery pets, sample medications, vaccines, labs, food, activity history, no-data states, raw signals and Bluetooth/4G boundaries remain intact. This is a display-interpretation release; no model coefficients or lab thresholds changed.
- Verification: `node tests/qa_v1050_release.js` and the previous V10.43–V10.49 regressions. Mobile screenshot-level QA, SDK readings and veterinarian validation remain separately required.

## V10.49 — Deep observations, independent reminder list, lab classifications

- Heart & Breathing now displays a calm “今日觀察與建議” section even on a healthy day, without adding an alarm; existing below-90 warning cards remain as-is.
- Health's “近期健康提醒” More enters a separate 30-day full-list page with a Back button. The Health overview still shows three reminders, and the list uses the same pet-specific reminders and original detail-page actions.
- Veterinary one-tap reports classify each stored laboratory result with the **same reference-aware 0–100 score** already used by Health, rather than blindly treating `status: unknown` as “待確認.” Green/blue/orange/red means ≥90 healthy/80–89 mild concern/60–79 moderate concern/<60 severe concern. Missing or incompatible values, units, references or species remain unassessable. These are observational risk tiers, not disease diagnoses.
- The selected laboratory report stays the selected report independently of whether the physiological summary is Today/7/30 days; no lab record is fabricated for each sensor period.
- Regression: `node tests/qa_v1049_release.js`; earlier release tests retained.

## V10.48 — Simpler Deep pages, fixed sleep layout and daily-score integrity

- The single-day Sleep situation title stays horizontal at the same type size as 7/30-day views; the period summary sits directly beneath its subtitle, alongside the ring instead of after a tall blank area.
- In Me, the battery display now contains only a green battery glyph and percentage, with no pill background. The 14-day baseline entry uses one purely decorative curved line, with no extra caption, axes or dates; its full detail page and valid-day logic remain unchanged.
- The pairing confirmation gives Back a fixed horizontal label width without changing the pairing sequence.
- Removed the old on-Deep "same-day care comparison" and 7/30-day "personal changes" cards. Existing care logs and underlying score references are retained in Health.
- Added short plain-language heart, sleep and energy/recovery period conclusions; replaced jargon-heavy recovery and rest-and-steadiness explanations in all three period ranges.
- Poppy and other showroom pets no longer force energy/recovery sub-scores into the portrait's minimum grade. This removes the artificial 84/100 flatline while preserving date-specific variations and the weighted composite's independent meaning.
- Period energy detail now shows **one** daily energy score trend; daily activity remains accessible after choosing a date. The 7-day graph and 30-day graph use identical dated points and the same 30-day y-scale. Recovery details plot the same scored daily values as their parent card; the single-day recovery and calm cards now also use that source.
- `node tests/qa_v1048_release.js` tests the real Poppy showcase scoring function, dated score consistency, simplified labels and the UI source contract. Prior tests remain available.
- The WebApp is a gallery and source handoff; full mobile browser screenshot QA and live Bluetooth/4G factory SDK verification still require device/browser access.

## V10.47 — Per-metric evidence quality, honest curves and consistent detail values

- **No missing-as-zero score inflation/deflation:** energy, recovery and calm period means each divide by their own valid observed-day count. Missing recovery on one day does not count as a zero or leak into another metric's denominator. Composite scores keep a separate validity gate.
- **Detailed scores match parent cards:** daily energy and calm in the 7-/30-day expanded graphs use the identical per-pet, per-date scoring engine as the corresponding period cards. A missing engine value stays N/A; older fixture math is not substituted after the fact.
- **Calendar gaps stay visible:** generic 7-/30-day metric curves and energy calendars preserve missing date slots. They connect adjacent valid observations but do not draw false bridges across unmeasured days.
- **Authentic hourly movement:** the single-day hourly blue curve is now the actual mean of the 60 available minute-level activity samples in each hour. It is labeled movement intensity (%) and kept separate from the energy wellness score; previously generated synthetic clock-time score bumps were removed.
- **No invented 15-second recovery wiggles:** the single-day 120-second recovery chart uses the observed local peak and real subsequent minute-level HR values (0/60/120-second display slots). It no longer injects sinusoidal interpolation; exact cessation timing and the pre-stop peak are disclosed.
- **Device text safety:** an SDK-provided battery timestamp is assigned as text, not interpreted as HTML markup.
- **Regression:** `node tests/qa_v1047_release.js` runs live code-unit tests for every issue above. Prior 10.43–10.46 tests also remain in the package. Actual iOS/Android visual inspection and factory SDK verification still require device access.

## V10.46 — Cross-range curves, centered sleep scores and visible pairing battery

- **Sleep cards:** main score rings in Deep day, 7-day and 30-day views all use 108px circles with 34px digits centered in the circle; the sleep title/score header stays horizontal, with its green theme restored. Smaller secondary rings keep their own size and center their digits.
- **Battery:** the paired-device panel presents the percentage in a separate visible green field. Unknown or unverified capacity remains N/A, never a guessed percentage or timestamp.
- **14-day personal health baseline:** Me shows a connected plot from actually available scored days, using the existing 75% physiology + 25% rhythm composite. Fewer than two scored days yields an explicit pending state.
- **Energy, recovery and calm:** 7-day and 30-day detail values use one ordered 30-day data set, with the 7-day plot as its exact suffix and identical y-axis scale. Daily mean movement and daily energy score are shown separately. Valid periods have joined lines; genuinely missing measurements are marked N/A rather than invented.
- **Labels and More:** Deep expandable sections in 7-/30-day periods say “查看詳細數據”; the Health reminder overflow says only “More” without a down-chevron or underline.
- **Regression:** run `node tests/qa_v1046_release.js` alongside the prior three release tests. Automated tests verify values, source contracts and style rules; final iOS/Android screenshot alignment and SDK pairing remain separate physical-device acceptance gates.

## V10.45 — Every-second sensing, contextual evidence, representative references

- **20 Hz input, one-second processing from second one.** `assets/algorithm/second-by-second-v1045.js` accepts exactly 20 heart, breath and movement samples per second; `DeepPetSDK20Hz.createSession(profile, options).pushSecond(frame)` sends `onSecondUpdate` every second. **The first 12 seconds are not skipped.** The 12-second settling gate only controls when a quality-tested signal is eligible to publish metrics. With positively verified manufacturer SDK metrics, candidate heart rate needs at least 12 consecutive context-stable seconds, respiratory rate 30 seconds and HRV 60 seconds. All qualified rolling values can refresh each second thereafter. These are engineering trial settings, not validated medical thresholds.
- **Activity context changes what is comparable.** Verified `sleep`, `rest`, `active` and the 120-second post-activity `recovery` context do not share resting emergency thresholds. An initial activity→rest transition is held as recovery; unverified activity classification is `unknown`. No user labeling, guessed sleep stage or extra UI screen is introduced.
- **An actual fourteen-day per-pet reference.** `DeepPetSecondStream1045.buildContextReference({petId,context,at,history})` requires 14 distinct earlier dates, each containing at least 30 minutes of manufacturer-verified observations for the **same pet and same sleep/rest context**. It rejects conflicting daily copies, current-day/future data, other-pet data and showroom fixtures. The waveform-derived quiet reference also requires at least 15 actually observed quiet minutes and meaningful continuous episodes rather than scattered tiny snippets. This is an extra safeguard beyond the retained standard 14-day personalization.
- **Never turn bad contact into low physiology.** A zero/flat waveform, stale SDK metric, missing second, radio disconnection or unverified source yields unavailable current measurements—not heart rate zero, stopped breathing, or a fabricated numerical risk score. True non-zero low rates remain eligible for cautious context-matched trend assessment if the actual SDK independently verifies them. Acute **joint candidates** require both qualifying HR and breathing data, a real fourteen-day context baseline, 30 immediately preceding normal same-context seconds and then 15 consecutive corroborating changed seconds. A high rate right after fitting is not automatically called a sudden crisis. These candidates are NOT automatic diagnostic emergency notifications; veterinary validation and additional safety logic are required before such use.
- **Old UX stays intact.** The existing Me collar-reminder switch, its original loose-fit test, separate signal-loss preview, all showcase pets, all Health records, the four tabs and Bluetooth-vs-4G location boundary are preserved. No new buttons or display-only false alarm flows are added.
- **Factory integration contract:** `pushSecond({petId,startEpochMs,date,startLocalSecond,connected,qualityVerified,contextVerified,activityContext,heartWave,breathWave,motionWave,sdkMetrics})`, where arrays are one-second 20-sample frames. For a published rate, the factory must supply an owner-matched, fresh metric with `{verified:true,source:'verified_sdk',petId,context,observedEndEpochMs,observedSeconds,value}`. The adapter assembles 30 contiguous verified seconds for the *existing historical* `append()` API; this is **storage batching, never a 30s/2min sampling schedule**. A real firmware/SDK event bridge is still needed before claiming actual device operation.
- **QA:** `node tests/qa_v1045_release.js` plus previous V10.43/V10.44 and older owner/order/quality regression suites. Simulated sensor frames only; no collar hardware or veterinary accuracy testing.

## V10.44 — Original collar-fit test restored and quality settling

- **Original Me test controls are retained.** In Me → Collar fit reminder, the existing on/off switch (`dp926-wear-toggle`) and the original `Test: simulate loose collar` entry remain available. A second preview exercises a radio/signal interruption. Both are display-only: they do not change paired device ownership, stored health scores, the fourteen-day baseline, real SDK records, or life-safety alerts. Unlike an actual alert, a preview cannot disable the user's reminders from inside the sample popup.
- **Sampling starts immediately; releasing a reliable value waits for stable evidence.** The transport-neutral SDK adapter now exposes an independent two-second, 20 Hz quality-window settling signal. Six consecutive usable windows (12 seconds) are required after first contact or recovery, with two consecutive invalid windows marking signal unavailable. These are engineering trial parameters—not a validated physiological accuracy guarantee or a manufacturer-specific wear-on delay. Signal stability alone cannot create a health score: the separate factory vital-sign validation is still required.
- **Do not confuse measurement with transmission or personalization.** Official Invoxia documentation describes motion-aware 2-minute resting windows; PetPace describes 2-minute collection intervals; Tractive describes a seven-day learning period for personal resting baselines. DeepPet retains continuous incoming 20 Hz sensor data where supported by the actual SDK, while restricting published insights to context-appropriate, quality-controlled segments. Device interruptions must never be displayed as bradycardia, apnea, or an artificial health score of zero.
- **QA scope.** Automated tests cover the original switch and both previews, read-only simulation, signal recovery and interruption, per-pet isolation and the V10.44 release contract. Hardware sensitivity/specificity and exact 12-second tuning still require real collars and veterinary validation.


## V10.36 — Priority consistency, source-aware device feedback, safe UI text

- **A single priority label:** The first ranked card gets exactly one quiet first-priority marker; other cards are never relabeled after re-sorting. The original item order, text and click destination are intact.
- **Real-device low battery only:** When the verified per-device SDK value is 20% or less, the existing device card gains an unobtrusive localized charging hint. The local presentation percentage cannot trigger a low-battery warning.
- **Preserve owner-authored notes and pet names:** The fixed interface copy cleanup no longer rewrites pet names or free-form Health notes. DOM insertions are processed incrementally to reduce cost, without touching waveforms, scores or timestamps.
- **Release hygiene:** A clean single-version ZIP, original four tabs and detailed waveforms; the Me footer shows `DeepPet Version 10.36` via `VERSION.txt`.

## V10.35 — Visible battery and focused daily guidance

- **Battery on existing cards:** The Me device card and the existing Home pet-photo area can show a quiet battery glyph and percentage for populated showcase pets. Live SDK readings take priority where available. A current unpaired connection is never falsely called paired; no invented SDK timestamp is added.
- **Change and context:** The first important Home item keeps its previous recent-day comparison and can display a tightly bounded same-day health-record count next to the original explanation; date-only records are not falsely linked to an exact event time.
- **Priority:** One subtle visual accent highlights the already-ranked first Home action without reordering scores, changing thresholds, adding a tab or adding a second route.
- **Presentation wording:** Fixed copy is simplified into ordinary product-language wording on screen; the companion Word audit retains full implementation and device-integration limitations.
- **Clean ZIP:** The customer-facing ZIP contains only this version's compiled HTML, live CSS/JS bundles and referenced image/data assets. Older QA reports, source-layer bundles and past versions are excluded from the downloadable ZIP.

## V10.34 — Automatic visible release number and quiet feedback

## V10.34 — Automatic visible release number and quiet feedback

- **Exact version at the bottom of Me:** Under the existing settings panel, the current release is displayed as `DeepPet Version 10.34`, with legible, restrained typography. The label is ordinary text, not a new button, menu, screen or navigation level.
- **Single release source for future updates:** `VERSION.txt` is the authoritative version. `node build.mjs` reads it and gives the HTML title, compiled CSS/JS filenames, runtime release metadata and Me footer the same number. For a future release, update `VERSION.txt` (for example `DeepPet V10.35`) and rebuild; there is no per-release hard-coded footer number to remember.
- **Quiet unless an actual milestone occurs:** The approved V10.33 one-shot 60-second Heart Moment halo and legitimate 14-valid-day baseline completion highlight remain. Real SDK-only battery remains hidden unless a valid current reading arrives. No additional flash, auto-playing content, modal or prompt was introduced.
- **Preserved exactly:** Four tabs, 15 demo pets, two different new-pet/blank profiles, every Health history entry, full daily/multi-day waveforms and original axes, scoring and baseline formulas, Bluetooth/4G boundaries and factory pairing handshake. No changes to signal-quality assessment.

### Build and version check

From this source directory, run `node build.mjs` and open `index.html`. The generated `dist/index.html` carries the same release and all bundled assets. Automated tests check that the displayed version, `VERSION.txt`, HTML title, bundle names and runtime metadata stay consistent across builds.

## V10.33 — Three approved subtle enhancements

- **Heart Moment completion:** Only when the existing 60-second first-reading flow actually finishes, the original health-score circle displays a one-time 540ms soft halo. It does not change the countdown, pet picture, static expression, the 60-second result calculation or any full-screen screen structure. Opening an older result does not replay a false completion.
- **14-day baseline milestone:** Within the existing Me baseline card and calendar/detail, a one-time 620ms soft highlight is allowed only when the same pet's previously observed incomplete baseline becomes complete by the existing 14-valid-recording-day rule. Already-complete gallery pets do not replay an artificial milestone on first viewing. The next-valid-day personalization rule remains unchanged.
- **Real SDK battery status:** The existing *My device* card now supports compact `Battery NN% · Updated HH:mm` only when a currently active, non-demo, per-pet paired radio session and the factory adapter supply a verified, matching, fresh battery percentage and an actual `sampledAt` timestamp. Unsupported, missing, mismatched, stale and out-of-range battery readings are not shown. No hard-coded percentages and no new button or page.
- **Factory integration hook:** If present, `window.DeepPetPairingBridge.getBatteryStatus({petIndex,deviceId,type})` can supply a Promise resolving `{verified:true,source:'sdk',petIndex,deviceId,type,percent,sampledAt}`; the same validated payload can be pushed via `window.DeepPetBatterySDK.receiveVerifiedStatus(payload)`. `sampledAt` must be a fresh ISO time. The UI checks live radio ownership and model before accepting it. Until the real SDK exposes the adapter, the battery field is intentionally absent.
- **No architectural change:** The four main tabs, Home priority, Deep 1/7/30-day details and all detailed waveforms, Health records, Me baseline, 15 showcase profiles, score algorithms, pairing success confirmation, the decorative device wave and reduced-motion accessibility remain as in V10.32. This is not a sensor-quality project.

## V10.32 — Quiet, refined interaction feedback and safer context retention

- **Make a pet change feel clear without hiding the new pet's content.** After the existing pet identity and private workspace have been swapped, the new panel enters with a single 210ms fade and 3px rise. Switching to Blank/New Pet never retains a previous pet's scores, dates, records, or paired status. This is a purely visual effect, not delayed loading.
- **Do not reset when choosing the already-selected pet.** Tapping that pet again now keeps the existing Deep date, any current detail context and other transient work; if the pet picker is open, it simply closes. Selecting Blank from Blank on its Home summary similarly avoids a redundant reset.
- **Quiet focus on today's first actionable card and the selected dates.** The existing first Home priority card gains a static slender accent. Deep's existing single-day and 7/30-day controls show a 190ms one-off soft fade only when the selected category/range/day actually changes, with no new pages or waveform animation.
- **Better micro-interactions on existing controls.** Selected pet imagery and active ranges are easier to spot. Buttons offer a minimal pressed state. Long success/error reminders wrap on narrow screens, are announced politely to assistive technology and enter gently instead of being clipped. All new motion is disabled under `prefers-reduced-motion`.
- **Strict exclusions.** Four Home/Deep/Health/Me tabs, existing sections, popup routes, detailed charts and XY axes, score formulae, historical care showcase records, Bluetooth/4G differences, verified pairing rules, and device-wave honesty are unchanged. No additional sensor or signal-quality analysis is performed.

## V10.31 — Animated, verified collar pairing and visual device activity

- **A high-impact success check at the actual pairing boundary.** After the factory bridge returns `verified:true` with the matching model and device ID, the existing search → select → pair sequence shows a luminous animated green check, three completed steps, and the precise Bluetooth/4G model. After 2.9 seconds it automatically continues to the original collar-fit instructions; a one-tap Continue is available. Failed scans, canceled requests and unverifiable devices never show success.
- **A visible signal that the collar has been paired.** The existing **My device** card gets a gently moving decorative pulse and breathing trace, soft neon grid and illuminated paired pill only for paired devices. It does not replace, imitate or alter the authentic heart/respiration waveforms on Deep pages. The visual is labelled as an animation, not as sensor telemetry. A GPS demo is explicitly tagged Demo, and the former hard-coded 84% battery reading is removed.
- **Test the design without hardware or a fake connection.** Without a configured pairing bridge, the original search screen offers an *explicit* visual-preview button. This shows a clearly labelled animation preview, then returns to the previous page and temporarily displays the card wave labelled *not connected*. It never writes a device ID, flips the pairing flag or enables 4G GPS; the animation ends on its own.
- **Navigation and accessibility preserved.** No new tab or deep route; Home-origin 4G pairing and Me-origin pairing still return to their original pages. The fit guide, 15 demo pets, Health records, score algorithms, chart axes, single-day and long-period waveforms, internationalization and device-model feature boundaries stay intact. Animated elements stop for users with reduced-motion preferences. Real radio/eSIM SDK verification is still required on physical hardware.

## V10.30 — Distinguish sustained change from fluctuation and explain today's personal change

- **Understand whether a shift is sustained.** Directly inside each original Deep 7-day/30-day comparison, a short status distinguishes three-consecutive-day evidence, a difference in period means that is not yet sustained, a one-off adjacent-day fluctuation despite similar period averages, or overall steadiness. These use the original observed dates and comparison threshold. No new risk score, notification, wave graph or destination is created.
- **See how today's lower score compares with this pet's own recent history.** Within each existing Home priority card for the three score-bearing Deep domains, show today's score difference against the actual mean of at least three valid previously recorded dates within the prior six calendar days, and yesterday's difference when available. Never substitute missing days, combine different pets, or compare event bpm with a 0–100 score. The existing priority order is unchanged.
- **See today's already logged care background without a new click.** The original Home priority card group now briefly shows at most two genuine same-day Health entries from the same read-only source used by Deep, with the rest explicitly retained in Health. Planned medication times are never presented as actual dosage times. A same-day entry is not claimed to cause a sensor change.
- **Preserve all existing product behavior.** Four tabs, both New Pet states, 15 gallery examples and complete Health history, full single-day waves, original 7/30-day graphs, popups, click paths, displayed score weights, and signal-quality logic remain unchanged.

## V10.29 — What changed, what was recorded then, and what to review now

- **A direct answer to what changed.** The existing Deep 7-day and 30-day views now identify the strongest comparable shift among the original, actually recorded indicators, with dated high/low readings and the largest actual adjacent-day difference. The original two-metric early/later comparison, period graphs, waveforms, detailed data and 4-tab structure are unchanged. No diagnosis or new health score is inferred.
- **Health history beside the dated change.** The same existing Deep period screen displays this pet's real Health entries on the highlighted days and separately lists other records from the selected period. Only genuine event dates and times are used. At most one same-page disclosure is needed for longer lists; all original meals, medication, vaccinations, exams and care records remain in Health. Time coincidence is not presented as causation.
- **A reason for today's priority.** Home and its existing centered More now explain whether the item ranks because of a low daily score, several consecutive low days, a pending scheduled medication time, an existing physiological event, or a care record. A dose whose planned time has passed is explicitly *unconfirmed*, never declared missed. No extra clicks or pages have been added.
- **Corrected event-versus-score labels.** Recovery events and quiet-breathing changes are no longer described as a 0–100 health score or falsely labelled “below 90”; only the three actual scored Deep domains use score-specific text. All original score algorithms, signal-quality behavior and continuous waveforms are preserved.


## V10.28 — Pet-specific period changes, real care-event context and smarter reminder ordering

- **Deep stays Deep: period-specific intelligence without extra navigation.** On the existing 7-day and 30-day Heart, Sleep and Energy panels, an inline two-metric summary now compares the early and later calendar halves with their own dated observations. It reports original means, direction, percentage change, each half's observation count, and whether the last three consecutive calendar days show the same change. Missing metrics never become zeros or invented histories. The original detailed graphs, daily timeline, full-waveform controls, and all Deep routes remain untouched.
- **Single-day moments get factual care-event context.** The existing Deep single-day cardiac view places this pet's actual dated meals, care notes and confirmed medications alongside its physiological explanation. The existing heart/breathing event replay annotates only owner-provided meal/note times falling within 90 minutes of the physiological moment; records with unknown times and medication schedule slots are not falsely assigned to that time. Time adjacency is explicitly non-causal. Full records still belong to Health.
- **Priority by actual time and repeated days, not label sorting.** Home's one-line medication digest now chooses the earliest pending scheduled dose by stored HH:MM and retains all original doses in Health. If a day's Deep subscore is below 80 on 2–3 consecutive natural dates, its existing explanation names that persistence, and the priority engine uses the persistence as a tie-break without changing any score or risk threshold. Home continues to show at most three attention items with the original centered More to access the complete list.
- **No signal-quality changes and no structural changes.** No sample-frequency, signal-quality, medical threshold, baseline normalization, scoring weight or wave graph is adjusted. No new tabs, pages, routing depth, pop-ups, or additional device features are introduced. All 15 showcase pets, detailed Health records, separate Blank vs New Pet states, four-language UI, BLE-only health vs 4G-GPS distinctions and the whole existing SDK package are retained.

This is explainable temporal comparison rather than a verified veterinary diagnosis or treatment-effect estimator. Actual devices and veterinary thresholds require independent testing.

## V10.27 — Truthful occurrence times and prescription-completeness gate

- **Historical meals no longer inherit a made-up clock time.** New food-entry forms leave the meal time empty, retain that blank across multi-food edits, and accept an explicitly unknown time. Existing meal edit forms preserve empty times without silently changing them to noon. A meal without a recorded time is labeled as such in the existing list, not misrepresented as 12:00.
- **Other health notes keep event time independent of entry time.** The event-time field is optional, empty when unknown, and remains empty when reopening a historical note. Saving no longer assigns 12:00 or the current device clock. Dates and nonempty times are validated; per-pet notes and historical records are retained.
- **An incomplete legacy medication entry is not a complete prescription.** Older saved records may contain a medicine name and one hour but lack actual dose, unit, start date or duration. The plan remains visible for its owner to complete, but does not generate a daily dose reminder until all required information is explicit. No fake 09:00, one tablet or seven-day duration is silently substituted into an editable or displayed plan. The obsolete shortcut cannot persist a partial schedule.
- **Medication edits are fully validated.** The original modal now shows unknown dose, unit, start date and days as empty and requires the owner to fill them. Valid plans preserve their stored values and the existing time-keyed medication history. The showcase sample histories, score algorithms, Home/Deep/Health/Me, two empty states, BLE health-only/4G GPS, all 15 pets and their complete records remain unchanged.

This release improves data provenance and reminder safety. The device SDK, true medical accuracy and veterinary reference limits remain subject to real-device and animal validation.

## V10.26 — Laboratory-reference integrity and truthful care data entry

- **Preserve an actual zero laboratory reference limit.** The original Health report editor accidentally converted numeric `0` to a blank input. V10.26 retains both zero-inclusive lower and upper bounds and checks that any supplied interval has two finite, ordered limits; missing limits remain genuinely missing.
- **Do not copy one laboratory reference range to multiple different tests.** The existing OCR/manual import retains the original individual recognized test results. If multiple tests are recognized while a single global reference interval is filled, saving pauses and asks the guardian to clear that shared interval and enter each test's own range after import. A valid single-result interval remains supported. Nonnumeric manually entered results are rejected rather than being saved as numeric evidence.
- **No fictitious appointment or examination time.** Existing vaccine creation, edit, rescheduling, and imported records now preserve an optional empty appointment time; no automatic `10:00` is inserted. The vaccine history shows a time only when supplied. The import form no longer invents a `10:00` examination time for an uploaded old report.
- **Require deliberate prescription details.** Imported medication schedules no longer prefill 1 tablet, 7 days, 09:00, or a tablet unit as though they were a veterinary prescription. A guardian must enter dose quantity, unit, treatment duration and at least one scheduled dose time explicitly. All original medication and vaccination showcase histories remain untouched.
- **Unchanged core boundaries.** No additional tab or new Health section; Home / Deep / Health / Me and date scopes remain intact. All original 15 showcase pets and medication/vaccination/examination/food/activity records, two separate new-pet states, Bluetooth health-only versus 4G location, sensor SDK and every score formula are preserved.

The new regression tests exercise zero-inclusive intervals, malformed and incomplete references, multi-analyte OCR protection, explicit medication dosing requirements, time-free vaccinations and retrospective examinations, and cross-pet separation. Real SDK and veterinary accuracy still need animal/device validation.

## V10.25 — Actual vaccination date, not the day a button was tapped

- **Confirm the real date before recording a vaccine as given.** The existing Health vaccination completion action now asks for the actual administration date from a vaccination booklet or veterinarian. No guessed today/date prefill is supplied; invalid or future dates are rejected. The original appointment date remains intact.
- **Keep two dates independent.** The existing vaccination edit form distinguishes the scheduled appointment from actual administration. Changing the appointment must not rewrite the real vaccination date, and undoing completion clears the administration date while preserving the appointment.
- **Do not invent injection time or legacy dates.** Completed-vaccination history sorts by recorded actual vaccination date and does not misleadingly show the old appointment time as an administration timestamp. Legacy completed records lacking an actual date say "Scheduled date only (actual date not recorded)"; editing never prefills that unknown date with the appointment day. The existing weekly/monthly care history also visibly marks such records as appointment-date-only while preserving the entry. Upcoming appointments retain their scheduled date and time.
- **Maintain record integrity and all product boundaries.** Both user-entered and original showcase vaccine entries use the pet-specific stored override/record transaction. Home / Deep / Health / Me, original 15 showcase pets and full records, Blank vs New Pet, Bluetooth health-only vs 4G location, measured-data quality and every core score algorithm are unchanged.

Regression coverage includes backdated completion, blank/future rejection, schedule-vs-actual editing, cross-pet modal guards, cancellation, history ordering and original-record preservation. Real collar SDK and clinical/veterinary validation remain outside this code-only release.

## V10.24 — Time-accurate medication history and overlooked appointments

- **Do not copy a confirmed dose to another dosing time:** the existing medication history links a recorded confirmation to its actual scheduled `HH:MM` time when that value is available. Editing 08:00 to 09:00 never turns the unconfirmed 09:00 dose into a taken dose, and reordering 08:00/20:00 preserves the correct 08:00 confirmation. Legacy records lacking any time continue to use their original slot as a compatibility fallback.
- **Keep original confirmed-dose history:** if a guardian edits or reorders schedule times, the original taken/skipped history is preserved. Updating a newly ordered dose edits only that time's record; another dose from the same day cannot be silently removed by an old slot index.
- **Unconfirmed overdue vaccinations now remain actionable:** when a vaccine appointment date has passed but its record is still `upcoming`, Home's existing Today to-do asks the guardian to verify whether the vaccination occurred and update Health. It does not claim the pet missed the vaccine. Completed appointments disappear; future appointments remain in Upcoming Care.
- **No architecture or score changes:** Home / Deep / Health / Me, date-specific vs long-term placement, 15 original showcase pets and full record histories, Blank vs New Pet, Bluetooth health-only vs 4G location, and all physiology algorithms are preserved.

The new regression checks cover dosing-time edits, reordered slots, independent completion/undo, legacy medication history, cross-pet identity, overdue/today/future/completed vaccine status, and Blank isolation. SDK and real-device validation remain separate.

## V10.23 — Canonical upcoming care and report-level Today actions

- **Medication reminders now find genuinely upcoming starts:** the existing Health upcoming-care list looks ahead 30 calendar days using the same pet-scoped medication due engine. A multi-day plan appears once per dose slot on its next scheduled day, including courses starting after tomorrow. A profile-only pet with a user-created future plan is no longer artificially blocked from its own care reminder.
- **No superseded parasite-care reminders:** the upcoming list reads `dpWormEffectiveReminders()` rather than all historical deworming records. The latest internal/external coverage determines the live reminder, while the full original treatment history stays in Health.
- **Chronological ordering before the 12-item vaccine limit:** upcoming vaccination dates are sorted before limiting the list, so a recently entered earlier appointment cannot be hidden behind older insertion order. The same original three-items-then-centered-More layout stays unchanged.
- **One Home task per veterinary exam, not per blood-test line:** multiple abnormal or internally conflicting test rows from one `reportId` and date become one Today review task, with the number of other affected tests displayed. The underlying individual results, reference ranges, and scores are untouched in Health. Separate reports on one day remain separate tasks, and legacy rows without a shared report ID are not conflated.
- **Direct original report navigation:** opening that report-level Today task takes the guardian to its exact report in the existing Health UI, with a safe fallback to the full report list if the report changed or was deleted. No new screens, cards, or tab movements.
- **Preserved contracts:** 15 showcase pet histories, separate Blank and New Pet, the pet-scoped journal, Bluetooth health-only vs. 4G location, the 20 Hz SDK surface, device quality rules, and every core scoring formula remain unchanged.

The new regression scenarios cover cross-pet reminders, editing/deleting a treatment, out-of-order appointments, 30-day scheduled starts, grouped lab findings, and direct/fallback navigation. Runtime browser and hardware integration still require device-side validation.

## V10.22 — Honest lab-label conflicts and localized report transactions

- **Detect an existing scoring-engine contradiction:** when a report labels an examination result `normal` but the original numerical result lies outside its applicable reference interval, `DeepPetLabEvidence.item()` returns `kind=needs_review`, `reason=value_flag_conflict` and *no score*. The existing Home Today to-do now correctly asks the guardian to review this conflicting report instead of silently hiding it. The same rule also clarifies an abnormal lab flag with a numerically in-range value, without inventing disease risk.
- **Show why a laboratory test is pending:** Health's existing expanded per-test detail states that the original lab label and measured value disagree. The numerical score stays unavailable. The existing valid lower/upper reference bounds and original result remain visible to help review the source report; this display repair does not change the evaluation formula.
- **Preserve original unit typography:** reference values display the source report's stated reference unit when available, instead of unexpectedly changing capitalization during internal unit normalization.
- **Protect the entire report-editing transaction across languages:** validation errors, unavailable/failed PDF/photo storage, failed local persistence and safe rollback, delete confirmation, and save/delete success notices now follow the currently selected language (Simplified Chinese, Traditional Chinese, English, Japanese, and existing Korean compatibility). The same report-editing UI and storage workflow remain intact.
- **Unchanged boundaries:** no new Home/Deep/Health/Me modules or movement of daily versus longitudinal content. All original 15 sample pets and their simulated care histories, separate Blank and Shiba New Pet, BLE/4G feature separation, 20Hz interface, monitoring-quality rules, and the complete scoring engine are unchanged.

The new regression cases run the actual unchanged laboratory evaluator in addition to mocked UI boundary scenarios; automated unit tests do not replace device validation or a veterinarian's review.

## V10.21 — Same-day examination evidence and full report localization

- **Home examination actions are complete and traceable:** the existing Today to-do now considers the current pet's original examination records tagged `alert`, `abnormal` or `critical`, plus numeric deviations that the **unchanged** lab evidence engine already assesses below 90. It describes whether a concern came from an original report flag or an applicable numerical reference, without inventing a new medical conclusion.
- **Strong record isolation:** examination to-dos must match the selected pet and today's local calendar date. Imported rows claiming another pet are excluded; identical record IDs are not duplicated. Blank and profile-only New Pet remain free of showcase medical data.
- **Full Korean exam details:** the existing examination list, report editor, comparison captions, and expanded single-test evidence details now include Korean wording; the previous English/Japanese/Simplified/Traditional options are retained. Pet names, guardian-entered clinic labels, raw source references, result values and stored reports are left untouched.
- **No structure or formula changes:** no new tabs or cards. Daily prompts stay on Home; original reports and long-term laboratory histories stay inside Health. All 15 complete showcase pets, medication/vaccination/exam/feeding/activity histories, the 20Hz hardware interface, BLE/4G gates and core scoring algorithms are unchanged.
- **Scope of verification:** deterministic JavaScript regression tests cover explicit flags, numerical-only deviations, missing evidence, other-pet records, previous dates, duplicate records and multilingual report details. Real collar pairing, veterinary validation and measurement-quality accuracy are not asserted.

## V10.20 — Accurate calendar periods and honest Health comparisons

- **True previous-day comparisons:** Deep's single-day comparison now requires the immediately preceding calendar day. A gap of two or more days does not get labeled "yesterday" or "previous day".
- **Calendar-defined period halves:** Deep's 3/7/14/30-day early-versus-later summary splits the selected date window into actual calendar halves, rather than splitting available readings by record count. Missing per-metric values do not become physiological zeros or false changes.
- **Date-proportional laboratory plots:** Health's original examination report trend chart uses real elapsed calendar time along the X axis. Two days and two months can no longer be drawn at identical spacings.
- **Ambiguous same-day lab values:** If one metric has conflicting values for the same date, that date is excluded from the analytical trend and disclosed in the chart. Every original examination record remains intact and available.
- **Health mini trends show real gaps:** Existing weekly/monthly Health cards no longer convert missing numeric values to zero, nor draw straight segments through unmeasured days. The compact graph now labels both X and Y axes while preserving its location.
- **Unchanged boundaries:** Four tabs and all routes, 15 showcase pet dossiers and care histories, separate Blank/New Pet, Bluetooth/4G positioning gates, biometric-age precision, original 20Hz pipeline, quality thresholds and core scoring algorithms are unchanged.

## V10.19 — Consistent 14-day trends and honest HRV day counts

- **One 75/25 interpretation throughout:** The explanatory comparison between the most recent fourteen valid daily scores and the preceding fourteen now derives its mean from the same 75% physiological-status / 25% physiological-rhythm composition documented for the long-term model. This changes only the 14-day explanatory trend; it does not alter scores, monitoring-quality rules, report deductions or the canonical 30-day model.
- **One calendar date is one HRV trend day:** When several eligible HRV sessions belong to one date, the existing Deep HRV explanatory section first averages those measurements within that date, then gives every date equal weight. The “N days” caption counts unique calendar days, not recordings.
- **Correct HRV baseline provenance:** If RMSSD or SDNN has only an applicable group reference despite completed pet wear history, the explanation now says above/below/near the *available reference* rather than above/below/near the pet’s own usual range. A note identifies when at least one metric is group-based. No unverified cohort is invented.
- **Missing HRV is neither zero nor a broken page:** A valid heartbeat/breathing day may lack one HRV field. The existing daily and multi-day cardio cards now safely show `—` rather than crashing, and the multi-day means use only available positive values for that same metric.
- **Honest calendar curves:** The existing 3/7/14/30-day RMSSD and SDNN views pair readings with their actual dates. When an intervening calendar day lacks an HRV reading, trend segments stop at the gap and restart afterward; no invented zero points or continuous line fills the gap.
- **Strictly unchanged layout:** Home, Deep, Health, Me and their original route/scope boundaries, all 15 sample pets and care records, separate Blank and New Pet, Bluetooth/4G features, age precision, and the entire SDK and algorithm package stay intact.

## V10.18 — Safe references and trustworthy care-event comparisons

- **Missing pet baseline is not a number:** On the existing Deep cardio page, a real pet without an eligible pet-specific or verified group reference shows `—` rather than crashing when a null heart/breath reference is formatted. The adjacent caption says no reference is available. No inferred default heart rate or breathing rate is substituted. Each reference metric has a display-only source label so a completed 14-day wear history cannot relabel a group-only fallback as a pet-specific measurement.
- **No unsupported comparison:** The existing overnight breathing interpretation no longer compares to an imported demo profile default when no applicable reference exists. The activity-to-rest recovery interpretation is unavailable until the needed valid reference exists. Baseline-stage copy no longer promises that a verified cohort reference is always present.
- **Same-date events remain separate records but share one context window:** In the existing Health weekly/monthly event review, medications, vaccinations, examinations, food and activities logged on the same calendar date are listed together for one before/after score comparison. Neither event is declared a cause. Additional nearby events are explicitly flagged as confounders.
- **Honest completeness:** The event summary distinguishes too-few valid days from valid comparisons hidden under the original three-item display limit, and duplicate daily score dates stay excluded even when repeated three or more times. All original historical events and rich demo records remain intact in their existing pages.
- **Preserved architecture and math:** Four tabs, the selected day's placement, Health weekly/monthly information, Me 30-day model and 14-day baseline, 15 demo pets, the truly Blank pet, New Pet Shiba, Bluetooth/4G boundaries, score weights and algorithm/SDK monitoring rules remain unchanged.

## V10.17 — Explainable wellness, baseline stages and care chronology

- **Same four-tab architecture:** no tabs, cards, routes or daily/long-term modules are moved. Home and Deep retain their daily or selected-period information; the 30-day AI health model and the 14-valid-day baseline remain in their original Me analysis routes; event comparisons stay inside Health's existing weekly/monthly review accordion.
- **Explain, never invent:** the existing “How this analysis was made” disclosure now states the real 75% physiological / 25% rhythm component composition, the larger mathematical score-gap contributor, any applicable examination deduction, and why wellness age moves inversely. Results come only from `DeepPetWellness925.evaluate`; no causal or diagnostic claim, unverified cohort or second scoring model is introduced.
- **Honest baseline transitions:** distinguish missing profile, pet with profile but no readings, fewer than 14 valid days, a newly completed 14th day awaiting the *next* valid day, and an active pet-specific baseline. The 45-calendar-day cumulative policy remains unchanged.
- **Care-context comparison only where defensible:** Health's existing events-and-scores disclosure can show up to three events with two or more real valid daily scores in the three calendar days *before* and *after*, excluding the event date. It reports both original physiological-status and physiological-rhythm scores separately; insufficient evidence means no comparison, and temporal association is never framed as treatment effect.
- **No sensor changes:** original 20 Hz pipeline, monitoring-quality checks, score formulas, report weights, 15 showcase pets and full virtual care histories, Blank/New Pet, Bluetooth/4G boundaries and navigation are preserved. Added deterministic calculation and scope regression tests.

## V10.16 — Pet-first wording, owner attribution and accurate baseline dates

- **No human-oriented wellness wording:** user-facing Traditional Chinese, Simplified Chinese, Korean, Japanese and English phrasing now consistently describes the selected **pet**. Health comparisons are called the pet's own or pet-specific baseline; care entered by a guardian is attributed to the owner. No pet screen calls its health history or AI model a person's personal history.
- **Cumulative-day baseline clearly explained:** the full baseline needs 14 distinct eligible recording dates within the prior 45 calendar days; these dates need not be consecutive. Its first fully referenced comparison starts with the next valid scoring date. The visible 14-cell calendar is specifically the last 14 calendar dates, not a claim that the baseline ignores earlier valid dates.
- **Conditional peer references:** copy no longer promises that age/breed/size matched cohort data always exists. It only describes comparisons using *available validated* group references; no invented cohort or diagnosis is introduced.
- **Clear pet/guardian responsibilities:** the veterinary report, privacy explanation, first-time entries and recovery progression explicitly name pet records versus guardian edits. Navigation, all samples, demo medications/vaccines/exams/food/activity, Bluetooth/4G feature boundaries, 20Hz intake rules and all scoring weights remain unchanged.
- **Cross-language contract test:** `tests/qa_v1016_pet_language_and_baseline_copy.js` catches forbidden Chinese/Korean human-centric pet terminology, English pet baseline text regressions and mismatched cumulative-date copy. Archived earlier QA notes are historical engineering records, not current UI wording.

## V10.15 — Central display contract, accountable evidence, cross-page tests

- **Single public precision contract:** `assets/js/metric_format_v1015.js` defines per-metric units and decimal precision for AI wellness age, scores, heart rate, resting respiration, HRV, weight, sleep hours, recovery seconds and percentages. Key wellness cards, age comparison badges, trend labels and shared chart-hover values use the formatter instead of independently deciding decimal places. Missing numeric chart values now show `—` instead of silently converting `null` to zero. Calculation engines retain raw precision.
- **Auditable pet-scoped analysis:** `DeepPetEvidence1015.snapshot(pet,period)` rebuilds the analysis metadata from the selected pet's actual accepted dates, source category (real verified 20Hz or supplied showroom fixtures), period boundary, relevant exam date, model version and stale state. The wellness analysis has a compact, **collapsed by default** “查看本次分析依据” section. It does not claim missing or sample data is a real verified sensor reading.
- **Trace metadata for score summaries:** Existing 7-day evidence notes include the accepted dates, owning pet ID, source and model version as machine-readable attributes. They are reconstructed on every render; no cross-pet cache is introduced.
- **Release regression suite:** Adds adversarial tests for precision and negative zero, evidence date attribution, 15 populated showcase pets, Blank and New Pet, score color tiers, model isolation, and page switching. The tests do not substitute for real BCG/SDK pairing or phone-browser visual acceptance.
- **Preserved contracts:** No modification to medical scoring algorithms, data fixtures, profile photos, medication/vaccine/exam records, Bluetooth versus 4G capabilities, four-tab navigation or the 20Hz accepted-waveform policy.

## V10.14 — Consistent one-decimal AI wellness age across all pages

- **Fixed the specific bug:** The older V9.41 decorator rewrote the full-analysis AI estimated age with `toFixed(2)` after the shared V9.25 component had correctly rendered `toFixed(1)`. That conflicting override is removed.
- **Single display precision:** Home, Me, the full `View analysis` card, the age trend y-axis, chart point tooltips and the legacy age delta badge now show **one decimal**; the underlying age model retains its internal precision.
- **Rounding consistency:** Difference labels are calculated from the same one-decimal figures the user sees, avoiding visually contradictory equations or `−0.0` when the raw numbers differ by less than half a decimal unit.
- **Per-pet safety:** The final age display consults the active pet's model at render time and preserves `—` for absent estimates; Blank/New Pet remain unscored. All 15 gallery pets and all records are preserved.
- **Tests and scope:** Adds direct precision and age-value consistency regression tests. No health scoring weights, event thresholds, trend algorithms, 20Hz signal gates, Bluetooth/4G boundaries or navigation routes are changed.

## V10.13 — Evidence dates, prior-14-day personal score comparisons, and care-event context

- **Date-and-quality provenance:** Home's two scores, Deep, and Health's weekly/monthly review display the actual evidence cutoff and number of valid daily scores, without filling missing days as zero.
- **Personal baseline directly in interpretation:** For each of the two main scores, compare today's score against the preceding **14 separate quality-accepted scored dates**—excluding today from its own baseline. Without the prerequisite, comparison remains unavailable. Original score weights remain unchanged.
- **Care records paired to same-day scoring:** Weekly/monthly reviews now have an optional collapsed journal of medication, vaccination, examination, food, activity, recovery and notes; entries show the exact recorded date and only validated scores from that same date. Timing is explicitly not causal evidence or diagnosis. Future plans are never history.
- **Real-data integrity:** Verification for the 14-day wear calendar, baseline builder and veterinary report is aligned to owner-verified `20hz-waveform` samples, not just numeric heart and respiration values. Duplicated dates do not count twice, and comparisons observe the recent 45-day window.
- **Testing:** 76 JavaScript regression files pass, including the new ten-case adversarial suite. Automated Chromium screenshot testing was attempted but the execution host prohibited starting Chromium; hardware SDK and real-world medical performance remain unverified.
- **Preservation:** All 15 existing rich pet cases, the distinct Blank and Shiba New Pet, full four-tab UI, photos, 20 Hz interfaces and the Bluetooth-vs-4G distinction remain in place. The complete formula Word file retains Chapters 0–46 and adds Chapter 47.

## V10.12 — Record navigation, clinical-summary honesty and keyboard inspection

- **Two distinct More behaviors:** Health's upcoming-reminders More remains a native expand/collapse control. The separate recorded-care history More opens a complete chronological archive, using only the selected pet's existing records and original detail-page routes. No record collections have been removed.
- **Veterinary-summary missing dates:** The exact dates excluded by the signal-quality gate, with available reasons, are embedded in both the on-screen report and the exported print/PDF HTML. There are no invented fill-in measurements or hidden date gaps.
- **Physiological rhythm evidence:** Reported calmness and heartbeat-rhythm means are now calculated only from the same quality-passed daily slots used by the report. Real-device data that cannot produce a valid rhythm score displays a neutral dash, not 0/100. Each metric shows its valid-day count and observed date span.
- **Truthful chart description:** The report now describes the actual renderer: valid consecutive days are connected, and its line breaks across missing/invalid days.
- **Accessible trends:** The existing weekly/monthly review charts retain mouse/touch numeric tooltips and now support Left/Right/Home/End keyboard selection with a visible focus outline.
- **All established boundaries preserved:** Home/Deep/Health/Me, 15 fully populated showcase profiles, one truly Blank profile and one photo/age/weight/breed-only Shiba New Pet, all medication/vaccine/exam/food/activity records, 20 Hz signal quality rules, Bluetooth/4G separation, status colors and unchanged score formulas.

## V10.11 — Profile identity, health trends, tour and review UI audit

- **Two separate introductory cases:** The Blank sample remains completely empty. The adjacent Shiba Inu is named New Pet with its own intact portrait, breed, age (2 years) and weight (9 kg), but has no health measurements or medical records. Its edit-profile photo is restored and an old unsaved “空白檔案” nickname is migrated without overwriting saved user edits.
- **Emergency placement and wording:** Existing urgent alerts now appear directly under the pet hero and above Today's Summary. A day without alerts reads “目前沒有當日應急提醒”, with no `N/A` display.
- **Consumer terminology:** “身体状态／身體狀態” appears as “生理状态／生理狀態” across existing sections and dialogs. Estimated biological age is rendered to one decimal.
- **Model curve integrity:** Gallery-only 30-day chart uses day-by-day values from the already-established 75/25 component score, so real day-to-day highs and lows are visible. The corresponding age curve comes from the *same daily score* and is inversely related. The headline 30-day model and its age continue using the original long-term formula; real-device missing dates remain missing.
- **60-second introduction:** Four pages now use one illustrated overlaid red heartbeat/green breathing waveform with simple axes followed by static score, care-record and AI model diagrams. Technical RMSSD/SDNN explanations are in everyday language; unexplained “12 test items” and three extra trend charts are removed.
- **Care and reviews:** Recent-care `More` labels omit appended counts and open an all-record detail page using existing record sources/routes. Weekly physiological-rhythm trend starts collapsed, and both weekly lines have numerical hover/touch readings. Missing observation dates are annotated with the available quality reason; Luna's previously *intentional synthetic* missing days were removed for the fully connected showcase example.
- **Boundaries preserved:** Home/Deep/Health/Me, all original record collections and score rules, score colors, Bluetooth/4G feature boundary and actual SDK acceptance gates remain unchanged.

## V10.10 — Honest real-device alert values and wear-quality evidence

- **P1 urgent alert integrity:** The existing Home alert card no longer converts absent event values or activity-matched references to the misleading number `0.0`, or displays `NaN`/`Infinity` when imported metadata is malformed. An unavailable value is rendered `—`; no verified event is silently dropped or recalculated.
- **P1 no fabricated event clock:** Missing or invalid event minutes no longer produce a made-up `00:00`. The existing time field is shown when present (escaped as text); otherwise a legitimate integer minute 0–1439 is formatted or the label states that time is unavailable.
- **P1 input-label neutrality:** Unknown event kinds or severities do not acquire a fictional `Heartbeat` or `Mild change` label. Existing recognized kinds, levels, and alert-score ceilings are untouched.
- **P1 valid quality labels:** On a real evidence day, unavailable or invalid wear seconds and coverage ratios are omitted independently instead of appearing as `NaN min` or `NaN%`. The original Home cards remain in place.
- **Scope:** Zero-signal refit, real event verification and alert thresholds, the four-tab architecture, all score formulas, 15 rich showcase pets, Shiba New Pet/Blank, 20Hz integration interface, all photos and all historic care entries remain unchanged.

## V10.09 — Exact historical dates per metric and secure alert time display

- **P0 per-metric date provenance:** Existing Deep score-date stamps for the four cardio sub-indicators and the three energy/recovery sub-indicators now use the dates on which that **specific metric's score** is eligible. When one sub-score is observed only on November 10 while another is observed on November 15, they no longer both claim an invented November 10–15 history. The selected main-domain score still uses its own existing 7/30-day completeness denominator.
- **P0 missing-evidence clarity:** When a score's own underlying daily field has no eligible date, the accompanying date label is omitted instead of borrowing another score's observation date. No new measurements or scores are fabricated. Unmapped pre-existing legacy modules are left unchanged.
- **P1 safe event timestamps:** A verified real-device alert may carry a supplied event time. The established Home urgency card now escapes that time as plain HTML text, preventing imported timestamp metadata from being interpreted as a UI tag. Alert verification, severity, score gates, and navigation remain identical.
- **Scope:** The four original tabs, investor gallery with all 15 pets and rich care records, New Pet Shiba and wholly Blank, score formulas, existing grades/colors, Bluetooth/4G boundaries, 20Hz acquisition interface, photo assets, and original controls are all preserved.

## V10.08 — Accurate per-domain coverage and uninterrupted reading

- **P0 domain-specific evidence:** The existing 7/30-day data-completeness indicator now counts scored days for the **selected Deep domain** only: cardio, sleep, or energy/recovery. A day with only a cardio score cannot count as a valid sleep-scoring day. A previously broad “3/7 days recorded” indication beside every metric would overstate what was actually observed.
- **P0 placement precision:** The count is shown only beside the existing *main score* for that domain, rather than repeating a domain-wide figure next to heart, breath, HRV, and other sub-scores whose eligible-day totals can differ. No cards, modules, pages, or score weights are added.
- **P1 smooth local-midnight refresh:** An automatic same-page midnight refresh now retains the current scroll position. Navigation still uses the original scroll-reset rule; foreground/hidden, onboarding, modal, history-selection, and active-entry protections from V10.07 remain in force.
- **Evidence and regression checks:** The new source includes adversarial tests for uneven domain coverage and missing-day reports. All original demo animals, profile-only Shiba New Pet and completely Blank, records, profile images, established scoring engines, color thresholds, and BT/4G boundaries remain unchanged. No external deployment requested.

## V10.07 — Cross-midnight accuracy and honest sparse-period evidence

- **P0 midnight view refresh:** An already-open Home/Deep page refreshes its day-dependent score, status and reminders after the user's local date changes. A foreground check runs on tab reactivation and at most once per minute while the page stays visible. No restart is needed. Modal dialogues, detail pages, active form entry and onboarding are not interrupted.
- **P0 personal history boundary:** A Deep view showing the previous *current* day follows the calendar to the new day; an intentionally selected older date stays selected. The established per-pet score cache is invalidated at rollover, so neither yesterday's current summary nor an obsolete pet score persists on a new date.
- **P1 sparse-period transparency:** The existing 7/30-day Deep score timestamp now additionally says how many days in that calendar window contain an eligible score, only when there are gaps. For example, three recorded days in a seven-day view are explicitly presented as **3/7 days recorded** rather than implying complete seven-day evidence. Simplified/Traditional Chinese, English, Korean and Japanese are supported in the existing stamp; no new card or tab is added.
- **P1 regression coverage:** Automated boundary tests now exercise foreground/hidden behavior, 23:59 to 00:00 transitions, historical date preservation, editing protection and sparse multi-day labels. Original 15 showcase pet records, both New Pet/Blank states, photos, scoring equations, grade colors, and BT/4G separation are kept as-is.

## V10.06 — Fresh laboratory context, permanent pet identity and truthful score dates

- **P0 health-record consistency:** Health's existing examination summary now evaluates the currently selected pet's actual saved laboratory examinations using **today's date**. It no longer asks the last collar measurement to determine whether an independently entered lab report exists. A valid but old examination remains visible when no new collar data is available; a newer incomplete examination is identified as pending review, never mislabeled as no report or silently substituted for the last assessable result.
- **P0 cross-pet identity durability:** New Pet and every newly created owner pet receive a stable public ID before their first save. Missing legacy owner IDs are assigned and immediately persisted upon first lookup; the ID is not regenerated by subsequent view changes. The original pet index, care records, gallery IDs, blank profile, device settings, four main tabs, and social page architecture remain intact.
- **P1 legitimate score-source dates:** Existing Home/Deep score-date labels reject placeholder days whose score fields are entirely unavailable. Historical windows are sorted and label only genuine eligible dates, with a single day shown as one date rather than a duplicated start/end range.
- **P1 report evidence provenance:** The existing detailed examination view displays the report fusion's **potential present-day** weight under the same established algorithm. The wording makes clear that a laboratory result alone cannot fabricate a daily wearable score. Partial veterinary review, attachments and missing reference ranges are distinguished in the existing report summary, without adding UI modules.
- Source photos, all 15 investor-gallery pets and their full sets of medicine/vaccination/exam/food/activity/recovery examples, standalone Blank and Shiba New Pet, score weights/tiers and Bluetooth/4G boundaries are preserved. No Netlify build requested.

## V10.05 — Score observation dates, lost-signal re-wear and rolling baseline progress

- Existing Home daily-score lanes and Deep daily/domain scores now show their **actual eligible observation date**; 7/30-day scores show the exact eligible date span. The existing score-detail dialogs disclose source date, verified observed minutes when available, and whether the source is a gallery fixture or a real 20 Hz signal. No invented clock timestamps or new screens.
- For an attached device, three consecutive **2-second dual-channel zero** windows trigger the existing Me > device fitting reminder even when there was no preceding stable waveform. Abrupt near-zero loss with a verified prior signal retains the prior reminder; a signal dropout never means cardiac/respiratory arrest and cannot itself create a score of zero or a health alert. The already-existing reminder switch, preview button, and other urgent alerts remain independent. Numeric SDK pet identifiers now resolve to the same stable ID used by the existing reminder switch.
- The real owner's existing rolling 14-valid-day baseline, restricted to the **last 45 days**, now displays its date range and last valid update. Where two full 14-day eligible groups exist, the baseline detail includes their actual difference in mean wellness scores, without asserting a medical improvement; incomplete comparisons remain N/A. On the 14th valid recording day, the UI explains that today's scoring uses preceding evidence, with the full personal comparison starting on the next valid day.
- Original 15 investor-gallery pets, extensive artificial care/exam/activity records, completely Blank and Shiba New Pet profiles, all four tabs, original score formulas and tier thresholds remain unchanged. No Netlify or external deployment is included.

## V10.04 — Same-day alerts, correct score explanation and current baselines

- Fixed Home priority banners, the existing summary dialog, score-evidence wording, the alert list and hover titles to use **today's exact date**, never the most recent historical recording. Without today's verified data, there is no counterfeit "today" warning or score.
- Repaired a false score-mismatch warning: the existing detail dialog now explicitly explains how mandatory-low-component guards and verified-event ceilings produce the final daily score. The 42/30/28 formula, all other weights and color tiers are unchanged.
- The real collar's 14-valid-day personal reference and accompanying 70/30 average now use valid sessions within the same recent 45-calendar-day evidence window as the established personalized-alert policy. Long-inactive owners cannot accidentally use last year's data as a current baseline; every gallery case keeps its existing 30-day examples.
- Localized the existing full alert list with distinct **no verified measurement today** and **verified measurements with no alert** messages in Chinese, English, Korean and Japanese.
- Corrected New Pet's profile-only description from "height" to the actual saved field **age**. No new page, card, tab, purchase route, sample record, score weight or image changes.

## V10.03 — Four P0/P1 integrity improvements without structural changes

- P0: bind new real sensor readings to the pet's stable public ID plus their legacy numeric index; reject conflicting stable ownership and preserve the original raw records for review. A changed collar does not erase the same pet's historical readings.
- P0: unify verified wear-day checks across the signal-scoring engine, 14-day quality display and Home score source. Unreported optional quality metrics show neutral N/A rather than a false failure.
- P1: verified heart **or breathing** alerts impose the same severity ceiling on both headline score families, without modifying their weights; Health uses breed/age/weight for profile-only prevention and food estimates while real photo confirmation remains necessary for device pairing.
- Small, inline evidence explanations were added to existing score lanes and preventive-care text. Home/Deep/Health/Me, full gallery data and records, empty/New Pet scenarios, and all prior design sections stay intact.

## V10.02 — Correct breed photos and prevent identity leakage

- Replaced the erroneous **Saint Bernard** with an accurate **Shiba Inu**
  for **New Pet**. Profile/avatar and the separately cropped Home hero use
  the same pictured dog; versioned file paths also prevent old-photo cache.
- Audited all **15 fictional showcase portraits**. **Leo** now uses a Pug
  rather than a French Bulldog image, and **Snowy** uses a Golden Retriever
  rather than a Cocker Spaniel. Both also have breed-consistent original and
  four mood images. Names, grades, score arrays and medical/care event records
  are unchanged.
- Corrected the **illustrative** Snowy profile from **4.8 kg / 500 kcal**
  to **24.8 kg / 1050 kcal** at one year of age, consistent with other
  fictitious Golden Retriever examples. These numbers are not prescriptions.
- Owner-created pets without photos now receive a neutral paw placeholder,
  **never** another breed's headshot. Completely Blank continues to show no
  pet image or identity; profile-only New Pet has no physiological score or
  health-history rows. Owner-uploaded photos and deliberate edits win.
- Resolved Heart Moments' demo portrait using the pet's current fixture file
  path, so it cannot silently show an obsolete filename after image updates.
- Existing Home / Deep / Health / Me, today's to-dos, centered More, and all
  fifteen fictional medication, vaccination, examination, feeding and activity
  histories remain available. The version string and asset fingerprints are
  updated for cache invalidation.

## V10.01 — Home today to-dos and distinct pet profiles

- Restored the existing Home **今日待辦** priority panel that a legacy Home cleanup
  mistakenly removed. It uses the existing combined register for low-score
  dimensions, health actions due today, and nearby messages, showing three at
  most. Only when there are more than three entries does a centered **More**
  appear; the full list opens on Home and each entry opens its matching page.
- Removed the duplicate **今日待辦** heading/list from Health's top level while
  retaining **近期健康提醒**, preventive care, feeding, medication, reports,
  vaccination, notes, and recovery in their previous order.
- Fixed a missing destination: a **deworming** action in today's to-do list
  now opens the Health deworming page instead of doing nothing.
- Ensured the established **New Pet** profile has the photo, name, breed,
  age and weight in both Home and Me. The independent **Blank** state has none
  of these fields; both remain entirely without physiological histories.
- All 15 investor-gallery fixture data sets, physiological scores and
  algorithms are byte-for-byte preserved.

## V10.00 — Correct 60-second waveforms, New Pet identity and trend lines

All fifteen monitored showcase profiles keep their original numerical data,
health records, score and age-estimation formulas. No new pages or navigation
categories were added; V9.99's Home / Deep / Health / Me layout remains intact.

- The first 15-second introduction stage explains BCG as one sensing method,
  displaying **heartbeat waveform** and **breathing waveform** in two tracks
  on a shared time axis. There is no separately labeled “BCG curve”.
- **Blank** has no identity data at all; **New Pet** has its photograph, name,
  dog/breed, age and weight, consistently on Home and Me, but no readings,
  scores or historical care records. Actual edited owner profile values win.
- Heartbeat and respiratory detail charts use their existing page background
  instead of stacking another pale rectangular backdrop.
- Wellness model **30-day score** and **AI-estimated age** graphs connect each
  consecutive showcased point for continuously worn investor-gallery pets.
  Real monitored pets still show genuine gaps on unavailable dates.

## V9.99 — Restore the original architecture and repair Heart Moments

**Targeted corrections only.** The Home / Deep / Health / Me structure,
existing scoring formulas, fifteen fully populated investor/engineering
profiles, photo assets and fixture values are preserved without regeneration.
Blank remains completely empty; New Pet has only its basic profile.

- Put the day-over-day positive/negative change *inside* each of the two
  original **今日總結** score lanes. Remove the duplicate **今日評分變化** card.
- Restore Home to daily priorities: original two scores, emergency prompts,
  **今日待辦** (the existing priority-action panel), GPS and other original
  entries. **預防性健康管理** appears only in Health, never Home.
- Remove newly appended **量測可信度** sections from Deep and Me, plus the
  owner-facing **展示資料** labels. Pairing and collar-contact checking remain
  within the original paired-device flow.
- Rebuild the existing Health **近期健康提醒** row from its pet-specific records;
  show at most three by default and exactly **one centered More** if needed.
- Add a real HTML pet-photo fallback behind both Heart Moments poster views;
  embed the chosen photo in exported SVG before rendering PNG. This restores
  the complete image backdrop in previews and saved files.
- Do not insert an extra summary, personalized-warning or historical feed
  into the original page ordering. Existing sections and their contents remain.

## V9.98 — Previous explainable priorities and health-history review

**Investor gallery and engineering dataset are unchanged.** All 15 populated
fictional pet scenarios keep their health, sensor and record values; Blank is
fully empty, and New Pet shows only its photo, name, species, age and weight.
No real-device SDK behavior or medical thresholds were revised.

- Fixed a potentially misleading score explanation: unavailable component
  scores never count as below 90, and a low **Body rhythm** now appears among
  the two strongest priority links with a correct Home destination (not the
  unrelated Cardio tab). When an overall score is low but no component can be
  highlighted, the text no longer claims the pet is stable.
- Extended the contextual **Daily health records** list from 30 to 90 days,
  keeping up to 90 entries **per record category**, rather than one shared
  90-entry cap that could hide older exams behind numerous activity events.
  Long lists expand 24 rows at a time to avoid overloading a mobile screen.
  The display explicitly identifies its date range.
  Added concise, clickable **latest exam / vaccination / medication** dates,
  all derived from actual existing per-pet event records and never invented.
- Corrected the scheduled-coverage unit from an ambiguous percent plus “days”
  to the unambiguous **percentage of the full day**. Continued wording cleanup
  makes health-record actions easier to understand in English as well.
- Maintained the earlier regression checks and added 33 targeted
  V9.98 safeguards for nulls, high/low rhythm, chronology, category navigation
  and the two distinct empty profiles. Actual Bluetooth/4G SDK integration
  remains outside the scope of this code-only review.


## V9.97 — Plain-language health records and easier investor review

**Product phase remains unchanged:** the fifteen existing pets and all their
fictional monitoring, examination, medication, vaccination, feeding and
activity histories remain populated for investors and engineering reviews.
The completely Blank profile and basic-details-only New Pet remain distinct
and contain no generated health records. A later consumer release will have
no preloaded investor-gallery data.

- Replaced the ambiguous visible expression **「照護記錄」** and its related
  care-log variants with the clear **「日常健康紀錄」 / Daily health records**.
  Contextual explanations specify medication, exams, vaccines, food and
  activity instead of forcing investors to guess what “care” means.
- Updated corresponding Korean, Japanese and English labels. All existing
  Home / Deep / Health / Me navigation and original onboarding imagery stay.
- Added an accessible, scrollable **category filter** above the 30-day health
  history: All, medication, vaccines, examinations, food, activity, recovery,
  notes. Every category displays the count derived from the existing records.
  It does not change or regenerate sample numbers; the default remains All.
- Switching to a different pet keeps that pet's independent filter selection;
  expanding one category does not contaminate another pet's data. Selecting a
  new filter resets only the display expansion, never underlying records.
- Normalized outdated `index.source.html` resource query tokens from earlier
  versions to `v=9.97`, avoiding stale strings when the unbundled developer
  entry point is viewed. Production bundles remain content-hashed.
- Added a separate V9.97 terminology and filter regression test alongside all
  59 previous JavaScript suites. The scoring engine and sample data remain
  unchanged.

## V9.96 — Current investor and engineering showcase 2026 11 15

**Purpose:** This WebApp is currently a comprehensive investor presentation
and internal engineering test environment. All 15 bundled pets and every
fictional measurement, medication, vaccine, examination, feeding, activity
and recovery record MUST remain populated. There are two independent onboarding
cases: completely Blank and profile-only New Pet. No demo history is copied
into either empty profile. A future consumer build will start with no sample
health records; that is a separate release configuration, not a reason to
strip or blend the rich current showcase.

- Rebuilt laboratory result charts with proportion-preserving SVG, a complete
  horizontal date axis and a numeric vertical axis with three visible ticks.
  Chart points and date buttons remain interactive and display unit-accurate
  original values.
- Improved the existing Deep detail explanations to cite the **actual selected
  demo day's** breathing, heart, estimated rest or recovery values when those
  measurements support the statement. Other cases receive honest category
  summaries instead of a made-up single-metric explanation.
- The rest-duration number in a low-score explanation now uses the same
  selected-night timeline-derived duration displayed by the sleep chart;
  divergent cached daily values cannot produce contradictory numbers.
- A missing score now displays an explicit insufficient-data sentence, never
  an automatically generated negative health interpretation.
- Added 185 executable investor-gallery assertions: 15 portraits, 450 daily
  records, 120 medication examples, 45 report examples, 30 completed vaccine
  examples, color-tier diversity, pet-switch preservation and graph axes.
- Retains all existing Home, Deep, Health and Me flows, pet histories,
  proprietary scoring prototypes and 60-second introduction; no Netlify build
  or fifth bottom-tab is introduced.

## V9.95 — Historical release 2026 11 15

This release closes the remaining **synthetic-versus-real evidence leakage**
inside longitudinal scores. It keeps both different empty identities and the
original fifteen showcase pets, their imagery and all their fictional records.

- A first verified collar day no longer compares against yesterday's showroom
  example. Day-over-day deltas are omitted when the evidence source changes.
- A verified collar day must build its own 14-day personalized baseline from
  14 other verified days; synthetic examples cannot manufacture an alert.
- The underlying physiological scoring engine now rejects explicit motion
  interference and unknown sampling modes, matching the UI and alert gate.
- The engine's 14-valid-day comparison uses eligible, same-source observations
  within the previous 45 calendar days; last year's readings cannot become a
  supposedly current personal reference.
- Calendar period averages and exploratory biological-age trajectories never
  mix authentic sensor scores with showroom examples across different days.
- Multilingual explanations disclose a change of data provenance and a
  deliberately restarted personal baseline, without inventing a score.
- The V9.95 adversarial suite adds source-boundary, freshness, and engine
  quality parity tests. Hardware and veterinary accuracy still require real
  validation; these are engineering safeguards, not new medical claims.

## V9.94 — Historical release 2026 11 15

This release audits cross-pet evidence isolation and the agreement between
measured-score eligibility and emergency-change notifications. It preserves
both **different** onboarding profiles: a completely Blank identity and a
profile-only **New Pet** with avatar, name, breed, age and weight but no
monitoring or care history. All fifteen showcase pets retain their existing
full fictional medication, vaccination, examination, feeding, activity and
recovery histories.

- A real 20 Hz record can suppress a same-day gallery score only for the same
  pet. A foreign pet's record no longer hides another pet's valid example.
- The same full wear, motion, calendar, continuity and coverage evidence gate
  now governs both a real daily score and its verified change alerts. A
  quality-rejected day may not still raise a purported verified warning.
- Unknown explicit sampling modes are rejected consistently across the
  measurement adapter, score-integrity layer and explainable-intelligence
  layer; missing legacy mode retains the continuous-day rule.
- Gallery vaccine records retain historical completed examples when a pet's
  schedule contains only future vaccinations. Pending vaccine tasks are never
  called completed events.
- The weekly/monthly SVG score curve preserves its original proportions;
  X/Y tick labels cannot be stretched separately from the curve.
- Pet avatar updates now use the same rollback-safe persistence transaction as
  the health record editor; failed storage writes retain the previous photo.
- Tests cover cross-pet source precedence, rejected-day event exclusion,
  planned-versus-completed vaccines and the two distinct empty profiles.

**Historical note:** V9.90 briefly merged Blank and New Pet. That design was
reversed in V9.92. Do not implement the obsolete V9.90 single-profile rule.

## V9.91 — Historical release 2026 11 15

Deep audit after the V9.90 wellness restoration found **two cross-module
contract gaps with practical effects**. The 14-day personalization engine still
rejected the V9.73 showroom data provenance tag that the 30-day wellness model
now recognizes. In addition, three evidence layers skipped `profile.id` when
checking whether a record actually belongs to the selected pet. Conflicting
owner IDs could therefore be used in a wellness score or lab assessment.

- Aligns all three relevant score/14-day/report/period consumers on the two
  explicitly allowed showroom tags; retains all original sample histories.
- Enforces all four explicit owner-claim fields (`petId`, `ownerPetId`,
  `profile.petId`, `profile.id`) across wellness, lab assessment and
  personalized monitoring; a contradiction is not silently accepted.
- Removes the last Milo fallback from a long-term model lookup with an invalid
  pet ID. Such a request now returns an unavailable result.
- Localizes chart headings, horizontal labels, Y-axis captions, breathing
  legend and numeric tiles in the four-stage 60-second tour to simplified /
  traditional Chinese, English, Japanese and existing Korean fallback.
- Increases SVG axis-label font sizes while keeping a complete proportional
  393-CSS-pixel iPhone-width layout. Adds the missing Japanese New Pet name.
- Preserves the 15 showroom pets, New Pet profile, onboarding images, records,
  Home / Deep / Health / Me navigation, Bluetooth/4G capability distinction.

## V9.90 — Historical release (Blank/New Pet merge superseded) 2026 11 15

The fifteen unchanged showroom pets are visible again in both Home and Me's
Pet Wellness Model. Their existing 30-day case-calibrated evidence uses the
explicit `synthetic-extreme-showcase-v973` label, which V9.89's longitudinal
model inadvertently omitted. This release admits only the two known showroom
provenance labels (and still strictly quality-gates real sensor data).

- Removes the second, independently stateful Blank selector. The original
  `New Pet` profile now serves as the **only** new-user / no-monitoring case.
  Existing stored New Pet photo, breed, weight, notes and any future verified
  measurements remain untouched; obsolete Blank selections navigate to it.
- Uses the supplied original 940×988 four-dog mountain photo **only in the
  first stage** of the optional 60-second tour. The five-screen onboarding
  image set is unchanged.
- Sets the four-stage tour to an iPhone 15 reference width (393 CSS pixels),
  with scrolling as needed. All diagrams have complete X/Y tick marks, fixed
  SVG aspect ratios and readable separate metric cards; no tiny overlaid
  science card or phone-shaped crop is used.
- Adds a fallback for New Pet's avatar when an old photo URL is broken, and
  restores a wellness card if a later layout layer omits it.
- Retains the 15 complete showroom profiles and every sample medication,
  vaccination, lab exam, feeding, activity and recovery record; no records
  are deleted. Empty New Pet monitoring values are deliberately N/A.

## V9.89 — Previous release 2026 11 15

This release closes additional real-scoring gaps beyond the V9.88 ingestion
fixes, while preserving all original showroom pet photos and history:

- The 14-day **feature-level** baseline now rejects an equally qualified,
  contradictory duplicate date. A duplicate day cannot prematurely unlock
  the 70%-individual reference, alter HRV history, or overcount recovery events.
- Biological-age research indices no longer rely on last-write-wins day
  selection. Equal-quality contradictory score days cannot produce a
  seemingly precise 14-day age estimate.
- Ingestion and reading now rank an equal-length record by verified
  `timeCoverage`; real-day JSON object key order and unordered event order do
  not create false conflicts. Quality-gate fields affecting downstream scores
  are included in the conflict fingerprint.
- Scheduled observed time cannot exceed scheduled time, and the final score
  integrity gate validates real calendar dates. Nested owner IDs must match.
- Actual real-mode waveform and fit-quality screens use the same accepted day
  as the score engine. A disputed imported day cannot display a misleading
  waveform as though a qualified reading had been established.
- No changes to Home/Deep/Health/Me architecture, four-language coverage,
  Bluetooth/4G product separation, score weights, thresholds or rich gallery
  records. Hardware SDK and veterinary thresholds remain unvalidated.

## V9.88 — Previous release 2026 11 14


Fixed the actual verified-device WebApp ingestion and read path, which still
had last-upload-wins behavior despite V9.87 model-layer safeguards:

- A shorter verified 20 Hz recording cannot overwrite a longer same-day
  recording. A longer replacement is accepted without double counting.
- Exactly repeated uploads are idempotent; same-quality but conflicting daily
  evidence is rejected. Historical contradictory ties are excluded from the
  real-data score path and exposed in `excludedAmbiguousDays`.
- The day-ingestion transaction restores prior records and fresh-profile flags
  if browser persistence returns false **or throws**.
- Historical records whose embedded profile identifies another pet are not
  adopted during a new import. Real data remains independent for each pet.
- All prior demonstrations, charts, records, photos, languages and four tabs
  are preserved. This change does not invent sensor measurements or a medical
  diagnosis. Production sensor performance requires hardware validation.

## V9.87 — Previous release 2026 11 14


The 15 enriched showroom pets and their medications, vaccinations, examination
reports, meals, activities, recovery narratives and photographs are unchanged.
The main Home, Deep, Health, Me navigation and four-language copy are retained.

- A repeated date is no longer overwritten by whichever score happens to be
  imported last. Qualifying device waveform evidence takes precedence over a
  synthetic gallery fixture. Among two verified recordings on the same day,
  more observed and quality-verified seconds take precedence.
- If equally qualified records disagree, the date is marked as ambiguous and
  excluded from personal guidance, long-term wellness and period score charts;
  the long-term result exposes the excluded dates for review. Exact duplicates
  continue to count as one day.
- A real 20 Hz collar result must pass the full contact, signal, clock and
  observed-duration gate before any daily 0–100 composite can be published.
  Missing or invalid evidence is **unavailable**, never a reassuring 98/100.
- An unsupported real-recording HRV value is not allowed to boost cardio
  score; the original device-only rhythm and body score weights remain intact.
- `tests/qa_v987_same_day_evidence.js` adds **35 adversarial checks**. The
  complete release must pass **50 JavaScript QA suites**.
- The medical and wellness score thresholds remain research hypotheses and
  require prospective, species-specific veterinary validation before external
  health-risk or emergency claims.

## V9.86 — Previous release 2026 11 14

This release tightens the boundary between *observed evidence* and
*pet-specific advice*. It retains all 15 showroom pets, their records and
media, the four primary pages, four languages and candidate score weights.

- A pet-selected personalized trend or 30-day wellness model requires a
  positively matching pet identity. Completely ownerless imported readings
  remain available only to explicitly anonymous legacy computations; they
  cannot populate the selected Milo/Luna/New Pet record.
- An examination cannot generate a named pet's follow-up or alter its
  longitudinal wellness unless that report is tagged to the same pet.
- Invalid negative or above-100 component scores are excluded from trend
  calculations, even if the parent score itself is valid.
- Each trend explanation reports the **actual number** of eligible prior and
  recent measurements in Chinese, Traditional Chinese, English and Japanese.
  It no longer claims 3 measurements were used when only 2 were usable.
- The SDK refuses epoch timestamps outside JavaScript Date's supported range
  with an explicit error before modifying the in-progress session.
- Long-term results use a true `no_sensor_days` reason for an empty New Pet
  record, and an available result no longer carries a contradictory
  `insufficient_longitudinal_days` reason.
- `tests/qa_v986_adversarial_evidence.js` adds **38 focused checks** on top of
  the previous 48 suites; all 49 JavaScript suites must pass before release.

## V9.85 — Previous release 2026 11 14

This release addresses newly reproduced medical-evidence and SDK boundary
errors without changing the gallery records, navigation, four-color scoring
bands or validated candidate weight definitions.

- Health recommendations no longer call an examination **recent** if its date
  is older than 180 calendar days, in the future, malformed or unavailable.
  Date and score checks also exclude out-of-range findings.
- Examination follow-up must belong to the selected pet, with no contradictory
  owner tags. The exam assessment now carries pet identity into the later
  recommendation and longitudinal model instead of dropping that lineage.
- Individual SDK chunks reject an explicitly different `petId` or
  `ownerPetId` before buffer mutation; session profiles cannot contradict
  themselves. The direct day-level waveform engine enforces the same rule.
- A 20 Hz window that crosses local midnight is invalid for a single-day
  summary, including epoch-timestamped windows. Invalid local dates and
  extremely large timestamps are handled without assuming a healthy timeline.
- RMSSD still uses successive NN differences; SDNN now explicitly uses the
  **sample standard deviation (N−1)**, consistent with the formula Word.
  General motion dispersion and the existing score weights are unchanged.
- `tests/qa_v985_exam_recency_chunk_identity.js` adds **35 adversarial checks**;
  **48 JS test suites** pass. Full existing showroom case histories remain
  present, and prior 47 regression suites still pass.

## V9.84 — Previous release 2026 11 14

This release closes identity gaps at the model-to-profile boundary rather
than only inside a history array. The fifteen full presentation pets and their
medication, vaccination, examination, diet, activity and recovery histories
are preserved byte-for-byte in the source fixtures.

- Long-term wellness now refuses to use Luna's valid history for Milo merely
  because the caller supplied it as Milo's records. Personalized monitoring
  recommendations enforce the same expected-pet identity.
- A single row carrying conflicting `petId` and `ownerPetId` cannot produce a
  normal lab value, an actionable alert, a period score or a wearable baseline.
- Old untagged showroom examination histories are linked to their selected
  pet slot **in memory**; newly entered and historical records can coexist
  without cross-pet laboratory scoring. Original stored rows are not rewritten.
- Verified SDK ingestion rejects *all* contradictory owner fields and filters
  incoming events before they can enter saved daily summaries. SDK sessions
  can no longer silently share an anonymous `local-pet` identity.
- Long-term score and wellness-age trend charts break at missing calendar
  days; a visually continuous line no longer implies measurement during gaps.
- `tests/qa_v984_owner_provenance_and_continuity.js` adds 39 adversarial
  checks. **47 JS suites** pass, including the previous 46 suites.

## V9.83 — Previous release 2026 11 14

This update addresses reproducible per-pet and veterinary-reference
provenance defects in V9.82. All **fifteen existing** pet cases, medication,
vaccination, examination, meal and activity histories, images, UI cards,
score weights, four languages, colors and navigation remain intact.

- Calendar period averages now reject mixtures of distinct pet IDs and
  mixtures of tagged and untagged owners before deduplication by date.
- Laboratory fallback statuses can no longer silently turn a wrong-species,
  wrong-breed, wrong-life-stage, wrong-pet or incompatible-unit reference
  into a seemingly normal 96-point assessment.
- Multi-row laboratory reports reject mixed pet identities **before** they
  are grouped by report ID/date.
- Informational waveform extrema are not considered confirmed health alerts;
  same-date alerts from another pet cannot cap this pet's score.
- For a real waveform day, score-changing events additionally require an
  owner-matched and explicitly signal-verified source with valid wear/contact
  quality. No gap or lost contact is interpreted as cardiac/respiratory arrest.
- Verified SDK day summaries persist the active pet identity, and per-pet
  history readers reject separately tagged foreign records.
- The 14-observation recent trend uses only qualified days from the most
  recent 45-calendar-day window. The **separate** long-term personal baseline
  remains based on 14 valid days and keeps the original scoring weights.
- `tests/qa_v983_cross_pet_lab_and_alert_provenance.js` adds 48 adversarial
  assertions. **46 JS regression test files** pass in this release.

## V9.82 — Previous release 2026 11 14

This release fixes chronology, animal-identity, multi-indicator interpretation
and long-term laboratory blending problems found after V9.81. The original
15-pet showroom cases, historical exams, medicines, vaccines, meals, activity
logs, photos, approved scoring weights, grade colors, and four-tab navigation
remain untouched.

- Prior 14-day baselines now select the **latest fourteen distinct qualifying
  calendar days**, regardless of import order, and never mix explicit pet IDs.
- Matching recovery episodes also respect real dates, owner identity and the
  original 30-calendar-day comparison window.
- High-resolution HRV beat times must be strictly increasing and fully inside
  the observed window; duplicate, backward, negative or out-of-window events
  cannot masquerade as valid RMSSD/SDNN.
- SDK session ingestion rejects any declared heart, breath or motion channel
  rate that differs from 20 Hz, before mutating connection/day state.
- The long-term wellness model rejects mixed-pet histories, invalid 0–100
  component scores and lab scores outside the allowed 0–100 range.
- A reassuring lab result cannot **raise** a low wearable-derived longitudinal
  score. A concerning lab result may still reduce long-term wellness.
- New contextual guidance recognizes **both** heart and breathing scores
  declining for three recent valid days, corroborated on at least two days.
  Guidance is available in simplified/traditional Chinese, English and Japanese.
- Unavailable composites report zero score coverage confidence rather than
  a positive confidence number beside an unavailable score.
- New `tests/qa_v982_owner_order_and_joint_evidence.js` checks 40 adversarial
  cases; the existing 44 regression suites continue to run.

## V9.81 — Previous release 2026 11 14

This earlier release fixed measurement-context and aggregation errors found
after V9.80. There is **no alteration** to the original 15-pet
showroom cases, historical exams, medicines, vaccines, meals, activity logs,
photos, approved scoring weights, color thresholds or four-tab navigation.

- Raw input must declare all three channels at the same **20 Hz** rate. An
  explicit 19 Hz respiration or motion rate cannot be silently treated as 20 Hz.
- HRV derived from trusted beat timestamps must cover almost the full minimum
  180-second window; a 90-second IBI excerpt cannot be labelled 240-second HRV.
  The evidence reports the observed beat span rather than the outer stream size.
- OEM HRV that states 240 seconds of measurement must not be accepted when
  attached to an unrelated 30/60-second waveform. OEM quality scores must lie
  in their declared 0–1 range, and method/provenance remains mandatory.
- Three qualified low-motion windows are now required before a daily summary
  can claim **quiet heart/breath rate, quiet rhythm or quiet HRV**. Previously,
  a no-rest day could fall back to **all active windows** and produce convincing
  resting metrics. Without the context, these metrics are unavailable.
- A 14-day baseline for night rest uses only days with adequate night coverage;
  a calm/HRV baseline uses only qualified low-motion days, while daily motion
  history uses sufficiently covered activity days. Valid wear alone is not
  equivalent to a valid observation of every metric.
- Daily heart rate, respiration, motion and other window aggregates now respect
  each SDK window's **actual seconds observed**. A 300-second recording carries
  ten times the evidence of a 30-second one, eliminating chunk-count bias.
- New `tests/qa_v981_context_duration_and_raw_rates.js` exercises mismatch,
  sparse-rest, SDK provenance, dynamic duration and baseline edge cases.

The existing *32/32/20/16* cardiopulmonary, *40/35/25* energy/recovery,
*58/42* body rhythm and *42/30/28* body-state weights remain candidate
engineering priorities, **not medically validated percentages**. Veterinary
ECG/BCG pairing and measured animal behavior labels are necessary before any
diagnostic performance or sleep-stage classification claim.

## V9.80 — Previous release 2026 11 14

This update audits the actual RMSSD/SDNN numbers against primary canine and
feline ECG literature and repairs their evidence chain. The 15 complete
showroom profiles, full examination/medication/vaccine/food/activity histories,
four tabs and approved scoring weights remain intact.

- Two inflated feline **HRV-only** example reference pairs were moderated:
  Nori 73/96 → 60/55 ms; Max 52/68 → 46/48 ms. Their cached daily snapshots
  receive a one-time, field-limited correction without clearing other data.
- The `meanOf` baseline function no longer turns absent readings into valid
  `0` through `Number(null)`. Fourteen valid wear days alone do **not** imply
  fourteen valid HRV observations; the HRV baseline requires its own eligible
  14-day history or a separately supplied verified group reference.
- Accepted 20Hz feature provenance, paired RMSSD/SDNN, correct calendar windows,
  missing-baseline states and a four-language HRV explanation now agree between
  Deep and the rest-and-steadiness insight.
- Removed the arbitrary, universal 58/73-ms first-day HRV comparator. It was
  not a veterinary reference for either species. Real owner measurements never
  borrow an exhibition fixture, and an exhibition day with invalid HRV cannot
  receive a high HRV score from its portrait target.
- All original 32/32/20/16 cardiopulmonary, 40/35/25 energy/recovery, 58/42
  body-rhythm, and presentation color thresholds are unchanged.
- `tests/qa_v980_hrv_numerics_and_baselines.js` checks 15 scenarios, sparse
  personal baselines, quality gates and language-specific displayed values.

The HRV examples are display values, not a validated veterinary disease
classifier. The literature demonstrates substantial effects of species,
recording duration, context and measurement system; larger labelled studies
and live SDK comparisons remain prerequisites for clinical claims.

## V9.79 — Previous release 2026 11 14

## V9.79 — Current release 2026 11 14

This audit fixes two **effective cross-module contradictions** in health
interpretation, rather than changing 15 showcase pets or their records.

- The final body-rhythm modal previously described the 58/42 composite as an
  equal two-item average. Its explanatory text now describes the actual two
  contributing domains without displaying hidden weights to end users.
- Missing calm or heartbeat stability now stays unavailable in the modal,
  without red `0/100`, `null/100`, or a false claim that both metrics are normal.
  Both figures must exist before the composite can be explained as complete.
- The Deep rest-and-steadiness evidence once averaged `row.rmssd` and
  `row.sdnn` from its legacy record fields. A personally added pet with a
  verified collar day could therefore receive another source's displayed HRV
  evidence. Its figures now come only from that pet's **verified same-date
  20 Hz feature** with an explicit HRV-valid flag, with both RMSSD and SDNN
  present on each included day.
- Evidence now states the number of eligible paired-HRV days, instead of
  mixing different denominator days or coercing `null` to zero. Existing
  showcase histories retain their original values and charts.
- All newly modified rhythm guidance is available in Simplified Chinese,
  Traditional Chinese, English and Japanese, including Japanese findings.
- New `tests/qa_v979_rhythm_hrv_provenance.js` tests the effective dialog,
  quality provenance, 15-case preservation and four-language sentences.

No confirmed scoring weights, color tiers, record data, tab layout or
Bluetooth/4G boundaries changed. Clinical performance and actual SDK/platform
behavior still require separately executed veterinary/hardware validation.

## V9.78 — Previous release 2026 11 14


This release focuses on **consistent product logic and medically responsible
interpretation**. It does **not** regenerate, remove or normalize any of the
15 full-profile pet cases, their historic examinations, vaccinations,
medications, feeding, activity, recovery, messages or record timelines.

- The actual overriding Home daily narrative now handles missing health and
  rhythm components without treating `null` as a bad 0/100, showing a clear
  unavailable-state sentence when quality is present but scores are not.
- Home's cardiopulmonary review points to **heart, breathing, HRV and beat
  stability**, exactly the four inputs used by the 32/32/20/16 score.
- Today's Deep attention cards identify the lowest valid contributing heart,
  breathing, HRV, rhythm-stability, energy, post-exercise recovery or calmness
  subscore **from the same date and the same scoring engine**. A low domain
  score caused solely by an event cap is not falsely attributed to a normal
  subscore. Missing components generate no fabricated weakest cause.
- All inserted numeric explanations are translated directly into Simplified
  Chinese, Traditional Chinese, English and Japanese, with legacy Korean
  compatibility; no score weights, severity boundaries or medical-event
  thresholds are changed in this version.
- Adds `tests/qa_v978_narrative_consistency.js` and retains previous regression
  suites. The release's Word audit separates **verified engineering behavior**
  from veterinary validation still required prior to real-world deployment.

## V9.77 — Previous release 2026 11 14


This pass reviews whether display claims are traceable to an actual reading.
It leaves the 15 deliberately extreme showroom profiles and every fixture
medication, vaccination, examination, meal, activity and care episode intact.
It also keeps all existing score weights, grades, four pages and four languages.

- Missing scores stay **unavailable**, never a red `0/100` just because
  JavaScript coerces `null` to zero.
- Today's Deep advice for a real pet uses its **verified same-date sensor
  feature** for heart/breath averages; night rest requires sufficient measured
  full-day/night coverage, and two-minute recovery requires an accepted event.
  Missing details are explained instead of replaced by showroom values.
- Both invented quiet-breathing and two-minute-recovery *showroom alerts* are
  strictly disabled for real owner pets. The quiet-breathing detail panel has
  a separate owner path showing only quality-approved real low-motion daily
  respiratory aggregates, without claiming unsupported continuous 10-minute
  samples. The 15 showcases keep their rich sample visualizations.
- The 14-day post-treatment care timeline continues to display owners' manual
  notes and medication timing; its heart, respiration, quiet-rest and 2-minute
  figures for real pets now come strictly from verified sensor features. A
  missing signal remains an em dash, not invented physiology or zero.
- Dynamic advice for the changed sections explicitly supports Simplified
  Chinese, Traditional Chinese, English and Japanese (with legacy Korean
  compatibility), including numbers interpolated into medical-facing copy.
- New `tests/qa_v977_owner_provenance.js` checks missing-score behavior,
  verified owner values, language variants and showroom/owner separation.

**Caution:** the exact weight choices and health-scoring thresholds remain
product hypotheses requiring prospective dog/cat validation. No hardware SDK,
BLE/4G, GPS, or native store test was performed in this environment.

## V9.76 — Previous release 2026 11 14

## V9.76 — Current release 2026 11 14

V9.76 is a **professional data-integrity revision**, not a redesign of the
four-page app or another scoring-weight experiment. V9.75's current 32/32/20/16
cardiopulmonary weights and 40/35/25 energy/recovery weights remain untouched.

- Accepts actual SDK numeric `Float32Array`/`Float64Array` 20 Hz heart,
  breathing and motion channels. Previously the peak/coherence routines
  silently rejected typed arrays. Disallows misaligned or nonnumeric stream
  objects at the raw-window entry point.
- Rest/quiet hours are the **observed quiet seconds during 20:00–08:00 divided
  by 3600**, not all sampled hours multiplied by the nighttime quiet fraction.
  This prevents daytime sensor coverage inflating the apparent night duration.
  The quality object now includes `nightQuietObservedSeconds` for auditability.
- Preserves sub-minute epoch timestamp precision when computing day/night
  overlaps, including the 08:00 and 20:00 boundaries.
- Independent high-precision beat-timestamp HRV must span no more than its
  actual >=180-second observed waveform; an unrelated longer timestamp list
  cannot silently produce a plausible HRV score. Supplier-provided HRV remains
  usable when independently verified and quality-tagged as before.
- The activity-recovery comparator now requires >=3 **distinct previous valid
  exertion events** in the last 30 calendar days at genuinely comparable
  sensor-measured intensity (within 25%), excluding invalid wear days, future
  dates and duplicate reuse. This fixes the earlier absolute intensity
  tolerance of 8, which matched unrelated fractional RMS efforts.
- Within a severity tier, multiple accepted heart/breathing events are ordered
  by actual measured relative deviation. `integrity.dominantEvents` provides
  an auditable reason for selecting the strongest alert; existing conservative
  alert ceilings and grade colors are unchanged.
- Adds deterministic `tests/qa_v976_professional_signal_evidence.js` and
  reruns the entire preserved regression suite (including four-language,
  fifteen-pet, New Pet and all care-record cases).

**What this does NOT claim:** no disease prediction or veterinary-grade
validation of the exact score weights, rhythm, sleep stages, or recovery
thresholds; no physical collar, native BLE, 4G/GPS, iOS/Android or production
network testing was performed. Synthetic showcase values remain synthetic.

**Existing functions and data preserved:** 15 strongly differentiated pets,
multiple complete physical reports each, medications, vaccines, feeding logs,
activity, recovery, family sharing and the empty New Pet; Home/Deep/Health/Me,
the three time choices, and zh/zht/en/ja locales. No new mock device-fault
buttons, changing grade thresholds, or extra navigation controls.

## V9.75 — Historical prior release 2026 11 14

- Corrects V9.74's inappropriate equal-weight replacement. Cardio now uses
  all four displayed dimensions: heart 32%, breathing 32%, quality-eligible
  HRV 20%, mechanical heartbeat stability 16%. Energy/recovery is a weighted
  energy 40% + matched two-minute recovery 35% + rest/steadiness 25%.
- These numbers are **candidate engineering priorities**, not a validated
  veterinary prediction model or a published clinical standard. Research
  supports the importance of each dimension, not an exact numerical mixture.
- Heart and breathing are mandatory; a missing optional HRV/stability value
  does not become zero. Available component weights are renormalized and a
  partial cardio assessment cannot appear in the green 90–100 band.
- A poor *verified heart or breathing* score restricts cardio severity, but
  isolated HRV or mechanical-stability abnormalities cannot be called an ECG
  arrhythmia or emergency solely from the composite. Separate verified event
  evidence retains its score caps and alerts.
- Removes leftover equal-average formulas from owner fallback, 7/30-day energy
  detail and rhythm score, keeping daily and period values consistent.
- All 15 extreme-case simulated pets, their exam/medication/vaccine/diet/
  activity histories, original photos and New Pet blank-state isolation remain.

**Evidence for prioritization, not for percentage validation:**
<https://pmc.ncbi.nlm.nih.gov/articles/PMC7105988/> (canine HRV);
<https://pmc.ncbi.nlm.nih.gov/articles/PMC12031628/> (canine BCG vital tracking);
<https://pmc.ncbi.nlm.nih.gov/articles/PMC12477687/> (resting vital trends);
<https://pmc.ncbi.nlm.nih.gov/articles/PMC5918126/> (canine post-exercise recovery).

**Testing limit:** this package tests the candidate algorithm and full source
without claiming ECG-grade rhythm interpretation, real-device clinical
validation, BLE/4G/GPS live integration, or pixel-perfect mobile acceptance.

## V9.74 — Superseded historical release 2026 11 14

The following V9.74 equal-weight statements are retained as a historical
change log only and **must not be used as current scoring specifications**.

- Harmonizes Deep's agreed formulas with both scoring engines and every major
  dependent page: cardio = equal heart/breath average; energy & recovery =
  equal energy/recovery/calm average. A participating component in a lower
  severity tier imposes the documented conservative risk-band ceiling.
- An unavailable recovery observation is not silently replaced by energy or
  calm: the three-part composite and any dependent daily body-state score
  remain unavailable until eligible evidence exists. Optional HRV and beat
  stability remain independently visible and do not secretly change the
  two-part cardio mean. Real-SDK coverage limits are explicit.
- Fixes the second independent score source in Heart Moments. Gallery weekly,
  monthly and daily Heart Moment scores now join the **same pet and date** from
  the authoritative Home/Deep engine. Unworn days remain gaps; a simulated
  95/100 in older gallery snapshots can no longer override a red daily score.
- Weekly/monthly Heart Moments reviews now show the two requested score
  families and continuous XY graphs with missing-day gaps, as does the exported
  image. All labels and notices are provided in four interface languages.
- Only an actual first-use New Pet enters the simulated 60-second countdown;
  an unpaired pet or missing gallery score displays no reading. Missing real
  vital signs are not replaced with invented fallback pulse/respiration.
- The gallery currently has **15 static mood photos + 15 thumbnails**, not
  four distinct photos per pet. The app now rejects an expression-photo / score
  grade mismatch and falls back to the user's unaltered pet photo. Generating
  the 45 missing expression variants requires separate photo creation.
- Keeps all V9.73 care records and simulations intact, including medicine,
  vaccines, physical exams, food, activity, recovery observations and reports.
  Adds `tests/qa_v974_cross_page_contract.js` with 75 deterministic assertions.

**Verification:** Node regression suite, source syntax and build are tested
after this release. Real hardware and screenshot-level browser interactions
still require device-side acceptance; user-entered records are never replaced
by the new gallery-score reconciliation.

## V9.73 — Historical prior release 2026 11 14

- Preserves fifteen gallery profiles with sharply separated synthetic wellness
  scenarios across green, blue, orange and red score bands. All top-level,
  Deep and historical period scores share the same candidate integrity engine;
  emergency heartbeat/breathing evidence still caps reassuring display grades.
- Populates fifteen different simulated dietary patterns, seven days of meals
  with two meals per day, medication schedules, vaccination histories,
  other-care notes, activity/behavior histories, and three full examination
  reports per pet. Each pet also has a distinct historical fourteen-day
  recovery observation with no automatic current recovery episode.
- Upgrades unchanged older generated meal samples while preserving individually
  edited and user-created records. New Pet, Blank and real owner profiles have
  no sample medical, feeding, score or history records.
- Restricts the interface to four languages: simplified Chinese, traditional
  Chinese, English, and Japanese. Includes new Japanese examples for care
  records, the examination editor, the four-language weekly/monthly review,
  and correct Japanese onboarding and age-index labels.
- Fixes a null-date crash on sparse Deep history, a null reference in rhythm
  sample comparison, stale empty-profile accessor reads, and source-version
  inconsistencies. Adds `tests/qa_v973_architecture.js` with 162 specific
  release acceptance assertions.
- `index.html` is the compiled offline application; `index.source.html` plus
  `assets/` and `build.mjs` are the editable source. Use `node build.mjs`
  after changes. The complete generated `dist/` is included for verification.

**Testing limits:** all 36 Node regression suites pass. A full interactive
Chromium test was attempted but could not start in this execution environment
because the browser process was denied a local socket. Consequently this release
does not claim click-through, pixel-perfect, camera/photo, background alert,
BLE, 4G/GPS, live SDK or App Store approval testing. Real signal algorithms
and examination risk classification remain candidate research models, not
validated diagnostic or feeding recommendations. The 15 gallery scores and
medical records are fictional demonstration data, never real pet measurements.

## Historical releases and prior audits

## V9.69 — Recovery episode history and family access archive

- Preserves all **15 showcase profiles**, demonstration treatments, vaccine
  schedules, meals, activity records, and **three full 30-indicator examination
  reports per pet**, without deleting the underlying gallery history. Blank,
  New Pet and personally created profiles remain isolated and unseeded.
- Makes recovery-plan start, 14-day restart, daily check-in and deletion
  transactional. A failed browser save restores the prior plan, and does not
  claim the observation or deletion succeeded. Starting a replacement episode
  archives its existing dated check-ins, reason and notes instead of discarding
  the previous observations.
- Makes alone-time start/stop, Heart Moment bookmarks, manual behavior journals,
  and showpiece activity history load/clear transactional and pet-scoped.
- Makes family access requests, approvals, denials, revocations and permission
  toggles transactional. Blank has no invitation code and cannot accidentally
  manipulate the pet selected before entering Blank. Family access remains a
  **local UI simulation**; no cross-device authentication or health data sharing
  is implemented. User feedback no longer claims remote authorization.
- Adds new regression checks for failure rollback, archive preservation,
  cross-pet isolation and release build consistency.

**Software validation:** 34 Node regression suites passing (including 20 new
V9.69 executable action scenarios), zero suite failures. The current build
packages all 45 CSS and 59 JavaScript source modules, photos and offline assets.
See `QA_V9.69_操作事务与隐私复查.md` and the historical QA reports for details.

This is a **software audit release**, not clinical validation. Browser UI
automation, BLE/4G hardware, background notifications and real cloud sharing
have not been certified by these source-only tests. The user-requested Word
formula document and any Netlify-only variant are intentionally deferred.

## V9.68 — Durable care records, reliable new-pet creation and current-day signal filtering (HISTORICAL, PRESERVED)

This release deliberately preserves the **15 complete showcase pets**, including
all demonstration medication and vaccination histories, three 30-indicator
examination reports per pet, meals, activities, and care journals. It does not
replace, delete or flatten historical fixtures. Blank, New Pet and owner-created
pets still start without invented observations, diagnoses, history or scores.

- Medicine, vaccine, food, free-care and note edits now save transactionally:
  a rejected browser storage write rolls back only the touched pet's data.
  Existing report edits and attachments remain protected by V9.67 safeguards.
- Recording a scheduled dose validates its exact daily slot and status;
  multiple-dose treatments cannot silently record nonexistent time slots.
- A historical meal moving to a new calendar day updates both dates atomically,
  and imported record dates must be real calendar dates, not merely formatted text.
- Adding a new pet (including the first 60-second Heart Moment route) does not
  create a phantom profile when storage is full. Gallery profile edits also
  roll back on failure and leave the editor open.
- Verified 20 Hz daily summaries are restricted to today or earlier for scoring
  and trend calculations. A storage failure during real-device ingestion also
  restores the New Pet's previously empty first-use state.
- Legacy examination deletion no longer removes **every report on the same date**;
  the user must select an exact report ID in the canonical report list.
- Invalid saved nutrition numbers are ignored rather than propagating NaN into
  food totals. The About/Me build label now matches version 9.68.
- Second-pass checks hardened parasite-treatment saving/deletion, diet-target
  reset, and 4G GPS/geofence toggles and polygon updates. Impossible or future
  completed treatment dates are rejected, and failed saves keep the prior
  per-pet geofence and the still-open form instead of showing false success.

**Software validation:** 33 Node regression suites / 513 passing assertions,
zero failures, plus source/module syntax and packaged build checks. Browser
automation could not launch Chromium in this environment due an OS-level socket
permission restriction. Physical BLE/4G devices, external services, clinical
accuracy, and cross-device visual appearance still require separate validation.

Run `node build.mjs`, then every `node tests/qa_*.js`; V9.68-specific cases
are in `tests/qa_v968_transactions_and_dates.js` and
`tests/qa_v968_gps_and_deworm_durability.js`. See
`QA_V9.68_全盘资料事务与设备日期复查.md`. No Word document or Netlify deployment package
is included at this stage.

## V9.67 — Pet identity preservation, examination evidence and attachment durability (HISTORICAL, PRESERVED)

**Showroom fixture contract unchanged:** all 15 built-in example pets retain
many demonstration medication courses, vaccine histories, three 30-indicator
examinations each, meals, and activity/care records. Blank, New Pet and newly
added owner pets start without these synthetic histories. No gallery records
are deleted as part of this upgrade.

- Removed an old startup filter that deleted **any user-owned pet named Raffi,
  Rafi or 拉菲**. Such deletions could shift numeric pet IDs and cross-wire
  unrelated pets' saved food, medicines, exams and activity history.
- Examination attention now uses the **latest assessable past or present test
  date**, not the newest merely uploaded report. A pending, future-dated,
  invalid-date or internally contradictory report cannot hide the previous
  evaluable findings or generate unverified medical-looking flags.
- Editing a lab report now retains hidden reference applicability metadata
  and an existing attachment, even though those fields are not re-rendered
  in its editable form. Replaced/deleted report blobs are cleaned up only
  when no saved record still references them.
- Failed local persistence now restores the prior report or deletion state,
  shows an error and leaves the editor available for a retry. An attachment
  upload failure never falsely announces that an attached report was saved.
- The quiet-rest explanation uses only a current, valid signal-derived rest
  duration. Missing data produces an insufficient-data explanation instead
  of an illustrative profile's static hour count.

See `QA_V9.67_资料安全与体检证据深度审计.md` and `tests/qa_v967_record_safety_and_lab_alerts.js`.
The release contains the full source, images and compiled build; no separate
Netlify package is made. Hardware recording and medical validity require
real-device / veterinary validation.

## V9.66 — Consistent daily advice, age factors and weekly/monthly breakdown (HISTORICAL, PRESERVED)

This release **preserves every V9.65/V9.64 exhibition fixture**: all 15
gallery pets retain their medication plans/history, vaccines, three 30-test
examination reports, food entries, all five categories of activity and care
journal, and daily vital/score scenarios. Blank, New Pet, and individually
created pets receive **no fabricated history or score**.

- AI improvement cards now use the exact verified, event-capped **today** heart,
  sleep, and energy/recovery domain scores used by Home and Deep. A profile's
  fixed exhibition scenario values can no longer produce a healthy recommendation
  when the live daily score is poor—or a false low-score warning when it is good.
- Incomplete valid daily domains leave AI guidance pending; absent measurements
  never become fake zero or unearned reassuring guidance.
- A latest assessable abnormal examination appears in care advice even when
  today's heart/breathing score is healthy. Exam records remain independent
  of physiological score calculations and are never deleted or overwritten.
- Suggestion warning tones follow orange/red domains and verified longer
  recovery; normal conditions retain routine-advice presentation.
- The biological-age factor cards now show actual today's energy/recovery
  values and an explicit insufficient-data state, not pet profile seed scores.
- Weekly/monthly average subcomponents now use the **same date-matched, risk-
  capped score engine** as their two headline averages. Earlier, an uncapped
  legacy component could look green beside a red daily score.

Run `node build.mjs` and `node tests/qa_*.js`. New regression cases cover
high/low scenario conflicts, abnormal exams, new-pet emptiness, missing scores,
trend warnings, score-band presentation, and period component consistency.
Only a complete source ZIP and a complete formula Word are delivered; no
separate Netlify package. See `QA_V9.66_全盘审计与评分建议一致性.md`.

## V9.65 — Unified examination evidence and care-history display (HISTORICAL, PRESERVED)

This release preserves **all V9.64 demonstration fixtures** for all 15 editable
gallery pets: medications, vaccinations, multiple 30-test examination reports,
seven days of meals, 14 days of five activity/care habits and the 30-day sensor
scenarios. Blank and New Pet remain completely empty until a user adds data.

- The weekly/monthly care journal now draws examination records from the same
  saved/report-ID collection as the Health examination screen. A tap opens the
  corresponding modern individual report, rather than a separate legacy report.
- Examination attention counts evaluate assessable numeric tests; an untouched
  imported status of `unknown` no longer conceals a visibly out-of-range value.
- Legacy export/trend consumers read the canonical examination records when
  present. No historical reports or personal edits are deleted.
- Activity/care-habit history lists the most recent entries across all five
  categories in date order; it no longer shows only the last inserted category.
- Stored showcase vaccination rows are identified as `showcase`, not wrongly
  marked as owner-entered `user` records. Their edit/complete routing is kept.
- Recovery timelines correctly label `skipped` medication instead of presenting
  it as unconfirmed. Activity history no longer exposes a repeated `Demo` suffix.

Run `node build.mjs`, then every `node tests/qa_*.js` to verify. See
`QA_V9.65_全盘审计与记录来源一致性.md` for the new round and remaining hardware
verification boundaries. This release supplies one complete source package;
no separate Netlify deployment package is required.
Current software regression result: **29 suites / 449 PASS / 0 FAIL**.

## V9.64 — Exhibition data restoration and permanent gallery identity (HISTORICAL, PRESERVED)

**This release supersedes the V9.63 edited-gallery conversion policy below.**
The 15 built-in gallery pets are **permanent editable exhibition profiles**.
Renaming one, changing its age/weight/breed or uploading a photo must **never**
convert it into an unmeasured owner pet or erase its sample measurements.
Blank and New Pet are the only supplied empty-entry experiences; personally
added pets also start with no invented historical measurements.

Every gallery pet retains the 30-day signal/score scenarios, three multi-test
examination reports, numerous medicine/vaccination/extra-note entries, seven
days of two meal records per day, and 14 days of five varied care-habit / activity
categories. The old legacy examination date-picker also opens nonempty values
for **all fifteen** gallery profiles, not only ten.

The V9.63 migration could leave previously seeded demo records deleted while
keeping “already seeded” flags in localStorage. V9.64 rehydrates only missing
sample IDs, without removing or overwriting any user-entered care or photo.
It does not duplicate sample rows on re-entry or reload. Coco's same-day alerts,
lab rows and vaccine reminder are likewise restored idempotently. An explicit
“clear preloaded behavior” action remains opt-in and preserves manual behavior
observations; “load” restores the 14-day showcase history.

Software validation: `node build.mjs` bundles 45 stylesheets and 59 scripts;
28 active Node.js regression suites report **430 PASS / 0 FAIL**, including
25 release-specific showcase integrity tests. The older V9.63 owner-conversion
suite was archived under `tests/retired/` because it asserts the **now explicitly
rejected** rule that editing Milo/Coco deletes exhibition records.
See `QA_V9.64_展示档案记录恢复及全盘审计.md` for checks and limitations.

No real BLE / 4G / eSIM / mobile-background or biological accuracy claim is
derived from these software-only tests. Sample reports are illustrative, not
validated pet-specific reference intervals or medical diagnoses.

## V9.63 legacy showcase migration and calendar integrity (HISTORICAL — REVERSED IN V9.64)

Earlier app revisions wrote demonstration medicines, vaccines, examination
entries, diary notes, activity entries and meal records into the same local
per-pet storage buckets used after a gallery animal was edited into an owner
profile. V9.62 suppressed new demo review records but did not remove already
persisted sample entries. V9.63 now isolates owner data at the storage boundary:
only explicitly sample/showcase-tagged rows are removed, personal records and
other pets remain untouched, and stale synthetic medication-completion history
and historical daily fixture snapshots are discarded. Unmodified gallery pets
retain their full example experience.

Real/edited pets now get 30 *date-only* calendar slots from the historical
day provider; the generator never invents heart rate, breathing, weight,
sleep, food, HRV, recovery or estimated age for actual owners. The 7/30-day
review always keeps its selected calendar width even if just one day meets
valid-wear requirements; missing dates remain gaps and never enter averages.
The owner identity flag also survives browser reload. Legacy edited gallery
profiles and newly uploaded personal portraits are recognized as owner
profiles, while simply opening and saving an unchanged sample preserves its
original fixture. The medical-exam workflow, older lab-date picker and
veterinary export no longer inject sample reports, sample night-rest hours,
missing-as-zero averages or continuous lines across missing days. Loading
sample activity into an actual owner's behavior diary is blocked.

40 additional regressions cover sample migration, medical reminders,
identity isolation, legacy profile upgrades, veterinary exports and sparse
calendars. The complete 28-suite software run reports 445 explicit PASS lines
with zero failures. Factory 20Hz hardware integration remains an independent
real-device task.

## V9.62 verified summaries vs. synthetic detail isolation (retained)

All personally created or edited showcase pets now use the same safe Deep
renderer: verified daily wellness scores are shown, but unfinished raw minute,
sleep and activity charts display N/A instead of inheriting the gallery's
generated readings. The original 15 unmodified gallery animals keep their
interactive example pages. Invalidated showcase animals no longer inherit
fictional vaccination, medication or health-examination examples in their
weekly/monthly review.

The WebApp's synthetic minute-series factory is now gallery-only. A real
pet's minute bridge requires a verified 20 Hz record for that precise date;
null, blank strings and missing samples are rejected, not converted into
0-bpm or 0-breath points. The final day score adapter does not execute the
legacy demo calculation for owners, including its fabricated activity score.

Weekly and monthly curves keep all 7/30 calendar days in the plotted array,
so missed days remain visible as breaks rather than connecting two distant
observations. Repeated verified-day computations are content-cached and
automatically refreshed when actual SDK data, the pet profile, reports or
group reference changes. The time selector is still Today, 7 days, 30 days;
14 valid wear days remain a **background baseline requirement only**.

The 20 new V9.62 regression cases are in
`tests/qa_v962_real_owner_provenance_and_sparse_review.js`. The real collar
SDK/phone permissions/OCR/clinical validation remain outside this software QA.

## V9.61 verified wear and cross-pet date-isolation audit (historical)

Personally added pets can no longer receive simulated recording duration,
collar contact quality, or clean-beat counts through the old `qualityForDay`
function. Only exact, independently verified 20 Hz dates already admitted by
the production-facing scoring gate count. Invalidated fixture profiles also
cannot display fictional quality data; broken persisted day arrays fail closed.
The existing gallery demonstrations retain their original data fixtures.

Body-rhythm components now align with their exact daily engine dates instead
of incorrectly matching sparse SDK days to positional demo rows. Unrecorded
dates remain unavailable; an event-capped historical rhythm score is not
recomputed from uncapped components. Matching pet objects by identity also
handles multiple owner pets sharing the same name.

Home badges now select today's calendar date rather than the last recorded
day, and changing to a profile with missing data clears its old numeric
metadata and colors. Local-date-keyed fixture caches no longer hold yesterday
as today. Missing minute-waveform windows no longer appear as 0 bpm, zero
breaths/min or false trend dots; preview charts require actual minute arrays
when showing real-pet continuous measurements.

The selectable time periods remain exactly Today, 7 days and 30 days; the
separate fixed 14 **valid observation day** baseline remains unchanged.
Software-only testing cannot validate real device acquisition, the sensor's
biomedical accuracy or veterinary outcomes.

## V9.60 active scoring engine and real release-path QA (historical)

V9.59 patched several early UI helpers, but the complete application loads
later compatibility scripts that overwrite those helpers. This release also
fixes the **actual final source of truth**, `DeepPetScoreIntegrity.reconcile`,
whose output is used by `DeepPetSignalScoring.getDaily` and the final
`ux_v912` adapters. Every parent score now applies a documented risk-band
ceiling after its weighted mean, so no valid orange/red subscore can hide under
a green parent. Current authoritative formulas are cardio (heart 32%, breath
32%, HRV 20%, stability 16%), energy/recovery (energy 40%, two-minute recovery
35%, calm 25%), rhythm (calm 58%, stable rhythm 42%), and physiological status
(cardio 42%, sleep 30%, energy/recovery 28%). Missing optional submetrics
are excluded and renormalized; missing required metrics remain N/A.

Health weekly/monthly reviews now read each actual day's **final engine
physiology and body rhythm**, including emergency/event caps. They no longer
recalculate a different unguarded historical rhythm. The final score adapter
recognizes original gallery-pet identity even when a user-created pet has the
same name. Home narratives explicitly check missing physical/rhythm scores
before choosing positive or warning text. Weekly/monthly status and rhythm
averages each count their own valid dates independently. Missing dates are
gaps, not zero-point scores or connected lines in the trend chart.

There are exactly three selectable analysis periods: Today, 7 days, 30 days.
The separate fixed 14-day health baseline and care plans remain unchanged.
There are no UI layout changes, fictional SDK values for real pets, or hidden
claims of mobile-device end-to-end testing. Build with `node build.mjs` and
run all `tests/qa*.js`, especially
`tests/qa_v960_runtime_reconciliation.js`.

## V9.59 scoring, narrative, chart and cache audit (historical)

Composite health/rhythm scores now use a transparent **risk-band ceiling** after
their existing arithmetic average: if a valid constituent is red (<60), orange
(60–79), or blue (80–89), the parent cannot present a safer band. Respectively
the maximum composite is 59, 79, or 89. This applies to heart+breath, daily
physiological status, three-part body rhythm, and energy+activity. Missing
required components show N/A instead of manufacturing a high or zero score.

The Home narrative uses the **same computed per-pet values** as the displayed
daily score, not the gallery's old fixture categories. Weekly vital comparisons
exclude invalid/no-score days and do not claim a previous-day comparison when
that day lacks valid readings. Missing chart samples are omitted, not plotted
as a false zero. Corrupt cached pet indices are safely reset to Milo, keeping
valid pet records and separate Blank/New Pet behavior intact.

Only Today, 7 days and 30 days are selectable; the independent fixed 14-day
individual health baseline and care plans remain available. No real SDK or
mobile hardware test is claimed. Run `node build.mjs` and all `tests/qa*.js`,
especially `tests/qa_v959_score_consistency_and_restore.js`.

## V9.58 independent notification and cached-state audit (historical)

The reminder-center switch now reads and writes the same canonical field
(`notifyHealth`, `notifyMed`, `notifyVax`, `notifyFence`) on the **first click**.
Legacy shorthand preferences are migrated, and each pet keeps separate
preferences. These are local presentation preferences, **not** a claim that
mobile push notifications have been integrated or delivered. Critical health
warnings remain accessible regardless of reminder preferences. Medication and
vaccination switches filter the in-app pending reminders; turning off ordinary
health changes hides only noncritical items (scores 60–89). Red-risk health
items (<60) and historic geofence incidents remain visible. Geofence preference
is retained for future notification integration but does not erase event logs.

Obsolete cached 3-day or 14-day selectable periods are restored to 7 days,
and the health weekly/monthly summary is restored to 7/30 days if an old
unsupported value was saved. An invalid cached extra-pet collection is safely
replaced by an empty list. User-authored medicine/reminder strings are escaped
in the reminder center before insertion into HTML. The independent **fixed**
14-day individualized health baseline and care plans are retained.

There are no changes to physiology scoring, source signal requirements,
sample pets, four navigation tabs, or the visible page design. Run
`node build.mjs` and all `tests/qa*.js`, including the new
`tests/qa_v958_settings_and_windows.js`. See the V9.58 audit report.

## V9.57 strict date-range audit (historical)

Every analysis date-range selector offers **Today / 7 days / 30 days only**,
including Deep, signal-free/blank pet screens, waveform details and vet
summary. Removed the V9.56 compatibility script that introduced unsupported
date choices. Previously cached unsupported values are normalized to 7 days.
No-data pages keep missing physiological values as N/A for every period.
The separate fixed **14-day individualized health baseline** and 14-day care
plans remain available in Me/Health, and are not selectable trend ranges.

Historical deworming treatments are retained, but obsolete next-date reminders
are ignored if a newer treatment covers the same internal/external category.
Upcoming-care and today's reminder use the same effective-treatment selection.
New Pet can view genuine saved future medication/vaccine/deworming plans; Blank
remains isolated. All scoring coefficients, the 15 gallery pets, and existing
20 Hz signal requirements are unchanged from V9.56.

Build with `node build.mjs`; run all `tests/qa*.js`, especially
`tests/qa_v957_period_and_care.js`. See the V9.57 regression report.

## V9.55 independent Heart Moment audit (historical)

The full-screen Heart Moment, weekly/monthly reviews and their photo pipeline are
now independently checked against the same pet-ownership and trusted-signal
rules as Home, Deep and Health. A user pet receives a real daily score in Heart
Moment only from the canonical 20 Hz waveform scoring engine, with the same
quality and coverage checks. Old cached simulated one-minute scores can no
longer override a verified owner score, and historical last-known scores now
display their actual date.

Added stale-callback protection for pet portrait uploads, expression service
responses and review exports; serialized overlapping picture saves; blocked
Blank from opening a previous pet's Heart Moment. All 15 fixed demo pets, food
and exam fixtures, the fresh New Pet example and the truly Blank state stay
unchanged. Existing core score formulas and thresholds are identical to V9.54.

Run `node build.mjs` then all `tests/qa*.js`, including the new
`tests/qa_v955_heart_integrity.js`. See
`QA_V9.55_第十一轮心动时刻数据一致性与照片安全复查.md`.

## V9.54 repeated self-audit: uploads and onboarding state ownership (current)

This is a **behavior-only** update. All investor fixture arrays/files,
15 distinct pets, sample food and clinical records, the New Pet profile-only
state, Blank state, scoring formulae and color thresholds remain unchanged.

- Selecting a replacement meal photograph immediately clears the prior
  unsaved photo and preview. Failed or delayed decodes cannot attach it.
- Choosing a new examination image/PDF immediately clears previous OCR text.
  User corrections made during OCR take precedence over late recognition.
- Leaving an import modal for an unrelated dialog abandons the pending upload;
  proceeding from the import step to its editor retains it.
- Legacy profile photo save callbacks are tied to the originating pet, epoch
  and latest request. Failed local persistence rolls back the prior photo.
- Onboarding completion and delayed pair-success navigation belong only to
  their originating pet/session. Blank-to-new-pet creation is still supported.
- Older examination wizard delay cannot advance a different pet or reopened
  wizard.

Run `node build.mjs` followed by all `tests/qa*.js`, including
`tests/qa_v954_repeat_rounds.js`. Details in
`QA_V9.54_第十轮持续复查与异步归属报告.md`.

## V9.53 first-run, camera and verified pairing isolation (retained)

All 15 investor gallery pets, their original individual data, food and exam
fixtures and both special empty states are **byte-identical** to the prior
release. No scoring equation, biological threshold or meal coefficient changed.

- Cancelling the first Heart Moment profile creation cannot add a pet after
  its file reader finishes; a double tap cannot create duplicate profiles.
- An avatar or chat-photo decode that finishes late cannot replace a newer
  picture or show an error over a different pet or chat.
- An old QR camera permission response and its late error cannot seize or stop
  a new scanning session; camera tracks are released promptly.
- Verified pairing discoveries are scoped to the selected pet and session.
  Retry performs a real new lookup, and late results or pair confirmations
  are ignored after changing identity, wizard, or selected device.

Run `node build.mjs`, `node tests/qa_v953_entry_camera_pairing.js`, and all
retained suites. Read `QA_V9.53_第九轮首次建档扫码与配对深度审计.md`.

## V9.52 asynchronous workflow integrity (retained)

All 15 investor sample pets, diverse score fixtures, 7-day meal examples,
individual exam panels, and the two special empty states are unchanged.
This is a **behavioral** release. It does not alter scoring coefficients,
medical reference bands, names, photos, or any sample values.

- A draft report attachment can no longer silently carry over after a pet
  switch or a canceled import. Abandoned *newly uploaded, unreferenced*
  IndexedDB blobs are released without deleting any saved report.
- When choosing multiple report files quickly, only the newest pending
  request can update the current import form; old OCR results and late
  uploads are ignored and discarded safely.
- Voice messages use a per-session microphone recorder, track, timer, and
  target pet. A late stop callback or microphone authorization from pet A
  cannot interrupt pet B's recording. Navigating away stops the microphone.
- When food photos are chosen rapidly, the newest decoded image wins;
  failed image decodes properly revoke their object URLs.
- A previously requested weekly image export or report attachment error
  cannot suddenly appear after an unrelated pet switch.

Run `node build.mjs` and `node tests/qa_v952_lifecycle_races.js` alongside
all retained suites. Review
`QA_V9.52_第八轮异步流程与数据隔离深度审计.md` for precise
scope and limitations.

## V9.51 investor showcase and identity isolation (retained)

The 15 built-in pets, their diverse vital-score fixtures, all laboratory values,
and all meal example values are **unchanged**. There are still two distinct
empty-state identities: fully Blank and profile-only New Pet.

- Food history defaults to the **last seven actual days**, which makes the
  populated, varied example meals visible. A toggle preserves the original
  seven-day future-planning view; unrecorded future meals are never fabricated.
- An IndexedDB attachment, pet photo decode, QR scan, or heart-moment poster
  cannot silently apply to a different pet if an investor switches identity
  during an asynchronous operation. Switching pets also closes pending report
  editor drafts.
- Missing laboratory values no longer coerce to a fake numeric zero in trend
  plots; a genuine measured zero remains valid.
- New Pet empty-state explanations correctly describe its existing breed,
  height and weight instead of claiming that only a name and photo exist.

Run `node build.mjs` and `node tests/qa_v951_async_and_food.js` alongside the
retained full legacy regression suites. See
`QA_V9.51_第七轮非示例数据深度审计与交付说明.md` for results and verification limits.

## V9.50 investor / engineering showcase (retained)

Historical notes below document earlier versions. Where they conflict about
edited gallery pets losing their fixture eligibility, **the V9.50–V9.51
showcase-slot preservation rule above is authoritative**.

This is a **data-rich presentation version**. The 15 original pets retain their own
distinct example score patterns, physiological scenarios, portraits, lab panels,
health records, and seven-day meal histories. **No numeric example data, food
reference values or lab sample values were rewritten in V9.50.** The complete
V9.49 fixture blocks were compared byte-for-byte by SHA-256 regression checks.

Two special views are intentionally different from the other 15:

- **Blank / No pet yet:** no profile and no monitoring, displayed separately.
- **New Pet:** profile-only sample with name, Shiba Inu breed, 38 cm height and
  9 kg weight. Age and monitoring records remain absent, so sensor scores are N/A.

The gallery's synthetic history remains visible after an engineer edits a
built-in pet's example profile. The app no longer forcibly opens Edit Pet when
visiting informational Health/Deep pages in either empty state. N/A uses a
neutral palette, not a misleading red risk grade. New user-added pets are still
isolated and do not inherit the 15 gallery examples. **The gallery values are
not clinical evidence or validated reference intervals.**

Run `node build.mjs`, then each `node tests/qa*.js`. There are 16 JavaScript
test files with **233 static/VM assertions**, including the 14 direct assertions
in the original V9.35 gallery contract and 22 new V9.50 contracts.

See `QA_V9.50_投资展示全盘复核与交付说明.md` for differences, limits and QA.

This is a non-clinical interactive demonstration, not the production DeepPet service.

## V9.49 sixth-stage independent deep audit (retained)

- **No fake personal baselines**: 14 score-only records, without explicit recording origin and the required quality evidence, can no longer unlock personalized monitoring advice. The 7-day longitudinal wellness score and 14-day AI wellness age have the same strict real-telemetry gate. Explicitly labeled bundled gallery fixtures remain available for demonstration only.
- **No real-pet lab fiction**: completing New Pet no longer creates three synthetic lab reports. User-created pets, New Pet and renamed/edited gallery pets load only their own saved reports. The report editor for these identities now has empty values, empty reference bounds and no invented clinic; it cannot accidentally save fabricated blood-test numbers.
- **Fresh emergency evidence**: event severity cache keys now track per-pet signal revisions and relevant profile updates; invalidation also clears same-pet event and quiet-variation caches. Real/new/edited pets cannot derive synthetic demo events from the investor gallery.
- **Graceful recovery from damaged storage**: corrupt arrays for daily confirmed recordings, hidden/replaced reports and owner laboratory data no longer freeze the analysis. Invalid pet indices no longer silently display Milo's sample scores. Lab edit/delete state participates in the scoring cache key.
- **Regression evidence**: `tests/qa_v949_sixth_audit.js` adds 29 focused tests. All fifteen Node suites execute independently. This verifies code contracts, not physical collar, mobile-browser, data-privacy backends or veterinary clinical validity.

## V9.48 fifth-stage independent deep audit (retained)

- **Correct examination-day age**: an actual `birthDate` is evaluated at the recorded examination date (calendar date arithmetic), and an explicit `ageAtExamYears` takes precedence. Historical age-specific and adult-only reference ranges cannot silently borrow an unreliable present-day age. Negative test-day age, zero/negative test-day weight, or missing breed for a breed-limited interval cannot be scored.
- **One consistent patient per report**: inconsistent test-day age or weight across items in a single examination now makes the report pending review, with a visible Health warning. Two examination dates sharing an imported report ID remain two separate reports; opening, editing and deleting are date-scoped.
- **Numerical evidence behind every event**: heart/breath change severity is derived from measured `abs(value-reference)/reference`, with separate thresholds for each signal. Events whose claimed percentage contradicts their actual values are rejected; a forged light/high label cannot force the wrong score ceiling.
- **Honest longitudinal examination comparisons**: moving between two values *within the same reference interval* is no longer called deterioration merely for moving away from the midpoint. Missing numeric values, missing bounds and changed reference scope prevent misleading direct comparisons. Lower bound 0 and age minimum 0 are retained by the legacy editor.
- **Previous reliability work preserved**: full-bleed four-stage 60-second illustrations, fast and truthful New Pet/Blank navigation, per-pet signal isolation, valid wear-day baseline gates, and real-device pairing safeguards are unchanged. Corrupted saved records/events now fail safely rather than freezing their assessment. `tests/qa_v948_fifth_audit.js` adds 24 executable cases; all 14 suites cover **182/182** code assertions. Real-browser and real-hardware trials remain outstanding.

## V9.47 fourth-stage deep audit (retained)

- **Honest day/night data**: the nighttime breathing window is 20:00–08:00; 08:00–12:00 no longer counts as night. Rest-hour and rest-fraction proxies use only valid observed night windows; daytime inactivity never becomes overnight sleep. Sleep requires at least 12 hours of actual observed time with 4 night hours; whole-day energy separately requires 4 daytime hours. They do not become full-day conclusions from a short planned sampling schedule.
- **Cross-checked time and QC**: 20Hz heart/breath/motion lengths must agree; epoch/local clocks must reconcile; `timeCoverage` must be arithmetically consistent with actual recorded seconds and an explicit planned schedule. All baseline, wellness-age, daily alert, and real-pet data paths reject mismatched coverage or missing signal evidence.
- **No phantom device on app restart**: historical pairing records may remain saved, but the old radio's `connected:true` is not proof it is connected now. The running page tracks live pairing IDs in memory. Importing a verified day requires the same currently live pairing and active pet, so an old saved device cannot authorize it.
- **Real nearby users are not invented**: the ten named example pets and fictional distances remain in the investor demo gallery only. New Pet, Blank, and real/edited pets see N/A until a genuine, consent-aware 4G social discovery backend is connected. Existing personal messages remain accessible.
- **No visually untested claims**: 14 new deterministic cases in `tests/qa_v947_fourth_audit.js` cover the above, for 158 automated assertions overall. A real browser or hardware test is still required before production.

## V9.46 third-stage deep audit

- **Scheduled 20 Hz samples are not continuous 24-hour observations**: `timeCoverage` now means accepted verified seconds divided by a *provided* planned number of sample seconds. The model records the independently computed `observedDayFraction` and never extends observed quiet time into unsampled sleep hours. Without at least half a day of actual measurement, sleep/whole-day energy and the combined physiological daily score remain N/A. The planned sample duration must be passed explicitly; absent it, continuous-day coverage rules apply.
- **Real SDK session evidence must flow through**: `createSession` forwards the caller's explicit `wearConfirmed`, `signalConfirmed`, and scheduled duration to the scoring engine. Missing contact/quality evidence cannot produce a normal health score.
- **Two-minute recovery cannot cross sample gaps**: event detection checks timestamps adjacent across the exercise transition and the complete following 120 seconds. Event times derive from the actual local timestamp, not from synthetic concatenation.
- **Fourteen days really means fourteen valid scored observations**: baseline averages select the most recent 14 eligible days rather than the final 14 array slots before filtering N/A records.
- **Per-pet 4G/GPS permissions**: the current profile must own a matching saved 4G pairing. Demo GPS cannot be activated on a real/blank owner profile. Enabling GPS on a real collar does not invent a position; an owner without a verified location sees N/A. The demo map is labeled fictional.
- **Real daily Deep calendar**: actual verified daily composite scores appear on the correct dates, while unavailable date/metrics and missing raw waveforms remain N/A.
- Node regression tests, Chromium UI smoke-test outcomes and unresolved device/veterinary limitations are recorded separately in `QA_V9.46_第三轮深度审计与交付说明.md`.

## V9.45 current release — second-stage full audit

- **New Pet persistence restored**: after a confirmed 20 Hz daily recording, re-opening the app no longer resets its `dpFreshPet` or `freeCare` flags. The one-time migration distinguishes untouched gallery placeholders from accepted owner recordings.
- **The freeze path had an additional root cause**: the shared Blank/New Pet page factory cached the *old*, heavy Deep and Health render functions before the V9.43 lightweight guards were installed. Shared navigation now calls the guarded functions themselves. This is a code-level correction; live-browser validation is still outstanding.
- **Removed hardcoded index 15**: the preloaded New Pet can move in the list when other profiles exist. It no longer stays permanently classified as unmeasured after verified readings, and a different user-added pet at position 15 is not automatically treated as the placeholder.
- **Strict collar provenance**: `wearValid`, `signalValid`, heart/breath validity, timeline validity and the accepted time coverage must affirmatively pass for real `20hz-waveform` records. An omitted QC flag is not evidence of successful measurement. The same gate is applied to ingestion, scoring, long-term trend eligibility, prevention and the Heart Moment gate.
- **No made-up minute waves for verified owner pets**: Deep uses verified daily score summaries without extrapolating nonexistent minute-by-minute histories. Waveform sections remain N/A until actual timestamped SDK samples exist. Other simulated investor-gallery records stay clearly separate.
- **First-day group comparisons are no longer blocked**: when a verified, external cohort reference `G` actually exists for a metric, the score can compare against `G` before three personal prior samples; after 14 distinct metric-valid days, the original 30% G / 70% P weighting applies. No unvalidated cohort reference was invented.
- **Scheduled recording gaps are supported**: valid, non-overlapping, timestamped 20 Hz segments need not cover every second. Missing time does not count as observed rest; true contact/signal verification must still come from an actual device integration.
- **Plan completion no longer assumes zero**: unpaired Health uses the same care-progress calculations as other pet pages instead of falsely showing `0 / pending tasks` when earlier tasks were completed.
- V9.45 adds separate regression cases for these findings. An app that passes static and Node checks is **not** declared clinically validated, physically paired, or visually verified on all phones.

## V9.44 retained corrections

- **Blank is genuinely isolated from New Pet**: rendering now uses a temporary, unused identity rather than the saved New Pet index. It cannot read New Pet's medication, food, care reminders or other personal records; only the restored selected identity is persisted.
- **One alert, one evidence record, one score**: Home emergency-change reminders come only from the scored day's accepted `integrity.alerts` records. Other high/low plot markers remain in the detailed charts without being promoted to emergency reminders. Invalid/unworn days never generate Home alerts.
- **14-day baseline quality corrected**: the prior 14 days' metric values must belong to distinct, valid calendar wear dates, with both heart and breath channels qualified. Failed-respiration days, duplicates, invalid dates and malformed continuity are excluded from both baseline count and personal values.
- **Metric-specific personalization eligibility**: 14 accepted wearing days are necessary but not sufficient to apply the individual 70% blend to a metric. That metric must itself have 14 qualifying historical values; three HRV samples cannot be treated like 14 valid HRV days.
- **AI age requires verifiable input**: the 14 scored days used by the sensor-age fallback must have valid calendar dates and explicitly verified heart and respiration quality, not merely an invented 0–100 score.
- Invalid calendar dates such as `2026-99-99` no longer crash the 30-day wellness evaluator or count as valid personalized-monitoring days. New local-day recordings are not rejected just because UTC is still the previous date.
- All four introduction stages have taller illustration canvases, while the original wording remains unchanged. English and other long-language content scrolls inside the modal without being compressed.
- `node tests/qa_v944_cross_pet_contract.js` adds nine independent regressions; all ten JavaScript test suites pass 120/120 code-level checks.
- The same score coefficients, 0.30G/0.70P baseline blend, report fusion and inverse wellness-age formula are preserved. This is an evidence/validity correction, **not** a new medically calibrated reference database.

## V9.43 retained fixes

- All four 60-second tour illustrations now occupy the complete artwork area: the original vertical scene is framed around all four dogs (without shrinking to show the very large pre-rendered blue top/bottom margins), and the deep-analysis, examination-trend and AI-wellness visuals use adaptive full-height cards. The approved text is unchanged.
- New Pet and truly empty profiles take a lightweight, no-signal Deep/Health renderer with the familiar page tabs and sections. Day / 7 / 14 / 30-day navigation remains available; results are N/A and no synthetic waveform or sensor score is generated. Existing showcase pets retain their established renderer and separate datasets.
- An additional no-record path in the measurement quality audit was repaired: missing duration, contact, motion and clean-interval fields now show N/A instead of throwing an exception when calling toFixed on null.
- `node tests/qa_v943_empty_navigation.js` runs nine targeted contracts against the actual empty-state HTML render functions, including all five UI languages, all dates, and null-safe quality results. Historical algorithm and data-isolation tests are retained.
- Browser-driven visual testing was blocked by browser URL security policy for the local test URL. Therefore no claim is made that every interactive UI path is visually or physically verified. Test with real Chrome/Safari and SDK hardware before commercial release.

- `DeepPet_V9.44_完整算法参数单位与开发说明_2026-11-13.docx` is the **separate**, fully updated 49-page developer specification covering 51 original numbered equations plus the new V9.44 eligibility, isolation and event-contract annex. Formula symbols have explicit units, constants, input paths, numeric examples and clickable cross-references. The companion Word is delivered separately from this complete WebApp source ZIP.
- The default New Pet starts **without** breed, age, weight or a confirmed real owner photo. The bundled example pet image is not accepted as owner upload. Complete a valid profile, including confirmed photo, before pairing or care/health actions; a completed profile alone permits provisional nutrition and preventive-care recommendations.
- The fifteen built-in dogs/cats are **synthetic investor/demo fixtures**, isolated from all new/real pets. Changing a built-in fixture's identity invalidates its synthetic physiology. The built-in example group references `G` are **not** a verified population database.
- Device search and pairing **never fabricate hardware success**. A real `window.DeepPetPairingBridge.findResults(type)` and `.pair({device,type,petIndex})` integration must be provided by a native Android/iOS SDK bridge; verified scan results and successful confirmed pairing are required. Bluetooth offers health sensing only; 4G additionally supports supported GPS/geofence functions.
- Verified real-pet daily summaries are accepted only with a matching paired device, complete profile, 20 Hz signal provenance and sufficient time/heart/breath quality through `DeepPetSignalScoring.ingestVerifiedDay(petIndex,day,deviceId)`. It does not substitute for an actual SDK bridge; real hardware remains untested.
- Each valid heart/breath change event imposes a documented score ceiling. Light/medium/high events force today's physiological score to at most 89/79/59; applicable cardio and heart-related rhythm scores are capped. A failed or unverified signal is not an emergency diagnosis.
- The personal baseline counts fourteen cumulative distinct valid wear dates, not consecutive calendar dates. The display age and trend use the same 30-day wellness score: `ageYears = max(0.1, ageYearsActual + (85 - wellnessScore) * 0.08)` rounded to 0.01 years, after fourteen eligible scored days. This is **not** a medically validated biological age.
- Nutrition uses `70 × weightKg ^ 0.75 × provisionalSpeciesLifeStageFactor`, rounded to 10 kcal/day. This is an adjustable starting estimate, **not** a breed-validated prescription. Vaccines, medication, deworming and reports require user-entered records.
- Ten executable Node regression suites passed (120/120), including `node tests/qa_v944_cross_pet_contract.js`. Local browser access was restricted, so Chromium/Safari interactive UI behavior, physical SDK behavior and longitudinal veterinary accuracy require separate verification.
- Run `node build.mjs` from this folder and deploy the **contents of `dist/`** to Netlify. The source ZIP includes original JS, CSS, images, test scripts, the build script and a prebuilt `dist/` folder.

## Earlier V9.40 documentation (historical)

## V9.40 numeric specification audit (V9.39 runtime weights preserved)

- The companion Word file `DeepPet_V9.40_全部公式参数取值与源码核对说明_2026-11-13.docx` documents **44 numbered formulas**. Each formula has: plain-language symbol explanations, exact fixed coefficients or data-dependent variable retrieval rules, a source-code path, a reproducible numeric example, and two-way clickable links to Chapter 17.
- All 15 built-in pet `G` numbers are extracted directly from `assets/js/app_03.js` for the Word numeric table. **These are synthetic demonstration profile proxies, not clinically validated breed/age/weight reference values**. `P` and `R` are genuinely per-pet/per-date computations, so no universal numeric value exists for them.
- `node tests/qa_v940_formula_contract.js` runs 10 additional executable checks: all 13 scoring weight groups, precise G values, the 14-day 0/70% switch, missing wear days, weighted score arithmetic, lab sample scoring, report weighting, peer evidence gating, wellness fusion, and inverse AI age.
- No change has been made to the V9.39 runtime scoring coefficients or V9.39 user interface. A build-version bump and the additional tests/documentation identify this audited release.

## V9.39 fixes (retained)
- The four-stage “60秒认识 DeepPet” tour has one title, a wider modal, a larger illustration and compact four chips. Only step one shows the dog; the other three use scientific SVGs (HRV trends, labs, personalized wellness model).
- BCG is described as recording tiny mechanical movements associated with the heartbeat. Continuous samples are not equated with independently verified clinical accuracy; 4G-exclusive positioning is clear.
- New Pet and Blank cannot erase another pet's data via the temporary empty-state rendering flag; switching profiles invalidates the appropriate per-pet score cache.
- The 14-day reference requires 14 genuinely valid wear days, even when nonconsecutive. Sample pets include both 14/14-ready and still-learning histories.
- Compatible day-score metrics use 100% provisional group proxy until 14 **prior** valid wear days; on the next scored day the reference becomes 30% group + 70% personal mean. Main Home/Deep/30-day scores consume those computed daily scores, and the 14-day summary uses the identical daily engine.
- Chart inspector paths gain a visible precise hover marker and vertical guide. Heart, breathing and energy inspector pages select the newest exceptional high/low event by default, rather than midnight.
- The updated Chinese Word reference replaces the V9.39 symbol-only glossary with precise values, input field paths and clickable numeric source references.

## Inherited V9.38 fixes
- 30-day body-health analysis uses one inverse score-to-wellness-age index.
- Five separately colored health evidence cards with chart hover readouts.
- Exact event time and value highlighted on both all-day and zoomed trends.
- Four-colored exam risks, unified score rings, correct affected/total counts.
- Illustrated four-stage DeepPet introduction; profile step 01 required.
- New-pet baseline and recording-quality fields show N/A until measured.
- Young-pet prevention suggestions no longer include senior-specific checks.

## Gallery and layout
- 15 demo dogs/cats with their own illustrative monitoring history.
- New Pet requires the owner to complete identity fields and upload a confirmed photo; it has no bundled real sensor readings.
- Blank has no profile identity and no sensor readings.
- All 17 gallery states use the same Home / Deep / Health / Me page renderer and navigation. Missing measurements display N/A, not zero or another pet's data.
- Blank and New Pet receive a closable 60-second + 01/02/03 guidance modal, not an alternate homepage. The four main pages remain accessible when the guidance is closed.

## Monitoring and care
- Home: the two daily scores, long-term wellness model, and at most three emergency-change reminders with More.
- Deep: 1 / 7 / 30-day heart, breathing, sleep and energy areas. Detailed heart/breathing charts allow hover readouts for full-day and zoom data; energy events are in the detailed energy page. Clicking a daily alert navigates to the selected time in Deep.
- Health: exam reports and diet/medication/vaccination/deworming record management, scoped to the selected pet.
- Me: long-term Pet Wellness Model and device/wear reminder settings, plus the nearby pets card.
- Current source-linked scoring weights and equations are documented in the separate V9.39 engineering Word reference, and are intentionally not shown in consumer-facing score popovers.

## Build and deployment
```bash
node build.mjs
```
Upload the content of `dist/` to Netlify, or upload the provided direct-deploy ZIP which places `index.html` and `assets/` at the ZIP root.

## QA performed
- V9.38-specific headless Node/VM checks: 15/15 passed. These cover the score-age relationship, Health/Home/Me age consistency, age-sensitive prevention, event focus, activity zoom, new-pet 14-day quality and the mandatory first-step save gate.
- V9.39 additional Node/VM checks: run `node tests/qa_v939_core.js` (14-valid-day handoff, independent group/personal references, missing wear-day fixtures, tour artwork/duplicate title, hover cursor, profile switching).
- Inherited independent algorithm regressions: 18 core-score/date/unit tests; 10 SDK/HRV boundary tests.
- Bundling, JavaScript syntax and packaged asset references checked.
- The V9.39 Chromium launch was attempted but refused by this execution environment (`socket() failed: Operation not permitted`). Any UI interactions beyond headless VM checks require a browser smoke test on a regular developer PC.

Known exclusions: V9.39 visual Chromium QA could not run due environment browser restrictions. Public Netlify URL, physical BLE/4G/SDK, accuracy superiority claims and clinical veterinary validity remain unverified. Built-in pet sample histories and population G values are development fixtures, not evidence of a validated breed cohort. The AI wellness age is a non-clinical demonstration estimate derived inversely from a longitudinal wellness score.

## Independent V9.37 fixes
- Eliminate duplicate urgent alert card on monitored pets.
- Never manufacture zero-minute sleep or negative rest assessment when an empty pet has no readings.
- Retain all three energy/recovery/rest metric cards for empty pets in the 7/30-day view.
- Keep full-day and zoom hover readouts anchored to the same selected high/low event.
- Correct blank-pet GPS placeholder from N/A Rd. to N/A.
# DeepPet V10.55 — 五层证据型白话解释

- Deep 的心肺、睡眠、精力恢复在单日、7日、30日使用精简主结论与一项优先行动；测量对照、低分持续情况和改善判据收进「查看详细原因与改善」。
- 影响因素按照当前内部评分引擎的加权缺口排序；用户介面只显示参数来源与观察结论，不公布权重及公式。
- 周/月回顾、体检报告采用相同的短文案分层。健康记录与展示宠物数据保持原样。
- 已知低分和急性事件仍严格区分；缺少可比较测量时不生成确诊结论或虚构持续时间。

# DeepPet V10.93 — Health and Me structural parity audit

- The Blank Me route now invokes the latest shared Me renderer, matching Milo
  and Lucky rather than the stale V9.36 function snapshot.
- The completely blank identity retains the same profile, baseline, device,
  device reminder, store, nearby pets, family and settings components; only
  profile fields are placeholders and actions requiring a profile are gated.
- Lucky no longer receives a second, route-specific profile-basics element.
- The device-fitting reminder card is present at the same position for every
  identity, with controls disabled when no pet profile exists.
- Health examination scores use one SVG dot ring, without a second CSS ring.
- New route and component tests cover measured, Lucky and fully blank pages.

