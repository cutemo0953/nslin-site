## Competitive Intelligence Proposals

Source file: `proposals-2026-03-29.json`
Date: 2026-03-29
Total proposals: 8

### Summary

| Class | Count | Action |
|-------|-------|--------|
| Factual (2) | 6 | Review & merge |
| Noisy (4) | 2 | Appended to signals |

---

### 76 Projects Hi Flow Valve

- **price** (Noisy, 60% confidence)
  - Change: `29` -> `28`
  - Source: [retail](https://www.bikeperfect.com/reviews/76-projects-hi-flow-no-clog-valves-review)
  - Evidence: "Price: $28.00 / £24.50 / €29.90; Sizes: 15-35mm, 30-50mm, 45-65mm; Color: Anodized black or pink. Shop for tubeless valves. Peaty's x Chris King"

- **lengths** (Noisy, 70% confidence)
  - Change: `["42mm", "52mm", "62mm"]` -> `["15-35mm", "30-50mm", "45-65mm"]`
  - Source: [retail](https://www.bikeperfect.com/reviews/76-projects-hi-flow-no-clog-valves-review)
  - Evidence: "Price: $28.00 / £24.50 / €29.90; Sizes: 15-35mm, 30-50mm, 45-65mm; Color: Anodized black or pink. Shop for tubeless valves. Peaty's x Chris King"

### Industry Nine Tubeless Valve

- **price** (Factual, 70% confidence)
  - Change: `27.5` -> `21.0`
  - Source: [retail](https://worldwidecyclery.com/products/industry-nine-no-clog-aluminum-tubeless-valve-stems-39mm-lime-pair?srsltid=AfmBOooZxKz_wuSi82gEkYe9P7nDchLhYFsUA2kTjRqdxOkRgzYbU1xE)
  - Evidence: "Industry Nine Tubeless Valves - 40mm, Lime, Pair ; List Price ; Sale Price · $21.99 ; Savings · $-21.99 (0%)."

- **lengths** (Factual, 90% confidence)
  - Change: `["40mm", "52mm", "67mm"]` -> `["40mm", "52mm", "57mm", "67mm", "80mm"]`
  - Source: [official_site](https://www.ap.industrynine.com/parts/valves)
  - Evidence: "TKVABLK_ Small Parts - Tubeless Aluminum Valve Kit - 40mm - Black (2 Valves). TKVABLK52 Small Parts - Tubeless Aluminum Valve Kit - 52mm - Black (2 Valves). TKVABLK57 Small Parts - Tubeless Aluminum V..."

### Peaty's x Chris King MK2 Tubeless Valve

- **material** (Factual, 80% confidence)
  - Change: `aluminum (Chris King collab)` -> `7075 aluminum (Chris King collab)`
  - Source: [retail](https://www.ebay.com/itm/116962097603)
  - Evidence: "Made from premium lightweight, high strength 7075 aluminium, Peaty's MK2 Tubeless Valves fit most tubeless setups from MTB to road and cyclocross, including"

### WTB Max-Flow Valve

- **price** (Factual, 85% confidence)
  - Change: `27.5` -> `24.95`
  - Source: [official_site](https://www.wtb.com/products/max-flow-tubeless-valves?srsltid=AfmBOoqtwqDgfLIuX5AxA3kzluobnu5HP0tX253f14-obDWzhk8btxEh)
  - Evidence: "Perfect for quick installation and a tight seal. Get the most out of your tubeless setup. Buy today! Sale price$24.95."

### Muc-Off Big Bore Tubeless Valve

- **price** (Factual, 90% confidence)
  - Change: `48.99` -> `50.00`
  - Source: [retail](https://us.muc-off.com/collections/big-bore-tubeless-valves)
  - Evidence: "Big Bore Tubeless Valves ; Big Bore Lite Tubeless Valves · $50.00 ; Hey Dipstick! · $15.00 ; Big Bore Hybrid Tubeless Valves · $50.00"

### CushCore Hi-Flo Valve

- **price** (Factual, 90% confidence)
  - Change: `24.99` -> `30.00`
  - Source: [official_site](https://cushcore.com/products/cushcore-valves?srsltid=AfmBOopFxq5TnJq9kBqoCa4m2VrQlrQHuDwXJJGjxXTJZiqCfKS8iGjj)
  - Evidence: "HI-FLO Valves $30.00. # HI-FLO Valves. **Now with 13 color options!**. Tubeless Presta Valves with CushCore's pateneted Hi-FLo 3 hole design."

---

### Review Checklist

- [ ] Check Class 2 proposals (factual changes) for accuracy
- [ ] Check Class 3 proposals (interpretive) for editorial quality
- [ ] Verify price changes against source URLs
- [ ] Confirm no Class 4 (noisy) items leaked into main data

After merge, run: `node scripts/apply-competitive-intel.mjs data/competitive-intel/proposals-2026-03-29.json && npm run prebuild`
Then deploy via `/cf-deploy nslin-site`