export type ArvComp = {
  address: string;
  salePrice: number | null;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  saleDate: string;
  adjustment: number | null;
};

export type ArvSubject = {
  address: string;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
};

export type ArvDeal = {
  repairs: number | null;
  assignmentFee: number | null;
  arvPercent: number | null;
};

export type ArvMath = {
  compRates: (number | null)[];
  averagePerSqft: number | null;
  medianPerSqft: number | null;
  arv: number | null;
  medianArv: number | null;
  investorBuyPrice: number | null;
  maxAllowableOffer: number | null;
  buyerProfit: number | null;
};

export function blankComp(): ArvComp {
  return { address: "", salePrice: null, sqft: null, beds: null, baths: null, saleDate: "", adjustment: null };
}

/** Adjusted sale price divided by square feet. Adjustment is added to the sale price. */
export function compPricePerSqft(comp: ArvComp): number | null {
  if (comp.salePrice == null || comp.sqft == null || comp.sqft <= 0) return null;
  const adjusted = comp.salePrice + (comp.adjustment ?? 0);
  if (!Number.isFinite(adjusted) || adjusted <= 0) return null;
  return adjusted / comp.sqft;
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function moneyOrZero(value: number | null): number {
  return value != null && Number.isFinite(value) ? value : 0;
}

export function calculateArv(subject: ArvSubject, comps: ArvComp[], deal: ArvDeal): ArvMath {
  const compRates = comps.map(compPricePerSqft);
  const usable = compRates.filter((rate): rate is number => rate != null);
  const averagePerSqft = average(usable);
  const medianPerSqft = median(usable);
  const sqft = subject.sqft != null && subject.sqft > 0 ? subject.sqft : null;
  const arv = averagePerSqft != null && sqft != null ? averagePerSqft * sqft : null;
  const medianArv = medianPerSqft != null && sqft != null ? medianPerSqft * sqft : null;
  const percent = deal.arvPercent != null && Number.isFinite(deal.arvPercent) ? deal.arvPercent : null;
  const repairs = moneyOrZero(deal.repairs);
  const fee = moneyOrZero(deal.assignmentFee);
  const discounted = arv != null && percent != null ? arv * (percent / 100) : null;
  const investorBuyPrice = discounted != null ? discounted - repairs : null;
  const maxAllowableOffer = investorBuyPrice != null ? investorBuyPrice - fee : null;
  const buyerProfit = arv != null && investorBuyPrice != null ? arv - investorBuyPrice - repairs : null;
  return { compRates, averagePerSqft, medianPerSqft, arv, medianArv, investorBuyPrice, maxAllowableOffer, buyerProfit };
}

export function formatDollars(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatRate(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
