import { CROWN_BAND, CROWN_CENTER, CROWN_JEWELS, CROWN_LEFT, CROWN_RIGHT, CROWN_STROKE } from "./crown";

export function CrownMark({
  className = "h-9 w-9",
  draw = false,
}: {
  className?: string;
  draw?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" className={`${draw ? "crown-draw " : ""}${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth={CROWN_STROKE} strokeLinejoin="round" strokeLinecap="round">
        <path pathLength={1} d={CROWN_BAND} />
        <path pathLength={1} d={CROWN_LEFT} />
        <path pathLength={1} d={CROWN_RIGHT} />
        <path pathLength={1} d={CROWN_CENTER} />
      </g>
      <g fill="currentColor">
        {CROWN_JEWELS.map((jewel) => (
          <circle key={jewel.cx} cx={jewel.cx} cy={jewel.cy} r={jewel.r} />
        ))}
      </g>
    </svg>
  );
}
