"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { brand } from "@brand";
import {
  SESSION_COOKIE,
  adminConfigured,
  adminPassword,
  createSessionToken,
  passwordMatches,
  sessionCookieOptions,
} from "./auth";
import { errorState, formValues, successState, type FormState, type LoginState } from "./form-state";
import { deleteSeller, insertBuyer, insertMessage, insertSeller, saveSellerPhotos, type RequestMeta } from "./leads";
import { LEAD_LIMIT, LEAD_WINDOW_MS, LOGIN_LIMIT, LOGIN_WINDOW_MS, consumeRate } from "./rate-limit";
import { PHOTO_TYPES, honeypotTripped, isTooFast, parseBuyer, parseContact, parseSeller, photoError } from "./validate";

const SELLER_KEYS = [
  "asset_category",
  "name",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "zip",
  "property_type",
  "condition",
  "timeline",
  "asking_price",
  "reason",
  "description",
  "item_type",
  "weight",
  "purity",
  "certification",
  "quantity",
  "tcpa",
] as const;

const BUYER_KEYS = [
  "name",
  "phone",
  "email",
  "company",
  "categories",
  "market_scope",
  "markets",
  "property_types",
  "price_range",
  "buy_box",
  "proof_of_funds",
  "tcpa",
] as const;

const CONTACT_KEYS = ["name", "email", "phone", "message", "consent"] as const;

async function requestMeta(): Promise<RequestMeta> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown").slice(0, 80);
  const userAgent = (headerList.get("user-agent") || "").slice(0, 300);
  return { ip, userAgent };
}

async function trapped(formData: FormData, ip: string): Promise<boolean> {
  if (!honeypotTripped(formData) && !isTooFast(formData.get("form_started"))) return false;
  await consumeRate(ip, "lead", LEAD_LIMIT, LEAD_WINDOW_MS);
  return true;
}

const sellerSuccess = `We received your information. We will review it and follow up at the email or phone you provided. There is no obligation to accept an offer.`;
const buyerSuccess = `You are on the ${brand.name} cash buyers list. We will contact you when a property fits what you described. Joining the list does not reserve a property or guarantee that one will be offered.`;
const contactSuccess = `We received your message and will reply at the email you provided.`;

function rateMessage(): string {
  return `You've sent several requests in a short time. Please wait about 15 minutes and try again, or email ${brand.email}.`;
}

export async function submitSeller(_prev: FormState, formData: FormData): Promise<FormState> {
  const meta = await requestMeta();
  if (await trapped(formData, meta.ip)) return successState(sellerSuccess);
  const values = formValues(formData, SELLER_KEYS);
  const parsed = parseSeller(formData);
  if (!parsed.ok) {
    return errorState("Please fix the highlighted fields.", parsed.fieldErrors, values);
  }
  const photoEntries = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const photoProblem = photoError(photoEntries.map((file) => ({ type: file.type, size: file.size })));
  if (photoProblem) {
    return errorState(photoProblem, { photos: photoProblem }, values);
  }
  if (!(await consumeRate(meta.ip, "lead", LEAD_LIMIT, LEAD_WINDOW_MS))) {
    return errorState(rateMessage(), {}, values);
  }
  let leadId = 0;
  try {
    leadId = await insertSeller(parsed.data, meta);
    const files = [];
    for (const file of photoEntries) {
      files.push({ ext: PHOTO_TYPES[file.type], bytes: Buffer.from(await file.arrayBuffer()) });
    }
    try {
      await saveSellerPhotos(leadId, files);
    } catch (error) {
      console.error("photo save skipped", error instanceof Error ? error.message : "unknown");
    }
  } catch (error) {
    if (leadId) await deleteSeller(leadId);
    console.error("seller insert failed", error instanceof Error ? error.message : "unknown");
    return errorState(`Something went wrong saving your request. Email ${brand.email} and we will take it from there.`, {}, values);
  }
  return successState(sellerSuccess);
}

export async function submitBuyer(_prev: FormState, formData: FormData): Promise<FormState> {
  const meta = await requestMeta();
  if (await trapped(formData, meta.ip)) return successState(buyerSuccess);
  const values = formValues(formData, BUYER_KEYS);
  const parsed = parseBuyer(formData);
  if (!parsed.ok) {
    return errorState("Please fix the highlighted fields.", parsed.fieldErrors, values);
  }
  if (!(await consumeRate(meta.ip, "lead", LEAD_LIMIT, LEAD_WINDOW_MS))) {
    return errorState(rateMessage(), {}, values);
  }
  try {
    await insertBuyer(parsed.data, meta);
  } catch (error) {
    console.error("buyer insert failed", error instanceof Error ? error.message : "unknown");
    return errorState(`Something went wrong saving your request. Email ${brand.email} and we will take it from there.`, {}, values);
  }
  return successState(buyerSuccess);
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const meta = await requestMeta();
  if (await trapped(formData, meta.ip)) return successState(contactSuccess);
  const values = formValues(formData, CONTACT_KEYS);
  const parsed = parseContact(formData);
  if (!parsed.ok) {
    return errorState("Please fix the highlighted fields.", parsed.fieldErrors, values);
  }
  if (!(await consumeRate(meta.ip, "lead", LEAD_LIMIT, LEAD_WINDOW_MS))) {
    return errorState(rateMessage(), {}, values);
  }
  try {
    await insertMessage(parsed.data, meta);
  } catch (error) {
    console.error("contact insert failed", error instanceof Error ? error.message : "unknown");
    return errorState(`Something went wrong saving your message. Email ${brand.email} instead.`, {}, values);
  }
  return successState(contactSuccess);
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!(await adminConfigured())) {
    return { error: "Admin is not configured. Set ADMIN_PASSWORD and SESSION_SECRET on the server." };
  }
  const meta = await requestMeta();
  if (!(await consumeRate(meta.ip, "login", LOGIN_LIMIT, LOGIN_WINDOW_MS))) {
    return { error: "Too many sign-in attempts. Wait 15 minutes and try again." };
  }
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password, await adminPassword())) {
    return { error: "That password is incorrect." };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  redirect("/admin/login");
}
