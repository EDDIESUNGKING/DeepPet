DeepPet Version 9.02 — Screenshot-driven layout and navigation repair
Base: Version 9.01 with unchanged health score palette, model data and main function flows.

Fixes:
1. Deep Energy & Recovery daily / 7d / 30d summaries: explanatory text moved into left heading column; no reserved blank region under headings.
2. Energy status / Recovery status / Rest & steadiness cards: descriptions directly below titles, with right-aligned score rings and responsive layout.
3. Heartbeat rhythm stability detail: compact 11.5px explanation and in-line disclosure, with right-aligned score ring.
4. Home body-rhythm detail: exactly two indicators and positive/attention insight sections, including comparison-based interpretations.
5. Home rhythm-score taps: navigate to actual corresponding Deep metric (heart rhythm stability or rest & steadiness), auto-scroll and display a temporary red border (~3.7 seconds).
6. Bottom navigation item font weight is 400 (regular), active tab retains distinct background.
7. Duplicated explanation panel was removed in Deep Energy & Recovery; legacy 14-day, 3-day, and other application functions retained.
8. Small pet avatar preload behavior retained from V9.01.

Color rules unchanged: >=90 green; 80-89 blue; 60-79 orange; <60 red. (90 is normal under existing implementation.)

Verification:
- Five language options x three Deep tabs x day/7-day/30-day: 45 cases.
- 375px narrow layout across four pets and three ranges: 12 cases.
- Home two-indicator modal and real clickthrough to heart and rest cards verified in browser with temporary red border.
- Not a real SDK or veterinary validation; demo data remains simulated.
