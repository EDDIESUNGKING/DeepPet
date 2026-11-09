DeepPet V8.56 - Complete Netlify demo bundle

Corrected after V8.55:
- Fifteen pet demo portraits are now clear, edge-to-edge photographs in assets/demo_score_portraits/.
- The 15 active JPEGs contain NO embedded name, score, ordinal number, text, collage tile, or blurred top/bottom filler.
- All 15 active photos are 600x1000 portrait images and are referenced directly by currentDog().photo.
- Heart Moment uses the same currently assigned demo pet photo and overlays metric UI separately, without hiding the photo.
- No video files are necessary for the static pet expression demo.
- Home, Deep, Health, Me, all original JS/CSS, other assets, netlify functions, and backup remain in the bundle.

Demo portraits: some are substituted generated stock-style example pet portraits to match demo mood, not verified photos of a user's actual animal.
Future custom-pet image generation still requires cloud image service configuration and API key on Netlify (not bundled).
All heart-rate, respiration, HRV, and health scores are simulated and not veterinary diagnoses.
No public Netlify production verification; local browser QA is documented separately.

Deploy: unzip, drag the whole folder containing index.html into https://app.netlify.com/drop
