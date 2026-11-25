import { cloneElement, type ReactElement } from "react";
import type { FormState } from "@/lib/form-state";

type ControlProps = {
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function Field({
  label,
  name,
  error,
  required = false,
  hint,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactElement<ControlProps>;
}) {
  const describedBy = [hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;
  const control = cloneElement(children, {
    id: name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: ["control", children.props.className].filter(Boolean).join(" "),
  });

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-ember">
              {" "}
              *
            </span>
            <span className="sr-only"> required</span>
          </>
        ) : (
          <span className="font-normal text-moss"> (optional)</span>
        )}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="mt-1 text-sm leading-relaxed text-moss">
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.status !== "error") return null;
  const entries = Object.entries(state.fieldErrors);
  return (
    <div id="form-status" tabIndex={-1} role="alert" className="rounded-2xl border border-danger/30 bg-[#fdf2f2] p-4 text-sm text-danger">
      <p className="font-semibold">{state.message}</p>
      {entries.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {entries.map(([key, message]) => (
            <li key={key}>
              <a className="underline underline-offset-2" href={`#${key}`}>
                {message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
