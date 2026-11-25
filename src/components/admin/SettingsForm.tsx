"use client";

import { useActionState } from "react";
import { saveSettings } from "@/lib/admin-actions";
import { Field } from "../fields";

const idle = { status: "idle", message: "", fieldErrors: {} as Record<string, string> };

export function SettingsForm({ email, phone, saved }: { email: string; phone: string; saved: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, idle);
  return (
    <form action={action} className="max-w-xl space-y-4">
      {saved ? <p role="status" className="rounded-2xl border border-brass/40 bg-paper px-4 py-3 text-sm">Saved. The public site now uses these details.</p> : null}
      {state.status === "error" ? <p role="alert" className="text-sm text-danger">{state.message}</p> : null}
      <Field label="Public email" name="email" required error={state.fieldErrors.email}>
        <input name="email" type="email" defaultValue={email} required />
      </Field>
      <Field label="Public phone" name="phone" required error={state.fieldErrors.phone} hint="Shown in the footer and on the contact page. A real 10-digit number becomes a tap-to-call link.">
        <input name="phone" defaultValue={phone} required />
      </Field>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
