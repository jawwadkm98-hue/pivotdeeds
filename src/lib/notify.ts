import { brand } from "@brand";
import { cloudflareEnv, isCloudflareWorker } from "./db";

export const NOTIFY_TO = "crownwholesalersusa@gmail.com";
export const NOTIFY_FROM = "leads@crownwholesalers.com";

export async function notifyLead(subject: string, lines: string[], adminPath: string): Promise<void> {
  if (!isCloudflareWorker()) return;
  try {
    const env = await cloudflareEnv();
    if (!env.NOTIFY_EMAIL) return;
    const { createMimeMessage } = await import("mimetext/browser");
    const load = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{ EmailMessage: new (from: string, to: string, raw: string) => unknown }>;
    const { EmailMessage } = await load("cloudflare:email");
    const message = createMimeMessage();
    message.setSender({ name: brand.name, addr: NOTIFY_FROM });
    message.setRecipient(NOTIFY_TO);
    message.setSubject(subject.slice(0, 180));
    message.addMessage({
      contentType: "text/plain",
      data: [...lines, "", `Admin: ${brand.siteUrl}${adminPath}`].join("\n"),
    });
    await env.NOTIFY_EMAIL.send(new EmailMessage(NOTIFY_FROM, NOTIFY_TO, message.asRaw()));
  } catch (error) {
    console.error("notify email failed", error instanceof Error ? error.message : "unknown");
  }
}
