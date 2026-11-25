import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseSeller } from "../src/lib/validate.ts";

test("sqlite stores a seller lead, searches it, exports csv, and rate limits", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "crownwholesalers-"));
  process.env.DATABASE_PATH = path.join(dir, "test.sqlite");
  const { closeDb, getSql } = await import("../src/lib/db.ts");
  const { consumeRate } = await import("../src/lib/rate-limit.ts");
  const { insertSeller, searchSellers, sellersCsv } = await import("../src/lib/leads.ts");

  try {
    const parsed = parseSeller(
      (() => {
        const form = new FormData();
        form.set("asset_category", "real_estate");
        form.set("name", "Ada Lovelace");
        form.set("phone", "2025550148");
        form.set("email", "ada@example.com");
        form.set("address", "123 Market Street");
        form.set("city", "Baltimore");
        form.set("state", "MD");
        form.set("zip", "21201");
        form.set("property_type", "House");
        form.set("condition", "Fair, needs some work");
        form.set("timeline", "Within 30 days");
        form.set("description", "=1+1 keep");
        form.set("tcpa", "yes");
        return form;
      })(),
    );
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    await insertSeller(parsed.data, { ip: "203.0.113.10", userAgent: "test" });

    const found = await searchSellers("baltimore", 1);
    assert.equal(found.total, 1);
    assert.equal(found.rows[0]?.email, "ada@example.com");
    assert.equal(found.rows[0]?.tcpa_consent, 1);
    assert.equal((await searchSellers("nobody-home", 1)).total, 0);

    const csv = await sellersCsv();
    assert.match(csv, /Ada Lovelace/);
    assert.match(csv, /'=1\+1 keep/);

    const ip = "198.51.100.20";
    for (let attempt = 0; attempt < 6; attempt += 1) {
      assert.equal(await consumeRate(ip, "lead", 6, 60_000), true);
    }
    assert.equal(await consumeRate(ip, "lead", 6, 60_000), false);
    assert.equal(await consumeRate("198.51.100.21", "lead", 6, 60_000), true);
    await (await getSql()).run("UPDATE rate_events SET created_at = ?", [Date.now() - 120_000]);
    assert.equal(await consumeRate(ip, "lead", 6, 60_000), true);
  } finally {
    closeDb();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
