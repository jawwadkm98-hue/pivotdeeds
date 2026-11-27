import { verifyAdminPassword } from "./auth";
import { MAX_PASSWORD_LENGTH, MIN_NEW_PASSWORD_LENGTH } from "./password-constants";
import { savePasswordHash } from "./password";

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordResult =
  | { ok: true; version: number }
  | { ok: false; error: string; status: number };

function text(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function parseChangePasswordPayload(body: unknown): ChangePasswordInput | { error: string } {
  if (!body || typeof body !== "object") return { error: "Missing password details." };
  const record = body as Record<string, unknown>;
  return {
    currentPassword: text(record.currentPassword),
    newPassword: text(record.newPassword),
    confirmPassword: text(record.confirmPassword),
  };
}

export function validateNewPassword(newPassword: string, confirmPassword: string, currentPassword: string): string | null {
  if (newPassword.length < MIN_NEW_PASSWORD_LENGTH) {
    return `The new password must be at least ${MIN_NEW_PASSWORD_LENGTH} characters.`;
  }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return `The new password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  }
  if (newPassword !== confirmPassword) return "The new password and confirmation do not match.";
  if (currentPassword.length > 0 && newPassword === currentPassword) return "Choose a new password that is different from the current one.";
  return null;
}

export async function changeAdminPassword(input: ChangePasswordInput): Promise<ChangePasswordResult> {
  const currentPassword = input.currentPassword;
  const newPassword = input.newPassword;
  const confirmPassword = input.confirmPassword;
  if (!currentPassword) return { ok: false, error: "Enter your current password.", status: 400 };
  const invalid = validateNewPassword(newPassword, confirmPassword, currentPassword);
  if (invalid) return { ok: false, error: invalid, status: 400 };
  if (!(await verifyAdminPassword(currentPassword))) {
    return { ok: false, error: "That current password is incorrect.", status: 401 };
  }
  const version = await savePasswordHash(newPassword);
  return { ok: true, version };
}
