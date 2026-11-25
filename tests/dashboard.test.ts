import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("dashboard tables, settings, and unpublished inventory", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "crown-dashboard-"));
  process.env.DATABASE_PATH = path.join(dir, "test.sqlite");
  const { closeDb } = await import("../src/lib/db.ts");
  const { saveListing, searchPublished, countPublished, insertInquiry, updateInquiry } = await import("../src/lib/inventory.ts");
  const { saveSiteContact, getSiteContact } = await import("../src/lib/settings.ts");
  const { notifyLead } = await import("../src/lib/notify.ts");
  const { insertSeller, updateLead, getSeller } = await import("../src/lib/leads.ts");
  const { parseSeller } = await import("../src/lib/validate.ts");

  try {
    const migration = fs.readFileSync(new URL("../migrations/0002_dashboard.sql", import.meta.url), "utf8").trim().split("\n");
    assert.ok(migration.length >= 8);
    for (const line of migration) {
      assert.equal(line.includes("\n"), false);
      assert.match(line, /^(CREATE|ALTER) /);
      assert.ok(line.endsWith(";"));
    }

    await saveSiteContact("desk@example.com", "(202) 555-0148");
    const contact = await getSiteContact();
    assert.equal(contact.email, "desk@example.com");
    assert.equal(contact.phoneIsLive, true);

    const id = await saveListing(
      {
        title: "Test house",
        propertyType: "House",
        status: "available",
        published: false,
        city: "Baltimore",
        state: "MD",
        address: "1 Main",
        showAddress: false,
        askingPrice: 100000,
        arv: 150000,
        repairs: 20000,
        beds: 3,
        baths: 2,
        sqft: 1200,
        description: "Hidden until published",
      },
      null,
    );
    assert.equal(await countPublished(), 0);
    assert.equal((await searchPublished({ state: "MD", type: "House", min: null, max: null })).length, 0);

    const inquiryId = await insertInquiry(id, { name: "Buyer", phone: "(202) 555-0199", email: "buyer@example.com", message: "Interested" }, { ip: "203.0.113.8", userAgent: "test" });
    await updateInquiry(inquiryId, "contacted", "Called once");

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
    form.set("description", "Needs work");
    form.set("tcpa", "yes");
    const parsed = parseSeller(form);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const sellerId = await insertSeller(parsed.data, { ip: "203.0.113.9", userAgent: "test" });
    await updateLead("sellers", sellerId, "contacted", "Left a voicemail");
    const seller = await getSeller(sellerId);
    assert.equal(seller?.status, "contacted");
    assert.equal(seller?.notes, "Left a voicemail");

    await notifyLead("Test", ["Line"], "/admin");
  } finally {
    closeDb();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
