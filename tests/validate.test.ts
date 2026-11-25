import assert from "node:assert/strict";
import test from "node:test";
import { STATES } from "../src/lib/constants.ts";
import { csvCell, toCsv } from "../src/lib/csv.ts";
import { honeypotTripped, isTooFast, parseBuyer, parseContact, parseSeller } from "../src/lib/validate.ts";

function sellerForm(overrides: Record<string, string> = {}, omit: string[] = []) {
  const values: Record<string, string> = {
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
    notes: "Estate sale, vacant.",
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
