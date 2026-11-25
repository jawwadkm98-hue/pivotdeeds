"use client";

import { useActionState, useState } from "react";
import { uploadLibrary } from "@/lib/admin-actions";

export function FileLibrary({ saved }: { saved: boolean }) {
  const [state, action, pending] = useActionState(uploadLibrary, { message: "" });
  const [names, setNames] = useState<string[]>([]);

  return (
    <form action={action} className="rounded-3xl border border-sand bg-paper p-5">
      {saved ? <p role="status" className="mb-3 text-sm">File saved.</p> : null}
      {state.message ? <p role="alert" className="mb-3 text-sm text-danger">{state.message}</p> : null}
      <label
        className="block rounded-3xl border border-dashed border-brass/70 px-4 py-8 text-center text-sm text-moss"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const input = event.currentTarget.querySelector("input");
          if (!input || !event.dataTransfer.files.length) return;
          const transfer = new DataTransfer();
          Array.from(event.dataTransfer.files).forEach((file) => transfer.items.add(file));
          input.files = transfer.files;
          setNames(Array.from(transfer.files).map((file) => file.name));
        }}
      >
        Drop contracts or photos here, or choose files. PDF, Word, JPG, PNG, or WebP. 20 MB each.
        <input
          className="mt-3 block w-full text-sm"
          type="file"
          name="files"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,.doc,.docx"
          onChange={(event) => setNames(Array.from(event.target.files ?? []).map((file) => file.name))}
        />
      </label>
      {names.length > 0 ? <p className="mt-2 text-sm">{names.join(", ")}</p> : null}
      <button className="btn btn-primary mt-4" type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
