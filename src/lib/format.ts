/** Admin timestamps display in Eastern Time. Change the zone here if the business prefers another. */
const TIME_ZONE = "America/New_York";

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(date);
  return `${formatted} ET`;
}

export function formatMoney(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function queryValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  return raw.slice(0, 80);
}

export function pageValue(value: string | string[] | undefined): number {
  const parsed = Number(queryValue(value));
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

export function likeQuery(raw: string): string {
  return raw.trim().slice(0, 80).replace(/[%_\\]/g, "");
}
