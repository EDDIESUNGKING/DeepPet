DeepPet V9.07 — Startup reliability and loading optimization

- Uses the V9.06 data model and UI unchanged.
- Combines styles and JavaScript into two cached versioned bundles, while retaining all editable original source files.
- Defers first full render until all UI overrides are installed, avoiding double-render on initial launch.
- Loads onboarding images as the user reaches each slide (preloads next), retaining the original full 941 x 1672 WebP files.
- Hardens Get Started to never dismiss into a blank shell: on initialization failure it shows an actionable retry panel.
- Keeps the first demonstration pet Milo as the default after onboarding.
- Build with `node build.mjs`; publish `dist` in Netlify.
- Demo physiology is not validated device output.
