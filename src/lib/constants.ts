export const STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

export type StateCode = (typeof STATES)[number][0];

export const STATE_NAME = new Map<string, string>(STATES);

export const PROPERTY_TYPES = [
  "House",
  "Condo",
  "Townhome",
  "Multifamily",
  "Land / lot",
  "Commercial",
  "Mobile home",
  "Other",
] as const;

export const CONDITIONS = [
  "Excellent, move-in ready",
  "Good, livable with minor updates",
  "Fair, needs some work",
  "Poor, major repairs",
  "Very poor, vacant or not safely habitable",
  "Not sure",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "Within 2 weeks",
  "Within 30 days",
  "1-3 months",
  "Flexible, just researching",
] as const;

export const REASONS = [
  "Inherited property",
  "Relocation",
  "Tired of managing a rental",
  "Divorce or separation",
  "Financial hardship",
  "Too many repairs",
  "Vacant property",
  "Pre-foreclosure",
  "Downsizing",
  "Behind on taxes",
  "Other",
] as const;

export const PRICE_RANGES = [
  "Under $100,000",
  "$100,000 to $250,000",
  "$250,000 to $500,000",
  "$500,000 to $1,000,000",
  "$1,000,000 or more",
  "Any price",
] as const;

export function includesOption(options: readonly string[], value: string): boolean {
  return options.includes(value);
}
