/* Finance: management visibility and office review above the existing (unnamed)
   accounting system. Every figure is derived from the shared store. */
import { useState, type ReactNode } from "react";
import { useDemo, go } from "../store";
import { act } from "../actions";
import { BILLS, CASH, COST_LABEL, HIRE, VARIATION } from "../fixtures";
import {
  cash, invoices, jobById, month, monthJobs, pendingApprovals, personName, receivables, scenario, supplier, type CashRow,
} from "../selectors";
import { addDays, dayOf, eur, fmtDate, fmtDT, pct } from "../format";
import {
  Badge, Bar, Btn, Field, Grid, KV, Note, Page, Panel, RecLink, SideSheet, Stat, StateBadge, Table, Toggle, downloadText,
} from "../ui";

type Props = { tab: string; params: Record<string, string> };

const TITLES: Record<string, [string, string]> = {
  overview: ["Finance", "Profit, cash and money owed, kept apart. A management view above the existing accounting system; not statutory accounts."],
  invoices: ["Invoices", "The mock invoice ledger and the J105 draft. Final invoices are issued in the existing accounting system."],
  receivables: ["Receivables", "Who owes what, how late it is, and what the office has done about it."],
  costs: ["Costs", "Job cost lines, supplier bills and overhead allowances, each labelled by source so nothing is counted twice."],
  cash: ["Cash forecast", "Next seven days, 10 to 16 November, from a manually entered bank snapshot. Not an exhaustive accounting forecast."],
  goals: ["Goals", "The November operating-profit target, the gap, and the decisions that would close it."],
  tax: ["Tax review", "Job classification, VAT treatment and RCT applicability, recorded by a person. No automatic determination."],
};

export default function FinancePage({ tab }: Props) {
  const t = TITLES[tab] ? tab : "overview";
  const [title, sub] = TITLES[t];
  return (
    <Page title={title} sub={sub}>
      {t === "overview" && <Overview />}
      {t === "invoices" && <Invoices />}
      {t === "receivables" && <Receivables />}
      {t === "costs" && <Costs />}
      {t === "cash" && <CashForecast />}
      {t === "goals" && <Goals />}
      {t === "tax" && <TaxReview />}
    </Page>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────── */
function Overview() {
  const s = useDemo();
  const b = month(s), r = receivables(s), c = cash(s), ap = pendingApprovals(s);
  const reviews = Object.entries(s.tax).filter(([, v]) => v.status !== "Reviewed");
  return (
    <>
      <Grid cols="1.15fr 1fr">
        <Panel title="Operating profit, November" sub="Management forecast before tax, using illustrative overhead allowances."
          right={<Btn small onClick={() => go("Finance", "goals")}>Open goals</Btn>}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span className="r-num" style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>{eur(b.op)}</span>
            <span className="r-dim" style={{ fontSize: 13 }}>against an example target of {eur(b.target)}</span>
          </div>
          <div style={{ margin: "12px 0 14px" }}><Bar value={b.op} max={Math.max(b.target, b.op)} tone={b.gap > 0 ? "warn" : "ok"} label={pct(b.progress) + " of target"} /></div>
          <KV rows={[
            ["Accepted job value", <span className="r-num">{eur(b.value)}</span>],
            ["Forecast direct costs", <span className="r-num">−{eur(b.cost)}</span>],
            ["Forecast gross profit", <span className="r-num">{eur(b.gp)} ({pct(b.margin, 2)})</span>],
            ["Modelled overhead", <span className="r-num">−{eur(b.overhead)}</span>],
            ["Gap to target", <span className="r-num">{b.gap > 0 ? eur(b.gap) + " short" : eur(-b.gap) + " ahead"}</span>],
          ]} />
        </Panel>
        <Panel title="Cash" sub="Bank cash, not profit. Opening balance is a manual snapshot; there is no live bank feed."
          right={<Btn small onClick={() => go("Finance", "cash")}>Cash forecast</Btn>}>
          <Grid cols="1fr 1fr" gap={10}>
            <Stat label={"Bank snapshot, " + fmtDT(CASH.openingAt)} value={eur(c.opening)} sub="Entered by hand" />
            <Stat label="Projected closing, 16 Nov" value={eur(c.closing)} tone={c.belowBuffer ? "bad" : undefined}
              sub={c.canDelay && !s.cashDelay ? eur(c.delayedClosing) + " if INV-099 slips" : s.cashDelay ? "Delay scenario on" : "Expected receipt settled"} />
          </Grid>
          <Note>Illustrative minimum buffer {eur(c.buffer)}. Receipts are assumptions until they reach the bank.</Note>
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1.15fr">
        <Panel title="Receivables" sub="Invoiced and unpaid. Separate from November job value."
          right={<Btn small onClick={() => go("Finance", "receivables")}>Receivables</Btn>}>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 10 }}>
            <div><div className="r-eyebrow">Open</div><div className="r-num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{eur(r.openTotal)}</div><div className="r-faint" style={{ fontSize: 12 }}>{r.open.length} invoices</div></div>
            <div><div className="r-eyebrow">Overdue</div><div className="r-num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4, color: r.overdueTotal ? "var(--bad)" : undefined }}>{eur(r.overdueTotal)}</div><div className="r-faint" style={{ fontSize: 12 }}>{r.overdue.length} invoice{r.overdue.length === 1 ? "" : "s"}</div></div>
            <div><div className="r-eyebrow">Not yet due</div><div className="r-num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{eur(r.notDue)}</div></div>
          </div>
          <div className="r-list">
            {r.open.map((i) => (
              <div className="r-li" key={i.id}>
                <div style={{ flex: 1, minWidth: 0 }}><RecLink r={{ kind: "invoice", id: i.id }} /> <span className="r-dim">{i.customerName}</span></div>
                <span className="r-num">{eur(i.open)}</span>
                <StateBadge state={i.overdue ? "Overdue " + i.daysOverdue + "d" : "Due " + fmtDate(i.due)} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Decisions waiting" sub="Spending, tax treatment and price changes all need a person.">
          <div className="r-list">
            {ap.map((t) => (
              <div className="r-li" key={t.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}>{t.title}</div>
                  <div className="r-faint" style={{ fontSize: 12, marginTop: 3 }}>{t.ownerName} · due {fmtDT(t.due)} · <RecLink r={t.ref} /></div>
                </div>
                <StateBadge state={t.status} />
              </div>
            ))}
            {!ap.length && <div className="r-empty">No decisions waiting.</div>}
          </div>
          {reviews.length > 0 && <Note tone="warn">{reviews.length} tax review item{reviews.length === 1 ? "" : "s"} open: {reviews.map(([j]) => j).join(", ")}. <button className="r-link" onClick={() => go("Finance", "tax")}>Open tax review</button></Note>}
        </Panel>
      </Grid>
    </>
  );
}

/* ── Invoices ──────────────────────────────────────────────────────────── */
type Inv = ReturnType<typeof invoices>[number];
function Invoices() {
  const s = useDemo();
  const list = invoices(s);
  const [open, setOpen] = useState<string | null>(null);
  const cur = list.find((i) => i.id === open);
  const r = receivables(s);
  return (
    <>
      <Panel title="Invoice ledger" sub="Simulated contractor invoices with office-reviewed treatment. Net amounts; these four cases carry reverse-charge VAT and a fictional 0% RCT authorisation, so cash equals net." pad={false}>
        <Table<Inv> keyOf={(i) => i.id} rows={list} onRow={(i) => setOpen(i.id)}
          cols={[
            { k: "id", label: "Invoice", w: "0.8fr", render: (i) => <span style={{ fontWeight: 500 }}>{i.id}</span> },
            { k: "c", label: "Customer / job", w: "1.4fr", render: (i) => <span>{i.customerName} <span className="r-faint">{i.job}</span></span> },
            { k: "n", label: "Net", w: "0.8fr", align: "right", render: (i) => <span className="r-num">{eur(i.amount)}</span> },
            { k: "v", label: "VAT treatment", w: "1.3fr", hideSm: true, render: (i) => <span className="r-dim" style={{ fontSize: 12 }}>{i.vat}</span> },
            { k: "r", label: "RCT evidence", w: "1.2fr", hideSm: true, render: (i) => <span className="r-dim" style={{ fontSize: 12 }}>{i.rct}</span> },
            { k: "s", label: "Settled", w: "0.8fr", align: "right", render: (i) => <span className="r-num">{eur(i.settled)}</span> },
            { k: "o", label: "Open", w: "0.8fr", align: "right", render: (i) => <span className="r-num" style={{ color: i.overdue ? "var(--bad)" : undefined }}>{eur(i.open)}</span> },
            { k: "st", label: "Status", w: "0.9fr", render: (i) => <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue " + i.daysOverdue + "d" : "Not yet due"} /> },
          ]}
          foot={<span>Face value {eur(r.face)} · settled {eur(r.settled)} · open {eur(r.openTotal)}. INV-099 is October work: collecting it is cash, not new November revenue.</span>} />
      </Panel>
      <div style={{ height: 14 }} />
      <DraftInvoice />
      {cur && <InvoiceSheet inv={cur} onClose={() => setOpen(null)} />}
    </>
  );
}

function InvoiceSheet({ inv, onClose }: { inv: Inv; onClose: () => void }) {
  return (
    <SideSheet title={inv.id + ", " + inv.customerName} sub={"Job " + inv.job + " · issued " + fmtDate(inv.issued, "long")} onClose={onClose}
      footer={<>
        {inv.open > 0 && <Btn kind="primary" onClick={() => act.simulatePayment(inv.id)}>Simulate payment received</Btn>}
        <Btn onClick={() => { onClose(); go("Finance", "receivables"); }}>Open receivables</Btn>
      </>}>
      <KV rows={[
        ["Customer", <RecLink r={{ kind: "customer", id: inv.customer }}>{inv.customerName}</RecLink>],
        ["Job", <RecLink r={{ kind: "job", id: inv.job }} />],
        ["Net service amount", <span className="r-num">{eur(inv.amount)}</span>],
        ["Due", fmtDate(inv.due, "long")],
        ["VAT treatment", inv.vat],
        ["RCT", inv.rct],
        ["Evidence", <RecLink r={{ kind: "document", id: inv.evidence }}>Office review evidence</RecLink>],
        ["Settled", <span className="r-num">{eur(inv.settled)}</span>],
        ["Open balance", <span className="r-num">{eur(inv.open)}</span>],
        ["Promise to pay", inv.promise ? fmtDate(inv.promise.date, "long") + " (recorded " + fmtDT(inv.promise.at) + ")" : "None recorded"],
        ["Source", "Mock ledger fixture. Existing accounting product not named; sample import only."],
      ]} />
      <div>
        <div className="r-eyebrow" style={{ marginBottom: 8 }}>Payments</div>
        {inv.payments.length ? inv.payments.map((p) => (
          <div key={p.id} className="r-li"><span style={{ flex: 1 }}>{fmtDate(p.date, "long")} · {p.note}</span><span className="r-num">{eur(p.amount)}</span></div>
        )) : <div className="r-dim" style={{ fontSize: 13 }}>No payments recorded.</div>}
      </div>
    </SideSheet>
  );
}

function vatAmount(vat: string | undefined, net: number): number | null {
  if (vat && vat.includes("13.5%")) return Math.round(net * 0.135);
  return null;
}

function DraftInvoice() {
  const s = useDemo();
  const j = jobById(s, "J105")!;
  const tax = s.tax.J105;
  const reviewed = tax?.status === "Reviewed";
  const preview = !!s.invoicePreview.J105;
  const vat = vatAmount(tax?.vat, j.value);
  const steps: [string, boolean][] = [
    ["Job completion recorded", j.status === "Completed"],
    ["Tax treatment reviewed by a person", reviewed],
    ["Local preview prepared", preview],
    ["Issued in the existing accounting system", false],
  ];
  return (
    <Panel title="Draft invoice: J105 Dunlavin private driveway" sub="Blocked from finalisation until the tax review is complete. Nothing here is sent or posted."
      tone={reviewed ? undefined : "warn"}
      right={<StateBadge state={preview ? "Preview ready" : reviewed ? "Ready to preview" : "Blocked: needs tax review"} />}>
      <Grid cols="1fr 1.2fr" gap={18}>
        <div>
          <KV rows={[
            ["Customer", <RecLink r={{ kind: "customer", id: j.customer }}>{j.customerName}</RecLink>],
            ["Job", <RecLink r={{ kind: "job", id: j.id }}>{j.id} {j.name}</RecLink>],
            ["Net value", <span className="r-num">{eur(j.value)}</span>],
            ["VAT treatment", reviewed ? tax.vat : "Needs review"],
            ["RCT", reviewed ? tax.rct : "Needs review"],
            ["Reviewer", reviewed ? personName(tax.reviewer || "") + ", " + fmtDT(tax.at || "") : "Joe (not yet reviewed)"],
          ]} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {!reviewed && <Btn kind="primary" onClick={() => go("Finance", "tax")}>Go to tax review</Btn>}
            <Btn kind={reviewed ? "primary" : "ghost"} disabled={!reviewed ? "Complete the J105 tax review first" : preview ? "Preview already prepared" : false}
              onClick={() => act.previewInvoice("J105")}>Prepare local preview</Btn>
          </div>
        </div>
        <div>
          <div className="r-eyebrow" style={{ marginBottom: 8 }}>Workflow</div>
          {steps.map(([label, ok], i) => (
            <div key={i} className="r-li" style={{ alignItems: "center" }}>
              <span className="r-num r-faint" style={{ width: 18 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
              <StateBadge state={ok ? "Done" : i === 0 ? "Live job" : i === 3 ? "Outside Pulse" : "Pending"} />
            </div>
          ))}
          {preview && (
            <div className="r-note" style={{ marginTop: 12 }}>
              <div className="r-eyebrow" style={{ marginBottom: 6 }}>Local preview, not an issued invoice</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>{j.scope}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span>Net</span><span className="r-num">{eur(j.value)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>VAT ({tax.vat})</span><span className="r-num">{vat != null ? eur(vat) : "Per reviewed treatment"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: 4 }}><span>Total</span><span className="r-num">{vat != null ? eur(j.value + vat) : eur(j.value) + " net"}</span></div>
              <div style={{ marginTop: 10 }}>
                <Btn small onClick={() => downloadText("J105-draft-invoice-preview.txt",
                  "DRAFT INVOICE PREVIEW (demo, not issued)\nReynolds Asphalt Contractors\n\nCustomer: " + j.customerName + "\nJob: " + j.id + " " + j.name + "\n" + j.scope +
                  "\n\nNet: " + eur(j.value) + "\nVAT treatment: " + tax.vat + (vat != null ? " (" + eur(vat) + ")" : "") + "\nRCT: " + tax.rct +
                  "\nReviewed by: " + personName(tax.reviewer || "") + " at " + fmtDT(tax.at || "") + "\n\nIssue the final invoice in the existing accounting system.\n")}>Save preview as text</Btn>
              </div>
            </div>
          )}
        </div>
      </Grid>
    </Panel>
  );
}

/* ── Receivables ───────────────────────────────────────────────────────── */
function Receivables() {
  const s = useDemo();
  const r = receivables(s);
  const inv = r.invoices.find((i) => i.id === "INV-099")!;
  const [promise, setPromise] = useState(addDays(s.clock, 3));
  const buckets: [string, number, "bad" | "warn" | "neutral"][] = [
    ["Overdue 1 to 30 days", r.b1_30, "warn"], ["Overdue 31 to 60 days", r.b31_60, "bad"], ["Overdue 60+ days", r.b60, "bad"], ["Not yet due", r.notDue, "neutral"],
  ];
  const max = Math.max(1, ...buckets.map((b) => b[1]));
  const draft = "Hi,\n\nOur records show " + inv.id + " for " + inv.customerName + " (" + inv.job + ", Kilteel access road) has " + eur(inv.open) +
    " outstanding. It was due on " + fmtDate(inv.due, "long") + ", " + inv.daysOverdue + " days ago. " + eur(inv.settled) +
    " has already been received, thank you.\n\nCould you let us know when the balance will be paid?\n\nAoife Brennan\nReynolds Asphalt Contractors";
  return (
    <>
      <Grid cols="1fr 1.3fr">
        <Panel title="Ageing" sub={r.open.length + " outstanding, " + r.overdue.length + " overdue. Totals derived from invoice rows."}>
          {buckets.map(([label, v, tone]) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "4px 10px", alignItems: "center", margin: "10px 0" }}>
              <span style={{ fontSize: 13 }}>{label}</span>
              <span className="r-num" style={{ textAlign: "right", fontSize: 13 }}>{eur(v)}</span>
              <div style={{ gridColumn: "1 / -1" }}><Bar value={v} max={max} tone={v ? tone : "neutral"} label={label + " " + eur(v)} /></div>
            </div>
          ))}
          <Note>Open total {eur(r.openTotal)}. A promise to pay changes expected timing only; a recorded receipt changes the balance.</Note>
        </Panel>
        <Panel title={"Follow-up: " + inv.id + ", " + inv.customerName}
          sub={inv.open ? eur(inv.open) + " open, " + inv.daysOverdue + " days overdue" : "Paid in full"}
          right={<StateBadge state={inv.open === 0 ? "Paid" : inv.promise ? "Promise recorded" : inv.reminderReviewed ? "Reviewed" : "Draft ready"} />}>
          {inv.open > 0 ? (
            <>
              <div className="r-eyebrow" style={{ margin: "4px 0 8px" }}>Prepared reminder · Draft, not sent, no email provider connected</div>
              <pre className="r-note" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{draft}</pre>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <Btn disabled={inv.reminderReviewed ? "Reviewed " + fmtDT(inv.reminderReviewed) : false} onClick={() => act.reviewReminder(inv.id)}>Mark draft reviewed</Btn>
                <Btn kind="quiet" onClick={() => downloadText(inv.id + "-reminder-draft.txt", draft)}>Save draft as text</Btn>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 16 }}>
                <Field label="Customer response: promised payment date">
                  <input type="date" className="r-input" value={promise} min={dayOf(s.clock)} onChange={(e) => setPromise(e.target.value)} />
                </Field>
                <Btn kind="primary" disabled={!promise ? "Pick a date" : false} onClick={() => act.recordPromise(inv.id, promise)}>Record promise to pay</Btn>
              </div>
              {inv.promise && <Note tone="warn">Promised for {fmtDate(inv.promise.date, "long")}. Balance stays {eur(inv.open)} until a receipt is recorded.</Note>}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="r-dim" style={{ fontSize: 12.5, flex: "1 1 220px" }}>Separate step: record money reaching the bank. Moves {eur(inv.open)} from expected receipts into actual cash.</span>
                <Btn onClick={() => act.simulatePayment(inv.id)}>Simulate payment received</Btn>
              </div>
            </>
          ) : <Note tone="ok">Receipt recorded. Cash history updated; no further follow-up.</Note>}
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="Outstanding invoices" pad={false}>
        <Table<Inv> keyOf={(i) => i.id} rows={r.open}
          empty="Nothing outstanding."
          cols={[
            { k: "i", label: "Invoice", w: "0.8fr", render: (i) => <RecLink r={{ kind: "invoice", id: i.id }} /> },
            { k: "c", label: "Customer", w: "1.4fr", render: (i) => <RecLink r={{ kind: "customer", id: i.customer }}>{i.customerName}</RecLink> },
            { k: "d", label: "Due", w: "0.9fr", render: (i) => fmtDate(i.due, "dow") },
            { k: "o", label: "Open", w: "0.8fr", align: "right", render: (i) => <span className="r-num">{eur(i.open)}</span> },
            { k: "s", label: "Status", w: "1fr", render: (i) => <StateBadge state={i.overdue ? "Overdue " + i.daysOverdue + "d" : "Not yet due"} /> },
            { k: "a", label: "", w: "1.1fr", align: "right", render: (i) => <Btn small onClick={() => act.simulatePayment(i.id)}>Simulate receipt</Btn> },
          ]} />
      </Panel>
    </>
  );
}

/* ── Costs ─────────────────────────────────────────────────────────────── */
function Costs() {
  const s = useDemo();
  const j = jobById(s, "J104")!;
  const b = month(s);
  const js = monthJobs(s);
  type L = (typeof j.lines)[number];
  return (
    <>
      <Note>Three separate sources. Job cost lines are the direct-cost forecast. Supplier bills are cash payments from the mock bill ledger and are not added to job costs again. Overheads are illustrative allowances, charged once at business level.</Note>
      <div style={{ height: 14 }} />
      <Panel title={<>J104 cost lines · <RecLink r={{ kind: "job", id: "J104" }}>Naas distribution yard</RecLink></>}
        sub={"Source: job cost model. Budget " + eur(j.budget) + ", forecast final " + eur(j.forecast) + ", overrun " + eur(j.overrun) + "."} right={<Badge tone="info">Direct cost</Badge>} pad={false}>
        <Table<L> keyOf={(l) => l.cat} rows={j.lines}
          cols={[
            { k: "c", label: "Category", w: "1.3fr", render: (l) => COST_LABEL[l.cat] },
            { k: "b", label: "Budget", w: "0.8fr", align: "right", render: (l) => <span className="r-num">{eur(l.budget)}</span> },
            { k: "p", label: "Posted", w: "0.8fr", align: "right", render: (l) => <span className="r-num">{eur(l.posted)}</span> },
            { k: "r", label: "Remaining", w: "0.8fr", align: "right", render: (l) => <span className="r-num">{eur(l.remaining)}</span> },
            { k: "f", label: "Forecast", w: "0.8fr", align: "right", render: (l) => <span className="r-num">{eur(l.forecast)}</span> },
            { k: "v", label: "Variance", w: "0.8fr", align: "right", render: (l) => <span className="r-num" style={{ color: l.variance > 0 ? "var(--bad)" : "var(--dim)" }}>{l.variance ? eur(l.variance, { sign: true }) : "0"}</span> },
          ]}
          foot={<span>Totals: budget {eur(j.budget)} · posted {eur(j.posted)} · remaining {eur(j.remaining)} · forecast {eur(j.forecast)}. V104-01's extra work cost is already inside the forecast.</span>} />
      </Panel>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1fr">
        <Panel title="Supplier bills" sub="Source: mock bill ledger. Cash payments due 10 to 16 Nov." right={<Badge tone="neutral">Cash payment</Badge>} pad={false}>
          <Table<(typeof BILLS)[number]> keyOf={(x) => x.id} rows={BILLS}
            cols={[
              { k: "i", label: "Bill", w: "0.6fr", render: (x) => x.id },
              { k: "s", label: "Supplier", w: "1.5fr", render: (x) => <RecLink r={{ kind: "supplier", id: x.supplier }}>{supplier(x.supplier)?.name}</RecLink> },
              { k: "d", label: "Due", w: "0.8fr", render: (x) => fmtDate(x.due, "dow") },
              { k: "a", label: "Amount", w: "0.8fr", align: "right", render: (x) => <span className="r-num">{eur(x.amount)}</span> },
            ]}
            foot={"Total " + eur(BILLS.reduce((a, x) => a + x.amount, 0)) + ". Not added to job forecasts; those costs are already in the job lines or earlier periods."} />
        </Panel>
        <Panel title="Overhead model, November" sub="Source: illustrative allowances. Charged once, below gross profit." right={<Badge tone="accent">Overhead</Badge>} pad={false}>
          <Table<(typeof b.overheadLines)[number]> keyOf={(o) => o.id} rows={b.overheadLines}
            cols={[
              { k: "l", label: "Allowance", w: "2fr", render: (o) => <span>{o.label}{o.note && <span className="r-faint" style={{ display: "block", fontSize: 11.5, marginTop: 2 }}>{o.note}</span>}</span> },
              { k: "a", label: "Amount", w: "0.8fr", align: "right", render: (o) => <span className="r-num">{eur(o.amount)}</span> },
            ]}
            foot={"Total " + eur(b.overhead) + ". Approving the €680 repair adds nothing; it is inside the maintenance line."} />
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="All November jobs, direct cost" sub="Posted plus remaining equals forecast final cost on every job." pad={false}>
        <Table<(typeof js)[number]> keyOf={(x) => x.id} rows={js}
          cols={[
            { k: "j", label: "Job", w: "1.8fr", render: (x) => <RecLink r={{ kind: "job", id: x.id }}>{x.id} {x.name}</RecLink> },
            { k: "s", label: "Status", w: "0.9fr", render: (x) => <StateBadge state={x.status} /> },
            { k: "p", label: "Posted", w: "0.8fr", align: "right", render: (x) => <span className="r-num">{eur(x.posted)}</span> },
            { k: "r", label: "Remaining", w: "0.8fr", align: "right", hideSm: true, render: (x) => <span className="r-num">{eur(x.remaining)}</span> },
            { k: "f", label: "Forecast", w: "0.8fr", align: "right", render: (x) => <span className="r-num">{eur(x.forecast)}</span> },
          ]}
          foot={"Forecast direct costs " + eur(b.cost) + " across " + js.length + " November jobs."} />
      </Panel>
    </>
  );
}

/* ── Cash forecast ─────────────────────────────────────────────────────── */
function CashForecast() {
  const s = useDemo();
  const c = cash(s);
  const hireProposed = s.hire === "Proposed";
  const top = Math.max(c.opening, ...c.days.map((d) => d.balance), c.buffer) * 1.08;
  const kindLabel: Record<CashRow["kind"], string> = { opening: "Snapshot", receipt: "Expected receipt", received: "Received", supplier: "Supplier bill", wages: "Day wages", fixed: "Fixed", hire: "Hire", delayed: "Excluded" };
  return (
    <>
      <Grid cols="1.5fr 1fr">
        <Panel title="Daily closing balance" sub="Projected bank balance at the end of each day. Dashed line is the illustrative minimum buffer.">
          <div style={{ position: "relative", height: 180, display: "flex", alignItems: "flex-end", gap: 8, padding: "10px 0 0" }}>
            <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 22 + (c.buffer / top) * 148, borderTop: "1px dashed var(--warn)" }} />
            {c.days.map((d) => (
              <div key={d.date} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span className="r-num" style={{ fontSize: 10.5, color: "var(--dim)" }}>{Math.round(d.balance / 100) / 10}k</span>
                <div title={fmtDate(d.date, "dow") + ": " + eur(d.balance)} style={{ width: "100%", maxWidth: 46, height: Math.max(2, (d.balance / top) * 148), borderRadius: "6px 6px 2px 2px", background: d.balance < c.buffer ? "var(--bad)" : "var(--accent)", opacity: d.date === c.days[c.days.length - 1].date ? 1 : 0.7 }} />
                <span style={{ fontSize: 11, color: "var(--faint)" }}>{fmtDate(d.date, "dow").slice(0, 3)} {d.date.slice(8, 10).replace(/^0/, "")}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Projection">
          <Stat big label="Projected closing, 16 Nov" value={eur(c.closing)} tone={c.belowBuffer ? "bad" : undefined} sub={"Opening snapshot " + eur(c.opening) + " · buffer " + eur(c.buffer)} />
          <div style={{ marginTop: 12 }}>
            <Toggle on={s.cashDelay} onChange={(v) => act.setCashDelay(v)} disabled={!c.canDelay ? "INV-099 has been received" : false}
              label="INV-099 receipt is delayed past 16 Nov"
              sub={c.canDelay ? (s.cashDelay ? "Excluded. Closing " + eur(c.closing) + "." : "Closing would fall to " + eur(c.delayedClosing) + ".") : "Nothing expected left to delay."} />
          </div>
          <Note tone={hireProposed ? "neutral" : "warn"}>
            {hireProposed ? <>If Joe approves <RecLink r={{ kind: "hire", id: HIRE.id }} />, {eur(HIRE.cost)} goes out on 11 Nov and closing falls to {eur(c.closing - HIRE.cost)}.</>
              : <>HIR-01 approved: {eur(HIRE.cost)} included on 11 Nov.</>}
          </Note>
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="Cash movements, 10 to 16 November" sub="Ordered by date. Receipts are assumptions until received." pad={false}>
        <Table<CashRow> keyOf={(r) => r.id} rows={c.rows}
          cols={[
            { k: "d", label: "Date", w: "0.8fr", render: (r) => fmtDate(r.date, "dow") },
            { k: "l", label: "Movement", w: "2.4fr", render: (r) => <span style={{ opacity: r.counted ? 1 : 0.55 }}>{r.ref ? <RecLink r={r.ref}>{r.label}</RecLink> : r.label}{r.note && <span className="r-faint" style={{ display: "block", fontSize: 11.5 }}>{r.note}</span>}</span> },
            { k: "k", label: "Type", w: "1fr", hideSm: true, render: (r) => <Badge tone={r.kind === "delayed" ? "warn" : r.amount >= 0 ? "ok" : "neutral"}>{kindLabel[r.kind]}</Badge> },
            { k: "a", label: "Amount", w: "0.9fr", align: "right", render: (r) => <span className="r-num" style={{ color: !r.counted ? "var(--faint)" : r.amount < 0 ? "var(--ink)" : "var(--ok)", textDecoration: r.counted ? undefined : "line-through" }}>{r.kind === "opening" ? eur(r.amount) : eur(r.amount, { sign: true })}</span> },
          ]}
          foot={<span>Closing {eur(c.closing)} = sum of counted rows. The €680 TRK-02 repair is payable outside this window.</span>} />
      </Panel>
      <div style={{ height: 14 }} />
      <Panel title="Basis and gaps" sub="What this projection assumes and what it leaves out.">
        <details open>
          <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--body)" }}>Assumptions</summary>
          <ul style={{ margin: "8px 0 12px", paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--body)" }}>
            <li>Opening balance {eur(CASH.opening)} entered by hand at {fmtDT(CASH.openingAt)}. No live bank feed.</li>
            <li>INV-099 expected {fmtDate(c.receiptAt || CASH.receiptExpected, "dow")}{s.promises["INV-099"] ? " (customer promise)" : " (office assumption)"}.</li>
            <li>The four listed supplier bills ({eur(c.supplierOut)}) are the only supplier payments in this window.</li>
            <li>Day wages {eur(c.wages)} on {fmtDate(CASH.wagesDate, "dow")}: expected gross day wages, not total employer cost.</li>
            <li>Other fixed payments {eur(c.fixed)} on {fmtDate(CASH.fixedDate, "dow")} are an allowance.</li>
          </ul>
        </details>
        <details>
          <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--body)" }}>Not supplied, so not included</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--body)" }}>
            {CASH.omitted.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </details>
      </Panel>
    </>
  );
}

/* ── Goals ─────────────────────────────────────────────────────────────── */
function Goals() {
  const s = useDemo();
  const b = month(s), sc = scenario(s);
  const [draft, setDraft] = useState(String(s.target));
  const save = () => { const n = Number(draft); if (n > 0 && n !== s.target) act.setTarget(n); else setDraft(String(s.target)); };
  const committed: ReactNode[] = [];
  if (sc.varIn) committed.push(<>V104-01 accepted by the customer: +{eur(VARIATION.price)} in agreed value.</>);
  if (sc.hireIn) committed.push(<>HIR-01 approved: {eur(HIRE.cost)} added to modelled overhead.</>);
  const col = (label: string, op: number, prog: number, tone: "neutral" | "accent", note: ReactNode) => (
    <div className="r-stat" style={{ borderColor: tone === "accent" ? "var(--accent-line)" : undefined, borderStyle: tone === "accent" ? "dashed" : undefined }}>
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value r-num" style={{ fontSize: 28 }}>{eur(op)}</div>
      <div style={{ margin: "10px 0 6px" }}><Bar value={op} max={Math.max(s.target, op, sc.op, b.op)} tone={tone === "accent" ? "accent" : op >= s.target ? "ok" : "warn"} /></div>
      <div className="r-stat-sub">{pct(prog)} of target · {op >= s.target ? eur(op - s.target) + " above" : eur(s.target - op) + " short"}</div>
      <div className="r-stat-sub">{note}</div>
    </div>
  );
  return (
    <>
      <Grid cols="1fr 1.6fr">
        <Panel title="November target" sub="Interpreted as operating profit after modelled overheads, before tax. Florin gave €5,000 as an example; edit it here.">
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            <Field label="Monthly operating-profit target (€)">
              <input className="r-input" type="number" min={1} step={100} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }} style={{ width: 150 }} />
            </Field>
            <Btn onClick={save}>Save</Btn>
          </div>
          <div style={{ marginTop: 16 }}>
            <KV rows={[
              ["Forecast operating profit", <span className="r-num">{eur(b.op)}</span>],
              ["Gap", <span className="r-num">{b.gap > 0 ? eur(b.gap) : "None, " + eur(-b.gap) + " ahead"}</span>],
              ["Progress", <span className="r-num">{pct(b.progress)}</span>],
            ]} />
          </div>
          <Note>Management forecast with illustrative allowances. No year-on-year comparison: history was not supplied.</Note>
        </Panel>
        <Panel title="Baseline and scenario" sub="The baseline only moves when a real state change happens. Scenario toggles never rewrite it.">
          <Grid cols="1fr 1fr" gap={10}>
            {col("Baseline forecast", b.op, b.progress, "neutral", "Committed state only")}
            {col("With selected scenarios", sc.op, sc.progress, "accent", sc.active ? "Scenario, not committed" : "No scenario selected")}
          </Grid>
          <div style={{ marginTop: 14 }}>
            <Toggle on={s.scenario.variation && !sc.varIn} onChange={(v) => act.setScenario("variation", v)} disabled={sc.varIn ? "Already accepted and in the baseline" : false}
              label={"Customer accepts V104-01, +" + eur(VARIATION.price)} sub={sc.varIn ? "Already in baseline" : "Variation status: " + s.variation} />
            <Toggle on={s.scenario.hire && !sc.hireIn} onChange={(v) => act.setScenario("hire", v)} disabled={sc.hireIn ? "Already approved and in the baseline" : false}
              label={"Approve one day of replacement transport, −" + eur(HIRE.cost)} sub={sc.hireIn ? "Already in baseline" : "Business-level contingency, not charged to J105"} />
          </div>
          <div className="r-faint" style={{ fontSize: 12, marginTop: 8 }}>
            Scenario: revenue {eur(sc.revenue)} · direct costs {eur(sc.cost)} (unchanged by convention) · overhead {eur(sc.overhead)} · change {eur(sc.delta, { sign: true })}
          </div>
          {committed.length > 0 && <Note tone="ok"><div className="r-eyebrow" style={{ marginBottom: 4 }}>Committed changes in baseline</div>{committed.map((c, i) => <div key={i}>{c}</div>)}</Note>}
        </Panel>
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="What closes the gap" sub="Who must act and the evidence needed. Internal approval of a variation is not customer acceptance.">
        <Grid cols="1fr 1fr" gap={18}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>Variation <RecLink r={{ kind: "variation", id: "V104-01" }} /></span>
              <StateBadge state={s.variation} />
            </div>
            <ol style={{ margin: "10px 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--body)" }}>
              <li>Florin reviews and approves the draft internally (<RecLink r={{ kind: "task", id: "W007" }} />). Agreed value unchanged.</li>
              <li>Naas Logistics Park accepts the {eur(VARIATION.price)} price. Only this changes J104 to {eur(24000 + VARIATION.price)}.</li>
            </ol>
            <div className="r-dim" style={{ fontSize: 12.5 }}>Evidence: <RecLink r={{ kind: "document", id: "D02" }}>V104-01 variation draft</RecLink>, <RecLink r={{ kind: "document", id: "D01" }}>J104 accepted quote</RecLink></div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Btn disabled={s.variation !== "Draft" ? "Already approved internally" : false} onClick={() => act.approveVariationInternally()}>Approve internally (Florin)</Btn>
              <Btn kind="primary" disabled={s.variation === "Draft" ? "Approve internally first" : s.variation === "Customer accepted" ? "Already accepted" : false}
                onClick={() => act.recordCustomerAcceptance()}>Record customer acceptance</Btn>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>Replacement transport <RecLink r={{ kind: "hire", id: HIRE.id }} /></span>
              <StateBadge state={s.hire} />
            </div>
            <ol style={{ margin: "10px 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "var(--body)" }}>
              <li>Joe approves the {eur(HIRE.cost)} one-day hire for 11 Nov (<RecLink r={{ kind: "task", id: "W003" }} />).</li>
              <li>It costs profit but protects the J105 surfacing day. It does not confirm the asphalt (<RecLink r={{ kind: "po", id: "PO-204" }} />).</li>
            </ol>
            <div className="r-dim" style={{ fontSize: 12.5 }}>Evidence: <RecLink r={{ kind: "document", id: "D05" }}>Replacement-transport quotation</RecLink></div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Btn kind="primary" disabled={s.hire !== "Proposed" ? "Already approved" : false} onClick={() => act.approveHire()}>Approve hire (Joe)</Btn>
            </div>
          </div>
        </Grid>
      </Panel>
    </>
  );
}

/* ── Tax review ────────────────────────────────────────────────────────── */
const VAT_OPTIONS = ["Not determined", "Charge VAT at 13.5% (rate selected by reviewer)", "Reverse charge: customer self-accounts", "Other treatment, see note"];
const RCT_OPTIONS = ["Not determined", "Not applicable: private customer, reviewer-confirmed", "Applicable: principal contractor, deduction authorisation on file", "Other, see note"];

function TaxReview() {
  const s = useDemo();
  const inv = invoices(s);
  return (
    <>
      <Note>RCT is Relevant Contracts Tax, a withholding mechanism between principal contractors and subcontractors. It is separate from VAT, and VAT reverse charge is a separate field again. Unknown treatment stays "Needs review". There is no ROS connection, no return or payment, and no automatic rate assignment; Revenue guidance is background for these fields only.</Note>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1fr">
        <ReviewCard job="J105" classification="Private customer, residential driveway" />
        <ReviewCard job="J104" classification="Commercial customer, distribution yard" />
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="Historical issued invoices" sub="Simulated contractor records reviewed by the office. Seed assumptions, not tax facts about Reynolds, and never copied to new jobs." pad={false}>
        <Table<Inv> keyOf={(i) => i.id} rows={inv}
          cols={[
            { k: "i", label: "Invoice", w: "0.8fr", render: (i) => <RecLink r={{ kind: "invoice", id: i.id }} /> },
            { k: "c", label: "Classification", w: "1.3fr", render: (i) => <span>Contractor · {i.customerName}</span> },
            { k: "v", label: "VAT", w: "1.4fr", render: (i) => <span style={{ fontSize: 12.5 }}>{i.vat}</span> },
            { k: "r", label: "RCT", w: "1.3fr", hideSm: true, render: (i) => <span style={{ fontSize: 12.5 }}>{i.rct}</span> },
            { k: "e", label: "Evidence", w: "0.9fr", render: (i) => <RecLink r={{ kind: "document", id: i.evidence }}>{i.evidence}</RecLink> },
            { k: "d", label: "Reviewed", w: "0.8fr", hideSm: true, render: (i) => fmtDate(i.issued) },
          ]} />
      </Panel>
    </>
  );
}

function ReviewCard({ job, classification }: { job: string; classification: string }) {
  const s = useDemo();
  const j = jobById(s, job)!;
  const t = s.tax[job];
  const [vat, setVat] = useState(VAT_OPTIONS[0]);
  const [rct, setRct] = useState(RCT_OPTIONS[0]);
  const reviewed = t?.status === "Reviewed";
  const ready = vat !== "Not determined" && rct !== "Not determined";
  return (
    <Panel title={<><RecLink r={{ kind: "job", id: job }}>{job} {j.name}</RecLink></>} sub={j.customerName + " · " + eur(j.value) + " net"}
      right={<StateBadge state={t?.status || "Needs review"} />} tone={reviewed ? undefined : "warn"}>
      <KV rows={[
        ["Job / customer classification", classification],
        ["VAT treatment", reviewed ? t.vat : "Needs review"],
        ["RCT applicability", reviewed ? t.rct : "Needs review"],
        ["Authorisation / evidence", job === "J104" ? <RecLink r={{ kind: "document", id: "D01" }}>J104 accepted quote (contract relationship to inspect)</RecLink> : <RecLink r={{ kind: "document", id: "D03" }}>J105 site note</RecLink>],
        ["Reviewer", reviewed ? personName(t.reviewer || "") : "Joe (assigned)"],
        ["Review date", reviewed ? fmtDT(t.at || "") : "Not reviewed"],
      ]} />
      {t?.note && !reviewed && <Note>{t.note}</Note>}
      {!reviewed && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="r-eyebrow">Record human review (as Joe, simulated)</div>
          <Field label="VAT treatment">
            <select className="r-select" value={vat} onChange={(e) => setVat(e.target.value)}>{VAT_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
          </Field>
          <Field label="RCT applicability">
            <select className="r-select" value={rct} onChange={(e) => setRct(e.target.value)}>{RCT_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
          </Field>
          <div><Btn kind="primary" disabled={!ready ? "Choose both treatments; Not determined keeps it under review" : false} onClick={() => act.completeTaxReview(job, vat, rct)}>Record review</Btn></div>
        </div>
      )}
      {reviewed && job === "J105" && <div style={{ marginTop: 12 }}><Btn small onClick={() => go("Finance", "invoices")}>Open J105 draft invoice</Btn></div>}
    </Panel>
  );
}
