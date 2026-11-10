/* Real relationships behind the Ontology graph. Selecting one lists the actual
   linked records, each of which opens in the shared record drawer. */
import { Fragment, useState, type ReactNode } from "react";
import { useDemo } from "./store";
import { jobs, pipeline, pos, invoices, tasks, runs, credentials, actorName, personName } from "./selectors";
import { CHECKS, COST_LABEL, DEFECT, PEOPLE, WEEK, type Ref } from "./fixtures";
import { eur, fmtDate } from "./format";
import { RecLink, SideSheet } from "./ui";

type Chain = (Ref | string)[];
const REL: { id: string; label: string; chains: (s: ReturnType<typeof useDemo>) => Chain[] }[] = [
  { id: "cust", label: "Customer → Jobs → Quotes / Variations", chains: (s) => [
    ...jobs(s).map((j) => [{ kind: "customer", id: j.customer } as Ref, { kind: "job", id: j.id } as Ref].concat(j.id === "J104" ? [{ kind: "variation", id: "V104-01" }] : [])),
    ...pipeline(s).quotes.map((q) => [{ kind: "customer", id: q.customer } as Ref, { kind: "quote", id: q.id } as Ref].concat(q.jobId ? [{ kind: "job", id: q.jobId }] : [])) ] },
  { id: "crew", label: "Job → Crew shifts → Person", chains: (s) => {
    const d = WEEK.includes(s.clock.slice(0, 10)) ? s.clock.slice(0, 10) : WEEK[1];
    return (["A", "B"] as const).flatMap((c) => { const cd = s.plan[d][c];
      return PEOPLE.filter((p) => p.crew === c).map((p) => [{ kind: "job", id: cd.job } as Ref, "Crew " + c + ", " + fmtDate(d, "dow"), { kind: "person", id: p.id } as Ref]); }); } },
  { id: "asset", label: "Job → Asset assignment → Truck / Plant", chains: (s) => WEEK.flatMap((d) => (["A", "B"] as const).flatMap((c) => {
    const cd = s.plan[d][c]; return [cd.truck, cd.plant].filter(Boolean).map((a) => [{ kind: "job", id: cd.job } as Ref, fmtDate(d, "dow"), { kind: "asset", id: a } as Ref]); })) },
  { id: "mat", label: "Job → Material order → Supplier → Delivery ticket", chains: (s) => pos(s).map((p) => [{ kind: "job", id: p.job } as Ref, { kind: "po", id: p.id } as Ref, { kind: "supplier", id: p.supplier } as Ref, (p.ticket ? { kind: "document", id: p.ticket } as Ref : "no ticket yet")] as Chain) },
  { id: "cost", label: "Job → Cost lines", chains: (s) => jobs(s).filter((j) => j.month === "2026-11").flatMap((j) => j.lines.map((l) => [{ kind: "job", id: j.id } as Ref, COST_LABEL[l.cat] + " " + eur(l.forecast)])) },
  { id: "inv", label: "Job → Invoice → Payments", chains: (s) => invoices(s).map((i) => ([{ kind: "job", id: i.job } as Ref, { kind: "invoice", id: i.id } as Ref] as Chain).concat(i.payments.length ? i.payments.map((p) => p.id + " " + eur(p.amount)) : ["no payment"])) },
  { id: "qual", label: "Person → Qualifications → Assignment eligibility", chains: (s) => credentials(s).list.map((c) => [{ kind: "person", id: c.person } as Ref, { kind: "credential", id: c.id } as Ref, c.type === "Truck eligibility" ? "may drive trucks" : c.expired ? "not eligible" : "site work, valid to " + fmtDate(c.expires)]) },
  { id: "def", label: "Asset → Checks → Defects → Maintenance", chains: (s) => CHECKS.map((c) => ([{ kind: "asset", id: c.asset } as Ref, c.id + " " + c.result] as Chain).concat(c.defect ? [DEFECT.id + " " + DEFECT.summary, { kind: "document", id: DEFECT.doc } as Ref, "repair: " + s.repair.toLowerCase()] : [])) },
  { id: "task", label: "Task / Approval → Related record", chains: (s) => tasks(s).map((t) => [{ kind: "task", id: t.id } as Ref, personName(t.owner), t.ref]) },
  { id: "run", label: "Agent run → Evidence records → Proposed action", chains: (s) => runs(s).map((r) => [{ kind: "run", id: r.id } as Ref, actorName(r.agent)].concat(r.refs as Chain, [r.outputs[r.outputs.length - 1]])) },
];

export default function OntologyRelations() {
  const s = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const rel = REL.find((r) => r.id === open);
  return (
    <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)", backdropFilter: "blur(20px) saturate(1.3)", boxShadow: "var(--card-shadow)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.13em", color: "var(--faint)", marginBottom: 8 }}>RELATIONSHIPS</div>
      {REL.map((r) => (
        <button key={r.id} type="button" onClick={() => setOpen(r.id)} className="r-onto-rel">
          <span style={{ flex: 1, minWidth: 0 }}>{r.label}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--faint)" }}>{r.chains(s).length}</span>
        </button>
      ))}
      {rel && (
        <SideSheet title={rel.label} sub="Actual linked records in the demo data. Select any ID to open it." onClose={() => setOpen(null)}>
          <div className="r-list">
            {rel.chains(s).map((c, i) => (
              <div key={i} className="r-li" style={{ flexWrap: "wrap", gap: 6, alignItems: "center", fontSize: 13 }}>
                {c.map((x, k) => (
                  <Fragment key={k}>
                    {k > 0 && <span className="r-faint" aria-hidden="true">→</span>}
                    {typeof x === "string" ? <span className="r-dim">{x}</span> : <RecLink r={x}>{short(x)}</RecLink>}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </SideSheet>
      )}
    </div>
  );
}
function short(r: Ref): ReactNode {
  if (r.kind === "person") return personName(r.id);
  return r.id;
}
