## Competitive Intelligence Proposals

Source file: `proposals-2026-03-16.json`
Date: 2026-03-16
Total proposals: 8

### Summary

| Class | Count | Action |
|-------|-------|--------|
| Factual (2) | 8 | Review & merge |

---

### DT Swiss Tubeless Valve (Aluminum)

- **price** (Factual, 70% confidence)
  - Change: `22.5` -> `12.20`
  - Source: [retail](https://www.freewheelbike.com/product/dt-swiss-aluminum-tubeless-valve-393138-1.htm?srsltid=AfmBOopTDLkCWiW5dGCQhi-EYuhUPKDBFi7hfrnja4HR1z54u28A53f_)
  - Evidence: "DT Swiss Aluminum Tubeless Valve. DT Swiss Aluminum Tubeless Valve Black. Black. $12.20. Color: Black. Size: Select size. 18 – 25mm. 26 – 35mm."

- **lengths** (Factual, 90% confidence)
  - Change: `["44mm", "60mm", "80mm"]` -> `["18-25mm", "26-35mm", "36-48mm", "49-65mm", "66-80mm"]`
  - Source: [official_site](https://www.dtswiss.com/en/components/wheel-accessories/valve)
  - Evidence: "Tubeless valve alloy black for 18 - 25 mm profile height. ### Tubeless valve alloy black for 26 - 35 mm profile height. ### Tubeless valve alloy black for 36 - 48 mm profile height. ### Tubeless valve..."

### Peaty's x Chris King MK2 Tubeless Valve

- **price** (Factual, 80% confidence)
  - Change: `36` -> `38`
  - Source: [retail](https://neweracycle.com/products/peatys-x-chris-king-mk2-tubeless-presta-valves?srsltid=AfmBOopSj55Sfe9-Cg1HEneYomvqBZqtempRxq3k6qemS5IHUo_9F1KS)
  - Evidence: "Peaty's x Chris King MK2 Tubeless Presta Valves Sale price$38.00 USD. With design, sustainability & quality running right to the core, there's only one company Peaty's could work with on the valve col..."

### Stan's NoTubes Exo-Core Valve

- **price** (Factual, 85% confidence)
  - Change: `54.99` -> `59.00`
  - Source: [official_site](https://notubes.com/)
  - Evidence: "Stan's Tubeless Exo-Core Valves. from $59.00 ; Stan's Original DART Tool. $27.00 ; Stan's ForkBoost. $13.00 ; Stan's Incredible DART Tubeless Repair Tool. $75.00."

### Reserve Fillmore Valve

- **warranty** (Factual, 90% confidence)
  - Change: `null` -> `Lifetime Guarantee`
  - Source: [official_site](https://uk.reservewheels.com/products/fillmore-tubeless-valves)
  - Evidence: "The ultimate high flow, no clog solution. 3X the airflow of standard Presta valves. Compatible with Presta pumps. Lifetime Guarantee."

### Topeak TurboFlow Valve

- **raw_price_text** (Factual, 90% confidence)
  - Change: `$35 per pair` -> `$34.95 per pair`
  - Source: [retail](https://www.topeak.com/us/en/product/1818-TURBOFLOW-VALVE-ADAPTER)
  - Evidence: "High-flow valve adapter for tubeless tires, sold as a pair. • Boosts airflow ... Regular price $34.95. Out of stock. find a store. Proposition 65 WARNING"

### CushCore Hi-Flo Valve

- **price** (Factual, 90% confidence)
  - Change: `24.99` -> `30.00`
  - Source: [official_site](https://cushcore.com/products/cushcore-valves?srsltid=AfmBOorBYcoRggQoa7Bsxm6nYxU-X2Rii6EKPpH--hSfN8GBaa05b8ae)
  - Evidence: "HI-FLO Valves $30.00. # HI-FLO Valves. **Now with 13 color options!**. Tubeless Presta Valves with CushCore's pateneted Hi-FLo 3 hole design."

### Industry Nine Tubeless Valve

- **lengths** (Factual, 90% confidence)
  - Change: `["40mm", "52mm", "67mm"]` -> `["40mm", "52mm", "57mm", "67mm", "80mm"]`
  - Source: [official_site](https://www.ap.industrynine.com/parts/valves)
  - Evidence: "TKVABLK_ Small Parts - Tubeless Aluminum Valve Kit - 40mm - Black (2 Valves). TKVABLK52 Small Parts - Tubeless Aluminum Valve Kit - 52mm - Black (2 Valves). TKVABLK57 Small Parts - Tubeless Aluminum V..."

---

### Review Checklist

- [ ] Check Class 2 proposals (factual changes) for accuracy
- [ ] Check Class 3 proposals (interpretive) for editorial quality
- [ ] Verify price changes against source URLs
- [ ] Confirm no Class 4 (noisy) items leaked into main data

After merge, run: `node scripts/apply-competitive-intel.mjs data/competitive-intel/proposals-2026-03-16.json && npm run prebuild`
Then deploy via `/cf-deploy nslin-site`