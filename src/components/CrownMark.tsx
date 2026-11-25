const CROWN = {
  band: "M8 42H56V56H8Z",
  left: "M8 42L15 24L26.3 33.8",
  right: "M56 42L49 24L37.7 33.8",
  center: "M22 42L32 8L42 42",
} as const;

export function CrownMark({
  className = "h-9 w-9",
  draw = false,
}: {
  className?: string;
  draw?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" className={`${draw ? "crown-draw " : ""}${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3.25" strokeLinejoin="miter" strokeLinecap="butt">
        <path pathLength={1} d={CROWN.band} />
        <path pathLength={1} d={CROWN.left} />
        <path pathLength={1} d={CROWN.right} />
        <path pathLength={1} d={CROWN.center} />
      </g>
    </svg>
  );
}
