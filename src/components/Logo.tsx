export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const tile = tone === "light" ? "#F4EFE6" : "#1C3B2E";
  const line = tone === "light" ? "#1C3B2E" : "#F4EFE6";
  const gold = tone === "light" ? "#6F5018" : "#E4C27A";
  const word = tone === "light" ? "text-cream" : "text-ink";
  const accent = tone === "light" ? "text-brass-bright" : "text-brass";

  return (
    <span className={`inline-flex items-center gap-2.5 ${word}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={tile} />
        <path
          d="M11.2 10.5h12.1L29 16.2V28a2 2 0 0 1-2 2H11.2a2 2 0 0 1-2-2V12.5a2 2 0 0 1 2-2Z"
          fill="none"
          stroke={line}
          strokeWidth="1.7"
        />
        <path d="M23.3 10.6V16h5.5" fill="none" stroke={gold} strokeWidth="1.7" />
        <path d="M14 25.2h9.2" stroke={gold} strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M20.2 22.4 23.2 25.2 20.2 28"
          fill="none"
          stroke={gold}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-serif text-[1.15rem] font-medium leading-none tracking-[-0.03em] sm:text-[1.35rem]">
        Pivot<span className={accent}>Deeds</span>
      </span>
    </span>
  );
}
