/** Approved outline crown. Center peak is wide and low; a solid jewel sits above each tip. */
export const CROWN_STROKE = 3.2;

export const CROWN_BAND = "M7 44H57V56.5H7Z";
export const CROWN_LEFT = "M7 44L13 27.6L19 44";
export const CROWN_RIGHT = "M57 44L51 27.6L45 44";
export const CROWN_CENTER = "M19 44L32 24.4L45 44";

export const CROWN_JEWELS = [
  { cx: 13, cy: 19.6, r: 2.35 },
  { cx: 32, cy: 16.2, r: 2.35 },
  { cx: 51, cy: 19.6, r: 2.35 },
] as const;
