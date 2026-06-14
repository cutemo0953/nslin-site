## Competitive Intelligence Proposals

Source file: `proposals-2026-06-14.json`
Date: 2026-06-14
Total proposals: 11

### Staleness Alert

The following competitors have fields not updated in over 30 days. Manual check may be needed.

| Competitor | Stale Fields |
|-----------|-------------|
| Reserve Fillmore Valve | specs (92 days), awards (92 days), pricing (92 days) |
| Muc-Off Big Bore Tubeless Valve | specs (92 days), awards (92 days), pricing (92 days), price (92 days), lengths (92 days) |
| Legion VMAX / TROJAN Vmax | specs (92 days), pricing (92 days), lengths (92 days) |
| Stan's NoTubes Exo-Core Valve | specs (92 days), pricing (92 days), price (92 days) |
| 76 Projects Hi Flow Valve | specs (92 days), pricing (92 days), price (92 days) |
| Schwalbe Clik Valve System | specs (92 days), awards (92 days), pricing (92 days), lengths (92 days), weight_per_valve_g (92 days), price (92 days) |
| Topeak TurboFlow Valve | specs (92 days), pricing (92 days), lengths (92 days), weight_per_valve_g (92 days) |
| WTB Max-Flow Valve | specs (92 days), pricing (92 days), price (92 days), lengths (92 days) |
| CushCore Hi-Flo Valve | specs (92 days), pricing (92 days), lengths (92 days), price (92 days) |
| Industry Nine Tubeless Valve | specs (92 days), pricing (92 days), lengths (92 days), price (92 days) |
| Peaty's x Chris King MK2 Tubeless Valve | specs (92 days), pricing (92 days), price (92 days) |
| DT Swiss Tubeless Valve (Aluminum) | specs (92 days), pricing (92 days), price (92 days) |
| Prime Tubeless Valve | specs (92 days), pricing (92 days), lengths (92 days) |

---

### Summary

| Class | Count | Action |
|-------|-------|--------|
| Factual (2) | 9 | Review & merge |
| Interpretive (3) | 1 | Review interpretive draft |
| Noisy (4) | 1 | Appended to signals |

---

### Schwalbe Clik Valve System

- **price** (Noisy, 40% confidence)
  - Change: `28` -> `29.87`
  - Source: [retail](https://www.schwalbetires.com/accessories/valves)
  - Evidence: "Contents: 2x Schwalbe Clik Valve tubeless valve. Variants from US$29.87*. from US$35.89* RRP. TUBELESS VALVE. Valve length: 40 mm."

### Industry Nine Tubeless Valve

- **material** (Interpretive, 70% confidence)
  - Change: `aluminum` -> `brass`
  - Source: [retail](https://thundermountainbikes.com/products/i9-brass-tubeless-valves)
  - Evidence: "Regular price$16.50 / Color. Brass tubeless presta valves from Industry Nine. Sold as a pair. Most bikes ship for only $200 within the continental US."

- **price** (Factual, 90% confidence)
  - Change: `27.5` -> `23.25`
  - Source: [official_site](https://industrynine.com/products/tubeless-aluminum-valve-kit)
  - Evidence: "Tubeless Aluminum Valve Kit. SKU: TKVARED_. Regular price $23.25 USD."

- **raw_price_text** (Factual, 90% confidence)
  - Change: `$25-30 per pair` -> `$23.25`
  - Source: [official_site](https://industrynine.com/products/tubeless-aluminum-valve-kit)
  - Evidence: "Tubeless Aluminum Valve Kit. SKU: TKVARED_. Regular price $23.25 USD."

- **normalized_per_unit** (Factual, 90% confidence)
  - Change: `13.75` -> `11.625`
  - Source: [official_site](https://industrynine.com/products/tubeless-aluminum-valve-kit)
  - Evidence: "Tubeless Aluminum Valve Kit. SKU: TKVARED_. Regular price $23.25 USD."

### CushCore Hi-Flo Valve

- **color_options** (Factual, 70% confidence)
  - Change: `null` -> `13 color options`
  - Source: [retail](https://cushcore.com/products/cushcore-valves)
  - Evidence: "Now with 13 color options! Tubeless Presta Valves with CushCore's pateneted Hi-FLo ... HI-FLO Valves. Sale price$30.00."

- **price** (Factual, 80% confidence)
  - Change: `24.99` -> `30.00`
  - Source: [retail](https://cushcore.com/products/cushcore-valves)
  - Evidence: "Now with 13 color options! Tubeless Presta Valves with CushCore's pateneted Hi-FLo ... HI-FLO Valves. Sale price$30.00. Pay over time for orders over $35.00"

### WTB Max-Flow Valve

- **lengths** (Factual, 80% confidence)
  - Change: `["34mm", "44mm", "46mm"]` -> `["34mm", "44mm", "46mm", "65mm"]`
  - Source: [retail](https://www.amazon.com/WTB-Max-Flow-Tubeless-Bicycle-Valves/dp/B0GW17BPR8)
  - Evidence: "Buy WTB Max-Flow Tubeless Bicycle Valves (2-Pack) 65mm Alloy Presta Valve - More Airflow - Insert Compatible"

### Muc-Off Big Bore Tubeless Valve

- **price** (Factual, 90% confidence)
  - Change: `48.99` -> `50.00`
  - Source: [official_site](https://us.muc-off.com/collections/big-bore-tubeless-valves)
  - Evidence: "Big Bore Tubeless Valves ; Big Bore Lite Tubeless Valves · $50.00 ; Hey Dipstick! · $15.00 ; Big Bore Hybrid Tubeless Valves · $50.00"

### Stan's NoTubes Exo-Core Valve

- **price** (Factual, 90% confidence)
  - Change: `54.99` -> `59.00`
  - Source: [official_site](https://www.notubes.com)
  - Evidence: "Stan's Tubeless Exo-Core Valves. from $59.00 ; Stan's Original DART Tool. $27.00 ; Stan's ForkBoost. $13.00 ; Stan's Incredible DART Tubeless Repair Tool. $75.00."

### Peaty's x Chris King MK2 Tubeless Valve

- **price** (Factual, 90% confidence)
  - Change: `36` -> `35.99`
  - Source: [retail](https://peatys.com/collections/tubeless-valves)
  - Evidence: "Peaty's x Chris King MK2 Tubeless Valves $35.99 Black. Valve Accessory Kit $9.99 Silver more for free shipping! Your order is eligible for free"

---

### Review Checklist

- [ ] Check Class 2 proposals (factual changes) for accuracy
- [ ] Check Class 3 proposals (interpretive) for editorial quality
- [ ] Verify price changes against source URLs
- [ ] Confirm no Class 4 (noisy) items leaked into main data

After merge, run: `node scripts/apply-competitive-intel.mjs data/competitive-intel/proposals-2026-06-14.json && npm run prebuild`
Then deploy via `/cf-deploy nslin-site`