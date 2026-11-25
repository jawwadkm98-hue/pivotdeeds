export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const tile = tone === "light" ? "#F4F1E8" : "#162033";
  const gold = "#E8C97A";
  const ink = tone === "light" ? "#162033" : gold;
  const word = tone === "light" ? "text-cream" : "text-ink";

  return (
    <span className={`inline-flex items-center gap-2.5 ${word}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={tile} />
        <path
          d="M9 26.5h22v2.2H9zM9.5 25.2 13.2 16l4.3 5.2L20 10.5l2.5 10.7 4.3-5.2 3.7 9.2H9.5z"
          fill={ink}
        />
        <circle cx="13.2" cy="14.6" r="1.15" fill={gold} />
        <circle cx="20" cy="9.2" r="1.25" fill={gold} />
        <circle cx="26.8" cy="14.6" r="1.15" fill={gold} />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.15rem] font-medium tracking-[-0.03em] sm:text-[1.3rem]">Crown</span>
        <span className={`mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${tone === "light" ? "text-brass-bright" : "text-brass"}`}>
          Wholesalers
        </span>
      </span>
    </span>
  );
}
