"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { brand } from "@brand";
import { submitContact } from "@/lib/actions";
import { checked, idleState, valueOf } from "@/lib/form-state";
import { Field, FormAlert } from "./fields";
import { SpamFieldsClient } from "./SpamFields";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, idleState);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "idle") return;
    panelRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={panelRef} tabIndex={-1} role="status" className="rounded-3xl border border-sand bg-paper p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-3xl font-medium tracking-[-0.03em]">Message received</h2>
        <p className="mt-4 leading-relaxed text-moss">{state.message}</p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => window.location.assign("/contact")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4 rounded-3xl border border-sand bg-paper p-5 shadow-sm sm:p-8">
      <div ref={panelRef} tabIndex={-1}>
        <h2 className="font-serif text-3xl font-medium tracking-[-0.03em]">Send a message</h2>
        <p className="mt-3 text-sm leading-relaxed text-moss">
          We store messages so we can reply. This form is for questions, not a property offer or a buyers-list signup.
        </p>
      </div>
      <FormAlert state={state} />
      <Field label="Name" name="name" required error={state.fieldErrors.name}>
        <input name="name" autoComplete="name" defaultValue={valueOf(state, "name")} maxLength={80} required />
      </Field>
      <Field label="Email" name="email" required error={state.fieldErrors.email}>
        <input name="email" type="email" autoComplete="email" defaultValue={valueOf(state, "email")} maxLength={160} required />
      </Field>
      <Field label="Phone" name="phone" error={state.fieldErrors.phone}>
        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={valueOf(state, "phone")} maxLength={30} />
      </Field>
      <Field label="Message" name="message" required error={state.fieldErrors.message}>
        <textarea name="message" defaultValue={valueOf(state, "message")} maxLength={4000} required minLength={10} />
      </Field>
      <div className={`rounded-2xl border p-4 ${state.fieldErrors.consent ? "border-danger bg-[#fdf2f2]" : "border-sand bg-cream"}`}>
        <label htmlFor="consent" className="flex gap-3 text-sm leading-relaxed">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            value="yes"
            defaultChecked={checked(state, "consent", "yes")}
            className="mt-1 h-5 w-5 shrink-0 accent-pine"
            required
            aria-invalid={state.fieldErrors.consent ? true : undefined}
          />
          <span>I agree that {brand.name} may contact me by email or phone about this message.</span>
        </label>
        {state.fieldErrors.consent ? <p className="mt-2 text-sm font-medium text-danger">{state.fieldErrors.consent}</p> : null}
      </div>
      <SpamFieldsClient />
      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
