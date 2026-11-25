import Link from "next/link";
import { removeRecord, saveRecord } from "@/lib/admin-actions";
import { PIPELINE } from "@/lib/constants";
import { ConfirmForm } from "./ConfirmForm";

export function RecordEditor({
  kind,
  id,
  title,
  status,
  notes,
  saved,
  fields,
  extra,
}: {
  kind: "sellers" | "buyers" | "messages" | "inquiries";
  id: number;
  title: string;
  status: string;
  notes: string | null;
  saved: boolean;
  fields: { label: string; value: string }[];
  extra?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
      <Link href={`/admin/${kind}`} className="text-sm text-brass">
        Back to {kind}
      </Link>
      <h1 className="mt-3 font-serif text-4xl font-medium">{title}</h1>
      {saved ? (
        <p role="status" className="mt-4 rounded-2xl border border-brass/40 bg-paper px-4 py-3 text-sm">
          Saved.
        </p>
      ) : null}
      <dl className="mt-6 divide-y divide-sand rounded-3xl border border-sand">
        {fields.map((field) => (
          <div key={field.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm text-moss">{field.label}</dt>
            <dd className="whitespace-pre-wrap text-sm">{field.value || "—"}</dd>
          </div>
        ))}
      </dl>
      {extra}
      <form action={saveRecord.bind(null, kind, id)} className="mt-6 space-y-4 rounded-3xl border border-sand bg-paper p-5">
        <label className="block text-sm font-semibold" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" className="control mt-1" defaultValue={status}>
          {PIPELINE.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="block text-sm font-semibold" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" className="control mt-1" defaultValue={notes ?? ""} maxLength={4000} />
        <button className="btn btn-primary" type="submit">
          Save status and notes
        </button>
      </form>
      <ConfirmForm className="mt-4" action={removeRecord.bind(null, kind)} message="Delete this record?" label="Delete">
        <input type="hidden" name="id" value={id} />
      </ConfirmForm>
    </div>
  );
}
