"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { saveInventory } from "@/lib/admin-actions";
import { LISTING_STATUSES, LISTING_TYPES, STATES } from "@/lib/constants";
import type { Listing } from "@/lib/inventory";
import { Field } from "../fields";

const idle = { status: "idle", message: "", fieldErrors: {} as Record<string, string> };

export function InventoryForm({ listing, photos = [] }: { listing?: Listing | null; photos?: string[] }) {
  const action = saveInventory.bind(null, listing?.id ?? null);
  const [state, formAction, pending] = useActionState(action, idle);
  const initial = useMemo(() => photos, [photos]);
  const [order, setOrder] = useState(initial);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | File[]) {
    const next = [...files, ...Array.from(list)].slice(0, 12);
    setFiles(next);
    if (fileRef.current) {
      const transfer = new DataTransfer();
      next.forEach((file) => transfer.items.add(file));
      fileRef.current.files = transfer.files;
    }
  }

  function move(name: string, direction: -1 | 1) {
    setOrder((current) => {
      const index = current.indexOf(name);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  const visible = order.filter((name) => !removed.includes(name));

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" ? (
        <p role="alert" className="rounded-2xl border border-danger/40 bg-paper p-4 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" required error={state.fieldErrors.title} className="sm:col-span-2">
          <input name="title" defaultValue={listing?.title ?? ""} maxLength={120} required />
        </Field>
        <Field label="Type" name="property_type" required error={state.fieldErrors.property_type}>
          <select name="property_type" defaultValue={listing?.property_type ?? "House"} required>
            {LISTING_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field label="Status" name="status" required error={state.fieldErrors.status}>
          <select name="status" defaultValue={listing?.status ?? "available"}>
            {LISTING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City" name="city" required error={state.fieldErrors.city}>
          <input name="city" defaultValue={listing?.city ?? ""} required />
        </Field>
        <Field label="State" name="state" required error={state.fieldErrors.state}>
          <select name="state" defaultValue={listing?.state ?? "MD"} required>
            {STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Street address" name="address" error={state.fieldErrors.address} className="sm:col-span-2">
          <input name="address" defaultValue={listing?.address ?? ""} />
        </Field>
        <Field label="Asking price" name="asking_price" error={state.fieldErrors.asking_price}>
          <input name="asking_price" inputMode="numeric" defaultValue={listing?.asking_price ?? ""} />
        </Field>
        <Field label="ARV" name="arv" error={state.fieldErrors.arv}>
          <input name="arv" inputMode="numeric" defaultValue={listing?.arv ?? ""} />
        </Field>
        <Field label="Estimated repairs" name="estimated_repairs" error={state.fieldErrors.estimated_repairs}>
          <input name="estimated_repairs" inputMode="numeric" defaultValue={listing?.estimated_repairs ?? ""} />
        </Field>
        <Field label="Beds" name="beds" error={state.fieldErrors.beds}>
          <input name="beds" inputMode="decimal" defaultValue={listing?.beds ?? ""} />
        </Field>
        <Field label="Baths" name="baths" error={state.fieldErrors.baths}>
          <input name="baths" inputMode="decimal" defaultValue={listing?.baths ?? ""} />
        </Field>
        <Field label="Square feet" name="sqft" error={state.fieldErrors.sqft}>
          <input name="sqft" inputMode="numeric" defaultValue={listing?.sqft ?? ""} />
        </Field>
      </div>
      <Field label="Short description" name="description" error={state.fieldErrors.description}>
        <textarea name="description" defaultValue={listing?.description ?? ""} maxLength={2000} />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="show_address" value="yes" defaultChecked={listing?.show_address === 1} className="h-5 w-5 accent-brass" />
        Show the street address on the public listing
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="published" value="yes" defaultChecked={listing?.published === 1} className="h-5 w-5 accent-brass" />
        Published on the public inventory page
      </label>
      <input type="hidden" name="photo_order" value={visible.join("|")} />
      {removed.map((name) => (
        <input key={name} type="hidden" name="photo_remove" value={name} />
      ))}
      <div>
        <p className="text-sm font-semibold">Photos</p>
        <p className="mt-1 text-sm text-moss">Drag a photo onto another to reorder it, or use the move buttons. JPG, PNG, or WebP, up to 12 photos.</p>
        <ul className="mt-3 space-y-2">
          {visible.map((name) => (
            <li
              key={name}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", name)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const from = event.dataTransfer.getData("text/plain");
                setOrder((current) => {
                  const next = current.filter((item) => item !== from);
                  const index = next.indexOf(name);
                  next.splice(index, 0, from);
                  return next;
                });
              }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-sand bg-cream px-3 py-2 text-sm"
            >
              <span className="truncate">{name.split("/").pop()}</span>
              <span className="flex gap-2">
                <button type="button" className="underline" onClick={() => move(name, -1)}>
                  Up
                </button>
                <button type="button" className="underline" onClick={() => move(name, 1)}>
                  Down
                </button>
                <button type="button" className="text-danger underline" onClick={() => setRemoved((current) => [...current, name])}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
        <label
          className="mt-3 block rounded-3xl border border-dashed border-brass/70 bg-paper px-4 py-8 text-center text-sm text-moss"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
          }}
        >
          Drop photos here or choose files
          <input
            ref={fileRef}
            className="mt-3 block w-full text-sm"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files);
            }}
          />
        </label>
        {files.length > 0 ? <p className="mt-2 text-sm text-moss">{files.length} new photo{files.length === 1 ? "" : "s"} ready to upload.</p> : null}
        {state.fieldErrors.photos ? <p className="mt-2 text-sm text-danger">{state.fieldErrors.photos}</p> : null}
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : listing ? "Save listing" : "Create listing"}
      </button>
    </form>
  );
}
