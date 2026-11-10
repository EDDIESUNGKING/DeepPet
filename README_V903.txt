DeepPet V9.03 — scoring and navigation consistency revision
Base: V9.02. Only local demo data and browser frontend are available in this package; no live BCG SDK or backend service is connected.

Deep score logic:
- Heart & breathing: heart-rate score, breathing score, HRV trend score, heartbeat rhythm stability score. Daily combined score = ROUND(average of these four). The four white metric modules display their individual scores.
- HRV demo score: compare RMSSD and SDNN to the previous up to 14 valid days (at least 3 preceding valid days). Deviation <=15% -> 95; <=25% -> 85; <=40% -> 70; otherwise 45, then average the two. This is ONLY a demonstration trend scoring method. It is not a clinically validated risk or an arrhythmia/apnea diagnosis. For insufficient prior observations, the HRV score and composite are marked unavailable (no invented normal score).
- Energy & recovery: energy, two-minute heart-rate recovery, and rest & steadiness. Daily combined score is exactly the rounded mean of these THREE scores. If one is unavailable, the composite is not manufactured.
- For multi-day summaries (3/7/14/30), include ONLY days with all the needed scores. Average each component across the SAME valid days and take the rounded mean of the displayed component averages. Thus the combined number always agrees with the displayed scores; a differing eligible-day count is clearly noted in the cardio summary.
- Score color thresholds unchanged: >=90 green, 80-89 blue, 60-79 orange, <60 red. Existing per-metric score scale is illustrative and needs species/breed/quality validation before medical claims.
- Main score rings uniformly 96 px across heart / sleep / energy, single-day and all supported periods. Submetric rings uniformly 84 px.
- Heart: Four sibling white cards with same hierarchy; Heart, Breathing, HRV, Heartbeat Rhythm Stability. Earlier standalone HRV and rhythm duplicates removed. Each period includes HRV average score and detailed RMSSD / SDNN numbers.
- Added Deep 3-day and 14-day period options, matching earlier requirements.

Navigation corrections:
- AI estimated biological age detail: same title as entry, single top-left back control; back returns to Me.
- Nearby Pets opens full screen (no primary bottom nav): Map / List / Messages / Friends. Messages contain only authorized conversation threads; friend lists and requests live in Friends. Unread message count excludes friend request count.
- Chat threads and pet public profile pages open full screen with no main navigation bar. Chat back returns to Nearby Pets > Messages. Public profile back returns to originating Nearby Pets or Chat page. Map/list not-yet-friend message actions open the public profile instead of an old modal.
- Removed the three-dot demo/simulate other-user reply menu from chat UI. Demo conversations remain local; cross-device chat requires real account/backend integration.
- Main bottom nav is hidden also on standalone heart/breath waveform details. The back button returns to Deep.
- Today rhythm submetric shortcuts route to the new stable/calm cards, scroll them into view and flash a temporary red outline; the outline does not persist.

Validation:
- Browsed 135 configurations across three languages, three pets, three Deep categories and all five periods; no script errors in that matrix.
- Separate 36-case four-pet / three-period / three-category score-ring and arithmetic test passed.
- Standalone navigation and back paths tested, including rhythm shortcuts, wave page, nearby pets tabs, friend chat, profile from chat, Age back; no issues reported.
- Full 300-case browser stress run timed out, so it is NOT claimed to have passed. Real device SDK, production messaging, uploads, payment, every Health editor and all mobile devices remain unverified.
