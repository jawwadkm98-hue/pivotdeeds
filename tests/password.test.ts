import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  equalHex,
  hashPassword,
  PBKDF2_ITERATIONS,
  PBKDF2_SALT_BYTES,
  verifyPbkdf2,
} from "../src/lib/password.ts";
import { parseChangePasswordPayload, validateNewPassword } from "../src/lib/change-password.ts";

const CURRENT = "current-pass-ok";
const NEXT = "replacement-pass-ok";

test("PBKDF2-SHA256 hashes are 32 bytes, use 100k iterations, and verify in constant time", async () => {
  const hashed = await hashPassword(CURRENT);
  assert.equal(hashed.iterations, PBKDF2_ITERATIONS);
  assert.equal(hashed.saltHex.length, PBKDF2_SALT_BYTES * 2);
  assert.equal(hashed.hashHex.length, 64);
  assert.equal(
    await verifyPbkdf2(CURRENT, {
      hashHex: hashed.hashHex,
      saltHex: hashed.saltHex,
      iterations: hashed.iterations,
      version: 1,
    }),
    true,
  );
  assert.equal(
    await verifyPbkdf2("wrong-password-xx", {
      hashHex: hashed.hashHex,
      saltHex: hashed.saltHex,
      iterations: hashed.iterations,
      version: 1,
    }),
    false,
  );
  const again = await hashPassword(CURRENT, Buffer.from(hashed.saltHex, "hex"));
  assert.equal(equalHex(again.hashHex, hashed.hashHex), true);
  const other = await hashPassword(CURRENT);
  assert.equal(equalHex(other.hashHex, hashed.hashHex), false);
  assert.equal(equalHex(hashed.hashHex, "abcd"), false);
});

test("a stored hash with too few iterations is rejected", async () => {
  const hashed = await hashPassword(CURRENT, undefined, 50_000);
  assert.equal(
    await verifyPbkdf2(CURRENT, {
      hashHex: hashed.hashHex,
      saltHex: hashed.saltHex,
      iterations: 50_000,
      version: 1,
    }),
    false,
  );
});

test("new password validation enforces length, confirmation, and a change", () => {
  assert.match(validateNewPassword("short", "short", CURRENT) ?? "", /at least 12/i);
  assert.equal(validateNewPassword(NEXT, "something-else-12", CURRENT), "The new password and confirmation do not match.");
  assert.equal(validateNewPassword(CURRENT, CURRENT, CURRENT), "Choose a new password that is different from the current one.");
  assert.equal(validateNewPassword(NEXT, NEXT, CURRENT), null);
  const parsed = parseChangePasswordPayload({
    currentPassword: CURRENT,
    newPassword: NEXT,
    confirmPassword: NEXT,
  });
  assert.ok(!("error" in parsed));
  if ("error" in parsed) return;
  assert.equal(parsed.newPassword, NEXT);
  assert.equal(parseChangePasswordPayload(null).error, "Missing password details.");
});

test("ARV-style migration is one statement per line", () => {
  const lines = fs.readFileSync(new URL("../migrations/0004_password.sql", import.meta.url), "utf8").trim().split("\n");
  assert.equal(lines.length, 1);
  assert.equal(lines[0].endsWith(";"), true);
  assert.match(lines[0], /^CREATE TABLE IF NOT EXISTS admin_password /);
});

test("login uses the worker secret until a hash is stored, then the hash wins", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "crown-password-"));
  process.env.DATABASE_PATH = path.join(dir, "test.sqlite");
  process.env.SESSION_SECRET = "test-session-secret-value-ok";
  process.env.ADMIN_PASSWORD = CURRENT;
  process.env.COOKIE_SECURE = "false";

  const { closeDb } = await import("../src/lib/db.ts");
  const { getPasswordVersion, hasStoredPassword, savePasswordHash } = await import("../src/lib/password.ts");
  const { createSessionToken, verifyAdminPassword, verifySessionToken } = await import("../src/lib/auth.ts");
  const { changeAdminPassword } = await import("../src/lib/change-password.ts");

  try {
    assert.equal(await hasStoredPassword(), false);
    assert.equal(await getPasswordVersion(), 0);
    assert.equal(await verifyAdminPassword(CURRENT), true);
    assert.equal(await verifyAdminPassword("wrong-password-xx"), false);

    const before = await createSessionToken();
    assert.equal(await verifySessionToken(before), true);

    const result = await changeAdminPassword({
      currentPassword: CURRENT,
      newPassword: NEXT,
      confirmPassword: NEXT,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.version, 1);
    assert.equal(await hasStoredPassword(), true);
    assert.equal(await getPasswordVersion(), 1);

    // Dashboard hash is used even though the env secret is unchanged.
    assert.equal(await verifyAdminPassword(NEXT), true);
    assert.equal(await verifyAdminPassword(CURRENT), false);

    assert.equal(await verifySessionToken(before), false);
    const after = await createSessionToken();
    assert.equal(await verifySessionToken(after), true);

    const wrongCurrent = await changeAdminPassword({
      currentPassword: CURRENT,
      newPassword: "another-pass-ok",
      confirmPassword: "another-pass-ok",
    });
    assert.equal(wrongCurrent.ok, false);
    if (!wrongCurrent.ok) assert.equal(wrongCurrent.status, 401);

    const tooShort = await changeAdminPassword({
      currentPassword: NEXT,
      newPassword: "short",
      confirmPassword: "short",
    });
    assert.equal(tooShort.ok, false);
    if (!tooShort.ok) assert.equal(tooShort.status, 400);

    await savePasswordHash("third-password-ok");
    assert.equal(await getPasswordVersion(), 2);
    assert.equal(await verifySessionToken(after), false);
    assert.equal(await verifyAdminPassword("third-password-ok"), true);
  } finally {
    closeDb();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
