DeepPet V8.61 — Complete Netlify Deployable Build

WHAT CHANGED
- Replaced all five introductory images with the latest approved visual themes (four pets; BCG; Care Mode; personal baseline; worldwide 4G).
- 20 new localized high-resolution 900x1950 WebP images in assets/onboarding/en, zh, zht and ko. Titles, major marketing benefit labels, and prominent phone UI sections translated and baked per language. Demo mockup screens are illustrative recreations, not pixel-identical actual runtime screenshots.
- Preserved V8.60 Japanese intro images as a backwards-compatible fifth language; Japanese was not part of the newly requested four-language redesign.
- No original image-baked pagination or CTA; one interactive dot row and translated fifth-page Get Started button are rendered by onboarding.js/onboarding.css.
- Each full page load/reload shows the five screens; internal tab/page changes never reopen the intro. Fifth page Get Started enters the existing DeepPet app.
- Language auto-selects from the device/browser preferred language unless the user previously manually changed it in the app settings; the same persisted setting controls both onboarding and the app.
- All pre-existing JS, CSS, photo, record, New Pet, 60-sec first-measurement, and deworming data/logic are inherited from V8.60, not rebuilt.

DEPLOYMENT
Unzip the complete folder then upload the folder containing index.html, assets, app.js, styles.css, breed-catalog.js, netlify and build.mjs using Netlify Drop, or deploy from Git with netlify.toml (node build.mjs -> dist). Do not upload only index.html.

QA AND LIMITATIONS
Four sets of five images decoded and were checked for path and dimensions. Source hero images and the actual industrial-design reference have not been validated against a manufactured physical sample by this automated build. The poster-phone screens are illustrative and simulated, not screenshots of the installed app.
The previous demo health readings remain simulated. The existing old subfeatures have not all been exhaustively retested on device; Netlify public and iOS Safari confirmation require external deployment.
