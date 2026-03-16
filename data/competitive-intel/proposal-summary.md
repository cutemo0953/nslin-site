## Competitive Intelligence Proposals

Source file: `proposals-2026-03-16.json`
Date: 2026-03-16
Total proposals: 11

### Summary

| Class | Count | Action |
|-------|-------|--------|
| Factual (2) | 8 | Review & merge |
| Noisy (4) | 3 | Appended to signals |

---

### 76 Projects Hi Flow Valve

- **lengths** (Noisy, 40% confidence)
  - Change: `["42mm", "52mm", "62mm"]` -> `["42mm", "52mm", "62mm", "60-80mm"]`
  - Source: [retail](https://onebikeasia.com/products/76-projects-hi-flow-no-clog-tubeless-valves-size-4-60-80mm-black)
  - Evidence: "76 Projects Hi Flow No Clog Tubeless Valves Size 4 (60-80mm) Black. Regular price $55.00 SGD."

### WTB Max-Flow Valve

- **lengths** (Noisy, 40% confidence)
  - Change: `["34mm", "44mm", "46mm"]` -> `["34mm", "44mm", "46mm"]`
  - Source: [official_site](https://www.wtb.com/collections/all-accessories/products/tcs-tubeless-valve-stems?srsltid=AfmBOoppdmOfwM-MTRktPGQE-BSCIeeeKI3MYmAXIoDYoKvfF7BL_M1E)
  - Evidence: "Our aluminum TCS tubeless valves shed grams, come in catchy anodized red, orange, green, black, or blue, and are available in 34 and 46mm lengths for various rim depths."

### Peaty's x Chris King MK2 Tubeless Valve

- **price** (Noisy, 40% confidence)
  - Change: `36` -> `38`
  - Source: [retail](https://neweracycle.com/products/peatys-x-chris-king-mk2-tubeless-presta-valves?srsltid=AfmBOorc7kO_GTJWvoCTPDAkMsr-awCk_Nbu00xKxBBflfXr2WmzM7IO)
  - Evidence: "Peaty's x Chris King MK2 Tubeless Presta Valves Sale price$38.00 USD. With design, sustainability & quality running right to the core, there's only one company Peaty's could work with on the valve col..."

### Legion VMAX / TROJAN Vmax

- **lengths** (Factual, 70% confidence)
  - Change: `["44mm", "55mm", "65mm", "70mm", "80mm"]` -> `["40mm", "44mm", "55mm", "65mm", "70mm", "80mm"]`
  - Source: [retail](https://www.ubuy.tg/en/product/1AQ0H0VGA-legion-vmax-high-volume-aluminium-valves-40-mm-pair-tubeless-adult-unisex-black)
  - Evidence: "Shop Legion VMax High Volume Aluminium Valves 40 mm Pair Tubeless Adult Unisex, Black online at a best price in Togo."

### DT Swiss Tubeless Valve (Aluminum)

- **price** (Factual, 70% confidence)
  - Change: `22.5` -> `23.4`
  - Source: [retail](https://cbibikes.com/product/dt-swiss-aluminum-tubeless-valve/)
  - Evidence: "DT Swiss Aluminum Tubeless Valve. $11.70. -. MTB; Road; 18-25mm"

- **normalized_per_unit** (Factual, 70% confidence)
  - Change: `11.25` -> `11.70`
  - Source: [retail](https://cbibikes.com/product/dt-swiss-aluminum-tubeless-valve/)
  - Evidence: "DT Swiss Aluminum Tubeless Valve. $11.70. -. MTB; Road; 18-25mm"

### CushCore Hi-Flo Valve

- **color_options** (Factual, 85% confidence)
  - Change: `null` -> `13 color options`
  - Source: [official_site](https://cushcore.com/products/cushcore-valves?srsltid=AfmBOoru6oeVBnLupF3GgcNsf6o8Ae-uk413X-SDHVAr5CJyjd6adtxX)
  - Evidence: "HI-FLO Valves $30.00. # HI-FLO Valves. **Now with 13 color options!**. Tubeless Presta Valves with CushCore's pateneted Hi-FLo 3 hole design."

- **price** (Factual, 90% confidence)
  - Change: `24.99` -> `30.00`
  - Source: [official_site](https://cushcore.com/products/cushcore-valves?srsltid=AfmBOoru6oeVBnLupF3GgcNsf6o8Ae-uk413X-SDHVAr5CJyjd6adtxX)
  - Evidence: "HI-FLO Valves $30.00. # HI-FLO Valves. **Now with 13 color options!**. Tubeless Presta Valves with CushCore's pateneted Hi-FLo 3 hole design."

### Reserve Fillmore Valve

- **warranty** (Factual, 90% confidence)
  - Change: `null` -> `Lifetime Guarantee`
  - Source: [official_site](https://uk.reservewheels.com/products/fillmore-tubeless-valves)
  - Evidence: "The ultimate high flow, no clog solution. 3X the airflow of standard Presta valves. Compatible with Presta pumps. Lifetime Guarantee."

### Stan's NoTubes Exo-Core Valve

- **price** (Factual, 90% confidence)
  - Change: `54.99` -> `59.00`
  - Source: [official_site](https://notubes.com/)
  - Evidence: "Stan's Tubeless Exo-Core Valves. from $59.00 ; Stan's Original DART Tool. $27.00 ; Stan's ForkBoost. $13.00 ; Stan's Incredible DART Tubeless Repair Tool. $75.00."

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