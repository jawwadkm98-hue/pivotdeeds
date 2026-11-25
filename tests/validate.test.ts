import assert from "node:assert/strict";
import test from "node:test";
import { STATES } from "../src/lib/constants.ts";
import { csvCell, toCsv } from "../src/lib/csv.ts";
import { honeypotTripped, isTooFast, parseBuyer, parseContact, parseSeller, photoError } from "../src/lib/validate.ts";

function sellerForm(overrides: Record<string, string> = {}, omit: string[] = []) {
  const values: Record<string, string> = {
    asset_category: "real_estate",
    name: "Ada Lovelace",
    phone: "(202) 555-0148",
    email: "Ada@Example.com",
    address: "123 Market Street",
    city: "Baltimore",
    state: "md",
    zip: "21201",
    property_type: "House",
    condition: "Fair, needs some work",
    timeline: "Within 30 days",
    asking_price: "$250,000",
    reason: "Inherited property",
    description: "Estate sale, vacant.",
    tcpa: "yes",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (!omit.includes(key)) form.set(key, value);
  }
  return form;
}

test("state list covers 50 states and Washington, D.C.", () => {
  const codes = STATES.map(([code]) => code);
  assert.equal(codes.length, 51);
  assert.equal(new Set(codes).size, 51);
  assert.ok(codes.includes("DC"));
  assert.ok(codes.includes("MD"));
  assert.ok(codes.includes("CA"));
});

test("seller form accepts a complete submission and normalizes fields", () => {
  const parsed = parseSeller(sellerForm());
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.data.email, "ada@example.com");
  assert.equal(parsed.data.phone, "(202) 555-0148");
  assert.equal(parsed.data.state, "MD");
  assert.equal(parsed.data.askingPrice, 250000);
  assert.equal(parsed.data.reason, "Inherited property");
});

test("seller form rejects a missing consent box, a bad phone, and a bad ZIP", () => {
  const missingConsent = parseSeller(sellerForm({}, ["tcpa"]));
  assert.equal(missingConsent.ok, false);
  if (!missingConsent.ok) assert.match(missingConsent.fieldErrors.tcpa, /consent/i);

  const badPhone = parseSeller(sellerForm({ phone: "(000) 000-0000" }));
  assert.equal(badPhone.ok, false);
  if (!badPhone.ok) assert.ok(badPhone.fieldErrors.phone);

  const badZip = parseSeller(sellerForm({ zip: "212" }));
  assert.equal(badZip.ok, false);
  if (!badZip.ok) assert.ok(badZip.fieldErrors.zip);

  const zipPlus4 = parseSeller(sellerForm({ zip: "21201-1234", asking_price: "" }));
  assert.equal(zipPlus4.ok, true);
  if (zipPlus4.ok) assert.equal(zipPlus4.data.askingPrice, null);
});

test("buyer form requires markets, a buy box, proof of funds, and consent", () => {
  const form = new FormData();
  form.append("categories", "real_estate");
  form.set("name", "Grace Hopper");
  form.set("phone", "4155550199");
  form.set("email", "grace@example.com");
  form.set("company", "Hopper Holdings");
  form.set("market_scope", "specific");
  form.append("markets", "TX");
  form.append("markets", "tx");
  form.append("property_types", "House");
  form.append("property_types", "Land / lot");
  form.set("price_range", "Any price");
  form.set("buy_box", "Brick houses and infill lots.");
  form.set("proof_of_funds", "yes");
  form.set("tcpa", "yes");
  const parsed = parseBuyer(form);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.data.markets, "Texas");
  assert.equal(parsed.data.propertyTypes, "House; Land / lot");
  assert.equal(parsed.data.proofOfFunds, "yes");

  form.set("market_scope", "nationwide");
  const nationwide = parseBuyer(form);
  assert.equal(nationwide.ok, true);
  if (nationwide.ok) assert.match(nationwide.data.markets, /Nationwide/);

  form.set("market_scope", "specific");
  form.delete("markets");
  const missingStates = parseBuyer(form);
  assert.equal(missingStates.ok, false);

  form.append("markets", "TX");
  form.set("tcpa", "no");
  const badConsent = parseBuyer(form);
  assert.equal(badConsent.ok, false);
});

test("contact form allows a blank phone and requires a real message", () => {
  const form = new FormData();
  form.set("name", "Lin Wang");
  form.set("email", "lin@example.com");
  form.set("message", "Do you buy vacant land?");
  form.set("consent", "yes");
  const parsed = parseContact(form);
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.data.phone, null);

  form.set("message", "too short");
  assert.equal(parseContact(form).ok, false);
});

test("metals require a description and a known item type", () => {
  const form = new FormData();
  form.set("asset_category", "precious_metals");
  form.set("name", "Ada Lovelace");
  form.set("phone", "(202) 555-0148");
  form.set("email", "ada@example.com");
  form.set("city", "Baltimore");
  form.set("state", "MD");
  form.set("zip", "21201");
  form.set("timeline", "Within 30 days");
  form.set("item_type", "Gold coins");
  form.set("weight", "2 oz");
  form.set("purity", "22k");
  form.set("description", "Two gold coins in a flip.");
  form.set("tcpa", "yes");
  const parsed = parseSeller(form);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.data.assetCategory, "precious_metals");
    assert.equal(parsed.data.address, null);
  }
  form.set("description", "short");
  assert.equal(parseSeller(form).ok, false);
});

test("photo rules reject the wrong type and a fourth file", () => {
  assert.equal(photoError([]), null);
  assert.equal(photoError([{ type: "image/gif", size: 100 }]), "Photos must be JPG, PNG, or WebP.");
  assert.equal(
    photoError([
      { type: "image/jpeg", size: 10 },
      { type: "image/png", size: 10 },
      { type: "image/webp", size: 10 },
      { type: "image/jpeg", size: 10 },
    ]),
    "You can attach up to 3 photos.",
  );
});

test("a buyer who only wants gold does not need property types", () => {
  const form = new FormData();
  form.set("name", "Grace Hopper");
  form.set("phone", "4155550199");
  form.set("email", "grace@example.com");
  form.append("categories", "precious_metals");
  form.set("market_scope", "nationwide");
  form.set("price_range", "Any price");
  form.set("buy_box", "US gold coins and bars only.");
  form.set("proof_of_funds", "yes");
  form.set("tcpa", "yes");
  const parsed = parseBuyer(form);
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.match(parsed.data.categories, /Gold/);
});

test("honeypot and too-fast traps", () => {
  const clean = new FormData();
  assert.equal(honeypotTripped(clean), false);
  clean.set("company_url", "https://spam.example");
  assert.equal(honeypotTripped(clean), true);
  assert.equal(isTooFast(""), false);
  assert.equal(isTooFast("not-a-time"), true);
  assert.equal(isTooFast(String(1_700_000_000_000), 1_700_000_000_000 + 500), true);
  assert.equal(isTooFast(String(1_700_000_000_000), 1_700_000_000_000 + 5_000), false);
});

test("csv cells neutralize spreadsheet formulas", () => {
  assert.equal(csvCell("=1+1"), "'=1+1");
  assert.equal(csvCell("hello"), "hello");
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  const csv = toCsv(["notes"], [["=cmd|'/c calc'"]]);
  assert.ok(csv.charCodeAt(0) === 0xfeff);
  assert.match(csv, /'=cmd/);
});
