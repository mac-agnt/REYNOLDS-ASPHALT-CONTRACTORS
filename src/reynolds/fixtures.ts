/* Reynolds Asphalt Contractors: canonical demo fixtures.
   Everything here is fictional demo data unless its `source` says otherwise.
   Money is whole euro integers, net of VAT. Dates are Europe/Dublin wall-clock
   strings ("2026-11-10" or "2026-11-10T07:15"); November is GMT so no offsets. */

export type Source = "call" | "research" | "demo";
export type RecordKind =
  | "job" | "quote" | "variation" | "customer" | "supplier" | "person" | "asset" | "po"
  | "invoice" | "bill" | "task" | "document" | "credential" | "run" | "leave" | "hire" | "review";
export type Ref = { kind: RecordKind; id: string };
export type CostCat = "materials" | "labour" | "plant" | "fuel" | "transport";
export const COST_CATS: CostCat[] = ["materials", "labour", "plant", "fuel", "transport"];
export const COST_LABEL: Record<CostCat, string> = {
  materials: "Materials", labour: "Crew labour", plant: "Plant allocation", fuel: "Fuel", transport: "Transport",
};

export const ORG = {
  displayName: "Reynolds Asphalt Contractors",
  shortName: "Reynolds Asphalt",
  legalName: "Reynolds Asphalt Contractors Limited",
  companyNumber: "810162",
  registeredAddress: "Rathbawn House, Kilteel, Naas, Kildare",
  area: "Naas, Co. Kildare",
  website: "https://reynoldsasphalt.ie/",
  locale: "en-IE", currency: "EUR", timeZone: "Europe/Dublin",
  initials: "RA",
};

/* ── People ─────────────────────────────────────────────────────────────── */
export type Person = {
  id: string; name: string; first: string; role: string; team: string; email: string;
  wage: number | null; field: boolean; paidCrew: boolean; truckEligible: boolean; crew?: "A" | "B";
  initials: string; tint: string; duties: string; source: Source;
};
export const PEOPLE: Person[] = [
  { id: "P01", name: "Florin Pricope", first: "Florin", role: "Operations Lead / Business Partner", team: "Operations", email: "florin@reynoldsasphalt.ie", wage: null, field: true, paidCrew: false, truckEligible: false, initials: "FP", tint: "#F4B544", duties: "Scope, customer relationships, operations and final site decisions.", source: "call" },
  { id: "P02", name: "Joe", first: "Joe", role: "Business Partner", team: "Finance", email: "joe@reynoldsasphalt.ie", wage: null, field: false, paidCrew: false, truckEligible: false, initials: "J", tint: "#9fd6f0", duties: "Finance, payment approvals and office oversight.", source: "call" },
  { id: "P03", name: "Aoife Brennan", first: "Aoife", role: "Office Administrator", team: "Office", email: "office@reynoldsasphalt.ie", wage: null, field: false, paidCrew: false, truckEligible: false, initials: "AB", tint: "#c8b4f0", duties: "Invoice preparation, supplier confirmations and records.", source: "demo" },
  { id: "P04", name: "Cian Doyle", first: "Cian", role: "Driver / Crew Lead", team: "Operations", email: "cian@reynoldsasphalt.ie", wage: 220, field: true, paidCrew: true, truckEligible: true, crew: "A", initials: "CD", tint: "#a8e0c0", duties: "Leads Crew A and drives TRK-01.", source: "demo" },
  { id: "P05", name: "Mihai Ionescu", first: "Mihai", role: "Driver / Surfacing Operative", team: "Operations", email: "mihai@reynoldsasphalt.ie", wage: 220, field: true, paidCrew: true, truckEligible: true, crew: "B", initials: "MI", tint: "#e6c78a", duties: "Drives TRK-02 and works surfacing with Crew B.", source: "demo" },
  { id: "P06", name: "Andrei Popa", first: "Andrei", role: "Asphalt Operative", team: "Operations", email: "andrei@reynoldsasphalt.ie", wage: 210, field: true, paidCrew: true, truckEligible: false, crew: "A", initials: "AP", tint: "#9fd6f0", duties: "Asphalt laying, Crew A.", source: "demo" },
  { id: "P07", name: "Sean Kelly", first: "Sean", role: "Groundworks Operative", team: "Operations", email: "sean@reynoldsasphalt.ie", wage: 210, field: true, paidCrew: true, truckEligible: false, crew: "B", initials: "SK", tint: "#e2a08c", duties: "Groundworks and preparation, Crew B.", source: "demo" },
  { id: "P08", name: "Tomas Nowak", first: "Tomas", role: "Roller Operator", team: "Operations", email: "tomas@reynoldsasphalt.ie", wage: 200, field: true, paidCrew: true, truckEligible: false, crew: "A", initials: "TN", tint: "#c8b4f0", duties: "Roller operation, Crew A.", source: "demo" },
  { id: "P09", name: "Luke Byrne", first: "Luke", role: "General Operative", team: "Operations", email: "luke@reynoldsasphalt.ie", wage: 200, field: true, paidCrew: true, truckEligible: false, crew: "B", initials: "LB", tint: "#a8e0c0", duties: "General operative, Crew B.", source: "demo" },
  { id: "P10", name: "Patrick Walsh", first: "Patrick", role: "General Operative", team: "Operations", email: "patrick@reynoldsasphalt.ie", wage: 190, field: true, paidCrew: true, truckEligible: false, crew: "B", initials: "PW", tint: "#e6c78a", duties: "General operative, Crew B.", source: "demo" },
];

export const TEAMS = [
  { id: "Operations", label: "Operations", lead: "P01", blurb: "Scope, planning, crews and site decisions." },
  { id: "Office", label: "Office", lead: "P03", blurb: "Records, invoice preparation, supplier confirmations." },
  { id: "Finance", label: "Finance", lead: "P02", blurb: "Approvals, payments, cash and tax review." },
  { id: "Fleet", label: "Fleet", lead: "P01", blurb: "Trucks, plant, defects and returns to service." },
  { id: "Materials", label: "Materials", lead: "P03", blurb: "Requirements, purchase orders and deliveries." },
];

/* ── Customers and suppliers ───────────────────────────────────────────── */
export type Customer = { id: string; name: string; type: "contractor" | "commercial" | "private"; prospect: boolean; area: string; contact: string; note: string };
export const CUSTOMERS: Customer[] = [
  { id: "C01", name: "Kildare BuildCo", type: "contractor", prospect: false, area: "Newbridge", contact: "Site manager (demo contact)", note: "Main contractor. Regular access-road and repair work." },
  { id: "C02", name: "Liffey Civil Engineering", type: "contractor", prospect: false, area: "Kill", contact: "Contracts office (demo contact)", note: "Civil contractor. Yard and footpath packages." },
  { id: "C03", name: "Naas Logistics Park", type: "commercial", prospect: false, area: "Naas", contact: "Facilities manager (demo contact)", note: "Distribution yard surfacing, J104." },
  { id: "C04", name: "Aisling Murphy", type: "private", prospect: false, area: "Dunlavin", contact: "Homeowner", note: "Private driveway, J105." },
  { id: "C05", name: "O'Neill Family", type: "private", prospect: false, area: "Kilteel", contact: "Homeowner", note: "Private driveway, J107." },
  { id: "C06", name: "Riverbank Property Management", type: "commercial", prospect: false, area: "Clane", contact: "Property manager (demo contact)", note: "Car park resurfacing, J108." },
  { id: "C07", name: "Kilteel Service Station", type: "commercial", prospect: true, area: "Kilteel", contact: "Owner (demo contact)", note: "Forecourt repairs quoted, Q201." },
  { id: "C08", name: "Nolan Family", type: "private", prospect: true, area: "Johnstown", contact: "Homeowner", note: "Driveway quoted, Q202." },
  { id: "C09", name: "West County Developments", type: "contractor", prospect: true, area: "Prosperous", contact: "Development manager (demo contact)", note: "Access-road surfacing, draft Q203." },
];

export type Supplier = { id: string; name: string; category: string; materials: string[] };
export const SUPPLIERS: Supplier[] = [
  { id: "S01", name: "Leinster Asphalt Supply", category: "Asphalt", materials: ["Asphalt"] },
  { id: "S02", name: "Kildare Aggregate Supply", category: "Stone", materials: ["Stone"] },
  { id: "S03", name: "Naas Commercial Repairs", category: "Truck repairs", materials: [] },
  { id: "S04", name: "Leinster Plant Hire", category: "Plant and replacement transport", materials: [] },
  { id: "S05", name: "Kildare Fuel Supply", category: "Diesel", materials: [] },
];
/* Only explicitly seeded supplier quotes may be compared; nothing historical is invented. */
export const SUPPLIER_QUOTES = [
  { supplier: "S01", material: "Asphalt", unit: "t", price: 100, note: "Current agreed rate on PO-201, PO-204, PO-205." },
  { supplier: "S02", material: "Stone", unit: "t", price: 28, note: "Current agreed rate on PO-202, PO-203, PO-206." },
];

/* ── Jobs ──────────────────────────────────────────────────────────────── */
export type CostSeed = { budget: number; nonPoForecast: number; nonPoPosted: number };
export type JobStatus = "Scheduled" | "Live" | "Completed";
export type Job = {
  id: string; name: string; customer: string; status: JobStatus; value: number; area: string;
  start: string; end: string; completedOn?: string; month: string; owner: string; siteType: "private" | "commercial" | "contractor";
  scope: string; nextAction: string; nextOwner: string; phases: { label: string; from: string; to: string; note: string }[];
  costs: Record<CostCat, CostSeed>;
};
const flat = (m: number, l: number, p: number, f: number, t: number, posted = false): Record<CostCat, CostSeed> => ({
  materials: { budget: m, nonPoForecast: m, nonPoPosted: posted ? m : 0 },
  labour: { budget: l, nonPoForecast: l, nonPoPosted: posted ? l : 0 },
  plant: { budget: p, nonPoForecast: p, nonPoPosted: posted ? p : 0 },
  fuel: { budget: f, nonPoForecast: f, nonPoPosted: posted ? f : 0 },
  transport: { budget: t, nonPoForecast: t, nonPoPosted: posted ? t : 0 },
});
export const JOBS: Job[] = [
  { id: "J099", name: "Kilteel access road", customer: "C01", status: "Completed", value: 15600, area: "Kilteel", start: "2026-10-05", end: "2026-10-13", completedOn: "2026-10-13", month: "2026-10", owner: "P01", siteType: "contractor",
    scope: "Access-road surfacing for the main contractor. October work, invoiced 13 October.", nextAction: "Collect the €7,800 balance", nextOwner: "P03",
    phases: [{ label: "Surfacing", from: "2026-10-05", to: "2026-10-13", note: "Completed" }], costs: flat(6200, 3000, 1400, 600, 700, true) },
  { id: "J101", name: "Newbridge access road", customer: "C01", status: "Completed", value: 15800, area: "Newbridge", start: "2026-10-27", end: "2026-11-03", completedOn: "2026-11-03", month: "2026-11", owner: "P01", siteType: "contractor",
    scope: "Base course and wearing course on a 140 m access road.", nextAction: "None. Invoiced and paid.", nextOwner: "P03",
    phases: [{ label: "Prep and surfacing", from: "2026-10-27", to: "2026-11-03", note: "Completed 3 Nov" }], costs: flat(6300, 2900, 1400, 550, 700, true) },
  { id: "J102", name: "Celbridge parking repairs", customer: "C01", status: "Completed", value: 9600, area: "Celbridge", start: "2026-11-04", end: "2026-11-05", completedOn: "2026-11-05", month: "2026-11", owner: "P01", siteType: "contractor",
    scope: "Patch repairs and overlay across a contractor-managed car park.", nextAction: "Payment due 17 Nov", nextOwner: "P03",
    phases: [{ label: "Repairs", from: "2026-11-04", to: "2026-11-05", note: "Completed 5 Nov" }], costs: flat(3800, 1900, 900, 390, 400, true) },
  { id: "J103", name: "Kill service yard", customer: "C02", status: "Completed", value: 12400, area: "Kill", start: "2026-11-05", end: "2026-11-06", completedOn: "2026-11-06", month: "2026-11", owner: "P01", siteType: "contractor",
    scope: "Service-yard resurfacing for the civil contractor.", nextAction: "Payment due 19 Nov", nextOwner: "P03",
    phases: [{ label: "Resurfacing", from: "2026-11-05", to: "2026-11-06", note: "Completed 6 Nov" }], costs: flat(4900, 2300, 1100, 450, 550, true) },
  { id: "J104", name: "Naas distribution yard", customer: "C03", status: "Live", value: 24000, area: "Naas", start: "2026-11-09", end: "2026-11-13", month: "2026-11", owner: "P01", siteType: "commercial",
    scope: "Distribution-yard surfacing, 1,600 m² with edge preparation along the loading apron.", nextAction: "Review the €1,800 overrun and the €1,200 variation", nextOwner: "P01",
    phases: [
      { label: "Edge preparation and base", from: "2026-11-09", to: "2026-11-10", note: "Extra edge preparation found on day 1" },
      { label: "Surfacing", from: "2026-11-11", to: "2026-11-12", note: "24 t asphalt confirmed for 11 Nov 08:00" },
      { label: "Rolling, lining and handover", from: "2026-11-13", to: "2026-11-13", note: "Customer walk-round" }],
    costs: {
      materials: { budget: 9600, nonPoForecast: 7560, nonPoPosted: 5160 },
      labour: { budget: 4600, nonPoForecast: 5200, nonPoPosted: 2500 },
      plant: { budget: 2400, nonPoForecast: 2400, nonPoPosted: 1200 },
      fuel: { budget: 1000, nonPoForecast: 1000, nonPoPosted: 400 },
      transport: { budget: 1200, nonPoForecast: 1200, nonPoPosted: 500 },
    } },
  { id: "J105", name: "Dunlavin private driveway", customer: "C04", status: "Live", value: 11800, area: "Dunlavin", start: "2026-11-09", end: "2026-11-11", month: "2026-11", owner: "P01", siteType: "private",
    scope: "Private driveway: dig-out, stone base, kerbing and asphalt surface.", nextAction: "Clear transport and asphalt confirmation for 11 Nov", nextOwner: "P01",
    phases: [
      { label: "Preparation", from: "2026-11-09", to: "2026-11-10", note: "Dig-out and stone base. No truck needed on site." },
      { label: "Surfacing", from: "2026-11-11", to: "2026-11-11", note: "18 t asphalt at 08:00. Needs a truck and Mihai." }],
    costs: {
      materials: { budget: 4600, nonPoForecast: 2240, nonPoPosted: 840 },
      labour: { budget: 2200, nonPoForecast: 2200, nonPoPosted: 880 },
      plant: { budget: 900, nonPoForecast: 900, nonPoPosted: 300 },
      fuel: { budget: 400, nonPoForecast: 400, nonPoPosted: 150 },
      transport: { budget: 500, nonPoForecast: 500, nonPoPosted: 200 },
    } },
  { id: "J106", name: "Rathcoole footpath repairs", customer: "C02", status: "Live", value: 7600, area: "Rathcoole", start: "2026-11-10", end: "2026-11-12", month: "2026-11", owner: "P01", siteType: "contractor",
    scope: "Open footpath-repair package. Crew visit on 12 Nov; no crew on site today.", nextAction: "Crew slot 12 Nov, 6 t asphalt confirmed", nextOwner: "P01",
    phases: [{ label: "Work package open", from: "2026-11-10", to: "2026-11-11", note: "Marking and permits, no crew" }, { label: "Crew visit", from: "2026-11-12", to: "2026-11-12", note: "6 t asphalt 08:30" }],
    costs: {
      materials: { budget: 2900, nonPoForecast: 2300, nonPoPosted: 900 },
      labour: { budget: 1500, nonPoForecast: 1500, nonPoPosted: 400 },
      plant: { budget: 650, nonPoForecast: 650, nonPoPosted: 150 },
      fuel: { budget: 300, nonPoForecast: 300, nonPoPosted: 100 },
      transport: { budget: 350, nonPoForecast: 350, nonPoPosted: 100 },
    } },
  { id: "J107", name: "Kilteel driveway", customer: "C05", status: "Scheduled", value: 6800, area: "Kilteel", start: "2026-11-16", end: "2026-11-17", month: "2026-11", owner: "P01", siteType: "private",
    scope: "Private driveway resurfacing.", nextAction: "Order stone and asphalt by 12 Nov", nextOwner: "P03",
    phases: [{ label: "Prep and surfacing", from: "2026-11-16", to: "2026-11-17", note: "Two days" }], costs: flat(2600, 1300, 600, 250, 350) },
  { id: "J108", name: "Clane car park resurfacing", customer: "C06", status: "Scheduled", value: 10400, area: "Clane", start: "2026-11-18", end: "2026-11-20", month: "2026-11", owner: "P01", siteType: "commercial",
    scope: "Car park planing and resurfacing, phased around tenants.", nextAction: "Approve draft PO-206 for stone", nextOwner: "P03",
    phases: [{ label: "Planing and base", from: "2026-11-18", to: "2026-11-19", note: "Tenant access kept" }, { label: "Surfacing and lining", from: "2026-11-20", to: "2026-11-20", note: "" }],
    costs: {
      materials: { budget: 4000, nonPoForecast: 2880, nonPoPosted: 0 },
      labour: { budget: 2000, nonPoForecast: 2000, nonPoPosted: 0 },
      plant: { budget: 900, nonPoForecast: 900, nonPoPosted: 0 },
      fuel: { budget: 350, nonPoForecast: 350, nonPoPosted: 0 },
      transport: { budget: 450, nonPoForecast: 450, nonPoPosted: 0 },
    } },
];

export const VARIATION = {
  id: "V104-01", job: "J104", price: 1200,
  title: "Extra edge preparation along the loading apron",
  detail: "Day-1 dig found soft edges along 60 m of the apron. Extra excavation, stone and labour. The extra cost is already inside the €20,600 forecast; the €1,200 price is not yet agreed with the customer.",
};

/* ── Quotes ────────────────────────────────────────────────────────────── */
export type Quote = { id: string; customer: string; title: string; value: number; stage: "Draft" | "Sent"; followUp: string; owner: string; visitNote: string; area: string };
export const QUOTES: Quote[] = [
  { id: "Q201", customer: "C07", title: "Kilteel service-station forecourt repairs", value: 17400, stage: "Sent", followUp: "2026-11-12", owner: "P01", area: "Kilteel", visitNote: "Forecourt pot-holing around pump islands. Night or Sunday work to keep pumps open." },
  { id: "Q202", customer: "C08", title: "Private driveway", value: 8400, stage: "Sent", followUp: "2026-11-11", owner: "P01", area: "Johnstown", visitNote: "Gravel driveway to asphalt, about 180 m². Customer wants it before Christmas." },
  { id: "Q203", customer: "C09", title: "Development access-road surfacing", value: 22600, stage: "Draft", followUp: "2026-11-13", owner: "P01", area: "Prosperous", visitNote: "Access road for a housing phase. Levels to confirm with their engineer before pricing is final." },
];

/* ── Crew plan, leave and credentials ─────────────────────────────────── */
export const WEEK = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"];
export type CrewDay = { job: string; truck: string; driver: string; plant: string; note: string };
/* Per day, per crew. TRK-02 is off the road from 9 Nov 16:40, so it is never planned. */
export const CREW_PLAN: Record<string, { A: CrewDay; B: CrewDay }> = {
  "2026-11-09": { A: { job: "J104", truck: "TRK-01", driver: "P04", plant: "PLT-01", note: "Edge prep and base" }, B: { job: "J105", truck: "TRK-02", driver: "P05", plant: "PLT-03", note: "Dig-out. TRK-02 fault reported 16:40" } },
  "2026-11-10": { A: { job: "J104", truck: "TRK-01", driver: "P04", plant: "PLT-01", note: "Base course" }, B: { job: "J105", truck: "", driver: "", plant: "PLT-03", note: "Stone base and kerbs. No truck needed" } },
  "2026-11-11": { A: { job: "J104", truck: "TRK-01", driver: "P04", plant: "PLT-01", note: "Surfacing, 24 t" }, B: { job: "J105", truck: "", driver: "P05", plant: "PLT-02", note: "Surfacing, 18 t. Needs a truck" } },
  "2026-11-12": { A: { job: "J104", truck: "TRK-01", driver: "P04", plant: "PLT-01", note: "Surfacing" }, B: { job: "J106", truck: "", driver: "P05", plant: "PLT-03", note: "Footpath crew slot, 6 t" } },
  "2026-11-13": { A: { job: "J104", truck: "TRK-01", driver: "P04", plant: "PLT-01", note: "Rolling and handover" }, B: { job: "J104", truck: "", driver: "", plant: "", note: "Support the J104 finish" } },
};
export const FLORIN_DAY = [
  { at: "07:30", what: "Naas distribution yard: walk the edge with Cian", ref: { kind: "job", id: "J104" } as Ref },
  { at: "10:00", what: "Dunlavin driveway: check base and kerb line", ref: { kind: "job", id: "J105" } as Ref },
  { at: "12:30", what: "Nolan Family: driveway quote call (follow-up due 11 Nov)", ref: { kind: "quote", id: "Q202" } as Ref },
  { at: "15:00", what: "Naas Logistics Park: talk through variation V104-01", ref: { kind: "variation", id: "V104-01" } as Ref },
];
export const FUTURE_ASSIGNMENTS = [
  { person: "P08", job: "J107", date: "2026-11-16" },
  { person: "P08", job: "J108", date: "2026-11-18" },
  { person: "P08", job: "J108", date: "2026-11-19" },
  { person: "P09", job: "J108", date: "2026-11-23" },
];
export const LEAVE = [
  { id: "L01", person: "P09", date: "2026-11-23", status: "Pending" as const, reason: "Family event" },
  { id: "L02", person: "P10", date: "2026-11-27", status: "Approved" as const, reason: "Personal day" },
];
export type Credential = { id: string; person: string; type: "Safe Pass" | "Truck eligibility"; expires: string; evidence: string; doc: string };
export const CREDENTIALS: Credential[] = [
  { id: "CR-SP-P04", person: "P04", type: "Safe Pass", expires: "2027-08-14", evidence: "Card details recorded (demo)", doc: "D08" },
  { id: "CR-SP-P05", person: "P05", type: "Safe Pass", expires: "2027-03-02", evidence: "Card details recorded (demo)", doc: "D09" },
  { id: "CR-SP-P06", person: "P06", type: "Safe Pass", expires: "2028-01-19", evidence: "Card details recorded (demo)", doc: "D10" },
  { id: "CR-SP-P07", person: "P07", type: "Safe Pass", expires: "2027-06-30", evidence: "Card details recorded (demo)", doc: "D11" },
  { id: "CR-SP-P08", person: "P08", type: "Safe Pass", expires: "2026-11-18", evidence: "Card details recorded (demo)", doc: "D12" },
  { id: "CR-SP-P09", person: "P09", type: "Safe Pass", expires: "2027-11-04", evidence: "Card details recorded (demo)", doc: "D13" },
  { id: "CR-SP-P10", person: "P10", type: "Safe Pass", expires: "2027-05-21", evidence: "Card details recorded (demo)", doc: "D14" },
  { id: "CR-DR-P04", person: "P04", type: "Truck eligibility", expires: "2029-02-10", evidence: "Eligibility evidence recorded (demo). Real licence categories not established.", doc: "D15" },
  { id: "CR-DR-P05", person: "P05", type: "Truck eligibility", expires: "2028-09-03", evidence: "Eligibility evidence recorded (demo). Real licence categories not established.", doc: "D16" },
];

/* ── Fleet ─────────────────────────────────────────────────────────────── */
export type Asset = { id: string; kind: "Truck" | "Plant"; label: string; driver?: string; owned: boolean; note: string };
export const ASSETS: Asset[] = [
  { id: "TRK-01", kind: "Truck", label: "Insulated tipper", driver: "P04", owned: true, note: "Model and registration not supplied. Demo description." },
  { id: "TRK-02", kind: "Truck", label: "Tipper", driver: "P05", owned: true, note: "Model and registration not supplied. Demo description." },
  { id: "PLT-01", kind: "Plant", label: "Tandem roller", owned: true, note: "Demo description." },
  { id: "PLT-02", kind: "Plant", label: "Compact roller", owned: true, note: "Planned service 12 Nov." },
  { id: "PLT-03", kind: "Plant", label: "Plate compactor", owned: true, note: "Demo description." },
];
export const CHECKS = [
  { id: "CHK-01", asset: "TRK-01", date: "2026-11-09", operator: "P04", result: "Pass", note: "Walk-round check" },
  { id: "CHK-02", asset: "TRK-02", date: "2026-11-09", operator: "P05", result: "Fail", note: "Brake fault reported 16:40, truck stood down", defect: "DEF-01" },
  { id: "CHK-03", asset: "PLT-01", date: "2026-11-09", operator: "P08", result: "Pass", note: "Pre-use check" },
  { id: "CHK-04", asset: "PLT-03", date: "2026-11-09", operator: "P07", result: "Pass", note: "Pre-use check" },
  { id: "CHK-05", asset: "TRK-01", date: "2026-11-10", operator: "P04", result: "Pass", note: "Walk-round check 07:05" },
];
export const DEFECT = {
  id: "DEF-01", asset: "TRK-02", reported: "2026-11-09T16:40", by: "P05", summary: "Brake fault",
  quote: 680, supplier: "S03", approver: "P02", proposedReturn: "2026-11-11T15:00", doc: "D04",
};
export const HIRE = { id: "HIR-01", supplier: "S04", cost: 260, date: "2026-11-11", driver: "P05", job: "J105", label: "One-day replacement tipper", doc: "D05" };
export const PLT02_SERVICE = { asset: "PLT-02", date: "2026-11-12", note: "Planned service. Not broken." };

/* ── Materials ─────────────────────────────────────────────────────────── */
export type PoStatus = "Draft" | "Awaiting confirmation" | "Confirmed" | "Delivered";
export type Po = { id: string; job: string; supplier: string; material: "Asphalt" | "Stone"; qty: number; unit: number; status: PoStatus; window: string; owner: string; ticket?: string };
export const POS: Po[] = [
  { id: "PO-201", job: "J104", supplier: "S01", material: "Asphalt", qty: 24, unit: 100, status: "Confirmed", window: "2026-11-11T08:00", owner: "P03" },
  { id: "PO-202", job: "J104", supplier: "S02", material: "Stone", qty: 30, unit: 28, status: "Delivered", window: "2026-11-09T08:00", owner: "P03", ticket: "D06" },
  { id: "PO-203", job: "J105", supplier: "S02", material: "Stone", qty: 20, unit: 28, status: "Delivered", window: "2026-11-09T09:30", owner: "P03", ticket: "D07" },
  { id: "PO-204", job: "J105", supplier: "S01", material: "Asphalt", qty: 18, unit: 100, status: "Awaiting confirmation", window: "2026-11-11T08:00", owner: "P03" },
  { id: "PO-205", job: "J106", supplier: "S01", material: "Asphalt", qty: 6, unit: 100, status: "Confirmed", window: "2026-11-12T08:30", owner: "P03" },
  { id: "PO-206", job: "J108", supplier: "S02", material: "Stone", qty: 40, unit: 28, status: "Draft", window: "2026-11-17T10:00", owner: "P03" },
];

/* ── Invoices, payments, bills, cash ──────────────────────────────────── */
export type Invoice = { id: string; job: string; customer: string; issued: string; due: string; amount: number; vat: string; rct: string; evidence: string };
export const INVOICES: Invoice[] = [
  { id: "INV-099", job: "J099", customer: "C01", issued: "2026-10-13", due: "2026-10-27", amount: 15600, vat: "Reverse charge (simulated, office-reviewed)", rct: "0% deduction authorisation (fictional)", evidence: "D17" },
  { id: "INV-101", job: "J101", customer: "C01", issued: "2026-11-03", due: "2026-11-10", amount: 15800, vat: "Reverse charge (simulated, office-reviewed)", rct: "0% deduction authorisation (fictional)", evidence: "D18" },
  { id: "INV-102", job: "J102", customer: "C01", issued: "2026-11-05", due: "2026-11-17", amount: 9600, vat: "Reverse charge (simulated, office-reviewed)", rct: "0% deduction authorisation (fictional)", evidence: "D19" },
  { id: "INV-103", job: "J103", customer: "C02", issued: "2026-11-06", due: "2026-11-19", amount: 12400, vat: "Reverse charge (simulated, office-reviewed)", rct: "0% deduction authorisation (fictional)", evidence: "D20" },
];
export type Payment = { id: string; invoice: string; amount: number; date: string; note: string };
export const PAYMENTS: Payment[] = [
  { id: "PAY-01", invoice: "INV-099", amount: 7800, date: "2026-10-30", note: "Part payment (seed)" },
  { id: "PAY-02", invoice: "INV-101", amount: 15800, date: "2026-11-09", note: "Paid in full (seed)" },
];
export const BILLS = [
  { id: "B301", supplier: "S01", amount: 6200, due: "2026-11-12", note: "Asphalt account" },
  { id: "B302", supplier: "S02", amount: 4800, due: "2026-11-13", note: "Stone account" },
  { id: "B303", supplier: "S05", amount: 2100, due: "2026-11-11", note: "Diesel" },
  { id: "B304", supplier: "S04", amount: 1500, due: "2026-11-16", note: "Plant hire account" },
];
export const CASH = {
  opening: 34500, openingAt: "2026-11-10T07:00", window: ["2026-11-10", "2026-11-16"], buffer: 10000,
  receiptExpected: "2026-11-12", fixedPayments: 1200, fixedDate: "2026-11-12", wagesDate: "2026-11-13",
  repairPayable: "Outside this window (modelled)",
  omitted: ["VAT and RCT payments to Revenue", "Payroll taxes and employer costs", "Loan or finance repayments not listed", "Any supplier bill not in the mock ledger"],
};
export const OVERHEADS = [
  { id: "OH-1", label: "Office/admin allowance", amount: 6000 },
  { id: "OH-2", label: "Insurance and vehicle finance allowance", amount: 4200 },
  { id: "OH-3", label: "Yard and utilities allowance", amount: 2600 },
  { id: "OH-4", label: "Repair contingency and maintenance", amount: 2200, note: "Already allows for the €680 TRK-02 repair quote." },
  { id: "OH-5", label: "Other business overhead allowance", amount: 3000 },
];
export const TARGET = 5000;

/* ── Work ──────────────────────────────────────────────────────────────── */
export type TaskStatus = "To do" | "In progress" | "Awaiting approval" | "Draft ready" | "Needs review" | "Done";
export type Task = { id: string; title: string; owner: string; due: string; priority: "Critical" | "High" | "Medium"; area: string; status: TaskStatus; ref: Ref; approval?: boolean };
export const TASKS: Task[] = [
  { id: "W001", title: "Review J104's €1,800 overrun", owner: "P01", due: "2026-11-10T09:00", priority: "High", area: "Operations", status: "To do", ref: { kind: "job", id: "J104" } },
  { id: "W002", title: "Review €680 repair quote", owner: "P02", due: "2026-11-10T09:00", priority: "Critical", area: "Fleet", status: "Awaiting approval", ref: { kind: "asset", id: "TRK-02" }, approval: true },
  { id: "W003", title: "Review €260 replacement transport", owner: "P02", due: "2026-11-10T09:00", priority: "Critical", area: "Fleet", status: "Awaiting approval", ref: { kind: "hire", id: "HIR-01" }, approval: true },
  { id: "W004", title: "Confirm 18 t asphalt", owner: "P03", due: "2026-11-10T15:00", priority: "High", area: "Materials", status: "In progress", ref: { kind: "po", id: "PO-204" } },
  { id: "W005", title: "Follow up €7,800 overdue balance", owner: "P03", due: "2026-11-10T11:00", priority: "High", area: "Finance", status: "Draft ready", ref: { kind: "invoice", id: "INV-099" } },
  { id: "W006", title: "Review private-job tax treatment", owner: "P02", due: "2026-11-10T14:00", priority: "High", area: "Finance", status: "Needs review", ref: { kind: "job", id: "J105" }, approval: true },
  { id: "W007", title: "Review €1,200 variation draft", owner: "P01", due: "2026-11-10T12:00", priority: "High", area: "Operations", status: "Awaiting approval", ref: { kind: "variation", id: "V104-01" }, approval: true },
  { id: "W008", title: "Arrange Tomas's Safe Pass renewal", owner: "P03", due: "2026-11-13T16:00", priority: "Medium", area: "Office", status: "To do", ref: { kind: "person", id: "P08" } },
];

/* ── Documents ─────────────────────────────────────────────────────────── */
export type Doc = { id: string; title: string; type: string; folder: string; added: string; owner: string; refs: Ref[]; body: string[] };
const sp = (id: string, pid: string, name: string, exp: string): Doc => ({
  id, title: "Safe Pass record, " + name, type: "Credential record", folder: "Crew credentials", added: "2026-02-02", owner: "P03",
  refs: [{ kind: "person", id: pid }, { kind: "credential", id: "CR-SP-" + pid }],
  body: ["Simulated credential record for the demo. No scanned ID is stored.", "Recorded expiry: " + exp + ".", "Real card numbers and issue dates were not supplied."],
});
export const DOCUMENTS: Doc[] = [
  { id: "D01", title: "J104 accepted quote", type: "Quote", folder: "Jobs", added: "2026-10-22", owner: "P01", refs: [{ kind: "job", id: "J104" }, { kind: "customer", id: "C03" }],
    body: ["Naas Logistics Park, distribution yard surfacing. Agreed net value €24,000.", "Scope: 1,600 m² yard, base and wearing course, edge restraint on the loading apron as drawn.", "Exclusions: unforeseen ground conditions, priced separately as a variation."] },
  { id: "D02", title: "V104-01 variation draft", type: "Variation", folder: "Jobs", added: "2026-11-10", owner: "P01", refs: [{ kind: "variation", id: "V104-01" }, { kind: "job", id: "J104" }],
    body: ["Draft only. Not sent and not accepted by the customer.", "Extra edge preparation along 60 m of the loading apron, €1,200 net.", "Internal approval prepares it; only customer acceptance changes the agreed value."] },
  { id: "D03", title: "J105 site note, 9 Nov", type: "Site note", folder: "Jobs", added: "2026-11-09", owner: "P05", refs: [{ kind: "job", id: "J105" }],
    body: ["Dig-out finished. 20 t stone delivered and spread (PO-203).", "Kerb line agreed with the customer at the gate.", "TRK-02 brake fault at end of day. Surfacing load on 11 Nov needs transport."] },
  { id: "D04", title: "TRK-02 repair quote", type: "Supplier quote", folder: "Fleet", added: "2026-11-09", owner: "P02", refs: [{ kind: "asset", id: "TRK-02" }, { kind: "supplier", id: "S03" }],
    body: ["Naas Commercial Repairs: brake repair, €680 net.", "Proposed return 11 Nov 15:00, not confirmed.", "Approval does not make the truck roadworthy. Release needs a repair-complete record and a return-to-service check."] },
  { id: "D05", title: "Replacement-transport quotation", type: "Supplier quote", folder: "Fleet", added: "2026-11-10", owner: "P01", refs: [{ kind: "hire", id: "HIR-01" }, { kind: "supplier", id: "S04" }],
    body: ["Leinster Plant Hire: one-day replacement tipper on 11 Nov, €260 net.", "Driver: Mihai (demo eligibility recorded).", "Solves transport only. Does not confirm the asphalt."] },
  { id: "D06", title: "PO-202 delivery ticket", type: "Delivery ticket", folder: "Materials", added: "2026-11-09", owner: "P03", refs: [{ kind: "po", id: "PO-202" }, { kind: "job", id: "J104" }],
    body: ["Kildare Aggregate Supply. 30 t stone delivered to Naas distribution yard, 9 Nov.", "Signed on site by Cian Doyle (demo)."] },
  { id: "D07", title: "PO-203 delivery ticket", type: "Delivery ticket", folder: "Materials", added: "2026-11-09", owner: "P03", refs: [{ kind: "po", id: "PO-203" }, { kind: "job", id: "J105" }],
    body: ["Kildare Aggregate Supply. 20 t stone delivered to Dunlavin, 9 Nov.", "Signed on site by Mihai Ionescu (demo)."] },
  sp("D08", "P04", "Cian Doyle", "14 Aug 2027"), sp("D09", "P05", "Mihai Ionescu", "2 Mar 2027"), sp("D10", "P06", "Andrei Popa", "19 Jan 2028"),
  sp("D11", "P07", "Sean Kelly", "30 Jun 2027"), sp("D12", "P08", "Tomas Nowak", "18 Nov 2026"), sp("D13", "P09", "Luke Byrne", "4 Nov 2027"),
  sp("D14", "P10", "Patrick Walsh", "21 May 2027"),
  { id: "D15", title: "Truck eligibility, Cian Doyle", type: "Driver eligibility", folder: "Crew credentials", added: "2026-02-02", owner: "P03", refs: [{ kind: "person", id: "P04" }, { kind: "credential", id: "CR-DR-P04" }],
    body: ["Demo eligibility record. The real crew's licence categories were not established."] },
  { id: "D16", title: "Truck eligibility, Mihai Ionescu", type: "Driver eligibility", folder: "Crew credentials", added: "2026-02-02", owner: "P03", refs: [{ kind: "person", id: "P05" }, { kind: "credential", id: "CR-DR-P05" }],
    body: ["Demo eligibility record. The real crew's licence categories were not established."] },
  ...["INV-099", "INV-101", "INV-102", "INV-103"].map((inv, i): Doc => ({
    id: "D" + (17 + i), title: "Office review evidence, " + inv, type: "Review evidence", folder: "Finance", added: ["2026-10-13", "2026-11-03", "2026-11-05", "2026-11-06"][i], owner: "P03",
    refs: [{ kind: "invoice", id: inv }],
    body: ["Simulated contractor case. Reverse-charge VAT treatment recorded by office review.", "RCT: fictional 0% deduction authorisation recorded for the demo ledger.", "Seed assumption only. Not a tax fact about Reynolds and not applied to new jobs."] })),
];

/* ── Agents ────────────────────────────────────────────────────────────── */
export const AGENTS = [
  { id: "briefing", name: "Briefing", owner: "P01", shape: "crown-pebble", tint: "#24282D", purpose: "Gives Florin a short morning brief on operations and money." },
  { id: "ops", name: "Ops Watchdog", owner: "P01", shape: "shield", tint: "#2b2118", purpose: "Finds unresolved dependencies, overdue decisions and jobs not ready." },
  { id: "margin", name: "Job Margin Agent", owner: "P01", shape: "executive-capsule", tint: "#2a2118", purpose: "Compares agreed value, original budget and forecast final cost." },
  { id: "dispatch", name: "Dispatch Agent", owner: "P01", shape: "rim-capsule", tint: "#1b2430", purpose: "Proposes feasible crew, driver and truck assignments." },
  { id: "materials", name: "Materials Agent", owner: "P03", shape: "control-cube", tint: "#16241f", purpose: "Checks job requirements against orders and supplier confirmation." },
  { id: "finance", name: "Finance Agent", owner: "P02", shape: "low-dome", tint: "#241b2e", purpose: "Surfaces overdue balances, prepares follow-up drafts, updates cash scenarios." },
  { id: "crew", name: "Crew Admin Agent", owner: "P03", shape: "offset-pebble", tint: "#191c1f", purpose: "Compiles day-shift summaries, leave and qualification expiries." },
];

/* ── Seeded activity before 07:15 on 10 Nov ──────────────────────────── */
export type ActKind = "people" | "agents" | "systems";
export type Activity = { id: string; at: string; kind: ActKind; actor: string; title: string; note: string; refs: Ref[]; provenance: "Simulated" | "Demo import" };
export const SEED_ACTIVITY: Activity[] = [
  { id: "A01", at: "2026-11-09T07:40", kind: "systems", actor: "CSV import", title: "Fixture import: November jobs and invoices", note: "Demo fixtures loaded from a sample CSV preview. No accounting system connected.", refs: [{ kind: "job", id: "J104" }, { kind: "invoice", id: "INV-099" }], provenance: "Demo import" },
  { id: "A02", at: "2026-11-09T08:05", kind: "people", actor: "P04", title: "PO-202 delivery received", note: "30 t stone signed for at Naas distribution yard.", refs: [{ kind: "po", id: "PO-202" }, { kind: "document", id: "D06" }], provenance: "Simulated" },
  { id: "A03", at: "2026-11-09T09:40", kind: "people", actor: "P05", title: "PO-203 delivery received", note: "20 t stone signed for at Dunlavin.", refs: [{ kind: "po", id: "PO-203" }, { kind: "document", id: "D07" }], provenance: "Simulated" },
  { id: "A04", at: "2026-11-09T16:40", kind: "people", actor: "P05", title: "TRK-02 defect reported", note: "Brake fault on the end-of-day check. Truck stood down.", refs: [{ kind: "asset", id: "TRK-02" }], provenance: "Simulated" },
  { id: "A05", at: "2026-11-09T17:20", kind: "people", actor: "P01", title: "Repair quote attached, approval requested", note: "€680 from Naas Commercial Repairs. Routed to Joe.", refs: [{ kind: "document", id: "D04" }, { kind: "task", id: "W002" }], provenance: "Simulated" },
  { id: "A06", at: "2026-11-09T18:10", kind: "people", actor: "P01", title: "Monday attendance approved", note: "7 full-day shifts, €1,450 day wages.", refs: [{ kind: "person", id: "P04" }], provenance: "Simulated" },
  { id: "A07", at: "2026-11-09T19:05", kind: "systems", actor: "Bank snapshot", title: "Manual bank balance entered", note: "€34,500 opening snapshot for the cash view. No live bank feed.", refs: [], provenance: "Demo import" },
  { id: "A08", at: "2026-11-10T06:40", kind: "agents", actor: "margin", title: "J104 forecast recalculated to €20,600", note: "€1,800 over the €18,800 budget. Materials +€1,200, labour +€600.", refs: [{ kind: "job", id: "J104" }, { kind: "run", id: "R01" }], provenance: "Simulated" },
  { id: "A09", at: "2026-11-10T06:45", kind: "agents", actor: "materials", title: "PO-204 flagged: 18 t unconfirmed", note: "Needed 11 Nov 08:00 for J105. Owner Aoife.", refs: [{ kind: "po", id: "PO-204" }, { kind: "run", id: "R02" }], provenance: "Simulated" },
  { id: "A10", at: "2026-11-10T06:50", kind: "agents", actor: "dispatch", title: "J105 transport flagged", note: "TRK-02 unavailable; Mihai has no truck for 11 Nov. €260 hire proposed for Joe.", refs: [{ kind: "job", id: "J105" }, { kind: "run", id: "R03" }], provenance: "Simulated" },
  { id: "A11", at: "2026-11-10T06:55", kind: "agents", actor: "finance", title: "INV-099 follow-up prepared", note: "Draft reminder for Kildare BuildCo, €7,800, 14 days overdue. Not sent.", refs: [{ kind: "invoice", id: "INV-099" }, { kind: "run", id: "R04" }], provenance: "Simulated" },
  { id: "A12", at: "2026-11-10T07:10", kind: "agents", actor: "briefing", title: "Morning briefing compiled", note: "Six items for Florin, four decisions waiting.", refs: [{ kind: "run", id: "R07" }], provenance: "Simulated" },
];

export type Run = { id: string; agent: string; at: string; trigger: string; refs: Ref[]; result: string; inputs: string[]; outputs: string[] };
export const SEED_RUNS: Run[] = [
  { id: "R01", agent: "margin", at: "2026-11-10T06:40", trigger: "Schedule, weekdays 06:40", refs: [{ kind: "job", id: "J104" }], result: "Issue detected", inputs: ["J104 cost lines (5)", "Original budget €18,800", "Agreed value €24,000"], outputs: ["Forecast final cost €20,600", "Overrun €1,800 (materials +€1,200, labour +€600)", "V104-01 €1,200 not counted: not accepted"] },
  { id: "R02", agent: "materials", at: "2026-11-10T06:45", trigger: "Schedule, weekdays 06:45", refs: [{ kind: "po", id: "PO-204" }], result: "Issue detected", inputs: ["Job requirements for 11 Nov", "6 purchase orders"], outputs: ["Asphalt needed 11 Nov: 42 t", "Confirmed 24 t (PO-201)", "Unconfirmed 18 t (PO-204), owner Aoife, task W004"] },
  { id: "R03", agent: "dispatch", at: "2026-11-10T06:50", trigger: "Event, asset unavailable", refs: [{ kind: "asset", id: "TRK-02" }, { kind: "job", id: "J105" }], result: "Proposal ready", inputs: ["Crew plan 9 to 13 Nov", "2 owned trucks", "2 truck-eligible crew"], outputs: ["TRK-02 cannot be used until a return-to-service check", "Proposed: €260 one-day hire for Mihai on 11 Nov (task W003, Joe)"] },
  { id: "R04", agent: "finance", at: "2026-11-10T06:55", trigger: "Schedule, weekdays 06:55", refs: [{ kind: "invoice", id: "INV-099" }], result: "Draft ready", inputs: ["4 invoices", "Cash window 10 to 16 Nov"], outputs: ["INV-099 €7,800, 14 days overdue", "Reminder drafted, not sent (task W005)", "If it slips, closing cash falls to €11,450"] },
  { id: "R05", agent: "crew", at: "2026-11-10T07:00", trigger: "Schedule, weekdays 07:00", refs: [{ kind: "person", id: "P08" }], result: "Summary ready", inputs: ["Shift plan 9 to 13 Nov", "9 credentials", "2 leave requests"], outputs: ["35 planned shifts, €7,250 expected gross day wages", "Monday approved: 7 shifts, €1,450", "Tomas's Safe Pass expires 18 Nov (task W008)"] },
  { id: "R06", agent: "ops", at: "2026-11-10T07:05", trigger: "Schedule, weekdays 07:05", refs: [{ kind: "job", id: "J105" }], result: "Issue detected", inputs: ["Tasks", "Crew and assets", "Supplier confirmations"], outputs: ["J105 has 2 blockers: transport and material confirmation", "4 decisions due before 14:00"] },
  { id: "R07", agent: "briefing", at: "2026-11-10T07:10", trigger: "Schedule, weekdays 07:10", refs: [{ kind: "job", id: "J104" }, { kind: "job", id: "J105" }], result: "Briefing compiled", inputs: ["Jobs, readiness, costs, invoices, tasks, target"], outputs: ["Morning briefing for Florin"] },
];

export const CLOCK_PRESETS = [
  { id: "2026-11-10T07:15", label: "Tue 10 Nov, 07:15 (start)" },
  { id: "2026-11-10T13:30", label: "Tue 10 Nov, 13:30" },
  { id: "2026-11-10T18:20", label: "Tue 10 Nov, 18:20" },
  { id: "2026-11-11T07:15", label: "Wed 11 Nov, 07:15" },
];
export const START_CLOCK = "2026-11-10T07:15";
