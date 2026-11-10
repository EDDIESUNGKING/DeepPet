DeepPet Version 9.05 — calendar-led daily health review
Date: 2026-11-10

Source: DeepPet V9.04, retaining all original HTML, CSS, JS, images and Netlify functions.

Changes
1. The Body Rhythm detail has exactly two equally wide cards: Rest & Steadiness and Heartbeat Rhythm Stability.
2. Main Deep score rings stay at 84px and their secondary rings decrease to 72px; category colors and green/blue/orange/red grade thresholds are unchanged.
3. Added two explicitly simulated low/moderate demonstration change reminders for Milo (does not modify scores or present disease diagnoses).
4. Home Heart/Breathing Prevention now directly shows up to three prioritized items; More only appears if there are four or more, and routes to an independent list then to each item's detail.
5. Health prevention has the same 3-item/More rule.
6. Heart/breath detail buttons are labeled “查看詳細數據” instead of “查看波形”.
7. For 7/30 days, heart/breath detail first opens a 7/30-date calendar, then a full-screen daily trend with a focused zoom segment only when there is a demo change candidate. No live waveform in period mode.
8. Sleep 7/30 day summaries use a calendar (marked only on days with non-normal demo scores); individual dates open standalone detailed sleep views. No old “last three nights” presentation.
9. Energy 7/30 day summaries retain their recovery trend and now add a period energy-score curve and daily calendar; daily energy details show whole-day movement trends and selected zoom segments only for flagged demo dates.
10. Recovery remains a two-minute heart-rate-drop curve, without a separate calendar.
11. Health Review weekly and monthly charts have numerical Y ticks, dates along the X-axis, a horizontally scrollable 30-day presentation, and pointer/keyboard/touch-readable exact daily values.
12. Centered supporting text in social/profile entry where possible without changing existing navigation.
13. No SDK signal detection, clinical diagnosis, purchase, messaging-backend or medical classifier changes.

QA
- QA_V905.json: 27 Deep combinations on 430px browser width; direct route tests, exact point readouts, rhythm width, time-period calendar counts, and successful marked-date zoom.
- QA_V905_EXTENDED.json: 225 combinations (5 languages x 5 pets x 3 Deep categories x 3 date ranges) on 375px browser; no JS errors, calendar mismatch or horizontal overflow in the tested scenarios.
- Real physical browser clicks for More -> all prevention priorities -> specific priority were verified on a four-priority pet example.
- Node.js syntax check for V9.05 JavaScript passed; Netlify build and archive validation passed.

Limitations
- Data remain illustrative. The time-marked waveform and risk labels are simulated and cannot detect apnea, arrhythmia or sudden death. Real SDK data, signal-quality gates and veterinary validation would be needed before health alerts.
- This is a web-app demonstration. A smartphone/SDK/backend/transaction full end-to-end test has not been performed.
- Rendering time varies by device; no absolute zero-latency promise can be made.
