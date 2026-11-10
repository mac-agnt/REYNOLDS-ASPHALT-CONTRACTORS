/* Demo data and pure helpers for Pulse, re-skinned for Reynolds Asphalt Contractors.
   Operational fixtures live in src/reynolds/fixtures.ts; this file adapts them to the
   shapes the original Pulse views expect (contacts, files, ontology, agent threads). */
import { PEOPLE as R_PEOPLE, CUSTOMERS as R_CUSTOMERS, SUPPLIERS as R_SUPPLIERS, DOCUMENTS as R_DOCS } from "../reynolds/fixtures";

const INK="var(--ink)", BODY="var(--body)", DIM="var(--dim)", FAINT="var(--faint)";
const LIME="var(--accent)", GREEN="var(--ok)", AMBER="var(--warn)", RED="var(--bad)", NEUTRAL="var(--neutral)";
const MONO="var(--mono)";

const ICONS = {
  navHome:"M12 3.2 3.6 9.1v10a1.5 1.5 0 0 0 1.5 1.5h13.8a1.5 1.5 0 0 0 1.5-1.5v-10L12 3.2Z M8.9 13.1h2l1-2.6 1.5 5 1.1-2.4h1.6",
  navAgents:"M12 2.4v2.3 M12 2.4a.9.9 0 1 0 0-.02 M8.2 6.5h7.6A2.2 2.2 0 0 1 18 8.7v5.1a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 13.8V8.7a2.2 2.2 0 0 1 2.2-2.2Z M9.9 10.6v1.4 M14.1 10.6v1.4 M6 10h-1.9 M18 10h1.9 M9.2 18.6h5.6 M9.2 21.2h5.6",
  navDash:"M4 5.6h7.2v5.1H4V5.6Z M13.6 5.6H20v8.6h-6.4V5.6Z M4 13.1h7.2v5.3H4v-5.3Z M13.6 16.6H20v1.8h-6.4v-1.8Z",
  navWork:"M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v1.1h2.4A1.6 1.6 0 0 1 20 8.5v9.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6V8.5a1.6 1.6 0 0 1 1.6-1.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4Z M8 6.9h8 M9.6 13.3l1.8 1.8 3.4-3.6",
  navRecords:"M12 3.6c3.9 0 7 1.1 7 2.5S15.9 8.6 12 8.6 5 7.5 5 6.1 8.1 3.6 12 3.6Z M5 6.1v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.1 M5 11.8v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5.7",
  navActivity:"M4.6 4.6h14.8A1.6 1.6 0 0 1 21 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 17.8V6.2a1.6 1.6 0 0 1 1.6-1.6Z M6 12.4h2.2l1.5-4.1 2.3 8 1.9-5.4 1.2 1.5H18",
  navAdmin:"M12 2.9 5 5.6v5.9c0 4 2.8 7.1 7 8.6 4.2-1.5 7-4.6 7-8.6V5.6L12 2.9Z M12 8.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z M8.8 16.3a3.6 3.6 0 0 1 6.4 0",
  helios:"M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.9A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M8 12h1.6l1.2-2.6 1.6 5 1.4-2.4H16",
  inbox:"M3 13h4l1.5 3h7l1.5-3h4 M3 13l2.4-7A2 2 0 0 1 7.3 4.6h9.4a2 2 0 0 1 1.9 1.4L21 13v4.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z",
  work:"M6 4.6h12a1.6 1.6 0 0 1 1.6 1.6v12.2A1.6 1.6 0 0 1 18 20H6a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 6 4.6Z M8.4 10.4l1.9 1.9 3.9-3.9 M8.4 15.6h7.2",
  approvals:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  insights:"M4.5 19.5V13 M9.7 19.5V7.5 M14.9 19.5v-8 M20 19.5V5",
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  orgs:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5 M7.5 15.5h2.5",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  locations:"M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  visits:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M9 13.5l1.6 1.6 3.4-3.4",
  autos:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  agents:"M8.5 3.6h7A2.4 2.4 0 0 1 17.9 6v5.6a2.4 2.4 0 0 1-2.4 2.4h-7A2.4 2.4 0 0 1 6.1 11.6V6a2.4 2.4 0 0 1 2.4-2.4Z M9.6 8.2h.01 M14.4 8.2h.01 M12 14v2.6 M7.6 20.4h8.8 M12 16.6c-2.4 0-4.4 1.7-4.4 3.8h8.8c0-2.1-2-3.8-4.4-3.8Z",
  dash:"M4.4 4.4h6v6h-6v-6Z M13.6 4.4h6v3.6h-6V4.4Z M13.6 11.6h6v8h-6v-8Z M4.4 14h6v5.6h-6V14Z",
  files:"M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z",
  pulseLine:"M2.5 12.5h3.6l2.1-6.4 3.2 12.2 2.6-8.4 1.8 2.6h5.7",
  records:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  tree:"M4.5 6h5 M4.5 12h5 M4.5 18h5 M12.5 6h7 M12.5 12h7 M12.5 18h7",
  graph:"M7 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M17.6 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M9.4 21.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M8.6 6.4l7.6 2.6 M15.8 11.4l-5.6 5.2",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  navJobs:"M4 19.5h16 M6 19.5V9.5l6-4 6 4v10 M9.5 19.5v-5h5v5 M3.5 10.8 12 5.2l8.5 5.6",
  navPlanning:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M8 13h3 M13 13h3 M8 16.5h3",
  navFleet:"M3 7.5h10.5v8.5H3V7.5Z M13.5 10.5h3.8l2.7 3v2.5h-6.5v-5.5Z M7 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z M16.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z",
  navMaterials:"M3.5 18.5 8 9.5l3 5 2.5-3.5 7 7.5h-17Z M15.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  navFinance:"M4 19.5h16 M6.5 16.5v-5 M10.5 16.5V7.5 M14.5 16.5v-6 M18.5 16.5V5"
};

/* Ontology stays first and is never removed (PulseLogic enforces this too). */
const REC_SECTIONS = [
  {id:"ontology", label:"Ontology", blurb:"How every record connects: customers, jobs, crews, trucks, materials, invoices and decisions."},
  {id:"files", label:"Files", blurb:"Quotes, delivery tickets, repair quotes, credentials and review evidence. All simulated documents."},
  {id:"contacts", label:"Contacts", blurb:"The team, customers and suppliers in one list."},
  {id:"browse", label:"Browse", blurb:"Every entity in one searchable place."},
  {id:"customers", label:"Customers", blurb:"Customers and prospects with their jobs, quotes and balances."},
  {id:"suppliers", label:"Suppliers", blurb:"Suppliers with their orders, bills and documents."}
];

const TINTS = ["#F4B544","#9fd6f0","#e6c78a","#c8b4f0","#a8e0c0","#e2a08c"];
const CONTACTS = R_PEOPLE.map(p => [p.name, p.role, p.email, "Reynolds Asphalt", "staff", p.tint])
  .concat(R_CUSTOMERS.map((c, i) => [c.contact, c.type + (c.prospect ? " prospect" : " customer"), "not recorded", c.name, c.prospect ? "prospect" : "customer", TINTS[i % TINTS.length]]))
  .concat(R_SUPPLIERS.map((x, i) => ["Accounts desk", x.category, "not recorded", x.name, "supplier", TINTS[(i + 2) % TINTS.length]]));

const FOLDERS = ["Jobs","Fleet","Materials","Finance","Crew credentials"];
const PNAME = Object.fromEntries(R_PEOPLE.map(p => [p.id, p.name]));
const FILE_TREE = FOLDERS.flatMap((f, fi) => [{type:"folder", id:"f-" + fi, name:f, depth:0}].concat(
  R_DOCS.filter(d => d.folder === f).map(d => ({type:"file", id:d.id, name:d.title, depth:1, parent:"f-" + fi, indexed:true,
    path:f + " / " + d.type, title:d.title,
    facts:[["TYPE", d.type + " · simulated"], ["ADDED", d.added.split("-").reverse().join("/")], ["RECORD", d.id], ["OWNER", PNAME[d.owner] || d.owner]],
    body:d.body, links:d.refs.map(r => [r.id, r.kind])}))));

const ONTO_NODES = [
  ["Job","entity",500,300,1,"The spine: agreed value, cost lines, readiness, crews, materials and invoices hang off a job."],
  ["Customer","entity",300,190,1,"Contractor, commercial or private. Quotes, variations, jobs and balances."],
  ["Person","entity",700,190,1,"Florin, Joe, the office and seven paid crew. Qualifications decide truck eligibility."],
  ["Asset","entity",250,430,1,"Trucks and plant, owned or hired. Checks, defects and maintenance."],
  ["Task","entity",690,430,1,"Work and decisions, each tied to the record it is about."],
  ["Approval","entity",850,320,0,"Spend, tax treatment and price changes. Approval is never the same as acceptance or payment."],
  ["Invoice","ledger",390,95,0,"Invoices and payments. The existing accounting system stays the source of truth."],
  ["Material order","ledger",620,95,0,"Purchase orders, supplier confirmation and delivery tickets."],
  ["Agent run","module",860,470,0,"Deterministic agent runs with their evidence and proposed actions."],
  ["File","entity",140,300,0,"Quotes, tickets, repair quotes, credentials and review evidence."],
  ["for customer","predicate",395,240,0,"Job → Customer."],
  ["crewed by","predicate",605,240,0,"Job → Crew shift → Person."],
  ["uses","predicate",360,370,0,"Job → Asset assignment."],
  ["relates to","predicate",600,370,0,"Task / Approval → any record."],
  ["attached to","predicate",140,372,0,"File → any record."]
];

const ONTO_EDGES = [
  [500,300,300,190],[500,300,700,190],[500,300,250,430],[500,300,690,430],
  [500,300,850,320],[500,300,390,95],[500,300,620,95],[500,300,140,300],
  [300,190,250,430],[700,190,860,470],[690,430,850,320],[690,430,860,470],
  [300,190,140,300],[390,95,620,95]
];

const REC_TEMPLATES = [
  ["Field sheet","Records","Labelled fields in a grid: the default for a person, organisation or location.",
   "M5 5.5h14v13H5v-13Z M5 10h14 M12 10v8.5","grid"],
  ["Contact card","Records","A portrait, key fields and every linked record in one compact panel.",
   "M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M5.5 19c.8-3 3.3-4.7 6.5-4.7s5.7 1.7 6.5 4.7","card"],
  ["Directory","Records","A sortable table of many records at once, built for lists.",
   "M4.5 6.5h15 M4.5 12h15 M4.5 17.5h15 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01","rows"],
  ["Timeline","Case work","Ordered events with who did what and when. Good for a case or a claim.",
   "M12 3.5v17 M12 7.5h6 M12 13h-6 M12 18h6","timeline"],
  ["Kanban board","Case work","Cards in columns by status. For anything that moves through stages.",
   "M5 5h4.5v14H5V5Z M9.75 5h4.5v9h-4.5V5Z M14.5 5H19v6h-4.5V5Z","kanban"],
  ["Checklist","Case work","Ticked steps in order, with an owner and a due date on each.",
   "M5 6.5h2l1.4 1.4L11 5.5 M5 12.5h2l1.4 1.4 2.6-2.4 M5 18.5h2l1.4 1.4 2.6-2.4 M15 6.5h4 M15 12.5h4 M15 18.5h4","checklist"],
  ["Ledger","Finance","Rows and running totals. For anything with amounts and dates.",
   "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17","ledger"],
  ["Invoice","Finance","Line items, totals and a status, built to be previewed, not just stored.",
   "M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3","invoice"],
  ["Document","Notes","Long-form text with linked records pulled out down the side.",
   "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4","document"],
  ["Gallery","Notes","A wall of images and files with a caption on each, for a site or a job.",
   "M4.5 6h6v6h-6V6Z M13.5 6h6v6h-6V6Z M4.5 14h6v4h-6v-4Z M13.5 14h6v4h-6v-4Z","gallery"],
  ["Map & locations","Ops","A pinboard of places, with the record's fields beside each pin.",
   "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z","map"],
  ["Schedule","Ops","A calendar of bookings against this record, with recurring rules.",
   "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z","schedule"]
];
const REC_TEMPLATE_CATS = ["All","Records","Case work","Finance","Notes","Ops"];

/* ---- admin hub ---- */
/* Profiles, not employee or payroll records. Emails are synthetic demo addresses. */
const PEOPLE = [
  ["Florin Pricope","Operations Lead / Business Partner","florin@reynoldsasphalt.ie","Naas area","active","Admin","Demo profile"],
  ["Joe","Business Partner","joe@reynoldsasphalt.ie","Office","active","Admin","Demo profile"],
  ["Aoife Brennan","Office Administrator","office@reynoldsasphalt.ie","Office","active","Manager","Demo profile"],
  ["Cian Doyle","Driver / Crew Lead","cian@reynoldsasphalt.ie","Crew A","active","Standard","Demo profile"],
  ["Mihai Ionescu","Driver / Surfacing Operative","mihai@reynoldsasphalt.ie","Crew B","active","Standard","Demo profile"],
  ["Andrei Popa","Asphalt Operative","andrei@reynoldsasphalt.ie","Crew A","active","Standard","Demo profile"],
  ["Sean Kelly","Groundworks Operative","sean@reynoldsasphalt.ie","Crew B","active","Standard","Demo profile"],
  ["Tomas Nowak","Roller Operator","tomas@reynoldsasphalt.ie","Crew A","active","Standard","Demo profile"],
  ["Luke Byrne","General Operative","luke@reynoldsasphalt.ie","Crew B","active","Standard","Demo profile"],
  ["Patrick Walsh","General Operative","patrick@reynoldsasphalt.ie","Crew B","active","Standard","Demo profile"]
];
const ROLE_LEVELS = ["Admin","Manager","Standard","External"];
const PERM_KEYS = [["view","View records"],["edit","Edit records"],["approve","Approve spend"]];
const GRANT_DEFS = [
  ["view","View records","Read anything in scope"],
  ["edit","Edit records","Create and change records"],
  ["approve","Approve decisions","Say yes to spend, tax treatment and price changes"],
  ["pay","Record payments","Mark simulated receipts and payments"],
  ["export","Export data","Download local CSV files"],
  ["agents","Manage agents","Switch agents on or off"],
  ["settings","Change settings","Organisation, teams, demo controls"],
  ["audit","Read the activity log","Every action, everyone"]
];
const ROLE_SCOPES = ["All records","Their crew","Assigned only"];
const DEFAULT_PERMS = {Admin:{view:true,edit:true,approve:true}, Manager:{view:true,edit:true,approve:false},
  Standard:{view:true,edit:false,approve:false}, External:{view:false,edit:false,approve:false}};
/* Only systems that are honestly known. Nothing here is a live connection. */
const INTEGRATIONS = [
  {name:"Existing invoice system", blurb:"The accounting tool the office already uses. Product name not confirmed, so only a sample CSV import is shown.", tint:"var(--accent)", status:"sample import only", statusKind:"warn",
   glyph:"M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3",
   lastSync:"Fixture import 9 Nov 07:40", usage:"4 sample invoices", auth:"None", scopes:["Read sample"]},
  {name:"Bank balances", blurb:"A manually entered balance used as the opening point of the cash view. There is no live bank feed.", tint:"#9fd6f0", status:"manual snapshot", statusKind:"warn",
   glyph:"M4 10h16 M5.5 10v7 M10 10v7 M14 10v7 M18.5 10v7 M3.5 19.5h17 M12 3.5 20 8H4l8-4.5Z",
   lastSync:"Entered 9 Nov 19:05", usage:"€34,500 snapshot", auth:"None", scopes:["Manual"]},
  {name:"Existing paperwork", blurb:"Quotes, delivery tickets and repair quotes are represented as simulated documents in Records.", tint:"#e6c78a", status:"simulated", statusKind:"off",
   glyph:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2",
   lastSync:"n/a", usage:"20 simulated documents", auth:"None", scopes:[]},
  {name:"CSV import and export", blurb:"Local files in and out of the browser for the demonstration. A CSV is a format, not evidence of a spreadsheet tool.", tint:"#a8e0c0", status:"local demo", statusKind:"ok",
   glyph:"M12 4v11 M7.5 10.5 12 15l4.5-4.5 M5 19.5h14",
   lastSync:"On demand", usage:"Jobs export", auth:"None", scopes:["Local file"]},
  {name:"Email follow-up", blurb:"Reminder drafts can be previewed and reviewed. No email provider is connected, so nothing is sent.", tint:"#c8b4f0", status:"draft preview only", statusKind:"warn",
   glyph:"M4 7.2 12 13 20 7.2 M4 7.2v10.6h16V7.2",
   lastSync:"n/a", usage:"1 draft (INV-099)", auth:"None", scopes:["Preview"]},
  {name:"Revenue / ROS", blurb:"Not connected. Tax review stores evidence and a human decision only; no returns, payments or submissions.", tint:DIM, status:"not connected", statusKind:"off",
   glyph:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z",
   lastSync:"n/a", usage:"n/a", auth:"n/a", scopes:[]}
];

/* Background catalogue. Each entry is pure CSS so a tile is the real thing at
   thumbnail size, not a picture of it. */
const BG_DEFS = [
  {id:"bloom", name:"Bloom", cat:"Signature",
   css:"background:radial-gradient(60% 48% at 50% 34%, var(--accent-faint), transparent 72%), radial-gradient(44% 38% at 16% 84%, rgba(255,255,255,.05), transparent 70%)",
   thumb:"background:radial-gradient(62% 58% at 46% 34%, var(--accent-soft), transparent 74%), radial-gradient(50% 46% at 82% 84%, rgba(255,255,255,.08), transparent 72%), var(--surface-2)"},
  {id:"mist", name:"Mist", cat:"Signature",
   css:"background:radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,.07), transparent 70%), radial-gradient(56% 46% at 80% 76%, rgba(255,255,255,.05), transparent 72%)",
   thumb:"background:radial-gradient(58% 52% at 24% 22%, rgba(255,255,255,.16), transparent 72%), radial-gradient(60% 54% at 82% 78%, rgba(255,255,255,.10), transparent 74%), var(--surface-2)"},
  {id:"grid", name:"Grid", cat:"Signature",
   css:"background-image:linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%);-webkit-mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%)",
   thumb:"background-color:var(--surface-2);background-image:linear-gradient(var(--border-strong) 1px, transparent 1px),linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);background-size:14px 14px"},
  {id:"none", name:"None", cat:"Signature", css:"", thumb:"background:var(--surface-2)"},

  {id:"aurora", name:"Aurora", cat:"Gradient",
   css:"background:radial-gradient(70% 52% at 18% 8%, var(--bloom-a), transparent 66%), radial-gradient(64% 48% at 84% 22%, var(--bloom-b), transparent 68%), radial-gradient(70% 60% at 50% 104%, var(--bloom-c), transparent 70%);filter:blur(24px)",
   thumb:"background:radial-gradient(72% 60% at 16% 6%, var(--bloom-a), transparent 68%), radial-gradient(66% 54% at 86% 24%, var(--bloom-b), transparent 70%), radial-gradient(74% 66% at 50% 108%, var(--bloom-c), transparent 72%), var(--surface-2)"},
  {id:"horizon", name:"Horizon", cat:"Gradient",
   css:"background:linear-gradient(180deg, transparent 0%, var(--accent-faint) 58%, transparent 100%), radial-gradient(90% 40% at 50% 72%, var(--accent-soft), transparent 70%)",
   thumb:"background:linear-gradient(180deg, var(--surface-2) 0%, var(--accent-faint) 58%, var(--surface-2) 100%), radial-gradient(90% 44% at 50% 74%, var(--accent-soft), transparent 70%)"},
  {id:"dusk", name:"Dusk", cat:"Gradient",
   css:"background:linear-gradient(200deg, var(--bloom-c) -10%, transparent 46%), linear-gradient(20deg, var(--bloom-b) -10%, transparent 52%);opacity:.5",
   thumb:"background:linear-gradient(200deg, var(--bloom-c) -12%, transparent 48%), linear-gradient(20deg, var(--bloom-b) -12%, transparent 54%), var(--surface-2)"},
  {id:"ember", name:"Ember", cat:"Gradient",
   css:"background:radial-gradient(60% 70% at 84% 96%, var(--bloom-a), transparent 64%), radial-gradient(50% 60% at 10% 96%, var(--bloom-c), transparent 66%)",
   thumb:"background:radial-gradient(64% 76% at 84% 100%, var(--bloom-a), transparent 66%), radial-gradient(54% 66% at 8% 100%, var(--bloom-c), transparent 68%), var(--surface-2)"},

  {id:"mesh", name:"Mesh", cat:"Abstract",
   css:"background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:22px 22px;mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%);-webkit-mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%)",
   thumb:"background-color:var(--surface-2);background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:8px 8px"},
  {id:"contour", name:"Contour", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 30% 110%, transparent 0 22px, var(--border) 22px 23px);mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%);-webkit-mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%)",
   thumb:"background:repeating-radial-gradient(circle at 26% 116%, var(--surface-2) 0 9px, var(--border-strong) 9px 10px)"},
  {id:"weave", name:"Weave", cat:"Abstract",
   css:"background:repeating-linear-gradient(48deg, transparent 0 16px, var(--border) 16px 17px), repeating-linear-gradient(-48deg, transparent 0 16px, var(--border) 16px 17px);opacity:.7",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(48deg, transparent 0 7px, var(--border-strong) 7px 8px), repeating-linear-gradient(-48deg, transparent 0 7px, var(--border-strong) 7px 8px)"},
  {id:"halo", name:"Halo", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 50% 50%, transparent 0 46px, var(--accent-line) 46px 47px);mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%);-webkit-mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%)",
   thumb:"background:repeating-radial-gradient(circle at 50% 50%, var(--surface-2) 0 11px, var(--accent-line) 11px 12px)"},
  {id:"drift", name:"Drift", cat:"Abstract",
   css:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%);filter:blur(30px);opacity:.6",
   thumb:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%), var(--surface-2)"},
  {id:"scan", name:"Scanlines", cat:"Abstract",
   css:"background:repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 7px);mask-image:linear-gradient(180deg, #000, transparent 88%);-webkit-mask-image:linear-gradient(180deg, #000, transparent 88%)",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(0deg, var(--border-strong) 0 1px, transparent 1px 5px)"}
];

const THEMES = [
  {id:"reynolds", label:"Reynolds", group:"Dark", bg:"#0e0f11", surface:"#181a1e", ink:"#f4f3f0", accent:"#F4B544"},
  {id:"reynolds-light", label:"Reynolds light", group:"Light", bg:"#f4f2ed", surface:"#ffffff", ink:"#16181c", accent:"#A65A00"},
  {id:"dark", label:"Dark", group:"Dark", bg:"#0b0c0b", surface:"#1a1c19", ink:"#f2f3ef", accent:"#c8f04b"},
  {id:"indigo", label:"Indigo", group:"Dark", bg:"#0a0b13", surface:"#1a1b26", ink:"#f0f1fa", accent:"#8b93ff"},
  {id:"slate", label:"Slate", group:"Dark", bg:"#100e0c", surface:"#211c17", ink:"#f4f0ea", accent:"#e8a14a"},
  {id:"plum", label:"Plum", group:"Dark", bg:"#100a10", surface:"#20151f", ink:"#f6eef4", accent:"#f077b0"},
  {id:"ember", label:"Ember", group:"Dark", bg:"#0b0b0b", surface:"#1c1714", ink:"#f7f3ef", accent:"#f4561a"},
  {id:"harbour", label:"Harbour", group:"Dark", bg:"#0b0e10", surface:"#13171a", ink:"#f3f5f4", accent:"#5ee79a"},
  {id:"cargo", label:"Cargo", group:"Dark", bg:"#0a0a0a", surface:"#1a1c1a", ink:"#f2f5f2", accent:"#4ade80"},
  {id:"ocean", label:"Ocean", group:"Dark", bg:"#080e12", surface:"#141f25", ink:"#eaf4f8", accent:"#4fd4d0"},
  {id:"graphite", label:"Graphite", group:"Dark", bg:"#111112", surface:"#212124", ink:"#f4f4f5", accent:"#f4f4f5"},
  {id:"light", label:"Cream", group:"Light", bg:"#f4f2ed", surface:"#ffffff", ink:"#16181c", accent:"#0071e3"},
  {id:"warm", label:"Warm paper", group:"Light", bg:"#faf5ec", surface:"#fffdf9", ink:"#2a2016", accent:"#c9683f"},
  {id:"mist", label:"Mist", group:"Light", bg:"#eef1f4", surface:"#ffffff", ink:"#141e20", accent:"#0e9f6e"},
  {id:"sand", label:"Sand", group:"Light", bg:"#f6f1e6", surface:"#fffdf7", ink:"#221d12", accent:"#7d5fd6"}
];

const ADMIN_ICONS = {
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  structure:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
  shield:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  agent:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5",
  flow:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  plug:"M9 3.5v5 M15 3.5v5 M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z M12 17v3.5",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  lock:"M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  audit:"M8 3.5h8l3.5 3.5v13a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5h2Z M9 12h6 M9 16h4",
  brand:"M12 3.5 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9 12 3.5Z",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  data:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
};

const ADMIN_CARDS = [
  {id:"people", group:"ORGANISATION", title:"People & access", icon:"people", tint:"#6ad0f0",
   blurb:"The ten demo profiles: Florin, Joe, the office and seven paid crew.",
   tags:["10 profiles","5 functions","Naas area"],
   footer:"Profiles are not employee or payroll records", action:"Open Teams",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Field team including Florin","8"],["Paid crew on day rates","7"],["Truck-eligible demo drivers","2"],
     ["Office and finance","2"],["Area","Naas, Co. Kildare"]]},
  {id:"teams", group:"ORGANISATION", title:"Roles & permissions", icon:"shield", tint:"var(--accent)",
   blurb:"View presets for Florin, Joe, Aoife and the crew.",
   tags:["4 presets","Presentation only"],
   heroLabel:"THE QUESTION THIS ANSWERS", heroAction:"Preview a view preset",
   heroText:"See what each person would focus on. Presets change the presentation only; they are not security enforcement.",
   footer:"No authentication changes in this demo", action:"Open presets",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Florin","operations and management visibility"],["Joe","financial review and approvals"],
     ["Aoife","office records and coordination"],["Crew","assigned jobs and own attendance"]]},
  {id:"structure", group:"ORGANISATION", title:"Company structure", icon:"structure", tint:"#f0c04b",
   blurb:"Five functional responsibilities shared by a small team.",
   tags:["Naas, Co. Kildare","Europe/Dublin","EUR"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Company","Reynolds Asphalt Contractors"],["Functions","Operations, Office, Finance, Fleet, Materials"],
     ["Crews","A and B"],["Pay model","Day or shift rate"],["Default currency and timezone","EUR, Europe/Dublin"]]},

  {id:"agents", group:"CONTROL", title:"Agents & AI controls", icon:"agent", tint:"var(--accent)",
   blurb:"Seven deterministic demo agents. Draft-only, with visible evidence.",
   tags:["7 agents","Draft-only","Simulated runs"],
   heroLabel:"GLOBAL CONTROL", heroAction:"Switch agents off",
   heroText:"Agents read the demo fixtures and propose. They never send, pay, file or approve anything.",
   footer:"Spend, customer messages, tax and price changes need a person", action:"Review controls",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Enable or disable each agent","7 agents"],["Draft-only mode","on", true],
     ["Show evidence on every output","on", true],["Human approval for spend","Joe", true]]},
  {id:"wf", group:"CONTROL", title:"Workflow controls", icon:"flow", tint:"#9d8cf5",
   blurb:"The four operating workflows and who owns each step.",
   tags:["4 workflows","Human approval steps"],
   footer:"Workflows live under Work", action:"Open Work",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Accepted job to ready for site","Florin"],["Breakdown to repair and return check","Joe, Florin"],
     ["Completed job to invoice and tax review","Aoife, Joe"],["Overdue invoice to follow-up and receipt","Aoife"]]},
  {id:"notif", group:"CONTROL", title:"Notifications", icon:"bell", tint:"#f0994b",
   blurb:"In-app only in this demo. No messages leave the browser.",
   tags:["In-app","No external sends"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["In-app","", true],["Email","not connected", false],["Text messages","not connected", false]]},

  {id:"integrations", group:"SYSTEMS", title:"Systems & integrations", icon:"plug", tint:"#6ad0f0",
   blurb:"What the demo reads from, and what is honestly not connected.",
   tags:["0 live connections","1 sample import","1 manual snapshot"],
   footer:"Accounting product still to be confirmed", action:"Open systems",
   listLabel:"SYSTEMS",
   rows:[["Existing invoice system","sample import only"],["Bank balances","manual snapshot"],["Existing paperwork","simulated"],
     ["CSV import and export","local demo"],["Email follow-up","draft preview only"],["Revenue / ROS","not connected"]]},
  {id:"modules", group:"SYSTEMS", title:"Modules & configuration", icon:"modules", tint:"#f0c04b",
   blurb:"The twelve modules in the side rail and the words this business uses.",
   tags:["12 modules","Jobs, crews, loads, tonnes"],
   heroLabel:"TERMINOLOGY", heroAction:"Edit terminology",
   heroText:"Pulse speaks in jobs, crews, trucks, loads and tonnes, the way Florin and the office already talk.",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Modules","Home to Settings"],["Record types","jobs, quotes, orders, invoices, assets"],["Statuses","per record type"]]},
  {id:"health", group:"SYSTEMS", title:"Data health", icon:"health", tint:"#e2705c",
   blurb:"Gaps in what the demo knows, listed plainly.",
   tags:["5 unconfirmed facts"], badge:"Needs confirming", badgeKind:"warn",
   footer:"From the discovery call of 5 Nov 2026", action:"Review",
   listLabel:"ISSUES FOUND",
   trend:[5,5,5,5,5,5,5],
   bySeverity:[["High","2",RED],["Medium","2",AMBER],["Low","1",DIM]],
   issues:[["Accounting product unknown","1","high","Confirm which invoice system the office uses","Review"],
     ["VAT and RCT status unconfirmed","1","high","Confirm registrations before any tax logic","Review"],
     ["Licence categories unknown","2","medium","Record real driver licence categories","Review"],
     ["Brand assets unverified","1","medium","Supply the official logo and colours","Review"],
     ["Joe's surname and title","1","low","Confirm how Joe should be shown","Review"]],
   rows:[]},

  {id:"security", group:"GOVERNANCE", title:"Security", icon:"lock", tint:"#8fa6ff",
   blurb:"This is a frontend demonstration. It changes no sign-in or security setting.",
   tags:["Demo only","No secrets stored"],
   footer:"No authentication changes", action:"Review",
   listLabel:"WHAT IS TRUE IN THIS DEMO",
   rows:[["Authentication","unchanged"],["Secrets or keys","none stored"],["Data storage","this browser only"]]},
  {id:"audit", group:"GOVERNANCE", title:"Activity log", icon:"audit", tint:"#9d8cf5",
   blurb:"Every simulated change is written to Activity with its source.",
   tags:["Simulated provenance","Linked records"],
   footer:"Reset clears simulated changes", action:"Open Activity",
   listLabel:"WHAT IS RECORDED",
   rows:[["Approvals and decisions","with owner"],["Receipts and promises","with date"],["Agent runs","with inputs and outputs"]]},
  {id:"datamgmt", group:"GOVERNANCE", title:"Data management", icon:"data", tint:"#5fe0a8",
   blurb:"Local CSV export and a full reset to the canonical baseline.",
   tags:["Local only","Versioned seed"],
   footer:"Reset restores every fixture", action:"Reset demo",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Export data","local CSV"],["Reset demo","canonical baseline"],["Storage","browser only, not a backend"]]},

  {id:"brand", group:"EXPERIENCE", title:"Branding", icon:"brand", tint:"var(--accent)",
   blurb:"Provisional demo palette and an RA initials mark. Official assets not verified.",
   tags:["Amber accent","RA mark"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Mark","RA initials (not an official logo)"],["Asphalt charcoal","#24282D"],["Deep amber","#A65A00"],["Warm amber","#F4B544"]]},
  {id:"appearance", group:"EXPERIENCE", title:"Appearance & themes", icon:"brand", tint:"#6ad0f0",
   blurb:"Pick a light or dark theme for how Pulse looks to you.",
   tags:["Dark and light"],
   listLabel:"THEMES", rows:[]}
];

const ADMIN_GROUPS = [
  ["ORGANISATION", "repeat(3,1fr)"],
  ["CONTROL", "repeat(3,1fr)"],
  ["SYSTEMS", "repeat(3,1fr)"],
  ["GOVERNANCE", "repeat(3,1fr)"],
  ["EXPERIENCE", "repeat(3,1fr)"]
];

/* ---- activity feeds ---- */
const SRC_TINT = {Pulse:"var(--accent)", "CSV import":"#6ad0f0", "Bank snapshot":"#9fd6f0", Agent:"var(--accent)"};
const SRC_ABBR = {Pulse:"PL", "CSV import":"CSV", "Bank snapshot":"BK", Agent:"AI"};

const DATA_EVENTS = [
  ["Fixture import: November jobs","Demo fixtures loaded from a sample CSV preview. No accounting system connected.","CSV import","8 jobs","CSV import","completed"],
  ["Sample invoices imported","INV-099 to INV-103 read from the sample file for the demo ledger.","CSV import","Kildare BuildCo","CSV import","completed"],
  ["Bank balance entered","€34,500 opening snapshot for the cash view. No live bank feed.","Bank snapshot","Cash view","Bank snapshot","completed"],
  ["Delivery ticket filed","PO-202, 30 t stone, attached to Naas distribution yard.","Cian Doyle","J104","Pulse","completed"],
  ["Delivery ticket filed","PO-203, 20 t stone, attached to Dunlavin driveway.","Mihai Ionescu","J105","Pulse","completed"],
  ["Repair quote attached","€680 from Naas Commercial Repairs for TRK-02.","Florin Pricope","TRK-02","Pulse","completed"]
];

const PEOPLE_EVENTS = [
  ["TRK-02 defect reported","Brake fault on the end-of-day check, 9 Nov 16:40. Truck stood down.","Mihai Ionescu","TRK-02","Pulse","completed"],
  ["Monday attendance approved","7 full-day shifts, €1,450 day wages.","Florin Pricope","Crews A and B","Pulse","completed"],
  ["Repair approval requested","€680 quote routed to Joe.","Florin Pricope","TRK-02","Pulse","awaiting"],
  ["Replacement transport proposed","€260 one-day tipper for Mihai on 11 Nov, waiting on Joe.","Florin Pricope","J105","Pulse","awaiting"],
  ["Asphalt confirmation chased","PO-204, 18 t for 11 Nov 08:00, still unconfirmed.","Aoife Brennan","Leinster Asphalt Supply","Pulse","awaiting"]
];

const AI_EVENTS = [
  ["Job Margin Agent recalculated J104","Forecast €20,600, €1,800 over the €18,800 budget.","Job Margin Agent","J104","Agent","completed"],
  ["Materials Agent flagged PO-204","18 t asphalt for 11 Nov not yet confirmed. Owner Aoife.","Materials Agent","J105","Agent","completed"],
  ["Dispatch Agent flagged J105 transport","TRK-02 unavailable; €260 hire proposed for Joe.","Dispatch Agent","J105","Agent","awaiting"],
  ["Finance Agent prepared a reminder","INV-099, €7,800, 14 days overdue. Draft only, not sent.","Finance Agent","Kildare BuildCo","Agent","awaiting"],
  ["Crew Admin Agent compiled shifts","35 planned shifts, €7,250 expected gross day wages.","Crew Admin Agent","Crews A and B","Agent","completed"],
  ["Briefing compiled","Six items for Florin, four decisions waiting.","Briefing","Florin Pricope","Agent","completed"]
];

const STREAM_DEFS = [
  {id:"data", title:"New data", sub:"Information entering Pulse", pool:DATA_EVENTS, every:3200,
   tint:"#6ad0f0", icon:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"},
  {id:"people", title:"Employee activity", sub:"Decisions people made", pool:PEOPLE_EVENTS, every:6400,
   tint:"#f0c04b", icon:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9"},
  {id:"ai", title:"AI activity", sub:"Agents at work", pool:AI_EVENTS, every:4600,
   tint:"var(--accent)", icon:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5"}
];

const NAV = [
  {label:"Home", icon:"helios", page:"Home"},
  {label:"Agents", icon:"navAgents", page:"Agents"},
  {label:"Dashboard", icon:"navDash", page:"Dashboard"},
  {label:"Jobs", icon:"navJobs", page:"Jobs"},
  {label:"Planning", icon:"navPlanning", page:"Planning"},
  {label:"Fleet", icon:"navFleet", page:"Fleet", dot:true},
  {label:"Materials", icon:"navMaterials", page:"Materials"},
  {label:"Finance", icon:"navFinance", page:"Finance"},
  {label:"Work", icon:"navWork", page:"Work"},
  {label:"Records", icon:"navRecords", page:"Records"},
  {label:"Activity", icon:"pulseLine", page:"Activity"}
];

/* Inbox items follow the real InboxItem shape: what happened, why it matters, what I can do. */
const ITEMS = {
  sync:{kind:"Approval", importance:"critical", icon:ICONS.health, age:"14h",
    title:"TRK-02 repair quote, €680",
    why:"Brake fault reported 9 Nov 16:40. Joe owns the approval (W002).",
    detail:"Naas Commercial Repairs quoted €680, already allowed for in the maintenance overhead line. Approval does not make the truck roadworthy: release needs a repair-complete record and a return-to-service check.",
    actionLabel:"Open repair", secondaryLabel:"Later", group:"Approvals",
    fields:[{k:"Owner",v:"Joe"},{k:"Asset",v:"TRK-02"},{k:"Quote",v:"€680"},{k:"Task",v:"W002"}],
    history:[{when:"9 Nov 16:40",text:"Mihai reported a brake fault"},{when:"9 Nov 17:20",text:"Quote attached, approval requested"}]},
  po:{kind:"Approval", importance:"critical", icon:ICONS.approvals, age:"25m",
    title:"Replacement transport for 11 Nov, €260",
    why:"Mihai has no truck for the Dunlavin surfacing load. Joe owns the decision (W003).",
    detail:"Leinster Plant Hire can supply a one-day tipper on 11 Nov. It solves transport only; the 18 t of asphalt is a separate blocker.",
    actionLabel:"Open hire", secondaryLabel:"Later", group:"Approvals",
    fields:[{k:"Owner",v:"Joe"},{k:"Job",v:"J105"},{k:"Cost",v:"€260"},{k:"Task",v:"W003"}],
    history:[{when:"Today 06:50",text:"Dispatch Agent proposed the hire"}]},
  visit:{kind:"Task", importance:"high", icon:ICONS.visits, age:"30m",
    title:"18 t asphalt for Dunlavin is unconfirmed",
    why:"PO-204 is needed 11 Nov at 08:00. Aoife owns the confirmation (W004).",
    detail:"Leinster Asphalt Supply has not confirmed the load. Confirming does not mark it delivered.",
    actionLabel:"Open PO-204", secondaryLabel:"Later", group:"Work",
    fields:[{k:"Owner",v:"Aoife Brennan"},{k:"Order",v:"PO-204"},{k:"Quantity",v:"18 t"},{k:"Needed",v:"11 Nov 08:00"}],
    history:[{when:"Today 06:45",text:"Materials Agent flagged the order"}]},
  auto:{kind:"Task", importance:"high", icon:ICONS.autos, age:"20m",
    title:"INV-099 follow-up draft ready",
    why:"Kildare BuildCo owes €7,800, 14 days overdue. Aoife reviews the draft (W005).",
    detail:"The Finance Agent prepared a reminder. It is a draft only; no email provider is connected, so nothing is sent.",
    actionLabel:"Open INV-099", secondaryLabel:"Later", group:"Work",
    fields:[{k:"Owner",v:"Aoife Brennan"},{k:"Invoice",v:"INV-099"},{k:"Open",v:"€7,800"},{k:"Overdue",v:"14 days"}],
    history:[{when:"Today 06:55",text:"Finance Agent prepared the draft"}]},
  task:{kind:"Alert", importance:"normal", icon:ICONS.work, age:"35m",
    title:"Naas distribution yard is €1,800 over budget",
    why:"Forecast final cost €20,600 against €18,800. Profit down to €3,400.",
    detail:"Materials are €1,200 over and labour €600 over. Variation V104-01 for €1,200 is drafted but not accepted, so it is not counted.",
    actionLabel:"Open J104", secondaryLabel:"Later", group:"Work",
    fields:[{k:"Owner",v:"Florin Pricope"},{k:"Job",v:"J104"},{k:"Overrun",v:"€1,800"},{k:"Task",v:"W001"}],
    history:[{when:"Today 06:40",text:"Job Margin Agent recalculated the forecast"}]}
};
const ORDER = ["sync","po","visit","auto","task"];

const ANSWERS = {
  credit:{tool:"receivables_find", effect:"read",
    text:"€29,800 is outstanding across three invoices. INV-099 for Kildare BuildCo is the overdue one: €7,800, 14 days past due.",
    cols:["Invoice","Customer","Open","Status"],
    rows:[["INV-099","Kildare BuildCo","€7,800","14 days overdue"],["INV-102","Kildare BuildCo","€9,600","due 17 Nov"],["INV-103","Liffey Civil Engineering","€12,400","due 19 Nov"]],
    actions:[["Review the reminder draft",1],["Open receivables",0]]},
  jobs:{tool:"readiness_check", effect:"read",
    text:"Dunlavin driveway has two separate blockers for 11 Nov: transport, because TRK-02 is unavailable, and the 18 t of asphalt on PO-204, which is unconfirmed.",
    cols:["Job","Check","State","Owner"],
    rows:[["J105","Transport","Blocked","Joe"],["J105","Asphalt 18 t","Needs confirmation","Aoife"],["J104","Asphalt 24 t","Ready","Aoife"]],
    actions:[["Open Dunlavin driveway",1],["Open Planning",0]]},
  chase:{tool:"reminder_draft", effect:"write", confirm:true,
    confirmSummary:"Prepare a reminder to Kildare BuildCo about INV-099 (€7,800, 14 days overdue). Draft only: no email provider is connected.",
    text:"Drafted for review. Nothing is sent from this demo; recording the customer's reply is a separate step.",
    actions:[["Mark as reviewed",1],["Edit draft",0]]},
  sync:{tool:"fleet_status", effect:"read",
    text:"TRK-02 has been off the road since a brake fault on 9 Nov at 16:40. The €680 repair needs Joe's approval, and even then it needs a repair-complete record and a return check before it can be used.",
    actions:[["Open TRK-02",1],["Open Fleet",0]]},
  visits:{tool:"crew_plan", effect:"read",
    text:"Two crews are out today: Crew A on Naas distribution yard with TRK-01, Crew B on Dunlavin preparation with no truck needed. Florin is supervising and has two customer conversations.",
    cols:["Crew","Job","Truck","Status"],
    rows:[["Crew A","J104 Naas","TRK-01","Ready"],["Crew B","J105 Dunlavin","None needed today","Ready for prep"],["Florin","Supervision","n/a","Visits"]],
    actions:[["Open Planning today",1],["Open Fleet",0]]},
  fallback:{tool:"records_search", effect:"read",
    text:"I answer from the demo records only: jobs, crews, trucks, materials, invoices, cash and the November goal.",
    actions:[["What could stop tomorrow's jobs?",0]]}
};

// Turns a plain-English filter name into a full dashboard area: the "primitive
// vibe-coding" bit: no real backend, just a seeded generator so the same phrase
// always produces the same numbers, with direction and vocabulary nudged by
// keywords in the text (expansion/growth trends up, risk/issue trends down, a
// region/cost/people/ops/customer word picks which metrics show).
function synthesizeCustomArea(name){
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  let seed = 0;
  for (let i = 0; i < trimmed.length; i++) seed = (seed * 31 + trimmed.charCodeAt(i)) >>> 0;
  const rnd = (n) => (((seed >>> (n % 24)) ^ (seed << ((n * 7) % 13))) >>> 0) % 997 / 997;
  const low = trimmed.toLowerCase();
  const has = (...words) => words.some(w => low.indexOf(w) > -1);
  const growth = has("expansion","growth","launch","scale","pilot","new site","open","opening","grow");
  const risk = has("risk","issue","delay","problem","complaint","fault","incident","churn","decline");
  const dir = risk ? -1 : (growth ? 1 : (rnd(2) > 0.45 ? 1 : -1));

  let vocab = "generic";
  if (has("ireland","region","county","kildare","naas","dublin","wicklow","meath","newbridge","clane"))
    vocab = "region";
  else if (has("cost","spend","budget","saving","margin")) vocab = "cost";
  else if (has("staff","hiring","team","recruit","headcount")) vocab = "people";
  else if (has("supplier","stock","inventory","warehouse","fleet")) vocab = "ops";
  else if (has("customer","client","retention","account")) vocab = "customer";

  const V = {
    region:   {labels:["New enquiries","Orders won","Revenue","Site coverage"], unit:"EUR, 30 DAYS"},
    cost:     {labels:["Spend","Cost per job","Savings found","Budget used"], unit:"EUR, 30 DAYS"},
    people:   {labels:["Headcount","Open roles","Time to hire","Retention"], unit:"PEOPLE"},
    ops:      {labels:["Stock cover","Lead time","Stockouts","Reorders raised"], unit:"DAYS"},
    customer: {labels:["Active accounts","Repeat rate","Churn","NPS"], unit:"ACCOUNTS"},
    generic:  {labels:["Volume","Rate","Cost","Coverage"], unit:"ACTIVITY, 30 DAYS"}
  }[vocab];

  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  let v0 = 40 + Math.floor(rnd(1) * 220);
  const chart = months.map((m, i) => {
    v0 = Math.max(8, Math.round(v0 * (1 + dir * (0.03 + rnd(i + 3) * 0.07))));
    return [m, v0, String(v0)];
  });
  const metrics = V.labels.map((label, i) => {
    const val = 20 + Math.floor(rnd(i + 5) * 400);
    const pct = 2 + Math.round(rnd(i + 9) * 18);
    const up = dir > 0 ? rnd(i + 12) > 0.25 : rnd(i + 12) > 0.7;
    const bars = [0,1,2,3,4,5,6,7,8].map(k => 0.3 + rnd(i * 3 + k) * 0.7);
    return [label, i === 1 ? pct + "%" : String(val), (up ? "+" : "\u2212") + pct + (i === 1 ? "pt" : "%"), up ? "up" : "down", "vs last month", bars];
  });
  const capName = trimmed.replace(/\b\w/g, c => c.toUpperCase());
  const split = [
    [capName + ": direct", String(Math.round(v0 * 0.5)), "48%", 1],
    ["Existing pipeline", String(Math.round(v0 * 0.3)), "31%", 0],
    ["Everything else", String(Math.round(v0 * 0.2)), "21%", 0]
  ];
  const table = [1,2,3].map(w => [capName + ", week " + w, String(20 + Math.floor(rnd(20 + w) * 200)),
    (dir > 0 ? "+" : "\u2212") + (3 + Math.floor(rnd(23 + w) * 14)) + "%", "Auto-tagged from records mentioning \u201c" + low + "\u201d"]);
  table.push(["Everything else", String(20 + Math.floor(rnd(30) * 200)), "n/a", "Baseline"]);
  return {
    id: trimmed, label: capName, color: "var(--accent)", owner: "CUSTOM FILTER",
    description: "Generated from \u201c" + trimmed + "\u201d: a plain-English filter with sample numbers, not real metrics.",
    kind: "columns", chartTitle: capName + " over time", chartUnit: V.unit,
    chart, splitTitle: "Where \u201c" + low + "\u201d shows up", split,
    tableCols: ["Item","Value","Change","Note"], table,
    metrics, legend: [capName, "Pipeline", "Other"]
  };
}

function pickAnswer(q){
  const s = q.toLowerCase();
  if (/crew|today|visit|who is/.test(s)) return ANSWERS.visits;
  if (/chase|remind|draft|follow/.test(s)) return ANSWERS.chase;
  if (/owe|invoice|unpaid|overdue|outstanding|receivable/.test(s)) return ANSWERS.credit;
  if (/tomorrow|block|ready|asphalt|job/.test(s)) return ANSWERS.jobs;
  if (/truck|trk|repair|fleet|brake/.test(s)) return ANSWERS.sync;
  return ANSWERS.fallback;
}

const ORGS = [
  ["Kildare BuildCo","Contractor","€17,400","14 days","watch"],
  ["Liffey Civil Engineering","Contractor","€12,400","not yet due","active"],
  ["Naas Logistics Park","Commercial","€0","n/a","active"],
  ["Aisling Murphy","Private","€0","n/a","active"],
  ["Leinster Asphalt Supply","Supplier","n/a","n/a","active"],
  ["Kildare Aggregate Supply","Supplier","n/a","n/a","active"]
];
const TEAMS = [
  ["Operations","8 people","Florin Pricope","jobs, crews, site decisions"],
  ["Office","1 person","Aoife Brennan","records, invoices, confirmations"],
  ["Finance","1 person","Joe","approvals, cash, tax review"],
  ["Fleet","shared","Florin Pricope","trucks, plant, returns to service"],
  ["Materials","shared","Aoife Brennan","orders and deliveries"]
];
const LOCATIONS = [
  ["Naas area base","Naas, Co. Kildare (no yard address recorded)","Office and crews","active"],
  ["Naas distribution yard","Naas, live site J104","Crew A","live"],
  ["Dunlavin driveway","Dunlavin, live site J105","Crew B","live"]
];

const AGENT_DEFS = [
  {id:"briefing", name:"Briefing", shape:"crown-pebble", tint:"#24282D", state:"complete", role:"Gives Florin a short morning brief on operations and money",
   when:"07:10", preview:"four decisions waiting. j105 has two blockers.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 07:10"},
     {kind:"routine", text:"Ran routine", routine:"Morning briefing"},
     {kind:"agent", text:"morning briefing:", lines:[
       {k:"Today", v:"J104 €1,800 over budget, €3,400 profit · TRK-02 off the road"},
       {k:"Materials", v:"18 t asphalt for 11 Nov 08:00 unconfirmed (PO-204)"},
       {k:"Money", v:"€7,800 overdue on INV-099 · €4,160 forecast vs €5,000"}]},
     {kind:"agent", text:"four decisions are waiting: the €680 repair and €260 hire with joe, the €1,200 variation with you, and the j105 tax review with joe."},
     {kind:"user", text:"what gets me to 5k"},
     {kind:"agent", text:"customer acceptance of the €1,200 variation less the €260 hire takes the forecast to €5,100. both are scenarios until they actually happen."}
   ]},
  {id:"ops", name:"Ops Watchdog", shape:"shield", tint:"#2b2118", state:"attention", role:"Finds unresolved dependencies, overdue decisions and jobs not ready",
   when:"07:05", preview:"j105 has 2 blockers: transport and material confirmation.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 07:05"},
     {kind:"agent", text:"j105 has 2 blockers for 11 nov: transport, because trk-02 is unavailable, and the 18 t on po-204, which is unconfirmed. clearing one does not clear the other."},
     {kind:"agent", text:"four decisions are due before 14:00 today."}
   ]},
  {id:"margin", name:"Job Margin Agent", shape:"executive-capsule", tint:"#2a2118", state:"attention", role:"Compares agreed value, original budget and forecast final cost",
   when:"06:40", preview:"j104 forecast €20,600, €1,800 over budget.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 06:40"},
     {kind:"agent", text:"naas distribution yard: €24,000 agreed, €18,800 budget, €20,600 forecast. that is €1,800 over, so profit drops from €5,200 to €3,400."},
     {kind:"user", text:"where did it go"},
     {kind:"agent", text:"materials +€1,200 and labour +€600, mostly the extra edge preparation. variation v104-01 for €1,200 is a draft and not counted until the customer accepts."}
   ]},
  {id:"dispatch", name:"Dispatch Agent", shape:"rim-capsule", tint:"#1b2430", state:"waiting", role:"Proposes feasible crew, driver and truck assignments",
   when:"06:50", preview:"mihai has no truck for 11 nov. €260 hire proposed.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 06:50"},
     {kind:"agent", text:"trk-02 is unavailable after the brake fault, so mihai has no truck for the dunlavin surfacing load on 11 nov. only cian and mihai are truck-eligible, and cian is on trk-01 at naas."},
     {kind:"agent", text:"proposal: a €260 one-day tipper from leinster plant hire for mihai. it waits for joe. it does not confirm the asphalt."}
   ]},
  {id:"materials", name:"Materials Agent", shape:"control-cube", tint:"#16241f", state:"waiting", role:"Checks job requirements against orders and supplier confirmation",
   when:"06:45", preview:"18 t asphalt for j105 unconfirmed. owner aoife.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 06:45"},
     {kind:"agent", text:"asphalt needed on 11 nov: 42 t. 24 t is confirmed on po-201 for naas. 18 t on po-204 for dunlavin is still awaiting supplier confirmation. owner aoife, task w004."},
     {kind:"agent", text:"i have not contacted the supplier. that is aoife's call to make."}
   ]},
  {id:"finance", name:"Finance Agent", shape:"low-dome", tint:"#241b2e", state:"waiting", role:"Surfaces overdue balances, prepares follow-up drafts, updates cash scenarios",
   when:"06:55", preview:"inv-099 €7,800, 14 days overdue. draft ready, not sent.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 06:55"},
     {kind:"agent", text:"kildare buildco owes €7,800 on inv-099, 14 days overdue. i drafted a reminder and parked it for aoife. nothing is sent from here."},
     {kind:"agent", text:"cash closes the week at €19,250 if that receipt lands, €11,450 if it slips. the illustrative buffer is €10,000."}
   ]},
  {id:"crew", name:"Crew Admin Agent", shape:"offset-pebble", tint:"#191c1f", state:"complete", role:"Compiles day-shift summaries, leave and qualification expiries",
   when:"07:00", preview:"35 shifts planned, €7,250 expected day wages.",
   thread:[
     {kind:"stamp", text:"Tue 10 Nov 07:00"},
     {kind:"agent", text:"this week: 35 planned shifts across seven crew, €7,250 expected gross day wages. monday is approved: 7 shifts, €1,450."},
     {kind:"agent", text:"tomas's safe pass expires 18 nov. that touches his j108 days, so aoife has w008 to arrange the renewal. nothing before then is affected."}
   ]}
];

/* Static fallbacks; PulseLogic overrides these at runtime from the shared selectors. */
const KPI_DEFS = {
  revenue:{label:"Accepted November value", value:"€98,400", delta:"8 jobs", dir:"up", hint:"net of VAT", hero:true},
  cash:{label:"Bank snapshot", value:"€34,500", delta:"manual", dir:"up", hint:"no live bank feed"},
  overdue:{label:"Overdue", value:"€7,800", delta:"INV-099", dir:"down", hint:"14 days overdue"},
  margin:{label:"Forecast gross margin", value:"22.5%", delta:"", dir:"up", hint:"November jobs"},
  jobs:{label:"Live jobs", value:"3", delta:"", dir:"up", hint:"J104, J105, J106"},
  nps:{label:"Forecast operating profit", value:"€4,160", delta:"€840 short", dir:"down", hint:"vs €5,000 example target"},
  pipeline:{label:"Quote pipeline", value:"€48,400", delta:"3 quotes", dir:"up", hint:"not in booked value"},
  utilisation:{label:"Owned trucks available", value:"1 of 2", delta:"TRK-02", dir:"down", hint:"brake fault"}
};

/* November figures only. No historical trend was supplied, so none is drawn. */
const ASPECT_DEFS = [
  {id:"sales", label:"Jobs", color:"var(--accent)", owner:"FLORIN PRICOPE", description:"November jobs by agreed value, cost and gross profit.",
   kind:"columns", chartTitle:"November jobs by agreed value", chartUnit:"EUR, NET",
   chart:[["J101",158,"€15.8k"],["J102",96,"€9.6k"],["J103",124,"€12.4k"],["J104",240,"€24.0k"],["J105",118,"€11.8k"],["J106",76,"€7.6k"],["J107",68,"€6.8k"],["J108",104,"€10.4k"]],
   splitTitle:"By status",
   split:[["Completed","€37,800","38%",1],["Live","€43,400","44%",0],["Scheduled","€17,200","17%",0]],
   tableCols:["Job","Value","Gross profit","Owner"],
   table:[["J104 Naas distribution yard","€24,000","€3,400","Florin Pricope"],["J101 Newbridge access road","€15,800","€3,950","Florin Pricope"],["J103 Kill service yard","€12,400","€3,100","Florin Pricope"],["J105 Dunlavin private driveway","€11,800","€3,200","Florin Pricope"]],
   metrics:[["Accepted value","€98,400","8 jobs","up","November",[.66,.4,.52,1,.49,.32,.28,.43]],
     ["Live jobs","3","","up","J104, J105, J106",[.5,.5,.5,.5,.5,.5,.5,.5]],
     ["Gross margin","22.5%","","up","forecast",[.5,.5,.5,.5,.5,.5,.5,.5]],
     ["Quote pipeline","€48,400","3 quotes","up","not booked",[.77,.37,1]]]},
  {id:"development", label:"Agents", color:"#9fd6f0", owner:"FLORIN PRICOPE", description:"Simulated agent runs on the morning of 10 Nov.",
   kind:"rows", rows:[["job margin","1 run",1],["materials","1 run",1],["dispatch","1 run",1],["finance","1 run",1],["crew admin","1 run",1],["ops watchdog","1 run",1],["briefing","1 run",1]], chartTitle:"Runs by agent", chartUnit:"RUNS, 10 NOV",
   chart:[["06:40",1,"1"],["06:45",1,"1"],["06:50",1,"1"],["06:55",1,"1"],["07:00",1,"1"],["07:05",1,"1"],["07:10",1,"1"]],
   splitTitle:"Results",
   split:[["Issue detected","3","43%",1],["Draft or proposal ready","2","29%",0],["Summary or briefing","2","28%",0]],
   tableCols:["Agent","Owner","Latest","State"],
   table:[["Job Margin Agent","Florin","J104 €1,800 over","issue"],["Dispatch Agent","Florin","€260 hire proposed","waiting"],["Materials Agent","Aoife","PO-204 unconfirmed","waiting"],["Finance Agent","Joe, Aoife","INV-099 draft","waiting"]],
   metrics:[["Agents","7","","up","deterministic",[.5,.5,.5,.5,.5,.5,.5]],
     ["Runs today","7","","up","simulated",[.5,.5,.5,.5,.5,.5,.5]],
     ["Issues found","3","","down","to resolve",[.5,.5,.5]],
     ["Messages sent","0","","up","draft-only",[0,0,0]]]},
  {id:"marketing", label:"Pipeline", color:"#e6c78a", owner:"FLORIN PRICOPE", description:"Quotes out the door. Not in booked value until accepted.",
   kind:"funnel", funnel:[["Open quotes","3","€48,400",3],["Sent","2","€25,800",2],["Draft","1","€22,600",1],["Accepted","0","none yet",0]], chartTitle:"Open quotes by value", chartUnit:"EUR, NET",
   chart:[["Q201",174,"€17.4k"],["Q202",84,"€8.4k"],["Q203",226,"€22.6k"]],
   splitTitle:"By stage",
   split:[["Sent","€25,800","53%",1],["Draft","€22,600","47%",0]],
   tableCols:["Quote","Customer","Value","Follow-up"],
   table:[["Q201 forecourt repairs","Kilteel Service Station","€17,400","12 Nov"],["Q202 driveway","Nolan Family","€8,400","11 Nov"],["Q203 access road","West County Developments","€22,600","13 Nov"]],
   metrics:[["Open pipeline","€48,400","3 quotes","up","not booked",[.77,.37,1]],
     ["Sent","2","","up","awaiting reply",[.5,.5]],
     ["Draft","1","","up","scope review",[.5]],
     ["Accepted","0","","up","this month",[0]]]},
  {id:"operations", label:"Crews", color:"#dcded6", owner:"FLORIN PRICOPE", description:"Two crews, seven paid crew on day rates, 9 to 13 Nov.",
   kind:"stacked", legend:["Crew A","Crew B"], stacked:[["Mon",[3,4]],["Tue",[3,4]],["Wed",[3,4]],["Thu",[3,4]],["Fri",[3,4]]], chartTitle:"Planned shifts by day", chartUnit:"SHIFTS",
   chart:[["Mon",7,"7"],["Tue",7,"7"],["Wed",7,"7"],["Thu",7,"7"],["Fri",7,"7"]],
   splitTitle:"By crew",
   split:[["Crew A","15","43%",1],["Crew B","20","57%",0]],
   tableCols:["Person","Day wage","Planned","Crew"],
   table:[["Cian Doyle","€220","5","A"],["Mihai Ionescu","€220","5","B"],["Andrei Popa","€210","5","A"],["Sean Kelly","€210","5","B"]],
   metrics:[["Planned shifts","35","","up","9 to 13 Nov",[.5,.5,.5,.5,.5]],
     ["Expected day wages","€7,250","","up","gross, not employer cost",[.5,.5,.5,.5,.5]],
     ["Approved so far","€1,450","Monday","up","7 shifts",[1,0,0,0,0]],
     ["Truck-eligible crew","2","","down","Cian and Mihai",[.5,.5]]]},
  {id:"finance", label:"Finance", color:"#7fd8a4", owner:"JOE", description:"Profit forecast, receivables and the 10 to 16 Nov cash view.",
   kind:"area", chartTitle:"Projected bank balance, 10 to 16 Nov", chartUnit:"EUR",
   chart:[["10 Nov",345,"€34.5k"],["11 Nov",324,"€32.4k"],["12 Nov",328,"€32.8k"],["13 Nov",208,"€20.8k"],["14 Nov",208,"€20.8k"],["15 Nov",208,"€20.8k"],["16 Nov",193,"€19.3k"]],
   splitTitle:"Receivables by age",
   split:[["Overdue 1 to 30 days","€7,800","26%",1],["Not yet due","€22,000","74%",0]],
   tableCols:["Invoice","Open","Due","Customer"],
   table:[["INV-099","€7,800","27 Oct","Kildare BuildCo"],["INV-102","€9,600","17 Nov","Kildare BuildCo"],["INV-103","€12,400","19 Nov","Liffey Civil Engineering"],["INV-101","€0","10 Nov","Kildare BuildCo"]],
   metrics:[["Operating profit","€4,160","€840 short","down","forecast vs €5,000",[.83]],
     ["Open receivables","€29,800","3 invoices","up","net",[.26,.32,.42]],
     ["Overdue","€7,800","INV-099","down","14 days",[1]],
     ["Closing cash","€19,250","16 Nov","up","€11,450 if receipt slips",[.95,.89,.9,.57,.57,.57,.53]]]},
  {id:"support", label:"Fleet", color:"#e2705c", owner:"FLORIN PRICOPE", description:"Owned trucks and plant, and what is available today.",
   kind:"dots", target:1, targetLabel:"1 means available today", chartTitle:"Owned assets available today", chartUnit:"AVAILABLE",
   chart:[["TRK-01",1,"1"],["TRK-02",0,"0"],["PLT-01",1,"1"],["PLT-02",1,"1"],["PLT-03",1,"1"]],
   splitTitle:"By type",
   split:[["Trucks available","1 of 2","50%",1],["Plant available","3 of 3","100%",0]],
   tableCols:["Asset","Status","Driver","Note"],
   table:[["TRK-01 Insulated tipper","Available","Cian Doyle","Crew A"],["TRK-02 Tipper","Unavailable","Mihai Ionescu","Brake fault"],["PLT-02 Compact roller","Available","n/a","Service 12 Nov"],["HIR-01 proposal","Not hired","Mihai Ionescu","€260, 11 Nov"]],
   metrics:[["Owned assets available","4 of 5","","down","today",[1,0,1,1,1]],
     ["Trucks available","1 of 2","","down","TRK-02 off road",[1,0]],
     ["Repair quote","€680","","down","awaiting Joe",[.5]],
     ["Hire option","€260","","down","11 Nov only",[.5]]]}
];

const FILTER_GROUPS = [
  {title:"AREA", items:["Jobs","Agents","Pipeline","Crews","Finance","Fleet"]},
  {title:"SPINE", items:["Customer","Job","Person","Asset","Supplier"]},
  {title:"TIME", items:["This week","November 2026"]}
];

const OPS_DEFS = [
  {id:"o1", name:"Morning briefing", kind:"routine", owner:"Briefing", ownerKind:"agent", initials:"BR",
   trigger:"Weekdays, 07:10", triggerKind:"schedule", next:"Tomorrow", last:"Compiled 07:10", status:"healthy", rate:100, on:true,
   what:"Reads jobs, readiness, costs, invoices, tasks and the target, and writes Florin a short brief with source links.",
   why:"Florin was checking the bank balance to judge how the business was doing.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 07:10"],["Find","Jobs, readiness, costs, invoices, tasks"],["Check","Drop anything already handled"],["Draft","Write the briefing"],["Update","Post to Home"]],
   runs:[["Today 07:10","simulated","ok","1 briefing","€0.00"]]},
  {id:"o2", name:"Job margin recalculation", kind:"automation", owner:"Job Margin Agent", ownerKind:"agent", initials:"JM",
   trigger:"Weekdays, 06:40", triggerKind:"schedule", next:"Tomorrow", last:"J104 €1,800 over", status:"healthy", rate:100, on:true,
   what:"Compares agreed value, original budget and forecast final cost for every live job.",
   why:"A busy crew can still produce poor profit.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 06:40"],["Find","Live job cost lines"],["Check","Forecast against budget"],["Update","Flag overruns to Florin"]],
   runs:[["Today 06:40","simulated","ok","1 issue","€0.00"]]},
  {id:"o3", name:"Material confirmation check", kind:"automation", owner:"Materials Agent", ownerKind:"agent", initials:"MA",
   trigger:"Weekdays, 06:45", triggerKind:"schedule", next:"Tomorrow", last:"PO-204 unconfirmed", status:"approval", rate:100, on:true,
   what:"Checks each job's material requirements against purchase orders and supplier confirmation.",
   why:"A crew can arrive ready to work while the asphalt is still unconfirmed.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 06:45"],["Find","Requirements for the next three days"],["Check","Supplier confirmation"],["Approval","Office confirms with the supplier","gate"]],
   runs:[["Today 06:45","simulated","partial","18 t unconfirmed","€0.00","PO-204 awaiting supplier confirmation"]]},
  {id:"o4", name:"Overdue invoice follow-up", kind:"automation", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"Weekdays, 06:55", triggerKind:"schedule", next:"Tomorrow", last:"1 draft waiting", status:"approval", rate:100, on:true,
   what:"Finds overdue balances, drafts a reminder and parks it for the office. Never sends.",
   why:"Cash on paper was not reaching the bank.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 06:55"],["Find","Invoices past due"],["Draft","Prepare the reminder"],["Approval","Aoife reviews","gate"],["Update","Record the customer's response"]],
   runs:[["Today 06:55","simulated","ok","1 draft","€0.00"]]},
  {id:"o5", name:"Shift summary", kind:"report", owner:"Crew Admin Agent", ownerKind:"agent", initials:"CA",
   trigger:"Weekdays, 07:00", triggerKind:"schedule", next:"Tomorrow", last:"35 shifts, €7,250", status:"healthy", rate:100, on:true,
   what:"Compiles day-shift attendance, expected day wages, leave and credential expiries.",
   why:"Workers are paid by the day, so hourly payroll screens solve the wrong problem.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 07:00"],["Find","Shift plan, leave, credentials"],["Draft","Write the summary"]],
   runs:[["Today 07:00","simulated","ok","1 summary","€0.00"]]},
  {id:"o6", name:"Readiness watch", kind:"routine", owner:"Ops Watchdog", ownerKind:"agent", initials:"OW",
   trigger:"Weekdays, 07:05", triggerKind:"schedule", next:"Tomorrow", last:"J105 has 2 blockers", status:"approval", rate:100, on:true,
   what:"Checks crews, trucks, drivers and supplier confirmations against the next days' work.",
   why:"Seven workers do not equal seven independently deployable crews.",
   saved:"Not measured in the demo",
   steps:[["Trigger","Every weekday at 07:05"],["Find","Crew plan and assets"],["Check","Driver eligibility and confirmations"],["Update","Flag blockers with owners"]],
   runs:[["Today 07:05","simulated","partial","2 blockers","€0.00","Transport and material confirmation for J105"]]},
  {id:"o7", name:"Credential expiry reminder", kind:"task", owner:"Office", ownerKind:"person", initials:"AB",
   trigger:"30 days before expiry", triggerKind:"event", next:"Event-based", last:"Tomas, 18 Nov", status:"healthy", rate:100, on:true,
   what:"Gives notice before a Safe Pass or eligibility record lapses.",
   why:"An expired credential would block assignments after its expiry date.",
   saved:"Not measured in the demo",
   steps:[["Trigger","30 days before a record expires"],["Find","The person and upcoming assignments"],["Update","Create the renewal task"]],
   runs:[["Today 07:00","simulated","ok","1 task (W008)","€0.00"]]}
];

const OPS_FILTERS = [
  ["all","All"], ["routine","Agent routines"], ["automation","Automations"],
  ["report","Reports"], ["task","Recurring tasks"], ["approval","Needs approval"], ["failed","Failed"]
];

const WORK_SECTIONS = [
  {id:"tasks", label:"My work", blurb:"Tasks and decisions, each linked to the record it is about.",
   views:["All tasks","Due tasks","Review","Done"], filters:["Due date","Any status","Anyone","Any due date"]},
  {id:"approvals", label:"Approvals", blurb:"Spend, tax treatment and price changes. Approval is never payment, delivery or customer acceptance.",
   views:["Awaiting you","Awaiting others","Decided"], filters:["Raised date","Any value","Anyone"]},
  {id:"workflows", label:"Workflows", blurb:"The four operating workflows and where each one is blocked.",
   views:[], filters:[]},
  {id:"schedules", label:"Schedule", blurb:"Deadlines, visits, deliveries and follow-ups by day.",
   views:[], filters:[]}
];

const WORK_TASKS = [
  {id:"W001", title:"Review J104's €1,800 overrun", status:"Not started", priority:"High", who:"FP",
   due:"Today 09:00", late:false, client:"Naas Logistics Park", day:"Today", mins:"20 mins", view:"Due tasks"},
  {id:"W002", title:"Review €680 repair quote", status:"Review", priority:"High", who:"J",
   due:"Today 09:00", late:false, client:"TRK-02", day:"Today", mins:"10 mins", view:"Review"},
  {id:"W003", title:"Review €260 replacement transport", status:"Review", priority:"High", who:"J",
   due:"Today 09:00", late:false, client:"J105 Dunlavin", day:"Today", mins:"10 mins", view:"Review"},
  {id:"W004", title:"Confirm 18 t asphalt", status:"In progress", priority:"High", who:"AB",
   due:"Today 15:00", late:false, client:"Leinster Asphalt Supply", day:"Today", mins:"15 mins", view:"Due tasks"},
  {id:"W005", title:"Follow up €7,800 overdue balance", status:"In progress", priority:"High", who:"AB",
   due:"Today 11:00", late:false, client:"Kildare BuildCo", day:"Today", mins:"15 mins", view:"Due tasks"},
  {id:"W006", title:"Review private-job tax treatment", status:"Review", priority:"High", who:"J",
   due:"Today 14:00", late:false, client:"Aisling Murphy", day:"Today", mins:"20 mins", view:"Review"},
  {id:"W007", title:"Review €1,200 variation draft", status:"Review", priority:"High", who:"FP",
   due:"Today 12:00", late:false, client:"Naas Logistics Park", day:"Today", mins:"15 mins", view:"Review"},
  {id:"W008", title:"Arrange Tomas's Safe Pass renewal", status:"Not started", priority:"Medium", who:"AB",
   due:"Fri 16:00", late:false, client:"Tomas Nowak", day:"Fri", mins:"10 mins", view:"All tasks"}
];

const WORKFLOWS = [
  {name:"Accepted job to ready for site", state:"live", trigger:"event · job accepted",
   actions:[["readiness.check","read"],["tasks.create","write"]], lastRun:"Today 07:05",
   result:"J105 blocked · 2 blockers", resultKind:"warn", runSummary:"1 blocked",
   runs:["idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","partial"]},
  {name:"Breakdown to repair and return check", state:"live", trigger:"event · asset defect",
   actions:[["approvals.route","read"],["notify.inbox","write"]], lastRun:"9 Nov 17:20",
   result:"awaiting Joe", resultKind:"warn", runSummary:"1 open",
   runs:["idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","partial"]},
  {name:"Completed job to invoice and tax review", state:"live", trigger:"event · job completed",
   actions:[["invoice.draft","write"],["approvals.route","read"]], lastRun:"6 Nov",
   result:"ok", resultKind:"ok", runSummary:"3 ok",
   runs:["idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","ok","ok","ok"]},
  {name:"Overdue invoice to follow-up and receipt", state:"live", trigger:"schedule · weekdays 06:55",
   actions:[["reminder.draft","write"]], lastRun:"Today 06:55",
   result:"draft waiting for review", resultKind:"warn", runSummary:"1 draft",
   runs:["idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","idle","ok"]}
];

const SCHEDULES = [
  {id:"s1", name:"Morning briefing", cadence:"Every weekday · 07:10", next:"Tomorrow 07:10", owner:"Briefing", on:true, day:1},
  {id:"s2", name:"Overdue invoice follow-up", cadence:"Weekdays · 06:55", next:"Tomorrow 06:55", owner:"Finance Agent", on:true, day:1},
  {id:"s3", name:"Material confirmation check", cadence:"Weekdays · 06:45", next:"Tomorrow 06:45", owner:"Materials Agent", on:true, day:1},
  {id:"s4", name:"PLT-02 planned service", cadence:"One-off · Thu 12 Nov", next:"Thu 12 Nov", owner:"Fleet", on:true, day:3},
  {id:"s5", name:"Weekly attendance sign-off", cadence:"Fridays · 17:00", next:"Fri 13 Nov 17:00", owner:"Florin Pricope", on:true, day:4}
];

const WIDGET_DEFS = [["inbox","Action inbox"],["work","My work"],["activity","Activity"],["kpi","Today's numbers"],["visits","Today's sites"]];
const WORK_WIDGETS = [
  {id:"queue", label:"My queue", value:"2", hint:"assigned to Florin", icon:"work", queue:"mine"},
  {id:"late", label:"Running late", value:"0", hint:"past their due time", icon:"health", queue:"overdue"},
  {id:"unassigned", label:"Unassigned", value:"0", hint:"every task has an owner", icon:"teams", queue:"unassigned"},
  {id:"week", label:"Next 7 days", value:"8", hint:"due this week", icon:"visits", queue:"upcoming"}
];
const PERSONALITIES = ["Straight-talking","Warm","Formal","Dry"];
const ANSWER_STYLES = ["Short answers","Show the working","Ask before acting"];
/* Every context source and every tool an agent could be granted. */
const CONTEXT_DEFS = [
  ["Customers","records","Contractors, commercial and private customers"],
  ["People","records","Team profiles and qualifications"],
  ["Files","records","Simulated quotes, tickets and evidence"],
  ["Jobs","work","Value, cost lines, readiness"],
  ["Crew shifts","work","Day-rate attendance and plan"],
  ["Approvals","work","What is waiting on a decision"],
  ["Invoices","money","Issued, settled, open"],
  ["Quotes","money","Draft, sent, accepted"],
  ["Purchase orders","money","Confirmed, delivered, draft"],
  ["Activity log","system","Every simulated event"],
  ["Assets","system","Trucks and plant"],
  ["Goals","system","Target, forecast and scenarios"]
];
const CONTEXT_SOURCES = CONTEXT_DEFS.map(c => c[0]);
const SKILL_DEFS = [
  ["Search records","read"],["Summarise activity","read"],["Read job costs","read"],
  ["Read crew plan","read"],["Check readiness","read"],
  ["Draft reminder","write"],["Create task","write"],["Update record","write"],
  ["Propose assignment","write"],["Raise approval","write"],
  ["Send email (not connected)","external"],["Export CSV","external"]
];
/* The two questions the agent asks back once it knows the job. */
const TRAIN_PHASES = [
  ["Reading the whole ontology", "9 jobs, 10 people, 6 orders"],
  ["Learning how this business words things", "job, crew, load, tonne"],
  ["Reading the asphalt and groundworks notes", "demo fixtures only"],
  ["Writing its own system prompt", "draft, waits for review"]
];
const BRIEF_QUESTIONS = [
  {title:"What should it cover?", sub:"Pick as many as you like. We can refine later.",
   options:[["Crews and trucks","Who is where, and what is not ready"],["Materials","Orders awaiting confirmation"],
            ["Money","Profit forecast, overdue and cash"],["Decisions","What is waiting on Joe or Florin"],
            ["Something else","Tell me in the next message"]]},
  {title:"When should it land?", sub:"One is enough to start.",
   options:[["Every morning 07:00","Before the crews start"],["Weekdays 06:45","Monday to Friday only"],
            ["Only when something changes","Event-driven, no noise"],["On demand","When you ask for it"]]}
];
/* The words under a name, keyed to the same state the face lights with. */
const STATE_LABELS = {working:"working", thinking:"thinking", waiting:"waiting on you",
  complete:"up to date", attention:"needs you", idle:"idle"};

const FACE_SHAPES = [
  ["crown-pebble","Pebble"],["executive-capsule","Executive"],["shield","Shield"],
  ["glass-visor","Visor"],["control-cube","Control cube"],["low-dome","Low dome"],
  ["offset-pebble","Offset pebble"],["rim-capsule","Capsule"],["wide-eyed","Wide-eyed"],
  ["precision-brow","Precision brow"],["tall-unit","Tall unit"],["soft-asymmetric","Soft asymmetric"]
];
/* Shell colours only, deliberately desaturated so none of them reads as a
   state. Each is a pair: the deep shell for light themes and its pale partner
   for dark ones (the eyes take the other). The status light carries the state. */
const FACE_TINTS = [
  ["#191c1f","Graphite","#e3e6e8"],["#1b2430","Slate","#d3dde9"],["#241b2e","Aubergine","#ddd4ea"],
  ["#2a2118","Bronze","#eadccb"],["#16241f","Pine","#d1e4da"],["#2b1b1e","Oxblood","#eed5d7"]
];

/* ---- ontology graph: generation, Dijkstra traversal, canvas render ---- */
const CLUSTERS = [
  ["Customers",       "#F4B544", 0.00, 0.62, 46],
  ["Jobs",            "#e6c78a", 0.90, 0.70, 52],
  ["People",          "#9fd6f0", 1.75, 0.66, 58],
  ["Assets",          "#c8b4f0", 2.55, 0.72, 44],
  ["Materials",       "#a8e0c0", 3.35, 0.60, 38],
  ["Invoices",        "#e2a08c", 4.15, 0.70, 40],
  ["Tasks",           "#d9a066", 4.95, 0.64, 30],
  ["Documents",       "#8fb8e8", 5.65, 0.72, 34]
];

function mulberry(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Hub-and-spoke clusters around a dense phyllotaxis core, in unit space
   (-1..1 on both axes) so the layout is resolution independent. */
const _hexCache = {};
function hexRGB(hex){
  if (_hexCache[hex]) return _hexCache[hex];
  const h = hex.replace("#", "");
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _hexCache[hex] = v;
  return v;
}


function buildGraph(){
  const rnd = mulberry(20260902);
  const nodes = [], edges = [], adj = [];
  const add = (x, y, z, r, cluster, kind) => {
    nodes.push({x, y, z, r, cluster, kind}); adj.push([]); return nodes.length - 1;
  };
  const link = (a, b) => {
    const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
    const w = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.004;
    const id = edges.length;
    edges.push({a, b, w});
    adj[a].push([b, w, id]); adj[b].push([a, w, id]);
  };

  // the core is a filled sphere on a Fibonacci lattice, not a disc
  const CORE = 880, coreIds = [];
  for (let i = 0; i < CORE; i++){
    const t = (i + 0.5) / CORE;
    const phi = Math.acos(1 - 2 * t);
    const theta = i * 2.39996;
    const shell = 0.16 + 0.28 * Math.pow(rnd(), 0.5);
    const grade = rnd();
    coreIds.push(add(
      Math.sin(phi) * Math.cos(theta) * shell * 1.04,
      Math.cos(phi) * shell * 0.96,
      Math.sin(phi) * Math.sin(theta) * shell,
      grade < 0.06 ? 3.4 + rnd() * 1.4 : grade < 0.3 ? 2.1 + rnd() * 0.7 : 1.0 + rnd() * 0.8, 0, "core"));
  }
  // lattice neighbours plus a mesh of chords, so the sphere reads as a volume
  for (let i = 1; i < coreIds.length; i++){
    link(coreIds[i], coreIds[i - 1]);
    if (i >= 13) link(coreIds[i], coreIds[i - 13]);
    if (i >= 21 && i % 2 === 0) link(coreIds[i], coreIds[i - 21]);
    if (i >= 34 && i % 3 === 0) link(coreIds[i], coreIds[i - 34]);
    if (i >= 55 && i % 4 === 0) link(coreIds[i], coreIds[i - 55]);
    if (i >= 89 && i % 5 === 0) link(coreIds[i], coreIds[i - 89]);
    if (i % 6 === 0) link(coreIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // a mid shell between the nucleus and the lobes: the layer that makes it
  // read as a network rather than a ball with satellites
  const MID = 560, midIds = [];
  for (let i = 0; i < MID; i++){
    const t = (i + 0.5) / MID;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996 + 0.7;
    const d = 0.52 + 0.16 * Math.pow(rnd(), 0.6);
    const g2 = rnd();
    midIds.push(add(
      Math.sin(phi) * Math.cos(theta) * d * 1.02,
      Math.cos(phi) * d * 0.96,
      Math.sin(phi) * Math.sin(theta) * d,
      g2 < 0.05 ? 2.6 + rnd() * 1.0 : g2 < 0.3 ? 1.6 + rnd() * 0.6 : 0.8 + rnd() * 0.7, 0, "core"));
  }
  for (let i = 0; i < midIds.length; i++){
    if (i >= 1) link(midIds[i], midIds[i - 1]);
    if (i >= 17) link(midIds[i], midIds[i - 17]);
    if (i >= 29 && i % 2 === 0) link(midIds[i], midIds[i - 29]);
    // radial spokes tying the shell to the nucleus
    if (i % 2 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
    if (i % 9 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // clusters ride a sphere: each hub gets its own latitude as well as longitude
  const hubs = [], clusterLeaves = [];
  const onSphere = (lon, lat, d0) => { const d = d0 * 1.22;
    return [Math.cos(lat) * Math.cos(lon) * d * 1.02, Math.sin(lat) * d * 0.96, Math.cos(lat) * Math.sin(lon) * d]; };
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist, leaves] = c;
    const lat = (ci % 2 ? 1 : -1) * (0.26 + rnd() * 0.5);
    const wob = 1.06 + rnd() * 0.16;
    const hp = onSphere(ang, lat, dist * wob);
    const hub = add(hp[0], hp[1], hp[2], 5.4, ci, "hub");
    hubs.push(hub);
    const mine = [];
    clusterLeaves.push(mine);
    for (let k = 0; k < 3; k++) link(hub, coreIds[Math.floor(rnd() * coreIds.length)]);
    for (let k = 0; k < 5; k++) link(hub, midIds[Math.floor(rnd() * midIds.length)]);

    const subs = 5 + Math.floor(rnd() * 4);
    const subIds = [];
    for (let s = 0; s < subs; s++){
      const sa = ang + (rnd() - 0.5) * 0.52, sl = lat + (rnd() - 0.5) * 0.3;
      const sd = dist + 0.08 + rnd() * 0.18;
      const sp = onSphere(sa, sl, sd);
      const sub = add(sp[0], sp[1], sp[2], 3.2, ci, "sub");
      subIds.push(sub);
      link(sub, hub);
      if (s > 0 && rnd() < 0.7) link(sub, subIds[s - 1]);
      const fan = Math.floor((leaves * 7.4) / subs);
      const spread = 0.17 + rnd() * 0.2;
      let prev = -1;
      for (let l = 0; l < fan; l++){
        const la = sa + (rnd() - 0.5) * spread * 2 + (rnd() - 0.5) * 0.06;
        const ll = sl + (rnd() - 0.5) * spread * 1.1;
        const ld = sd + 0.03 + Math.pow(rnd(), 0.8) * 0.17;
        const lp = onSphere(la, ll, ld);
        const lg = rnd();
        const leaf = add(lp[0], lp[1], lp[2],
          lg < 0.08 ? 2.8 + rnd() * 1.2 : lg < 0.34 ? 1.8 + rnd() * 0.6 : 1.0 + rnd() * 0.7, ci, "leaf");
        link(leaf, sub);
        mine.push(leaf);
        if (rnd() < 0.14) link(leaf, hub);
        if (prev >= 0 && rnd() < 0.34) link(leaf, prev);
        if (rnd() < 0.16) link(leaf, midIds[Math.floor(rnd() * midIds.length)]);
        prev = leaf;
      }
    }
  });
  // far satellites hanging off the outer leaves
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist] = c;
    for (let s = 0; s < 7; s++){
      const sa = ang + (rnd() - 0.5) * 1.5, sl = (rnd() - 0.5) * 1.3;
      const sd = dist + 0.42 + rnd() * 0.22;
      const ap = onSphere(sa, sl, sd);
      const anchor = add(ap[0], ap[1], ap[2], 2.4, ci, "sub");
      link(anchor, hubs[ci]);
      const n = 14 + Math.floor(rnd() * 18);
      for (let l = 0; l < n; l++){
        const la = sa + (rnd() - 0.5) * 0.9, ll = sl + (rnd() - 0.5) * 0.7;
        const ld = sd + 0.02 + Math.pow(rnd(), 0.8) * 0.18;
        const p = onSphere(la, ll, ld);
        const leaf = add(p[0], p[1], p[2], 0.8 + rnd() * 0.9, ci, "leaf");
        link(leaf, anchor);
        clusterLeaves[ci].push(leaf);
      }
    }
  });

  // two hub rings and long chords across the sphere
  hubs.forEach((h, i) => {
    link(h, hubs[(i + 1) % hubs.length]);
    link(h, hubs[(i + 2) % hubs.length]);
    if (i % 3 === 0) link(h, hubs[(i + 4) % hubs.length]);
  });
  // neighbouring clusters share records, so their leaves cross-link
  for (let ci = 0; ci < clusterLeaves.length; ci++){
    const a = clusterLeaves[ci], b = clusterLeaves[(ci + 1) % clusterLeaves.length];
    const n = 26 + Math.floor(rnd() * 16);
    for (let k = 0; k < n; k++){
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)]);
    }
    // and a good number reach right across to the far side
    for (let k = 0; k < 12; k++){
      const far = clusterLeaves[(ci + 3) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
    for (let k = 0; k < 8; k++){
      const far = clusterLeaves[(ci + 4) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
  }

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
  for (const n of nodes){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
    if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
  }
  const bounds = {minX, maxX, minY, maxY, cx:(minX + maxX) / 2, cy:(minY + maxY) / 2,
    cz:(minZ + maxZ) / 2, w:maxX - minX, h:maxY - minY, d:maxZ - minZ,
    radius: Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2,
    reach: nodes.reduce((m, n) => Math.max(m, Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)), 0)};
  return {nodes, edges, adj, hubs, coreIds, bounds};
}

export {
  INK,
  BODY,
  DIM,
  FAINT,
  LIME,
  GREEN,
  AMBER,
  RED,
  NEUTRAL,
  MONO,
  ICONS,
  REC_SECTIONS,
  CONTACTS,
  FILE_TREE,
  ONTO_NODES,
  ONTO_EDGES,
  REC_TEMPLATES,
  REC_TEMPLATE_CATS,
  PEOPLE,
  ROLE_LEVELS,
  PERM_KEYS,
  GRANT_DEFS,
  ROLE_SCOPES,
  DEFAULT_PERMS,
  INTEGRATIONS,
  BG_DEFS,
  THEMES,
  ADMIN_ICONS,
  ADMIN_CARDS,
  ADMIN_GROUPS,
  SRC_TINT,
  SRC_ABBR,
  DATA_EVENTS,
  PEOPLE_EVENTS,
  AI_EVENTS,
  STREAM_DEFS,
  NAV,
  ITEMS,
  ORDER,
  ANSWERS,
  synthesizeCustomArea,
  pickAnswer,
  ORGS,
  TEAMS,
  LOCATIONS,
  AGENT_DEFS,
  KPI_DEFS,
  ASPECT_DEFS,
  FILTER_GROUPS,
  OPS_DEFS,
  OPS_FILTERS,
  WORK_SECTIONS,
  WORK_TASKS,
  WORKFLOWS,
  SCHEDULES,
  WIDGET_DEFS,
  WORK_WIDGETS,
  PERSONALITIES,
  ANSWER_STYLES,
  CONTEXT_DEFS,
  CONTEXT_SOURCES,
  SKILL_DEFS,
  TRAIN_PHASES,
  BRIEF_QUESTIONS,
  STATE_LABELS,
  FACE_SHAPES,
  FACE_TINTS,
  CLUSTERS,
  mulberry,
  _hexCache,
  hexRGB,
  buildGraph
};
