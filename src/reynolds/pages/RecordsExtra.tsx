/* Records: Browse, Customers and Suppliers. Shared search and history over the
   same entities the operational modules use; nothing is duplicated here. */
import { useMemo, useState, type ReactNode } from "react";
import { BILLS, CUSTOMERS, DOCUMENTS, PEOPLE, SUPPLIERS, SUPPLIER_QUOTES, VARIATION, type Ref } from "../fixtures";
import { useDemo, type DemoState } from "../store";
import { customerBalance, fleet, invoices, jobs, pipeline, pos, shifts, tasks } from "../selectors";
import { eur, fmtDate } from "../format";
import { Badge, Btn, Grid, KV, Note, Page, Panel, RecLink, StateBadge, Table } from "../ui";

type Props = { tab: string; params: Record<string, string> };

export default function RecordsExtra({ tab, params }: Props) {
  const s = useDemo();
  if (tab === "customers") return <Customers s={s} initial={params.id} />;
  if (tab === "suppliers") return <Suppliers s={s} />;
  return <Browse s={s} initial={params.entity} />;
}

/* ── Browse ───────────────────────────────────────────────────────────── */
type Row = { id: string; title: string; meta: string; ref: Ref; tag?: ReactNode };
type Entity = { id: string; label: string; count: number; note?: string; rows: Row[] };

function entities(s: DemoState): Entity[] {
  const js = jobs(s), inv = invoices(s), pv = pos(s), f = fleet(s), sh = shifts(s), ts = tasks(s);
  const cust = (id: string) => CUSTOMERS.find((c) => c.id === id)?.name || id;
  const sup = (id: string) => SUPPLIERS.find((c) => c.id === id)?.name || id;
  const approvals = ts.filter((t) => t.approval);
  return [
    { id: "customers", label: "Customers and prospects", count: CUSTOMERS.length, rows: CUSTOMERS.map((c) => ({ id: c.id, title: c.name, meta: c.type + (c.prospect ? ", prospect" : "") + " · " + c.area, ref: { kind: "customer", id: c.id }, tag: c.prospect ? <Badge>Prospect</Badge> : null })) },
    { id: "people", label: "People", count: PEOPLE.length, note: "Demo profiles", rows: PEOPLE.map((p) => ({ id: p.id, title: p.name, meta: p.role, ref: { kind: "person", id: p.id }, tag: p.paidCrew ? <Badge tone="accent">Paid crew</Badge> : null })) },
    { id: "suppliers", label: "Suppliers", count: SUPPLIERS.length, rows: SUPPLIERS.map((x) => ({ id: x.id, title: x.name, meta: x.category, ref: { kind: "supplier", id: x.id } })) },
    { id: "jobs", label: "Jobs (all time)", count: js.length, rows: js.map((j) => ({ id: j.id, title: j.name, meta: cust(j.customer) + " · " + eur(j.value) + " · " + (j.month === "2026-11" ? "November" : j.month === "2026-10" ? "October" : j.month), ref: { kind: "job", id: j.id }, tag: <StateBadge state={j.status} /> })) },
    { id: "assets", label: "Owned assets", count: f.owned.length, note: f.hired.length ? f.hired.length + " hired shown separately" : undefined, rows: f.owned.concat(f.hired).map((a) => ({ id: a.id, title: a.id + " " + a.label, meta: (a.hired ? "Hired · " : a.kind + " · ") + a.status, ref: { kind: a.hired ? "hire" : "asset", id: a.id }, tag: <StateBadge state={a.available ? "Available" : "Unavailable"} /> })) },
    { id: "invoices", label: "Invoices", count: inv.length, rows: inv.map((i) => ({ id: i.id, title: i.id + " " + i.customerName, meta: eur(i.amount) + " · open " + eur(i.open) + " · due " + fmtDate(i.due), ref: { kind: "invoice", id: i.id }, tag: <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue" : "Not yet due"} /> })) },
    { id: "pos", label: "Purchase orders", count: pv.length, rows: pv.map((p) => ({ id: p.id, title: p.id + " " + p.qty + " t " + p.material.toLowerCase(), meta: sup(p.supplier) + " · " + p.job + " · " + eur(p.value), ref: { kind: "po", id: p.id }, tag: <StateBadge state={p.status} /> })) },
    { id: "shifts", label: "Crew shifts (9 to 13 Nov)", count: sh.slots, note: sh.approvedShifts + " approved", rows: sh.rows.map((r) => ({ id: r.person.id, title: r.person.name, meta: r.planned + " planned · " + r.approvedCount + " approved · " + eur(r.expected) + " expected", ref: { kind: "person", id: r.person.id } })) },
    { id: "documents", label: "Documents", count: DOCUMENTS.length, rows: DOCUMENTS.map((d) => ({ id: d.id, title: d.title, meta: d.type + " · " + d.folder, ref: { kind: "document", id: d.id } })) },
    { id: "approvals", label: "Approvals", count: approvals.length, note: approvals.filter((a) => a.open).length + " waiting", rows: approvals.map((t) => ({ id: t.id, title: t.id + " " + t.title, meta: t.ownerName + " · " + t.area, ref: { kind: "task", id: t.id }, tag: <StateBadge state={t.status} /> })) },
  ];
}

function Browse({ s, initial }: { s: DemoState; initial?: string }) {
  const all = useMemo(() => entities(s), [s]);
  const [sel, setSel] = useState(initial && all.some((e) => e.id === initial) ? initial : "jobs");
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const hit = (r: Row) => !ql || (r.id + " " + r.title + " " + r.meta).toLowerCase().includes(ql);
  const cur = all.find((e) => e.id === sel)!;
  const rows = ql ? all.flatMap((e) => e.rows.filter(hit).map((r) => ({ ...r, group: e.label }))) : cur.rows.map((r) => ({ ...r, group: cur.label }));
  return (
    <Page title="Browse records" sub="Shared search and history across every entity. Operational work stays in its own module; open any record from here.">
      <div className="r-grid" style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
        {all.map((e) => (
          <button key={e.id} type="button" className="r-stat r-click" aria-pressed={sel === e.id && !ql} onClick={() => { setSel(e.id); setQ(""); }}
            style={{ textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer", borderColor: sel === e.id && !ql ? "var(--accent)" : undefined }}>
            <div className="r-stat-label">{e.label}</div>
            <div className="r-stat-value" style={{ fontSize: 22 }}>{e.count}</div>
            {e.note && <div className="r-stat-sub">{e.note}</div>}
          </button>
        ))}
      </div>
      <Panel title={ql ? "Search results" : cur.label} sub={ql ? rows.length + " matches across all records" : cur.rows.length + " records"}
        right={<input className="r-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, name or detail" aria-label="Search all records" style={{ width: 240, maxWidth: "100%" }} />} pad={false}>
        <Table keyOf={(r) => r.group + r.id} rows={rows} empty="No records match. Try an ID such as J104 or PO-204." cols={[
          { k: "id", label: "ID", w: "100px", render: (r) => <RecLink r={r.ref}>{r.id}</RecLink> },
          { k: "t", label: "Record", w: "1.6fr", render: (r) => <span style={{ fontWeight: 500 }}>{r.title}</span> },
          { k: "m", label: "Detail", w: "2fr", render: (r) => <span className="r-dim">{r.meta}</span> },
          ...(ql ? [{ k: "g", label: "Type", w: "1fr", hideSm: true, render: (r: Row & { group: string }) => <span className="r-faint">{r.group}</span> }] : []),
          { k: "s", label: "Status", w: "auto", align: "right" as const, render: (r) => r.tag || null },
        ]} />
      </Panel>
    </Page>
  );
}

/* ── Customers ────────────────────────────────────────────────────────── */
function Customers({ s, initial }: { s: DemoState; initial?: string }) {
  const [sel, setSel] = useState(initial && CUSTOMERS.some((c) => c.id === initial) ? initial : "C01");
  const js = jobs(s), qs = pipeline(s).quotes, inv = invoices(s);
  const list = CUSTOMERS.map((c) => {
    const cj = js.filter((j) => j.customer === c.id);
    return { ...c, jobs: cj, quotes: qs.filter((q) => q.customer === c.id), invoices: inv.filter((i) => i.customer === c.id), balance: customerBalance(s, c.id) };
  });
  const c = list.find((x) => x.id === sel)!;
  const accepted = list.filter((x) => x.jobs.length).length;
  return (
    <Page title="Customers" sub={list.length + " customer and prospect records. " + accepted + " have accepted jobs, " + (list.length - accepted) + " have quotes only. All fictional demo entities."}>
      <Grid cols="minmax(0,1fr) minmax(0,1.5fr)">
        <Panel pad={false}>
          <Table keyOf={(x) => x.id} rows={list} onRow={(x) => setSel(x.id)} dense cols={[
            { k: "n", label: "Customer", w: "1.6fr", render: (x) => <span style={{ fontWeight: x.id === sel ? 600 : 500, color: x.id === sel ? "var(--accent)" : undefined }}>{x.name}</span> },
            { k: "t", label: "Type", w: "1fr", render: (x) => <span className="r-dim">{x.type}{x.prospect ? ", prospect" : ""}</span> },
            { k: "b", label: "Open balance", w: "1fr", align: "right", render: (x) => <span className="r-num">{x.balance ? eur(x.balance) : <span className="r-faint">{eur(0)}</span>}</span> },
          ]} />
        </Panel>
        <Panel title={c.name} sub={c.note}
          right={<><Badge tone={c.prospect ? "neutral" : "accent"}>{c.prospect ? "Prospect" : "Customer"}</Badge><RecLink r={{ kind: "customer", id: c.id }}>Open record</RecLink></>}>
          <KV rows={[
            ["ID", c.id], ["Type", c.type], ["Area", c.area], ["Contact", c.contact],
            ["Open balance", <span key="b" className="r-num" style={{ fontWeight: 600 }}>{eur(c.balance)}</span>],
          ]} />
          <Section title={"Jobs (" + c.jobs.length + ")"}>
            {c.jobs.length ? c.jobs.map((j) => (
              <div key={j.id} className="r-li" style={{ alignItems: "center" }}>
                <RecLink r={{ kind: "job", id: j.id }}>{j.id}</RecLink>
                <span style={{ flex: 1, minWidth: 0 }}>{j.name}</span>
                <span className="r-num r-dim">{eur(j.value)}</span>
                <StateBadge state={j.status} />
              </div>
            )) : <div className="r-dim" style={{ fontSize: 13 }}>No accepted jobs.</div>}
            {c.jobs.some((j) => j.id === VARIATION.job) && (
              <div style={{ marginTop: 8 }}>
                <Note tone={s.variation === "Customer accepted" ? "ok" : "warn"}>
                  <RecLink r={{ kind: "variation", id: VARIATION.id }}>{VARIATION.id}</RecLink> {VARIATION.title}, {eur(VARIATION.price)}. Status: {s.variation}.
                  {s.variation === "Customer accepted" ? " Included in J104's agreed value." : " Not accepted by the customer, so it is excluded from booked value."}
                </Note>
              </div>
            )}
          </Section>
          <Section title={"Quotes (" + c.quotes.length + ")"}>
            {c.quotes.length ? c.quotes.map((q) => (
              <div key={q.id} className="r-li" style={{ alignItems: "center" }}>
                <RecLink r={{ kind: "quote", id: q.id }}>{q.id}</RecLink>
                <span style={{ flex: 1, minWidth: 0 }}>{q.title}</span>
                <span className="r-num r-dim">{eur(q.value)}</span>
                <StateBadge state={q.stage} />
              </div>
            )) : <div className="r-dim" style={{ fontSize: 13 }}>No quotes.</div>}
          </Section>
          <Section title={"Invoices (" + c.invoices.length + ")"}>
            {c.invoices.length ? c.invoices.map((i) => (
              <div key={i.id} className="r-li" style={{ alignItems: "center" }}>
                <RecLink r={{ kind: "invoice", id: i.id }}>{i.id}</RecLink>
                <span style={{ flex: 1, minWidth: 0 }} className="r-dim">{i.job} · due {fmtDate(i.due)}</span>
                <span className="r-num">{eur(i.open)} open</span>
                <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue " + i.daysOverdue + " days" : "Not yet due"} />
              </div>
            )) : <div className="r-dim" style={{ fontSize: 13 }}>No invoices.</div>}
          </Section>
        </Panel>
      </Grid>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div className="r-eyebrow" style={{ marginBottom: 4 }}>{title}</div>
      <div className="r-list">{children}</div>
    </div>
  );
}

/* ── Suppliers ────────────────────────────────────────────────────────── */
function Suppliers({ s }: { s: DemoState }) {
  const pv = pos(s);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Page title="Suppliers" sub="The same five supplier records used by Materials and Finance. Rates shown only where a supplier quote is seeded.">
      <div className="r-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
        {SUPPLIERS.map((x) => {
          const sp = pv.filter((p) => p.supplier === x.id);
          const openPos = sp.filter((p) => p.status !== "Delivered");
          const awaiting = sp.filter((p) => p.status === "Awaiting confirmation");
          const bills = BILLS.filter((b) => b.supplier === x.id);
          const docs = DOCUMENTS.filter((d) => d.refs.some((r) => r.kind === "supplier" && r.id === x.id) || d.refs.some((r) => r.kind === "po" && sp.some((p) => p.id === r.id)));
          const rates = SUPPLIER_QUOTES.filter((q) => q.supplier === x.id);
          const expanded = open === x.id;
          return (
            <Panel key={x.id} title={x.name} sub={x.id + " · " + x.category} right={awaiting.length ? <Badge tone="warn">{awaiting.length} to confirm</Badge> : null}>
              <div className="r-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Mini label="Open POs" value={String(openPos.length)} />
                <Mini label="Committed" value={eur(openPos.filter((p) => p.status !== "Draft").reduce((a, p) => a + p.value, 0))} />
                <Mini label="Bills due" value={eur(bills.reduce((a, b) => a + b.amount, 0))} />
              </div>
              <div style={{ marginTop: 12, fontSize: 12.5 }} className="r-dim">
                {x.materials.length ? "Materials: " + x.materials.join(", ") : "Services: " + x.category.toLowerCase()}
                {rates.map((r) => <div key={r.material} style={{ marginTop: 4 }}>{r.material}: {eur(r.price)}/{r.unit}. {r.note}</div>)}
              </div>
              {expanded && (
                <div style={{ marginTop: 10 }}>
                  <Section title="Purchase orders">
                    {sp.length ? sp.map((p) => (
                      <div key={p.id} className="r-li" style={{ alignItems: "center" }}>
                        <RecLink r={{ kind: "po", id: p.id }}>{p.id}</RecLink>
                        <span style={{ flex: 1 }} className="r-dim">{p.qty} t · {p.job}</span>
                        <StateBadge state={p.status} />
                      </div>
                    )) : <div className="r-dim" style={{ fontSize: 13 }}>None.</div>}
                  </Section>
                  <Section title="Bills">
                    {bills.length ? bills.map((b) => (
                      <div key={b.id} className="r-li" style={{ alignItems: "center" }}>
                        <RecLink r={{ kind: "bill", id: b.id }}>{b.id}</RecLink>
                        <span style={{ flex: 1 }} className="r-dim">{b.note} · due {fmtDate(b.due)}</span>
                        <span className="r-num">{eur(b.amount)}</span>
                      </div>
                    )) : <div className="r-dim" style={{ fontSize: 13 }}>None.</div>}
                  </Section>
                  <Section title="Documents">
                    {docs.length ? docs.map((d) => (
                      <div key={d.id} className="r-li"><RecLink r={{ kind: "document", id: d.id }}>{d.title}</RecLink></div>
                    )) : <div className="r-dim" style={{ fontSize: 13 }}>None.</div>}
                  </Section>
                </div>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn small onClick={() => setOpen(expanded ? null : x.id)}>{expanded ? "Hide details" : "Orders, bills and documents"}</Btn>
                <Btn small kind="quiet" onClick={() => undefined} disabled="Supplier contact details were not supplied">Contact</Btn>
                <RecLink r={{ kind: "supplier", id: x.id }}>Open record</RecLink>
              </div>
            </Panel>
          );
        })}
      </div>
    </Page>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="r-stat" style={{ padding: "10px 12px" }}>
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value" style={{ fontSize: 17 }}>{value}</div>
    </div>
  );
}
