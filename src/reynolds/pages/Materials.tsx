/* Materials: job requirements, purchase orders, deliveries and suppliers.
   Job-specific orders, not a warehouse: stone and asphalt tonnes are never added together. */
import { useState } from "react";
import { useDemo, go, type DemoState } from "../store";
import { act } from "../actions";
import { asphaltOn, jobById, poTotals, pos, readiness, supplier, type PoView, type ReadyItem } from "../selectors";
import { BILLS, SUPPLIERS, SUPPLIER_QUOTES } from "../fixtures";
import { dayOf, eur, fmtDate, fmtDT, fmtTime, rel } from "../format";
import { Badge, Btn, Field, Grid, KV, Note, Page, Panel, RecLink, Seg, SideSheet, StateBadge, Stat, Table } from "../ui";

type Props = { tab: string; params: Record<string, string> };

export default function MaterialsPage({ tab }: Props) {
  const s = useDemo();
  if (tab === "orders") return <Orders s={s} />;
  if (tab === "deliveries") return <Deliveries s={s} />;
  if (tab === "suppliers") return <Suppliers s={s} />;
  return <Requirements s={s} />;
}

const treatment = (p: PoView) => (p.posted ? "Posted cost" : p.status === "Draft" ? "Draft, not committed" : "Committed");
function transportFor(s: DemoState, p: PoView): ReadyItem | null {
  if (p.material !== "Asphalt" || p.status === "Delivered") return null;
  return readiness(s, p.job, dayOf(p.window)).items.find((i) => i.label === "Transport") || null;
}
function JobLink({ id }: { id: string }) {
  const j = jobById(useDemo(), id);
  return <button type="button" className="r-link" onClick={() => go("Jobs", "detail", { job: id })}>{id}{j ? " " + j.name : ""}</button>;
}

/* ── PO actions (shared by drawer and agenda) ─────────────────────────── */
function PoActions({ p }: { p: PoView }) {
  const [win, setWin] = useState(p.window.slice(0, 16));
  const [qty, setQty] = useState(String(p.qty));
  const [key, setKey] = useState(p.id + p.window);
  if (key !== p.id + p.window) { setKey(p.id + p.window); setWin(p.window.slice(0, 16)); }
  if (p.status === "Delivered") return <Note tone="ok">Received {p.receivedQty ?? p.qty} t{p.variance ? ", variance " + eur(p.variance, { sign: true }) : ""}. Cost is posted.</Note>;
  const q = Number(qty);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {p.status === "Draft" && (
        <div className="r-pill-row">
          <Btn kind="primary" onClick={() => act.issueDraftPo(p.id)}>Mark as issued (simulated)</Btn>
          <span className="r-dim" style={{ fontSize: 12 }}>Nothing is sent to the supplier.</span>
        </div>
      )}
      {p.status === "Awaiting confirmation" && (
        <div className="r-pill-row">
          <Btn kind="primary" onClick={() => act.confirmPo(p.id)}>Record supplier confirmation</Btn>
          <span className="r-dim" style={{ fontSize: 12 }}>Confirmation does not mark it delivered.</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Revised arrival"><input type="datetime-local" className="r-input" value={win} onChange={(e) => setWin(e.target.value)} /></Field>
        <Btn onClick={() => act.reviseWindow(p.id, win)} disabled={win === p.window.slice(0, 16) ? "Change the time first" : false}>Save time</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Received quantity (t)" help={q > 0 && q !== p.qty ? "Variance " + (q - p.qty > 0 ? "+" : "") + (q - p.qty) + " t, " + eur((q - p.qty) * p.unit, { sign: true }) : "Ordered " + p.qty + " t"}>
          <input className="r-input" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))} style={{ width: 120 }} />
        </Field>
        <Btn onClick={() => act.receivePo(p.id, q)} disabled={p.status !== "Confirmed" ? "Only a confirmed order can be received" : !(q > 0) ? "Enter a quantity" : false}>Record receipt (simulated)</Btn>
      </div>
    </div>
  );
}

function PoSheet({ s, id, onClose }: { s: DemoState; id: string; onClose: () => void }) {
  const p = pos(s).find((x) => x.id === id)!;
  const t = transportFor(s, p);
  return (
    <SideSheet title={p.id + " · " + p.material + " " + p.qty + " t"} sub={supplier(p.supplier)?.name} onClose={onClose}>
      <KV rows={[
        ["Job", <JobLink id={p.job} />], ["Supplier", <RecLink r={{ kind: "supplier", id: p.supplier }}>{supplier(p.supplier)?.name}</RecLink>],
        ["Quantity", p.qty + " t × " + eur(p.unit) + " per t"], ["Ordered value", eur(p.orderedValue)], ["Current value", eur(p.value)],
        ["Supplier status", <StateBadge state={p.status} />], ["Cost treatment", treatment(p)], ["Window", fmtDT(p.window)], ["Owner", "Aoife Brennan"],
        ...(t ? [["Transport", <span><StateBadge state={t.state} /> <span className="r-dim">{t.detail}</span></span>] as [string, JSX.Element]] : []),
        ...(p.ticket ? [["Delivery ticket", <RecLink r={{ kind: "document", id: p.ticket }}>Open ticket</RecLink>] as [string, JSX.Element]] : []),
      ]} />
      <Note>{p.posted ? "Delivered: the cost sits in the job's posted cost." : p.status === "Draft" ? "Draft: part of the job's cost estimate, not an authorised purchase." : "Committed: counted in the job's remaining forecast. On receipt it moves to posted, not added again."}</Note>
      <PoActions p={p} />
    </SideSheet>
  );
}

/* ── Requirements ──────────────────────────────────────────────────────── */
function Requirements({ s }: { s: DemoState }) {
  const a = asphaltOn(s, "2026-11-11");
  const all = pos(s);
  const byJob = Array.from(new Set(all.map((p) => p.job)));
  const exceptions = all.filter((p) => p.status === "Awaiting confirmation" || p.status === "Draft");
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Page title="Material requirements" sub="What each job needs, what the supplier has confirmed, and what is still open.">
      <Panel title={"Asphalt for " + fmtDate("2026-11-11", "dow") + " (" + rel("2026-11-11", s.clock) + ")"} sub="Two jobs surface on the same morning." style={{ marginBottom: 14 }}>
        <Grid cols="repeat(3, minmax(0,1fr))" gap={10}>
          <Stat label="Required" value={a.required + " t"} sub={a.list.length + " orders"} big />
          <Stat label="Confirmed" value={a.confirmed + " t"} tone="ok" sub={a.list.filter((p) => p.status === "Confirmed" || p.status === "Delivered").map((p) => p.id).join(", ") || "None"} big />
          <Stat label="Awaiting confirmation" value={a.unconfirmed + " t"} tone={a.unconfirmed ? "warn" : "ok"} sub={a.list.filter((p) => p.status === "Awaiting confirmation" || p.status === "Draft").map((p) => p.id).join(", ") || "None"} big />
        </Grid>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {a.list.map((p) => (
            <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
              <button type="button" className="r-link" onClick={() => setOpen(p.id)}>{p.id}</button>
              <span>{p.qty} t for <JobLink id={p.job} /> at {fmtTime(p.window)}</span>
              <StateBadge state={p.status} />
            </div>
          ))}
        </div>
      </Panel>

      <Grid cols="1.5fr 1fr">
        <Panel title="By job" sub="Stone and asphalt are shown separately; tonnes are not added across materials." pad={false}>
          <div style={{ padding: "0 20px 10px" }}>
            {byJob.map((jid) => {
              const lines = all.filter((p) => p.job === jid).sort((x, y) => x.window.localeCompare(y.window));
              return (
                <div key={jid} className="r-li" style={{ flexDirection: "column", gap: 8 }}>
                  <strong style={{ fontSize: 13.5 }}><JobLink id={jid} /></strong>
                  {lines.map((p) => {
                    const r = readiness(s, p.job, dayOf(p.window));
                    return (
                      <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 13, paddingLeft: 2 }}>
                        <span style={{ minWidth: 150 }}>{p.material} {p.receivedQty ?? p.qty} t</span>
                        <span className="r-dim">{fmtDT(p.window)}</span>
                        <button type="button" className="r-link" onClick={() => setOpen(p.id)}>{p.id}</button>
                        <StateBadge state={p.status} />
                        {p.status !== "Delivered" && r.blockers.length > 0 && <span className="r-dim" style={{ fontSize: 12 }}>Day readiness: {r.overall.toLowerCase()}</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Exceptions" sub="Orders not yet confirmed and their job impact.">
          {exceptions.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>Every order is confirmed or delivered.</div>}
          {exceptions.map((p) => {
            const j = jobById(s, p.job);
            return (
              <div key={p.id} className="r-li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button type="button" className="r-link" onClick={() => setOpen(p.id)}>{p.id}</button> <span style={{ fontSize: 13 }}>{p.material} {p.qty} t, {fmtDT(p.window)}</span>
                  <div className="r-dim" style={{ fontSize: 12.5, marginTop: 4 }}>
                    {p.status === "Draft" ? "Draft for " + (j?.name || p.job) + ". Needs issuing before the supplier can confirm." : "Needed for " + (j?.name || p.job) + ". Crew is planned; the load is not confirmed. Owner Aoife (W004)."}
                  </div>
                </div>
                <StateBadge state={p.status} />
              </div>
            );
          })}
        </Panel>
      </Grid>
      {open && <PoSheet s={s} id={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}

/* ── Orders ────────────────────────────────────────────────────────────── */
type F = "all" | "Delivered" | "Confirmed" | "Awaiting confirmation" | "Draft";
function Orders({ s }: { s: DemoState }) {
  const t = poTotals(s);
  const [f, setF] = useState<F>("all");
  const [open, setOpen] = useState<string | null>(null);
  const rows = pos(s).filter((p) => f === "all" || p.status === f);
  return (
    <Page title="Purchase orders" sub="Job-specific orders. Listed value includes drafts and is not an authorised purchasing total.">
      <Grid cols="repeat(4, minmax(0,1fr))" style={{ marginBottom: 14 }}>
        <Stat label="Order records" value={String(t.count)} sub={t.delivered + " delivered, " + t.confirmed + " confirmed, " + t.awaiting + " awaiting, " + t.draft + " draft"} />
        <Stat label="Listed net value (incl. draft)" value={eur(t.listed)} />
        <Stat label="Non-draft orders" value={eur(t.nonDraft)} sub="Delivered, confirmed or awaiting" />
        <Stat label="Awaiting supplier" value={String(t.awaiting)} tone={t.awaiting ? "warn" : "ok"} sub="Confirmations outstanding" />
      </Grid>
      <div className="r-scroll-x" style={{ marginBottom: 12 }}>
        <Seg<F> value={f} onChange={setF} options={[
          { id: "all", label: "All " + t.count }, { id: "Delivered", label: "Delivered " + t.delivered }, { id: "Confirmed", label: "Confirmed " + t.confirmed },
          { id: "Awaiting confirmation", label: "Awaiting " + t.awaiting }, { id: "Draft", label: "Draft " + t.draft }]} />
      </div>
      <Panel pad={false}>
        <Table<PoView>
          keyOf={(p) => p.id} rows={rows} onRow={(p) => setOpen(p.id)} empty="No orders in this state."
          cols={[
            { k: "id", label: "Order", w: ".9fr", render: (p) => <strong>{p.id}</strong> },
            { k: "j", label: "Job", w: "1.5fr", render: (p) => <JobLink id={p.job} /> },
            { k: "s", label: "Supplier", w: "1.4fr", hideSm: true, render: (p) => supplier(p.supplier)?.name },
            { k: "q", label: "Quantity", w: "1.2fr", render: (p) => p.material + " " + (p.receivedQty ?? p.qty) + " t × " + eur(p.unit) },
            { k: "v", label: "Value", w: ".9fr", align: "right", render: (p) => <span className="r-num">{eur(p.value)}</span> },
            { k: "st", label: "Status", w: "1.3fr", render: (p) => <StateBadge state={p.status} /> },
            { k: "t", label: "Cost", w: "1.1fr", hideSm: true, render: (p) => <Badge tone={p.posted ? "ok" : p.status === "Draft" ? "neutral" : "info"}>{treatment(p)}</Badge> },
            { k: "w", label: "Window", w: "1.1fr", render: (p) => fmtDT(p.window) },
          ]}
          foot={<span>Listed net value {eur(t.listed)} across {t.count} records, including {t.draft} draft. Non-draft orders {eur(t.nonDraft)}. These orders are part of the job cost model, not all monthly material costs.</span>}
        />
      </Panel>
      {open && <PoSheet s={s} id={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}

/* ── Deliveries agenda ─────────────────────────────────────────────────── */
function Deliveries({ s }: { s: DemoState }) {
  const list = pos(s).slice().sort((a, b) => a.window.localeCompare(b.window));
  const days = Array.from(new Set(list.map((p) => dayOf(p.window))));
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Page title="Deliveries and collections" sub="By date and time. Supplier confirmation and transport are tracked separately: one does not clear the other.">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {days.map((d) => (
          <Panel key={d} title={fmtDate(d, "long")} sub={rel(d, s.clock)} pad={false}>
            <div style={{ padding: "0 20px 8px" }}>
              {list.filter((p) => dayOf(p.window) === d).map((p) => {
                const tr = transportFor(s, p);
                const focus = p.status === "Awaiting confirmation" || p.status === "Confirmed" || p.status === "Draft";
                return (
                  <div key={p.id} className="r-li" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ flex: "none", width: 64 }}>
                      <div style={{ fontSize: 18, fontWeight: 600 }} className="r-num">{fmtTime(p.window)}</div>
                    </div>
                    <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                      <div style={{ fontSize: 13.5 }}>
                        <button type="button" className="r-link" onClick={() => setOpen(p.id)}>{p.id}</button> {p.material} {p.receivedQty ?? p.qty} t from {supplier(p.supplier)?.name}
                      </div>
                      <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>For <JobLink id={p.job} /></div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8, fontSize: 12.5 }}>
                        <span>Supplier <StateBadge state={p.status} /></span>
                        {tr && <span>Transport <StateBadge state={tr.state} /> <span className="r-dim">{tr.detail}</span></span>}
                        {!tr && p.status !== "Delivered" && <span className="r-dim">Delivered by supplier, no truck needed</span>}
                      </div>
                    </div>
                    {focus && (
                      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                        <PoActions p={p} />
                      </div>
                    )}
                    {p.status === "Delivered" && p.ticket && <RecLink r={{ kind: "document", id: p.ticket }}>Delivery ticket</RecLink>}
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
      {open && <PoSheet s={s} id={open} onClose={() => setOpen(null)} />}
    </Page>
  );
}

/* ── Suppliers ─────────────────────────────────────────────────────────── */
function Suppliers({ s }: { s: DemoState }) {
  const all = pos(s);
  const rows = SUPPLIERS.map((x) => {
    const mine = all.filter((p) => p.supplier === x.id);
    const open = mine.filter((p) => p.status !== "Delivered");
    const bills = BILLS.filter((b) => b.supplier === x.id);
    return { ...x, open, awaiting: mine.filter((p) => p.status === "Awaiting confirmation"), bills };
  });
  type R = (typeof rows)[number];
  return (
    <Page title="Suppliers" sub="The same five supplier records used by Materials, Fleet and Finance.">
      <Panel pad={false} style={{ marginBottom: 14 }}>
        <Table<R>
          keyOf={(x) => x.id} rows={rows}
          cols={[
            { k: "n", label: "Supplier", w: "1.6fr", render: (x) => <RecLink r={{ kind: "supplier", id: x.id }}>{x.id} {x.name}</RecLink> },
            { k: "c", label: "Category", w: "1.4fr", hideSm: true, render: (x) => x.category },
            { k: "o", label: "Open orders", w: "1.3fr", render: (x) => (x.open.length ? x.open.map((p) => p.id).join(", ") : <span className="r-dim">None</span>) },
            { k: "a", label: "Awaiting confirmation", w: "1.2fr", render: (x) => (x.awaiting.length ? <Badge tone="warn">{x.awaiting.map((p) => p.id).join(", ")}</Badge> : <span className="r-dim">None</span>) },
            { k: "b", label: "Bills in cash window", w: "1.3fr", render: (x) => (x.bills.length ? x.bills.map((b) => <span key={b.id}><RecLink r={{ kind: "bill", id: b.id }} /> {eur(b.amount)} due {fmtDate(b.due)} </span>) : <span className="r-dim">None</span>) },
          ]}
        />
      </Panel>
      <Grid cols="1fr 1fr">
        <Panel title="Seeded price quotes" sub="Comparisons use only these supplier quotes. No historical savings or performance scores are shown because none were supplied.">
          {SUPPLIER_QUOTES.map((q) => (
            <div key={q.supplier + q.material} className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 13.5 }}>{q.material}</strong> <span className="r-dim">· {supplier(q.supplier)?.name}</span>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{q.note}</div>
              </div>
              <span className="r-num" style={{ fontSize: 15, fontWeight: 600 }}>{eur(q.price)} / {q.unit}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}><Note>One quote per material, so there is nothing to rank yet. Add a second supplier quote to compare.</Note></div>
        </Panel>
        <Panel title="Supplier bills" sub="Cash amounts from the mock bill ledger. Not added again as job costs.">
          {BILLS.map((b) => (
            <div key={b.id} className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}>
                <RecLink r={{ kind: "bill", id: b.id }} /> <span style={{ fontSize: 13 }}>{supplier(b.supplier)?.name}</span>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{b.note}, due {fmtDate(b.due, "dow")}</div>
              </div>
              <span className="r-num">{eur(b.amount)}</span>
            </div>
          ))}
        </Panel>
      </Grid>
    </Page>
  );
}
