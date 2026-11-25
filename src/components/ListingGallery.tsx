"use client";

import { useState } from "react";

export function ListingGallery({ names, alt }: { names: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);
  if (names.length === 0) {
    return <div className="flex h-64 items-center justify-center rounded-3xl border border-sand bg-paper text-sm text-moss">No photos yet</div>;
  }
  const src = `/inventory/photo?name=${encodeURIComponent(names[current] ?? names[0])}`;
  return (
    <div>
      <img src={src} alt={alt} className="h-80 w-full rounded-3xl border border-sand object-cover" />
      {names.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {names.map((name, index) => (
            <button key={name} type="button" onClick={() => setCurrent(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border ${index === current ? "border-brass" : "border-sand"}`}>
              <img src={`/inventory/photo?name=${encodeURIComponent(name)}`} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
