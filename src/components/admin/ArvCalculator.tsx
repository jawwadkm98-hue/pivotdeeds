"use client";

import { useEffect, useMemo, useState } from "react";
import {
  blankComp,
  calculateArv,
  formatDollars,
  formatRate,
  type ArvComp,
  type ArvDeal,
  type ArvSubject,
} from "@/lib/arv";

export type ArvListingChoice = {
  id: number;
  title: string;
  address: string;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
};

type SavedSummary = { id: number; title: string; updated_at: string; inventory_id: number | null };

const emptySubject = (): ArvSubject => ({ address: "", sqft: null, beds: null, baths: null });
const emptyDeal = (): ArvDeal => ({ repairs: null, assignmentFee: null, arvPercent: 70 });

function numberValue(raw: string): number | null {
  if (raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function ArvCalculator({ listings }: { listings: ArvListingChoice[] }) {
  const [title, setTitle] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [inventoryId, setInventoryId] = useState<number | null>(null);
  const [subject, setSubject] = useState<ArvSubject>(emptySubject);
  const [deal, setDeal] = useState<ArvDeal>(emptyDeal);
  const [comps, setComps] = useState<ArvComp[]>([blankComp(), blankComp()]);
  const [saved, setSaved] = useState<SavedSummary[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const math = useMemo(() => calculateArv(subject, comps, deal), [subject, comps, deal]);

  useEffect(() => {
    refreshList().catch(() => setMessage("Saved calculations could not be loaded."));
  }, []);

  function updateComp(index: number, patch: Partial<ArvComp>) {
    setComps((current) => current.map((comp, item) => (item === index ? { ...comp, ...patch } : comp)));
  }

  function applyListing(id: number | null) {
    setInventoryId(id);
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    setSubject({
      address: listing.address,
      sqft: listing.sqft,
      beds: listing.beds,
      baths: listing.baths,
    });
    if (!title.trim()) setTitle(listing.title);
  }

  async function refreshList() {
    const response = await fetch("/api/admin/arv");
    if (!response.ok) return;
    const body = (await response.json()) as { calculations: SavedSummary[] };
    setSaved(body.calculations);
  }

  async function loadCalc(id: number) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/arv/${id}`);
      if (!response.ok) {
        setMessage("That calculation could not be loaded.");
        return;
      }
      const body = (await response.json()) as {
        calculation: { id: number; title: string; inventory_id: number | null; subject: ArvSubject; deal: ArvDeal; comps: ArvComp[] };
      };
      const calc = body.calculation;
      setSavedId(calc.id);
      setTitle(calc.title);
      setInventoryId(calc.inventory_id);
      setSubject(calc.subject);
      setDeal({ ...calc.deal, arvPercent: calc.deal.arvPercent ?? 70 });
      setComps(calc.comps.length ? calc.comps : [blankComp()]);
    } finally {
      setBusy(false);
    }
  }

  async function save(mode: "new" | "update") {
    setBusy(true);
    setMessage("");
    try {
      const payload = { title, inventoryId, subject, deal, comps };
      const response = await fetch(mode === "update" && savedId ? `/api/admin/arv/${savedId}` : "/api/admin/arv", {
        method: mode === "update" && savedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: number; error?: string };
      if (!response.ok) {
        setMessage(body.error || "Save failed.");
        return;
      }
      if (body.id) setSavedId(body.id);
      setMessage(mode === "update" ? "Updated." : "Saved.");
      await refreshList();
    } finally {
      setBusy(false);
    }
  }

  async function removeSaved() {
    if (!savedId) return;
    if (!window.confirm("Delete this saved calculation?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/arv/${savedId}`, { method: "DELETE" });
      if (!response.ok) {
        setMessage("Delete failed.");
        return;
      }
      setSavedId(null);
      setMessage("Deleted.");
      await refreshList();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <p className="kicker">Admin only</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">ARV calculator</h1>
      <p className="mt-2 max-w-2xl text-sm text-moss">
        Comparable sales stay on this screen. The offer math updates as you type. Nothing here is shown on the public site.
      </p>

      <section className="mt-6 rounded-3xl border border-sand bg-paper p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <Field label="Calculation name">
            <input className="control" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
          </Field>
          <Field label="Inventory listing">
            <select
              className="control"
              value={inventoryId ?? ""}
              onChange={(event) => applyListing(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">Not linked</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save(savedId ? "update" : "new")}>
              {savedId ? "Update" : "Save"}
            </button>
            {savedId ? (
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => save("new")}>
                Save as new
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Saved calculations">
            <select className="control" value={savedId ?? ""} onChange={(event) => event.target.value && loadCalc(Number(event.target.value))}>
              <option value="">{saved.length ? "Load a saved calculation" : "None saved yet"}</option>
              {saved.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </Field>
          <button type="button" className="btn btn-secondary" onClick={() => refreshList()}>
            Refresh list
          </button>
          {savedId ? (
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={removeSaved}>
              Delete
            </button>
          ) : null}
        </div>
        {message ? <p className="mt-3 text-sm text-brass">{message}</p> : null}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-sand bg-paper p-4 sm:p-5">
            <h2 className="font-serif text-2xl">Subject property</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Address">
                <input className="control" value={subject.address} onChange={(event) => setSubject({ ...subject, address: event.target.value })} />
              </Field>
              <Field label="Square feet">
                <input className="control" inputMode="numeric" value={subject.sqft ?? ""} onChange={(event) => setSubject({ ...subject, sqft: numberValue(event.target.value) })} />
              </Field>
              <Field label="Beds">
                <input className="control" inputMode="decimal" value={subject.beds ?? ""} onChange={(event) => setSubject({ ...subject, beds: numberValue(event.target.value) })} />
              </Field>
              <Field label="Baths">
                <input className="control" inputMode="decimal" value={subject.baths ?? ""} onChange={(event) => setSubject({ ...subject, baths: numberValue(event.target.value) })} />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-sand bg-paper p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Comparable sales</h2>
              <button type="button" className="btn btn-secondary" onClick={() => setComps((current) => [...current, blankComp()])}>
                Add comp
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {comps.map((comp, index) => (
                <div key={index} className="rounded-2xl border border-sand p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-brass">Comp {index + 1}</p>
                    <button type="button" className="text-sm text-danger underline" onClick={() => setComps((current) => current.filter((_, item) => item !== index))}>
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Address">
                      <input className="control" value={comp.address} onChange={(event) => updateComp(index, { address: event.target.value })} />
                    </Field>
                    <Field label="Sale date">
                      <input className="control" type="date" value={comp.saleDate} onChange={(event) => updateComp(index, { saleDate: event.target.value })} />
                    </Field>
                    <Field label="Sale price">
                      <input className="control" inputMode="numeric" value={comp.salePrice ?? ""} onChange={(event) => updateComp(index, { salePrice: numberValue(event.target.value) })} />
                    </Field>
                    <Field label="Square feet">
                      <input className="control" inputMode="numeric" value={comp.sqft ?? ""} onChange={(event) => updateComp(index, { sqft: numberValue(event.target.value) })} />
                    </Field>
                    <Field label="Beds">
                      <input className="control" inputMode="decimal" value={comp.beds ?? ""} onChange={(event) => updateComp(index, { beds: numberValue(event.target.value) })} />
                    </Field>
                    <Field label="Baths">
                      <input className="control" inputMode="decimal" value={comp.baths ?? ""} onChange={(event) => updateComp(index, { baths: numberValue(event.target.value) })} />
                    </Field>
                    <Field label="Adjustment $">
                      <input className="control" inputMode="decimal" value={comp.adjustment ?? ""} onChange={(event) => updateComp(index, { adjustment: numberValue(event.target.value) })} />
                    </Field>
                    <p className="self-end text-sm text-moss">Adjusted $/sqft {formatRate(math.compRates[index] ?? null)}</p>
                  </div>
                </div>
              ))}
              {comps.length === 0 ? <p className="text-sm text-moss">Add at least one comparable sale.</p> : null}
            </div>
          </section>

          <section className="rounded-3xl border border-sand bg-paper p-4 sm:p-5">
            <h2 className="font-serif text-2xl">Deal math</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="Repair estimate">
                <input className="control" inputMode="numeric" value={deal.repairs ?? ""} onChange={(event) => setDeal({ ...deal, repairs: numberValue(event.target.value) })} />
              </Field>
              <Field label="Assignment fee">
                <input className="control" inputMode="numeric" value={deal.assignmentFee ?? ""} onChange={(event) => setDeal({ ...deal, assignmentFee: numberValue(event.target.value) })} />
              </Field>
              <Field label="ARV percentage">
                <input className="control" inputMode="decimal" value={deal.arvPercent ?? ""} onChange={(event) => setDeal({ ...deal, arvPercent: numberValue(event.target.value) })} />
              </Field>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-brass/40 bg-pine p-5 xl:sticky xl:top-4">
          <h2 className="font-serif text-2xl">Results</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-moss">Average $/sqft</dt><dd>{formatRate(math.averagePerSqft)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-moss">Median $/sqft</dt><dd>{formatRate(math.medianPerSqft)}</dd></div>
            <div className="flex justify-between gap-3"><dt>ARV</dt><dd className="font-semibold text-brass">{formatDollars(math.arv)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-moss">Median ARV</dt><dd>{formatDollars(math.medianArv)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-moss">Investor buy price</dt><dd>{formatDollars(math.investorBuyPrice)}</dd></div>
            <div className="flex justify-between gap-3 border-t border-sand pt-3"><dt>Max allowable offer</dt><dd className="font-semibold">{formatDollars(math.maxAllowableOffer)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-moss">Estimated buyer profit</dt><dd>{formatDollars(math.buyerProfit)}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-moss">
            ARV is subject square feet times the average adjusted price per square foot. The offer uses that ARV. Investor buy price is ARV times the percentage, minus repairs. Max allowable offer subtracts the assignment fee. Buyer profit is ARV minus that buy price and repairs.
          </p>
        </aside>
      </div>
    </div>
  );
}
