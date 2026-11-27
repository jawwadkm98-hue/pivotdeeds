"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { brand } from "@brand";
import {
  SESSION_COOKIE,
  adminConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "./auth";
import { errorState, formValues, successState, type FormState, type LoginState } from "./form-state";
import { getPublishedListing, insertInquiry } from "./inventory";
import { deleteSeller, insertBuyer, insertMessage, insertSeller, saveSellerPhotos, type RequestMeta } from "./leads";
import { notifyLead } from "./notify";
import { LEAD_LIMIT, LEAD_WINDOW_MS, LOGIN_LIMIT, LOGIN_WINDOW_MS, consumeRate } from "./rate-limit";
import { getSiteContact } from "./settings";
import { PHOTO_TYPES, honeypotTripped, isTooFast, parseBuyer, parseContact, parseInquiry, parseSeller, photoError } from "./validate";

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

async function rateMessage(): Promise<string> {
  const contact = await getSiteContact();
  return `You've sent several requests in a short time. Please wait about 15 minutes and try again, or email ${contact.email}.`;
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
    return errorState(await rateMessage(), {}, values);
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
    const contact = await getSiteContact();
    return errorState(`Something went wrong saving your request. Email ${contact.email} and we will take it from there.`, {}, values);
  }
  await notifyLead(`New seller lead #${leadId}`, [
    `Name: ${parsed.data.name}`,
    `Phone: ${parsed.data.phone}`,
    `Email: ${parsed.data.email}`,
    `Category: ${parsed.data.assetCategory}`,
    `Location: ${parsed.data.city}, ${parsed.data.state} ${parsed.data.zip}`,
    parsed.data.address ? `Address: ${parsed.data.address}` : "",
    parsed.data.description ? `Description: ${parsed.data.description}` : "",
  ].filter(Boolean), `/admin/sellers/${leadId}`);
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
    return errorState(await rateMessage(), {}, values);
  }
  let buyerId = 0;
  try {
    buyerId = await insertBuyer(parsed.data, meta);
  } catch (error) {
    console.error("buyer insert failed", error instanceof Error ? error.message : "unknown");
    const contact = await getSiteContact();
    return errorState(`Something went wrong saving your request. Email ${contact.email} and we will take it from there.`, {}, values);
  }
  await notifyLead(`New buyer signup: ${parsed.data.name}`, [
    `Name: ${parsed.data.name}`,
    `Phone: ${parsed.data.phone}`,
    `Email: ${parsed.data.email}`,
    parsed.data.company ? `Company: ${parsed.data.company}` : "",
    `Categories: ${parsed.data.categories}`,
    `Markets: ${parsed.data.markets}`,
    `Price range: ${parsed.data.priceRange}`,
    `Buy box: ${parsed.data.buyBox}`,
  ].filter(Boolean), `/admin/buyers/${buyerId}`);
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
    return errorState(await rateMessage(), {}, values);
  }
  let messageId = 0;
  try {
    messageId = await insertMessage(parsed.data, meta);
  } catch (error) {
    console.error("contact insert failed", error instanceof Error ? error.message : "unknown");
    const contact = await getSiteContact();
    return errorState(`Something went wrong saving your message. Email ${contact.email} instead.`, {}, values);
  }
  await notifyLead(`New message from ${parsed.data.name}`, [
    `Name: ${parsed.data.name}`,
    `Email: ${parsed.data.email}`,
    parsed.data.phone ? `Phone: ${parsed.data.phone}` : "",
    `Message: ${parsed.data.message}`,
  ].filter(Boolean), `/admin/messages/${messageId}`);
  return successState(contactSuccess);
}

const inquirySuccess = `We received your interest. ${brand.name} will follow up if this deal is still available. Sending this form does not reserve the property.`;

export async function submitInquiry(inventoryId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const listing = await getPublishedListing(inventoryId);
  if (!listing) return errorState("That listing is no longer available.", {}, {});
  const meta = await requestMeta();
  if (await trapped(formData, meta.ip)) return successState(inquirySuccess);
  const values = formValues(formData, ["name", "phone", "email", "message", "tcpa"] as const);
  const parsed = parseInquiry(formData);
  if (!parsed.ok) return errorState("Please fix the highlighted fields.", parsed.fieldErrors, values);
  if (!(await consumeRate(meta.ip, "lead", LEAD_LIMIT, LEAD_WINDOW_MS))) {
    return errorState(await rateMessage(), {}, values);
  }
  try {
    const id = await insertInquiry(listing.id, parsed.data, meta);
    await notifyLead(`Interest in ${listing.title}`, [
      `Listing: ${listing.title} (#${listing.id})`,
      `Place: ${listing.city}, ${listing.state}`,
      `Name: ${parsed.data.name}`,
      `Phone: ${parsed.data.phone}`,
      `Email: ${parsed.data.email}`,
      parsed.data.message ? `Message: ${parsed.data.message}` : "",
    ].filter(Boolean), `/admin/inquiries/${id}`);
  } catch (error) {
    console.error("inquiry insert failed", error instanceof Error ? error.message : "unknown");
    const contact = await getSiteContact();
    return errorState(`Something went wrong saving your interest. Email ${contact.email} instead.`, {}, values);
  }
  return successState(inquirySuccess);
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
  if (!(await verifyAdminPassword(password))) {
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
