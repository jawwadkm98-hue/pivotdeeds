"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { brand } from "@brand";
import { submitInquiry } from "@/lib/actions";
import { checked, idleState, valueOf } from "@/lib/form-state";
import { Field, FormAlert } from "./fields";
import { SpamFieldsClient } from "./SpamFields";

export function InterestForm({ inventoryId }: { inventoryId: number }) {
  const [state, action, pending] = useActionState(submitInquiry.bind(null, inventoryId), idleState);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "idle") return;
    panelRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={panelRef} tabIndex={-1} role="status" className="rounded-3xl border border-sand bg-paper p-6">
        <h2 className="font-serif text-3xl">Interest received</h2>
        <p className="mt-3 text-moss">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-paper p-5 sm:p-8">
      <div ref={panelRef} tabIndex={-1}>
        <h2 className="font-serif text-3xl">I&apos;m interested</h2>
        <p className="mt-2 text-sm text-moss">Tell us how to reach you. This does not reserve the deal.</p>
      </div>
      <FormAlert state={state} />
      <Field label="Name" name="name" required error={state.fieldErrors.name}>
        <input name="name" autoComplete="name" defaultValue={valueOf(state, "name")} required maxLength={80} />
      </Field>
      <Field label="Phone" name="phone" required error={state.fieldErrors.phone}>
        <input name="phone" type="tel" autoComplete="tel" defaultValue={valueOf(state, "phone")} required />
      </Field>
      <Field label="Email" name="email" required error={state.fieldErrors.email}>
        <input name="email" type="email" autoComplete="email" defaultValue={valueOf(state, "email")} required />
      </Field>
      <Field label="Message" name="message" error={state.fieldErrors.message}>
        <textarea name="message" defaultValue={valueOf(state, "message")} maxLength={2000} />
      </Field>
      <div className={`rounded-2xl border p-4 ${state.fieldErrors.tcpa ? "border-danger" : "border-sand"}`}>
        <label className="flex gap-3 text-sm leading-relaxed">
          <input name="tcpa" type="checkbox" value="yes" defaultChecked={checked(state, "tcpa", "yes")} className="mt-1 h-5 w-5 accent-brass" required />
          <span>
            I agree that {brand.name} may call and text me about this deal, including with an automatic telephone dialing system or a prerecorded voice. Consent is not required to buy. See the <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </span>
        </label>
      </div>
      <SpamFieldsClient />
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send my interest"}
      </button>
    </form>
  );
}
