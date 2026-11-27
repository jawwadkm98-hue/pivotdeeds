"use client";

import { useState } from "react";
import { Field } from "../fields";
import { MIN_NEW_PASSWORD_LENGTH } from "@/lib/password";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setPending(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
      if (!response.ok || !body?.ok) {
        setError(body?.error || "The password could not be changed.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch {
      setError("The password could not be changed. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4" autoComplete="off">
      {success ? (
        <p role="status" className="rounded-2xl border border-brass/40 bg-paper px-4 py-3 text-sm">
          Password updated. Any other signed-in sessions will need to sign in again.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Field label="Current password" name="currentPassword">
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </Field>
      <Field
        label="New password"
        name="newPassword"
        hint={`At least ${MIN_NEW_PASSWORD_LENGTH} characters. This is stored as a hash in the site database, not in the Cloudflare secret.`}
      >
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_NEW_PASSWORD_LENGTH}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </Field>
      <Field label="Confirm new password" name="confirmPassword">
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_NEW_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </Field>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
