export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string>;
  values: Record<string, string | string[]>;
};

export const idleState: FormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: {},
};

export function successState(message: string): FormState {
  return { status: "success", message, fieldErrors: {}, values: {} };
}

export function errorState(
  message: string,
  fieldErrors: Record<string, string>,
  values: Record<string, string | string[]>,
): FormState {
  return { status: "error", message, fieldErrors, values };
}

export type LoginState = { error: string };

export const idleLogin: LoginState = { error: "" };

export function formValues(formData: FormData, keys: readonly string[]): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of keys) {
    const all = formData.getAll(key).map((item) => String(item).slice(0, 4000));
    values[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return values;
}

export function valueOf(state: FormState, key: string): string {
  const value = state.values[key];
  return typeof value === "string" ? value : "";
}

export function checked(state: FormState, key: string, expected: string): boolean {
  const value = state.values[key];
  if (Array.isArray(value)) return value.includes(expected);
  return value === expected;
}
