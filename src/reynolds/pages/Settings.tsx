/* Settings: organisation identity, teams, systems, governance, AI controls and the demo experience. */
import { AGENTS, CLOCK_PRESETS, ORG, PEOPLE, TEAMS } from "../fixtures";
import type { ReactNode } from "react";
import { seedState, useDemo, type DemoState } from "../store";
import { act } from "../actions";
import { activity, jobs, month, pendingApprovals, personName, runs } from "../selectors";
import { eur, fmtDT, greeting, rel } from "../format";
import { Avatar, Badge, Btn, Field, Grid, KV, Note, Page, Panel, StateBadge, Table, Toggle, downloadText, type Tone } from "../ui";

type Props = { tab: string; params: Record<string, string>; theme: string; setTheme: (t: string) => void };

const THEME_OPTIONS = [
  { id: "reynolds", label: "Reynolds dark (default)" },
  { id: "reynolds-light", label: "Reynolds light" },
  { id: "harbour", label: "Harbour (Pulse dark)" },
  { id: "graphite", label: "Graphite (Pulse dark)" },
];

function confirmReset() {
  if (window.confirm("Reset the demo? Every simulated change (approvals, receipts, notes, runs) is cleared and the canonical baseline returns.")) act.reset();
}

export default function SettingsPage({ tab, theme, setTheme }: Props) {
  const s = useDemo();
  switch (tab) {
    case "teams": return <Teams s={s} />;
    case "systems": return <Systems s={s} />;
    case "governance": return <Governance s={s} />;
    case "ai": return <AiControls s={s} />;
    case "experience": return <Experience s={s} theme={theme} setTheme={setTheme} />;
    default: return <Organisation />;
  }
}

/* ── Organisation ─────────────────────────────────────────────────────── */
function Organisation() {
  const florin = PEOPLE.find((p) => p.id === "P01")!;
  const crew = PEOPLE.filter((p) => p.paidCrew).length;
  return (
    <Page title="Organisation" sub="What Pulse knows about the company, and where each fact came from. Unconfirmed fields stay marked until the business confirms them.">
      <Grid cols="minmax(0,1fr) minmax(0,1.4fr)">
        <Panel title="Identity" sub="Initials mark used because no verified logo is available.">
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "6px 0 16px" }}>
            <span aria-label="RA initials mark" style={{ width: 64, height: 64, flex: "none", borderRadius: 16, background: "#24282D", color: "#F4B544", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", border: "1px solid var(--border-strong)" }}>{ORG.initials}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.3px" }}>{ORG.shortName}</div>
              <div className="r-sub" style={{ marginTop: 3 }}>{ORG.displayName}</div>
            </div>
          </div>
          <KV rows={[
            ["Currency", ORG.currency],
            ["Locale", ORG.locale],
            ["Time zone", ORG.timeZone],
            ["Brand colours", <span key="b">Provisional demo palette <Badge tone="warn">Unverified</Badge></span>],
          ]} />
        </Panel>
        <Panel title="Research-backed" sub="Public sources checked 9 November 2026.">
          <KV rows={[
            ["Display name", ORG.displayName],
            ["Area", ORG.area],
            ["Website", <span key="w">{ORG.website} <span className="r-faint">(supplied with the call; could not be retrieved)</span></span>],
            ["Legal name", <span key="l">{ORG.legalName} <Badge tone="info">Directory-reported</Badge></span>],
            ["Company number", <span key="n">{ORG.companyNumber} <Badge tone="info">Directory-reported</Badge></span>],
            ["Registered address", <span key="a">{ORG.registeredAddress} <Badge tone="info">Directory-reported</Badge></span>],
          ]} />
          <div style={{ marginTop: 14 }}><Note tone="info">Directory-reported, not a CRO certificate. No operating-yard address or Eircode is recorded.</Note></div>
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1fr">
        <Panel title="Confirmed on the call" sub="Consulting.ie discovery call, 5 November 2026.">
          <KV rows={[
            ["Primary user", florin.name + ", " + florin.role],
            ["Business partner", "Joe (surname not supplied), finance and paperwork"],
            ["Crew", crew + " paid crew plus Florin on site"],
            ["Pay model", "Day or shift wages. Finishing time does not change the day wage."],
            ["Trucks", "Two, for asphalt, stone and materials"],
          ]} />
        </Panel>
        <Panel title="Not confirmed" sub="Shown as open questions, never as facts.">
          <KV rows={[
            ["VAT registration", <StateBadge key="v" state="To confirm" />],
            ["RCT status", <StateBadge key="r" state="To confirm" />],
            ["Payroll process", <StateBadge key="p" state="To confirm" />],
            ["Accounting product", <span key="a">Existing invoice system, product name not given</span>],
            ["Logo and brand colours", <span key="l">Provisional demo palette and RA initials mark</span>],
          ]} />
        </Panel>
      </Grid>
    </Page>
  );
}

/* ── Teams & permissions ──────────────────────────────────────────────── */
const PRESETS: { id: DemoState["viewAs"]; label: string; scope: string }[] = [
  { id: "P01", label: "Florin", scope: "Operations and management visibility" },
  { id: "P02", label: "Joe", scope: "Financial review and approvals" },
  { id: "P03", label: "Aoife", scope: "Office records, invoice preparation and coordination" },
  { id: "crew", label: "Crew", scope: "Assigned jobs, own attendance and relevant site documents" },
];

function Teams({ s }: { s: DemoState }) {
  const field = PEOPLE.filter((p) => p.field).length;
  const paid = PEOPLE.filter((p) => p.paidCrew).length;
  const office = PEOPLE.filter((p) => !p.field).length;
  const drivers = PEOPLE.filter((p) => p.truckEligible).length;
  return (
    <Page title="Teams & permissions" sub="Five functional responsibilities shared by a small team, not five departments. A profile here is a demo user profile, not an employee or payroll record.">
      <div className="r-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
        <Stat2 label="Demo profiles" value={String(PEOPLE.length)} />
        <Stat2 label="In the field, incl. Florin" value={String(field)} />
        <Stat2 label="Paid crew, day-wage model" value={String(paid)} />
        <Stat2 label="Office and finance" value={String(office)} sub={drivers + " crew truck-eligible (demo)"} />
      </div>
      <Grid cols="minmax(0,1fr) minmax(0,1.6fr)">
        <Panel title="Responsibilities" sub="Who leads each area. The same people cover several.">
          <div className="r-list">
            {TEAMS.map((t) => (
              <div key={t.id} className="r-li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.label}</div>
                  <div className="r-sub" style={{ marginTop: 2 }}>{t.blurb}</div>
                </div>
                <span className="r-dim" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>Lead: {personName(t.lead)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Profiles" pad={false}>
          <Table keyOf={(p) => p.id} rows={PEOPLE} cols={[
            { k: "n", label: "Name", w: "1.5fr", render: (p) => <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><Avatar initials={p.initials} tint={p.tint} size={24} /><span>{p.name}</span></span> },
            { k: "r", label: "Role", w: "1.6fr", render: (p) => <span className="r-dim">{p.role}</span> },
            { k: "t", label: "Area", w: ".9fr", hideSm: true, render: (p) => p.team },
            { k: "k", label: "Type", w: "1fr", render: (p) => <Badge tone={p.paidCrew ? "accent" : p.field ? "info" : "neutral"}>{p.paidCrew ? "Paid crew" : p.field ? "Field" : "Office"}</Badge> },
            { k: "e", label: "Demo email", w: "1.6fr", hideSm: true, render: (p) => <span className="r-faint" style={{ fontSize: 12 }}>{p.email}</span> },
          ]} foot="Emails are synthetic demo addresses and are never used to send anything." />
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="View presets" sub="Presentation preset only, not security enforcement. Real authentication is unchanged.">
        <div className="r-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
          {PRESETS.map((p) => {
            const on = s.viewAs === p.id;
            return (
              <button key={p.id} type="button" className="r-stat r-click" onClick={() => act.setViewAs(p.id)} aria-pressed={on}
                style={{ textAlign: "left", font: "inherit", color: "inherit", borderColor: on ? "var(--accent)" : undefined, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{p.label}</span>
                  {on && <Badge tone="accent">In use</Badge>}
                </div>
                <div className="r-stat-sub">{p.scope}</div>
              </button>
            );
          })}
        </div>
      </Panel>
    </Page>
  );
}

function Stat2({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="r-stat">
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value" style={{ fontSize: 24 }}>{value}</div>
      {sub && <div className="r-stat-sub">{sub}</div>}
    </div>
  );
}

/* ── Systems & integrations ───────────────────────────────────────────── */
function Systems({ s }: { s: DemoState }) {
  const exportJobs = () => {
    const rows = jobs(s);
    const head = ["id", "name", "customer", "status", "month", "agreed_value_eur", "budget_eur", "forecast_cost_eur", "gross_profit_eur"];
    const esc = (v: string | number) => { const t = String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const lines = [head.join(",")].concat(rows.map((j) => [j.id, j.name, j.customerName, j.status, j.month, j.value, j.budget, j.forecast, j.profit].map(esc).join(",")));
    downloadText("reynolds-demo-jobs.csv", lines.join("\n") + "\n");
  };
  const ROWS: { id: string; system: string; source: string; state: string; tone: Tone; detail: string; action?: ReactNode }[] = [
    { id: "acc", system: "Existing invoice / accounting system", source: "Product to be confirmed", state: "Sample import only", tone: "warn", detail: "Invoices in the demo come from a sample fixture, not a connection. Final invoices are still issued in the existing system." },
    { id: "bank", system: "Bank balances", source: "Manual demo snapshot", state: "No live bank feed", tone: "warn", detail: "The €34,500 opening balance was entered by hand for the cash view." },
    { id: "paper", system: "Existing paperwork", source: "Simulated documents and records", state: "Simulated", tone: "neutral", detail: "Quotes, tickets, credentials and review evidence are readable mock records." },
    { id: "csv", system: "CSV import / export", source: "Local demonstration", state: "Local only", tone: "ok", detail: "Files are built in the browser. Nothing is uploaded.", action: <Btn small onClick={exportJobs}>Export jobs CSV</Btn> },
    { id: "email", system: "Email follow-up", source: "Draft preview only", state: "No provider connected", tone: "neutral", detail: "Reminders are drafted for review. Nothing is sent." },
    { id: "ros", system: "Revenue / ROS", source: "Review evidence only", state: "Not connected", tone: "bad", detail: "No returns, payments or submissions. Tax treatment is recorded by a human reviewer." },
  ];
  return (
    <Page title="Systems & integrations" sub="Systems lists where data comes from. Integrations shows the simulated import or mapping state. No connection here is live.">
      <Panel pad={false}>
        <Table keyOf={(r) => r.id} rows={ROWS} cols={[
          { k: "s", label: "System", w: "1.4fr", render: (r) => <span style={{ fontWeight: 600 }}>{r.system}</span> },
          { k: "o", label: "Source", w: "1.2fr", render: (r) => <span className="r-dim">{r.source}</span> },
          { k: "t", label: "Integration state", w: "1fr", render: (r) => <Badge tone={r.tone}>{r.state}</Badge> },
          { k: "d", label: "What it means", w: "2fr", hideSm: true, render: (r) => <span className="r-dim" style={{ fontSize: 12.5 }}>{r.detail}</span> },
          { k: "a", label: "", w: "auto", align: "right", render: (r) => r.action || null },
        ]} foot="A CSV file is an import format, not evidence of any spreadsheet tool in use." />
      </Panel>
    </Page>
  );
}

/* ── Governance ───────────────────────────────────────────────────────── */
function Governance({ s }: { s: DemoState }) {
  const acts = activity(s);
  const simulated = acts.filter((a) => a.provenance === "Simulated").length;
  const imported = acts.length - simulated;
  const m = month(s);
  const RULES = [
    { id: "spend", what: "Spending proposals (repairs, hire, purchase orders)", owner: "Joe", rule: "Human approval before any commitment", example: "W002 €680 repair, W003 €260 hire" },
    { id: "comms", what: "Customer communications", owner: "The reviewing owner", rule: "Draft preview only; a person reviews before anything leaves", example: "INV-099 reminder, reviewed by Aoife" },
    { id: "tax", what: "Tax treatment (VAT, RCT)", owner: "Joe", rule: "Separate fields; unknown stays Needs review", example: "W006 J105 private driveway" },
    { id: "price", what: "Contract-price changes", owner: "Florin, then the customer", rule: "Internal approval prepares; only customer acceptance changes agreed value", example: "V104-01 €1,200 variation" },
  ];
  return (
    <Page title="Governance" sub="Who must approve what, where every figure comes from, and a safe way back to the baseline."
      actions={<Btn kind="danger" onClick={confirmReset}>Reset demo</Btn>}>
      <Panel title="Approval ownership" pad={false}>
        <Table keyOf={(r) => r.id} rows={RULES} cols={[
          { k: "w", label: "Decision", w: "1.5fr", render: (r) => <span style={{ fontWeight: 600 }}>{r.what}</span> },
          { k: "o", label: "Owner", w: "1fr", render: (r) => r.owner },
          { k: "r", label: "Rule", w: "1.8fr", render: (r) => <span className="r-dim">{r.rule}</span> },
          { k: "e", label: "Example now", w: "1.2fr", hideSm: true, render: (r) => <span className="r-faint" style={{ fontSize: 12.5 }}>{r.example}</span> },
        ]} foot={pendingApprovals(s).length + " approvals waiting in Work."} />
      </Panel>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1fr">
        <Panel title="Action history" sub="Every simulated change writes one linked event.">
          <div className="r-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Stat2 label="Events" value={String(acts.length)} />
            <Stat2 label="Simulated" value={String(simulated)} />
            <Stat2 label="Demo import" value={String(imported)} />
          </div>
          <div className="r-sub" style={{ marginTop: 12 }}>Agent runs recorded: {runs(s).length}. Last event: {acts[0] ? fmtDT(acts[0].at) + ", " + acts[0].title : "none"}.</div>
        </Panel>
        <Panel title="Financial provenance">
          <KV rows={[
            ["Job values and costs", "Fictional demo fixtures, net of VAT, derived per cost line"],
            ["Operating profit", eur(m.op) + " forecast, a management estimate using illustrative overhead allowances, not statutory accounts"],
            ["Target", eur(s.target) + " illustrative, from Florin's example on the call"],
            ["Bank cash", "Manual snapshot, no live feed"],
            ["Invoices", "Sample ledger, simulated contractor cases"],
          ]} />
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Note tone="warn">Reset clears every simulated change (approvals, receipts, notes, quote conversions, runs and filters) and restores the canonical fixtures. It cannot be undone.</Note>
    </Page>
  );
}

/* ── AI controls ──────────────────────────────────────────────────────── */
function AiControls({ s }: { s: DemoState }) {
  const all = runs(s);
  return (
    <Page title="AI controls" sub="Agents in this demo are deterministic and fixture-driven. A run updates local output and history; it does not connect to any service.">
      <Grid cols="minmax(0,1.5fr) minmax(0,1fr)">
        <Panel title="Agents" sub="Switching an agent off stops its manual runs.">
          <div className="r-list">
            {AGENTS.map((a) => {
              const n = all.filter((r) => r.agent === a.id).length;
              return (
                <div key={a.id} className="r-li" style={{ alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Toggle on={!!s.agentsOn[a.id]} onChange={() => act.toggleAgent(a.id)} label={a.name} sub={a.purpose} />
                  </div>
                  <span className="r-faint" style={{ fontSize: 12, whiteSpace: "nowrap" }}>Owner {personName(a.owner)} · {n} runs</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Panel title="Mode">
            <Toggle on={s.draftOnly} onChange={(v) => act.setDraftOnly(v)} label="Draft-only mode" sub="Agents prepare drafts and proposals. Nothing is sent, paid, filed or approved by an agent." />
          </Panel>
          <Panel title="Policy">
            <div className="r-list">
              <div className="r-li"><span style={{ fontSize: 13 }}>Visible evidence: each output lists its inputs and links to the records it used.</span></div>
              <div className="r-li"><span style={{ fontSize: 13 }}>Approval: spend, customer messages, tax treatment and price changes always go to a named person.</span></div>
              <div className="r-li"><span style={{ fontSize: 13 }}>Deduplication: repeat alerts are matched on agent, rule and record, so re-runs never add tasks.</span></div>
              <div className="r-li"><span className="r-dim" style={{ fontSize: 13 }}>No API keys or live model settings are stored in this demo.</span></div>
            </div>
          </Panel>
        </div>
      </Grid>
    </Page>
  );
}

/* ── Experience ───────────────────────────────────────────────────────── */
function Experience({ s, theme, setTheme }: { s: DemoState; theme: string; setTheme: (t: string) => void }) {
  const known = THEME_OPTIONS.some((t) => t.id === theme);
  const base = seedState();
  return (
    <Page title="Experience" sub="Demo controls. The clock drives greetings, overdue days and every relative date together.">
      <Grid cols="1fr 1fr">
        <Panel title="Demo clock" sub="Frozen scenario time, Europe/Dublin. The real system clock is never used.">
          <Field label="Demo time">
            <select className="r-select" value={s.clock} onChange={(e) => act.setClock(e.target.value)}>
              {CLOCK_PRESETS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              {!CLOCK_PRESETS.some((c) => c.id === s.clock) && <option value={s.clock}>{fmtDT(s.clock)}</option>}
            </select>
          </Field>
          <div style={{ marginTop: 14 }}>
            <KV rows={[
              ["Greeting", greeting(s.clock) + ", Florin"],
              ["11 Nov surfacing", rel("2026-11-11", s.clock)],
              ["INV-099 due date", rel("2026-10-27", s.clock)],
              ["Reporting period", "1 to 30 November 2026"],
            ]} />
          </div>
        </Panel>
        <Panel title="Appearance" sub="Existing Pulse themes. The Reynolds palette is a provisional demo palette.">
          <Field label="Theme">
            <select className="r-select" value={known ? theme : ""} onChange={(e) => setTheme(e.target.value)}>
              {!known && <option value="">{theme}</option>}
              {THEME_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["#24282D", "#A65A00", "#F4B544", "#FFF4D6"].map((c) => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--dim)" }}>
                <span style={{ width: 18, height: 18, borderRadius: 6, background: c, border: "1px solid var(--border-strong)" }} />{c}
              </span>
            ))}
          </div>
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="Reset demo" sub={"Restore the canonical baseline: " + eur(month(base).op) + " forecast operating profit, " + pendingApprovals(base).length + " decisions waiting, nothing paid or approved."}>
        <Btn kind="danger" onClick={confirmReset}>Reset demo</Btn>
      </Panel>
    </Page>
  );
}
