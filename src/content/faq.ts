import { brand } from "@brand";

export const faq = [
  {
    question: "Do I have to accept your offer?",
    answer:
      "No. Every offer is optional. You can say no, and we do not charge a fee for the request or for declining.",
  },
  {
    question: "Do you charge commissions or fees to sellers?",
    answer:
      "We do not charge a listing commission. We are not your agent. A written contract, if you accept an offer, will say who pays which ordinary closing costs. If there is a mortgage or other lien, it is typically paid from the sale proceeds at closing. We will not ask you to sign until those terms are in the contract.",
  },
  {
    question: "Do I need to repair the property or clean it out?",
    answer:
      "No. We buy as-is. You do not need to paint, replace a roof, or finish a renovation for us to make an offer. What stays or goes is written into the contract if you accept.",
  },
  {
    question: "How fast can you close?",
    answer:
      "Many sellers close in about one to three weeks, depending on title, payoff statements, and the date you want. You choose a timeline that works for you. We do not require a rushed closing.",
  },
  {
    question: "What areas do you cover?",
    answer: `${brand.serviceArea}. Send the address and we will tell you whether we can make an offer.`,
  },
  {
    question: "Are you a real estate agent or broker?",
    answer: `${brand.name} is a real estate investor and cash buyer. We do not represent sellers as an agent, and we do not list homes on the MLS for a commission.`,
  },
  {
    question: "Will you assign my contract or resell the property?",
    answer:
      "We may. We sometimes assign our purchase contract to another cash buyer, and we sometimes take title and resell. Where state law requires that disclosure, including Maryland Real Property § 10-715 for certain owner-occupied residential properties, we provide it in writing before the contract is signed. The notice in our footer is not a substitute for that contract disclosure.",
  },
  {
    question: "I am behind on payments or facing foreclosure. Can you help?",
    answer:
      "We can make a cash offer to buy the property. We are not a foreclosure consultant, and we do not offer rescue services, a promise to stop a sale, loan modification, or credit repair. For help understanding a foreclosure, talk with a lawyer or a housing counselor approved by the U.S. Department of Housing and Urban Development at hud.gov/counseling.",
  },
  {
    question: "How do you decide the price?",
    answer:
      "We look at location, condition, recent sales of similar properties, repairs, and what a cash buyer would pay. The offer is not a retail, fully repaired price, because we take on repairs, holding, and resale. You do not have to accept it.",
  },
  {
    question: "What property types do you buy?",
    answer:
      "Houses, condos, townhomes, multifamily, land and lots, mobile homes, and many commercial properties. If yours is not on that list, send it anyway and we will tell you if we can make an offer.",
  },
  {
    question: "I want to buy deals, not sell. How does the buyers list work?",
    answer:
      "Join the list with the markets, property types, and price range you actually buy. We contact you when something fits. We may ask for proof of funds before sharing an address. A listing on the list is not a promise of deals, and a property may be offered as an assignment of contract rather than a sale from the current owner.",
  },
  {
    question: "How is my information used?",
    answer: `We use it to review your property or your buy box and to contact you. To evaluate or complete a sale you asked about, we may share relevant details with a title company or a cash buyer. We do not sell your information as a marketing list. See the Privacy Policy, or email ${brand.email} to ask a question about your information.`,
  },
] as const;
