"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { brand } from "@brand";
import { CONDITIONS, PROPERTY_TYPES, REASONS, STATES, TIMELINES } from "@/lib/constants";
import { submitSeller } from "@/lib/actions";
import { checked, idleState, valueOf } from "@/lib/form-state";
import { Disclosure } from "./Disclosure";
import { Field, FormAlert } from "./fields";
import { SpamFieldsClient } from "./SpamFields";

export function SellerForm() {
  const [state, action, pending] = useActionState(submitSeller, idleState);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "idle") return;
    panelRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={panelRef} tabIndex={-1} role="status" className="scroll-mt-28 rounded-3xl border border-sand bg-paper p-6 shadow-sm sm:p-8">
        <p className="kicker">Request received</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.03em]">We have your property.</h2>
        <p className="mt-4 leading-relaxed text-moss">{state.message}</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => window.location.assign("/sell")}>
          Submit another property
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="relative rounded-3xl border border-sand bg-paper p-5 shadow-sm sm:p-8" noValidate={false}>
      <div ref={panelRef} tabIndex={-1} className="scroll-mt-28">
        <p className="kicker">Seller form</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.03em]">Tell us about the property</h2>
        <p className="mt-3 text-sm leading-relaxed text-moss">Fields marked with * are required. This is a request for an offer, not a contract.</p>
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
      </fieldset>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-serif text-2xl">The property</legend>
        <Field label="Property address" name="address" required error={state.fieldErrors.address}>
          <input name="address" autoComplete="street-address" defaultValue={valueOf(state, "address")} maxLength={180} required />
        </Field>
        <Field label="City" name="city" required error={state.fieldErrors.city}>
          <input name="city" autoComplete="address-level2" defaultValue={valueOf(state, "city")} maxLength={80} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field label="State" name="state" required error={state.fieldErrors.state}>
            <select name="state" autoComplete="address-level1" defaultValue={valueOf(state, "state")} required>
              <option value="">Choose a state</option>
              {STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ZIP" name="zip" required error={state.fieldErrors.zip}>
            <input name="zip" autoComplete="postal-code" inputMode="numeric" defaultValue={valueOf(state, "zip")} maxLength={10} required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property type" name="property_type" required error={state.fieldErrors.property_type}>
            <select name="property_type" defaultValue={valueOf(state, "property_type")} required>
              <option value="">Choose one</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition" name="condition" required error={state.fieldErrors.condition}>
            <select name="condition" defaultValue={valueOf(state, "condition")} required>
              <option value="">Choose one</option>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-4">
        <legend className="font-serif text-2xl">Your situation</legend>
        <Field label="Timeline" name="timeline" required error={state.fieldErrors.timeline}>
          <select name="timeline" defaultValue={valueOf(state, "timeline")} required>
            <option value="">Choose one</option>
            {TIMELINES.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asking price" name="asking_price" error={state.fieldErrors.asking_price} hint="A number you have in mind. Leave blank if you do not.">
            <input name="asking_price" inputMode="decimal" defaultValue={valueOf(state, "asking_price")} maxLength={20} placeholder="e.g. 250000" />
          </Field>
          <Field label="Reason for selling" name="reason" error={state.fieldErrors.reason}>
            <select name="reason" defaultValue={valueOf(state, "reason")}>
              <option value="">Optional</option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes" name="notes" error={state.fieldErrors.notes} hint="Tenants, liens, access, an estate, or anything else we should know.">
          <textarea name="notes" defaultValue={valueOf(state, "notes")} maxLength={4000} />
        </Field>
      </fieldset>

      <Disclosure level={3} className="mt-8 rounded-2xl border border-sand bg-cream p-4 text-ink" />

      <div className={`mt-6 rounded-2xl border p-4 ${state.fieldErrors.tcpa ? "border-danger bg-[#fdf2f2]" : "border-sand bg-cream"}`}>
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
            I agree that {brand.name} may call and text me at the phone number I provided, including with an automatic telephone dialing system or a prerecorded or artificial voice, about this inquiry and related property services. Message and data rates may apply. Message frequency varies. Reply STOP to opt out of texts and HELP for help. Consent is not a condition of any purchase, sale, or offer. See the{" "}
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
        {pending ? "Sending…" : "Request my cash offer"}
      </button>
    </form>
  );
}
