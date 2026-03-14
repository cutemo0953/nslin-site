const BASE_URL = 'https://nslin-site.tom-e31.workers.dev';

const CONTENT = `# N.S.-LIN Industrial Co., Ltd. (奕道實業有限公司)

> Taiwan-based tire valve manufacturer with 40+ years of expertise.
> ISO 9001:2015 certified. Products meet TRA (US), ETRTO (EU), JATMA (Japan) standards.
> Headquarters: Tainan, Taiwan. Specializing in OEM/ODM valve manufacturing.

## Product Categories (detailed specs in linked files)

- [Bicycle Tubeless Valves](${BASE_URL}/llms/bicycle-tubeless-valve.txt): Presta & Schrader, valve caps, extenders, adapters, wrenches, reducers
- [Motorcycle Valves](${BASE_URL}/llms/motorcycle-valve.txt): 7 models for motorcycle applications
- [Car & Light Truck Valves](${BASE_URL}/llms/car-light-truck-valve.txt): 13 models, snap-in & clamp-in
- [Truck & Bus Valves](${BASE_URL}/llms/truck-bus-valve.txt): Heavy-duty valve solutions
- [TPMS Sensor Valves](${BASE_URL}/llms/tpms-sensor-valve.txt): 15 aftermarket TPMS sensor valve models
- [Invisible Valves](${BASE_URL}/llms/invisible-valve.txt): Aesthetic hidden-stem valve designs
- [Large Bore Tractor Valves](${BASE_URL}/llms/tractor-valve.txt): Agricultural and industrial equipment
- [Truck Valve Extensions](${BASE_URL}/llms/truck-valve-extension.txt): Extension solutions for dual wheels
- [Industrial Valves](${BASE_URL}/llms/industrial-valve.txt): Specialty industrial applications
- [Special Valves & Caps](${BASE_URL}/llms/special-valve-cap.txt): Security caps, pentagonal designs
- [Alloy Lug Nuts](${BASE_URL}/llms/alloy-lug-nuts.txt): 7075-T6 aluminum, 83,000 PSI tensile
- [Rim Hole Plugs](${BASE_URL}/llms/rim-hole-plug.txt): Rim hole sealing solutions
- [Motorcycle Valve Extensions](${BASE_URL}/llms/motorcycle-valve-extension.txt): Extension adapters

## Knowledge Hub

- [Valve Standards Guide](${BASE_URL}/guides/valve-standards): TRA vs ETRTO vs JATMA comparison

## Company

- [About](${BASE_URL}/about): 40+ years of valve manufacturing expertise, ISO 9001:2015
- [Contact / RFQ](${BASE_URL}/contact): Request for quote, sample requests, custom design inquiries

## FAQ

- Q: What tire valve standards does N.S.-LIN comply with?
  A: TRA (US), ETRTO (EU), JATMA (Japan). All products are ISO 9001:2015 certified.

- Q: Does N.S.-LIN offer custom/OEM valve development?
  A: Yes. We design and manufacture valves according to custom specifications. Submit requirements via our R&D form.

- Q: Where is N.S.-LIN located?
  A: NO.65, Sec.4, Changhe Rd., Annan Dist., Tainan City 709-47, Taiwan.

- Q: What materials does N.S.-LIN use for tire valves?
  A: EPDM rubber (Shore A 70+/-5), brass (plain or nickel-plated), and 7075-T6 aluminum alloy for specialty products.
`;

export async function GET() {
  return new Response(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
