"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { idleLogin } from "@/lib/form-state";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, idleLogin);

  return (
    <form action={action} className="rounded-3xl border border-sand bg-paper p-6 shadow-sm sm:p-8">
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em]">Admin sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-moss">
        Seller leads, buyer signups, and contact messages are stored on this server. This page is not indexed.
      </p>
      {!configured ? (
        <p className="mt-4 rounded-2xl border border-danger/30 bg-[#fdf2f2] p-4 text-sm text-danger" role="status">
          Set ADMIN_PASSWORD (at least 10 characters) and SESSION_SECRET (at least 24 characters), then restart or redeploy.
        </p>
      ) : null}
      {state.error ? (
        <p className="mt-4 rounded-2xl border border-danger/30 bg-[#fdf2f2] p-4 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      <label htmlFor="password" className="mt-6 block text-sm font-semibold">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="control"
        disabled={!configured || pending}
      />
      <button className="btn btn-primary btn-block mt-6" type="submit" disabled={!configured || pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
