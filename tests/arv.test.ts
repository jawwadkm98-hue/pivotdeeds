import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { calculateArv, compPricePerSqft, type ArvComp } from "../src/lib/arv.ts";

function comp(partial: Partial<ArvComp>): ArvComp {
  return { address: "", salePrice: null, sqft: null, beds: null, baths: null, saleDate: "", adjustment: null, ...partial };
}

test("ARV uses average adjusted price per square foot and the 70 percent offer", () => {
  const first = comp({ salePrice: 200_000, sqft: 1_000, adjustment: 10_000 });
  const second = comp({ salePrice: 180_000, sqft: 1_000 });
  assert.equal(compPricePerSqft(first), 210);
  assert.equal(compPricePerSqft(second), 180);
  const result = calculateArv(
    { address: "1 Main", sqft: 1_500, beds: 3, baths: 2 },
    [first, second],
    { repairs: 20_000, assignmentFee: 10_000, arvPercent: 70 },
  );
  assert.equal(result.averagePerSqft, 195);
  assert.equal(result.medianPerSqft, 195);
  assert.equal(result.arv, 292_500);
  assert.equal(result.investorBuyPrice, 292_500 * 0.7 - 20_000);
  assert.equal(result.maxAllowableOffer, 292_500 * 0.7 - 20_000 - 10_000);
  assert.equal(result.buyerProfit, 292_500 - result.investorBuyPrice! - 20_000);
});

test("median ARV differs from the average when a third comp is added", () => {
  const result = calculateArv(
    { address: "", sqft: 1_000, beds: null, baths: null },
    [comp({ salePrice: 100_000, sqft: 1_000 }), comp({ salePrice: 200_000, sqft: 1_000 }), comp({ salePrice: 300_000, sqft: 1_000 })],
    { repairs: 0, assignmentFee: 0, arvPercent: 70 },
  );
  assert.equal(result.averagePerSqft, 200);
  assert.equal(result.medianPerSqft, 200);
  const skewed = calculateArv(
    { address: "", sqft: 1_000, beds: null, baths: null },
    [comp({ salePrice: 100_000, sqft: 1_000 }), comp({ salePrice: 110_000, sqft: 1_000 }), comp({ salePrice: 400_000, sqft: 1_000 })],
    { repairs: null, assignmentFee: null, arvPercent: 70 },
  );
  assert.equal(skewed.medianPerSqft, 110);
  assert.ok((skewed.averagePerSqft ?? 0) > 110);
  assert.equal(skewed.medianArv, 110_000);
});

test("a comp without square feet is left out of the average", () => {
  const result = calculateArv(
    { address: "", sqft: 2_000, beds: null, baths: null },
    [comp({ salePrice: 100_000, sqft: null }), comp({ salePrice: 150_000, sqft: 1_000 })],
    { repairs: 0, assignmentFee: 0, arvPercent: 70 },
  );
  assert.equal(result.compRates[0], null);
  assert.equal(result.arv, 300_000);
});

test("ARV migration is one statement per line", () => {
  const lines = fs.readFileSync(new URL("../migrations/0003_arv.sql", import.meta.url), "utf8").trim().split("\n");
  assert.deepEqual(lines.map((line) => line.endsWith(";")), [true, true]);
  assert.match(lines[0], /^CREATE TABLE IF NOT EXISTS arv_calculations /);
});
