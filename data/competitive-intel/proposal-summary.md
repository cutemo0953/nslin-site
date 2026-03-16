## Competitive Intelligence Proposals

Source file: `proposals-2026-03-16.json`
Date: 2026-03-16
Total proposals: 6

### Summary

| Class | Count | Action |
|-------|-------|--------|
| Factual (2) | 6 | Review & merge |

---

### Stan's NoTubes Exo-Core Valve

- **price** (Factual, 70% confidence)
  - Change: `54.99` -> `59.00`
  - Source: [official_site](https://notubes.com/)
  - Evidence: "Stan's Tubeless Exo-Core Valves. from $59.00 ; Stan's Original DART Tool. $27.00 ; Stan's ForkBoost. $13.00 ; Stan's Incredible DART Tubeless Repair Tool. $75.00."

### Schwalbe Clik Valve System

- **price** (Factual, 70% confidence)
  - Change: `28` -> `30`
  - Source: [retail](https://www.schwalbetires.com/accessories/valves/?srsltid=AfmBOoqHZIDUdec_yWd52mIhgmRyjR5Q1sWjOUjjEmhCe9EENz-PDnrU)
  - Evidence: "Contents: 2x Schwalbe Clik Valve tubeless valve. Variants from US$29.87*. from US$35.89* RRP. TUBELESS VALVE. Valve length: 40 mm."

- **normalized_per_unit** (Factual, 70% confidence)
  - Change: `14` -> `15`
  - Source: [retail](https://www.schwalbetires.com/accessories/valves/?srsltid=AfmBOoqHZIDUdec_yWd52mIhgmRyjR5Q1sWjOUjjEmhCe9EENz-PDnrU)
  - Evidence: "Contents: 2x Schwalbe Clik Valve tubeless valve. Variants from US$29.87*. from US$35.89* RRP."

### Industry Nine Tubeless Valve

- **lengths** (Factual, 90% confidence)
  - Change: `["40mm", "52mm", "67mm"]` -> `["40mm", "52mm", "57mm", "67mm", "80mm"]`
  - Source: [official_site](https://www.ap.industrynine.com/parts/valves)
  - Evidence: "TKVABLK52 Small Parts - Tubeless Aluminum Valve Kit - 52mm - Black (2 Valves). TKVABLK57 Small Parts - Tubeless Aluminum Valve Kit - 57mm - Black (2 Valves). TKVABLK67 Small Parts - Tubeless Aluminum ..."

### Topeak TurboFlow Valve

- **weight_per_valve_g** (Factual, 95% confidence)
  - Change: `6.4g (45mm), 6.9g (60mm), 7.9g (80mm)` -> `6.4g (45mm), 6.9g (60mm), 7.9g (80mm) - pair weights: 12.8g (45mm), 13.8g (60mm), 15.8g (80mm)`
  - Source: [official_site](https://www.topeak.com/global/en/product/1817-TURBOFLOW-VALVE-KIT)
  - Evidence: "Weight | 45 mm : 12.8 g (1 pair)   60 mm : 13.8 g (1 pair)   80 mm : 15.8 g (1 pair)"

### CushCore Hi-Flo Valve

- **price** (Factual, 95% confidence)
  - Change: `24.99` -> `30.00`
  - Source: [official_site](https://cushcore.com/products/cushcore-valves?srsltid=AfmBOopKCgjAMgGhU-SdV5QiGvTczCvi6vXJrpekoExozxq1OdSaOeoY)
  - Evidence: "HI-FLO Valves $30.00. # HI-FLO Valves. **Now with 13 color options!**. Tubeless Presta Valves with CushCore's pateneted Hi-FLo 3 hole design."

---

### Review Checklist

- [ ] Check Class 2 proposals (factual changes) for accuracy
- [ ] Check Class 3 proposals (interpretive) for editorial quality
- [ ] Verify price changes against source URLs
- [ ] Confirm no Class 4 (noisy) items leaked into main data

After merge, run: `node scripts/apply-competitive-intel.mjs data/competitive-intel/proposals-2026-03-16.json && npm run prebuild`
Then deploy via `/cf-deploy nslin-site`