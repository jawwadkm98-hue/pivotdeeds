"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { brand } from "@brand";
import { ASSET_CATEGORIES, PRICE_RANGES, PROPERTY_TYPES, STATES } from "@/lib/constants";
import { submitBuyer } from "@/lib/actions";
import { checked, idleState, valueOf } from "@/lib/form-state";
import { Field, FormAlert } from "./fields";
import { SpamFieldsClient } from "./SpamFields";

export function BuyerForm() {
  const [state, action, pending] = useActionState(submitBuyer, idleState);
  const [filter, setFilter] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const query = filter.trim().toLowerCase();

  useEffect(() => {
    if (state.status === "idle") return;
    panelRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={panelRef} tabIndex={-1} role="status" className="rounded-3xl border border-sand bg-paper p-6 shadow-sm sm:p-8">
        <p className="kicker">Buyers list</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.03em]">You are on the list.</h2>
        <p className="mt-4 leading-relaxed text-moss">{state.message}</p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => window.location.assign("/buyers")}>
          Update your buy box
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="relative rounded-3xl border border-sand bg-paper p-5 shadow-sm sm:p-8">
      <div ref={panelRef} tabIndex={-1}>
        <p className="kicker">Buyer form</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.03em]">Tell us what you buy</h2>
        <p className="mt-3 text-sm leading-relaxed text-moss">
          Fields marked with * are required. We use this to decide what to send you. It is not an agreement to buy.
        </p>
      </div>
      <div className="mt-6">
        <FormAlert state={state} />
      </div>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-serif text-2xl">Your contact</legend>
        <Field label="Name" name="name" required error={state.fieldErrors.name}>
          <input name="name" autoComplete="name" defaultValue={valueOf(state, "name")} maxLength={80} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" required error={state.fieldErrors.phone}>
            <input name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={valueOf(state, "phone")} maxLength={30} required />
          </Field>
          <Field label="Email" name="email" required error={state.fieldErrors.email}>
            <input name="email" type="email" autoComplete="email" defaultValue={valueOf(state, "email")} maxLength={160} required />
          </Field>
        </div>
        <Field label="Company" name="company" error={state.fieldErrors.company}>
          <input name="company" autoComplete="organization" defaultValue={valueOf(state, "company")} maxLength={120} />
        </Field>
      </fieldset>

      <fieldset className="mt-8" id="categories">
        <legend className="font-serif text-2xl">
          Categories <span className="text-brass">*</span>
        </legend>
        <p className="mt-2 text-sm leading-relaxed text-moss">Choose every line you actually buy. We can add more categories later without a new signup form.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ASSET_CATEGORIES.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded-2xl border border-sand px-3 py-2 text-sm has-[:checked]:border-pine has-[:checked]:bg-cream">
              <input type="checkbox" name="categories" value={item.id} defaultChecked={checked(state, "categories", item.id)} className="h-4 w-4 accent-pine" />
              {item.label}
            </label>
          ))}
        </div>
        {state.fieldErrors.categories ? <p className="mt-2 text-sm font-medium text-danger">{state.fieldErrors.categories}</p> : null}
      </fieldset>

      <fieldset className="market-picker mt-8" id="markets">
        <legend className="font-serif text-2xl">Markets</legend>
        <p className="mt-2 text-sm leading-relaxed text-moss">
          Choose nationwide, or pick states. If you choose nationwide, individual states are ignored. {brand.serviceArea}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex gap-3 rounded-2xl border border-sand bg-cream p-3 text-sm">
            <input type="radio" name="market_scope" value="nationwide" defaultChecked={valueOf(state, "market_scope") === "nationwide"} className="mt-1 h-4 w-4 accent-pine" required />
            <span>Nationwide — all 50 states and Washington, D.C.</span>
          </label>
          <label className="flex gap-3 rounded-2xl border border-sand bg-cream p-3 text-sm">
            <input type="radio" name="market_scope" value="specific" defaultChecked={valueOf(state, "market_scope") === "specific"} className="mt-1 h-4 w-4 accent-pine" />
            <span>Only these states</span>
          </label>
        </div>
        <label htmlFor="state-filter" className="mt-4 block text-sm font-semibold">
          Filter states
        </label>
        <input id="state-filter" className="control" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Texas, TX…" />
        <div className="state-grid mt-3 grid max-h-64 grid-cols-1 gap-2 overflow-auto rounded-2xl border border-sand p-3 sm:grid-cols-2">
          {STATES.map(([code, name]) => {
            const show = !query || name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
            return (
              <label key={code} className={show ? "flex items-start gap-2 text-sm" : "hidden"}>
                <input
                  type="checkbox"
                  name="markets"
                  value={code}
                  defaultChecked={checked(state, "markets", code)}
                  className="mt-0.5 h-4 w-4 accent-pine"
                />
                <span>
                  {name} <span className="text-moss">{code}</span>
                </span>
              </label>
            );
          })}
        </div>
        {state.fieldErrors.markets ? (
          <p id="markets-error" className="mt-2 text-sm font-medium text-danger">
            {state.fieldErrors.markets}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="mt-8" id="property_types">
        <legend className="font-serif text-2xl">Property types</legend>
        <p className="mt-2 text-sm text-moss">Required when real estate is one of your categories.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PROPERTY_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 rounded-2xl border border-sand px-3 py-2 text-sm has-[:checked]:border-pine has-[:checked]:bg-cream">
              <input type="checkbox" name="property_types" value={type} defaultChecked={checked(state, "property_types", type)} className="h-4 w-4 accent-pine" />
              {type}
            </label>
          ))}
        </div>
        {state.fieldErrors.property_types ? (
          <p className="mt-2 text-sm font-medium text-danger">{state.fieldErrors.property_types}</p>
        ) : null}
      </fieldset>

      <div className="mt-8 space-y-4">
        <Field label="Price range" name="price_range" required error={state.fieldErrors.price_range}>
          <select name="price_range" defaultValue={valueOf(state, "price_range")} required>
            <option value="">Choose one</option>
            {PRICE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Buy box notes"
          name="buy_box"
          required
          error={state.fieldErrors.buy_box}
          hint="Neighborhoods, construction, occupancy, financing, or anything you will not buy."
        >
          <textarea name="buy_box" defaultValue={valueOf(state, "buy_box")} maxLength={4000} required minLength={10} />
        </Field>
      </div>

      <fieldset className="mt-8" id="proof_of_funds">
        <legend className="font-serif text-2xl">
          Proof of funds available <span className="text-brass">*</span>
        </legend>
        <p className="mt-2 text-sm leading-relaxed text-moss">
          Yes means you can show funds or a credit line if we ask before sharing an address. No does not block you from joining the list.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex gap-3 rounded-2xl border border-sand p-3 text-sm">
            <input type="radio" name="proof_of_funds" value="yes" defaultChecked={valueOf(state, "proof_of_funds") === "yes"} className="mt-1 h-4 w-4 accent-pine" required />
            Yes, proof of funds is available
          </label>
          <label className="flex gap-3 rounded-2xl border border-sand p-3 text-sm">
            <input type="radio" name="proof_of_funds" value="no" defaultChecked={valueOf(state, "proof_of_funds") === "no"} className="mt-1 h-4 w-4 accent-pine" />
            No, not right now
          </label>
        </div>
        {state.fieldErrors.proof_of_funds ? (
          <p className="mt-2 text-sm font-medium text-danger">{state.fieldErrors.proof_of_funds}</p>
        ) : null}
      </fieldset>

      <div className={`mt-8 rounded-2xl border p-4 ${state.fieldErrors.tcpa ? "border-danger bg-[#fdf2f2]" : "border-sand bg-cream"}`}>
        <label htmlFor="tcpa" className="flex gap-3 text-sm leading-relaxed text-ink">
          <input
            id="tcpa"
            name="tcpa"
            type="checkbox"
            value="yes"
            defaultChecked={checked(state, "tcpa", "yes")}
            aria-invalid={state.fieldErrors.tcpa ? true : undefined}
            aria-describedby={state.fieldErrors.tcpa ? "tcpa-error" : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-pine"
            required
          />
          <span>
            I agree that {brand.name} may call and text me at the phone number I provided, including with an automatic telephone dialing system or a prerecorded or artificial voice, about buyer opportunities and related property services. Message and data rates may apply. Message frequency varies. Reply STOP to opt out of texts and HELP for help. Consent is not a condition of any purchase, sale, or offer. See the{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline">
              Terms of Use
            </Link>
            .
          </span>
        </label>
        {state.fieldErrors.tcpa ? (
          <p id="tcpa-error" className="mt-2 text-sm font-medium text-danger">
            {state.fieldErrors.tcpa}
          </p>
        ) : null}
      </div>

      <SpamFieldsClient />
      <button className="btn btn-primary btn-block mt-6" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Join the buyers list"}
      </button>
    </form>
  );
}
