import { brand } from "@brand";

export const legalUpdated = "November 25, 2026";

export const disclosures = [
  {
    id: "not-a-broker",
    text: `${brand.name} is a real estate investor and cash buyer. We are not a licensed real estate broker or agent in any state, and we do not represent sellers or buyers as their agent. We buy properties for our own account.`,
  },
  {
    id: "assignment",
    text: `${brand.name} may assign its purchase contract to another buyer or resell a property for a profit. That is one way a wholesale purchase works, and we say so before you are asked to sign. Some states require a specific written disclosure. Maryland Real Property § 10-715, for example, requires a wholesale buyer of certain owner-occupied residential property (one to four units) to disclose in writing, before the contract is signed, that the contract may be assigned. It also requires a person assigning that kind of contract to tell the new buyer, before the assignment, that they hold an equitable interest and may not be able to convey title. A notice on this website does not take the place of those written disclosures. The law of the state where the property sits controls that deal.`,
  },
  {
    id: "not-foreclosure",
    text: "We are not a foreclosure consultant and we do not offer foreclosure rescue, loan modification, or credit-repair services. If a property is in foreclosure, a cash offer to purchase it is the only thing we can propose.",
  },
  {
    id: "no-obligation",
    text: "Requesting an offer, receiving an offer, or joining the buyers list does not obligate you to sell or to buy. Nothing on this website is legal, tax, or financial advice.",
  },
  {
    id: "fair-housing",
    text: "We follow the federal Fair Housing Act. We do not discriminate based on race, color, religion, sex, disability, familial status, national origin, or any other characteristic protected by applicable law.",
  },
] as const;
