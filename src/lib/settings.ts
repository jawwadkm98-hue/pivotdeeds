import { brand, phoneIsLive } from "@brand";
import { getSql } from "./db";

export type SiteContact = {
  email: string;
  phone: string;
  phoneIsLive: boolean;
};

export function phoneLooksLive(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return national.length === 10 && !/^0+$/.test(national);
}

export function phoneTel(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return `tel:+1${national}`;
}

export async function getSiteContact(): Promise<SiteContact> {
  try {
    const sql = await getSql();
    const rows = await sql.all<{ key: string; value: string }>("SELECT key, value FROM site_settings WHERE key IN ('email', 'phone')");
    const saved = new Map(rows.map((row) => [row.key, row.value]));
    const email = saved.get("email")?.trim() || brand.email;
    const phone = saved.get("phone")?.trim() || brand.phone;
    return { email, phone, phoneIsLive: phoneLooksLive(phone) || (phone === brand.phone && phoneIsLive()) };
  } catch {
    return { email: brand.email, phone: brand.phone, phoneIsLive: phoneIsLive() };
  }
}

export async function saveSiteContact(email: string, phone: string): Promise<void> {
  const sql = await getSql();
  await sql.run("INSERT INTO site_settings (key, value) VALUES ('email', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [email]);
  await sql.run("INSERT INTO site_settings (key, value) VALUES ('phone', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [phone]);
}
