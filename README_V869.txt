DeepPet V8.69 — Deep risk evidence & live trend overlay

Start here:
- For Netlify Drop drag-and-drop: upload ONLY the dist/ folder.
- For editing: source is in index.html, app.js, styles.css and assets/.
- build.mjs regenerates dist/ when run with node.

Changes vs V8.68:
1. Heart and breathing Live Waveform overlays auto-show a same-day minute trend below the live animation. No extra tap.
2. Mark review periods with colored 20-minute windows selected from the SAME 1440-sample demo minute series used for the chart. Include timestamps, deviation versus prior valid days (when available), and average signal reading. Normal-grade demos have no falsely highlighted windows.
3. Heart, sleep and energy/activity headers show a risk/attention grade below the top-right numerical score and a specific short observation.
4. Sleep provides length and interrupted-rest comparisons; if the synthetic low score is not supported by these factors, it explicitly says so, rather than inventing a cause.
5. Rest/steadiness and load regulation show right-aligned values, risk level beneath and comparison details for single-day and 7-/30-day views.
6. 7/30-day heart charts stay collapsed, sleep charts remain present, and other existing functionality remains unchanged.

IMPORTANT:
All 15 sample pets and all displayed readings in this package are simulated. An unusual window is a UI review cue, NOT a medical diagnosis, actual arrhythmia detection, an urgent safety alert, or an SDK-confirmed measurement. SDK integration and veterinary validation have not been performed.

QA:
- See QA_V869.json for exact targeted checks. A wider attempt timed out, so do not construe this as complete end-to-end certification.
- Public Netlify, iPhone Safari and all legacy child flows were not tested in this run.
