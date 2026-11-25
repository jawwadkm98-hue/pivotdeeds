import { CrownMark } from "./CrownMark";

/** Horizontal lockup. `surface="dark"` is gold type on navy; `surface="light"` is navy type. */
export function Logo({ surface = "dark" }: { surface?: "dark" | "light" }) {
  const word = surface === "light" ? "text-[#0B1F3A]" : "text-[#D4A93C]";
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5 text-[#D4A93C]">
      <CrownMark draw className="logo-mark h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <span className={`logo-word font-sans font-semibold uppercase leading-none ${word}`}>
        Crown Wholesalers
      </span>
    </span>
  );
}
