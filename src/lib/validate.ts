import {
  CERTIFICATIONS,
  CONDITIONS,
  JEWELRY_ITEMS,
  METAL_ITEMS,
  PRICE_RANGES,
  PROPERTY_TYPES,
  REASONS,
  STATE_NAME,
  TIMELINES,
  categoryLabel,
  includesOption,
  isAssetCategory,
  type AssetCategoryId,
} from "./constants";

export type FieldErrors = Record<string, string>;

export type SellerInput = {
  assetCategory: AssetCategoryId;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  timeline: string;
  askingPrice: number | null;
  description: string | null;
  address: string | null;
  propertyType: string | null;
  condition: string | null;
  reason: string | null;
  itemType: string | null;
  weight: string | null;
  purity: string | null;
  certification: string | null;
  quantity: string | null;
};

export type BuyerInput = {
  name: string;
  phone: string;
  email: string;
  company: string | null;
  categories: string;
  markets: string;
  propertyTypes: string;
  priceRange: string;
  buyBox: string;
  proofOfFunds: "yes" | "no";
};

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function photoError(files: { type: string; size: number }[]): string | null {
  const attached = files.filter((file) => file.size > 0);
  if (attached.length > MAX_PHOTOS) return `You can attach up to ${MAX_PHOTOS} photos.`;
  for (const file of attached) {
    if (!PHOTO_TYPES[file.type]) return "Photos must be JPG, PNG, or WebP.";
    if (file.size > MAX_PHOTO_BYTES) return "Each photo must be 4 MB or smaller.";
  }
  return null;
}

export type ContactInput = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; fieldErrors: FieldErrors };
export type ParseResult<T> = Ok<T> | Err;

const NAME_RE = /^[\p{L}][\p{L}\s.'’-]*[\p{L}.]$/u;
const CITY_RE = /^[\p{L}][\p{L}\s.'’-]*[\p{L}.]$/u;
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const ZIP_RE = /^\d{5}(?:-\d{4})?$/;
const COMPANY_RE = /^[\p{L}\p{N}][\p{L}\p{N}\s.&',’-]*$/u;

export function cleanLine(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanBlock(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

export function formatPhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function add(errors: FieldErrors, key: string, message: string) {
  if (!errors[key]) errors[key] = message;
}

function requireName(errors: FieldErrors, name: string) {
  if (name.length < 2 || name.length > 80 || !NAME_RE.test(name)) {
    add(errors, "name", "Enter your full name using letters.");
  }
}

function requireEmail(errors: FieldErrors, email: string) {
  if (email.length > 160 || !EMAIL_RE.test(email)) {
    add(errors, "email", "Enter a valid email address.");
  }
}

export function honeypotTripped(formData: FormData): boolean {
  return cleanLine(formData.get("company_url"), 300).length > 0;
}

/** True when a submitted timestamp is present and the form came back too quickly, or the stamp is garbage. */
export function isTooFast(value: FormDataEntryValue | null, now = Date.now()): boolean {
  const raw = String(value ?? "");
  if (!raw) return false;
  if (!/^\d{13}$/.test(raw)) return true;
  const delta = now - Number(raw);
  if (delta < 0) return false;
  return delta < 1500;
}

export function parseSeller(formData: FormData): ParseResult<SellerInput> {
  const errors: FieldErrors = {};
  const assetCategoryRaw = cleanLine(formData.get("asset_category"), 40);
  const name = cleanLine(formData.get("name"), 80);
  const phone = formatPhone(cleanLine(formData.get("phone"), 30));
  const email = cleanLine(formData.get("email"), 160).toLowerCase();
  const city = cleanLine(formData.get("city"), 80);
  const state = cleanLine(formData.get("state"), 2).toUpperCase();
  const zip = cleanLine(formData.get("zip"), 10);
  const timeline = cleanLine(formData.get("timeline"), 80);
  const askingRaw = cleanLine(formData.get("asking_price"), 20);
  const description = cleanBlock(formData.get("description"), 4000);
  const tcpa = formData.get("tcpa");

  if (!isAssetCategory(assetCategoryRaw)) add(errors, "asset_category", "Choose what you want to sell.");
  const assetCategory = isAssetCategory(assetCategoryRaw) ? assetCategoryRaw : null;
  requireName(errors, name);
  if (!phone) add(errors, "phone", "Enter a valid 10-digit U.S. phone number.");
  requireEmail(errors, email);
  if (city.length < 2 || !CITY_RE.test(city)) add(errors, "city", "Enter the city.");
  if (!STATE_NAME.has(state)) add(errors, "state", "Choose a state.");
  if (!ZIP_RE.test(zip)) add(errors, "zip", "Enter a 5-digit ZIP code.");
  if (!includesOption(TIMELINES, timeline)) add(errors, "timeline", "Choose a timeline.");

  let askingPrice: number | null = null;
  if (askingRaw) {
    const normalized = askingRaw.replace(/[$,]/g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      add(errors, "asking_price", "Enter a dollar amount, or leave this blank.");
    } else {
      const amount = Math.round(Number(normalized));
      if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) {
        add(errors, "asking_price", "Enter a realistic price, or leave this blank.");
      } else {
        askingPrice = amount;
      }
    }
  }

  let address: string | null = null;
  let propertyType: string | null = null;
  let condition: string | null = null;
  let reason: string | null = null;
  let itemType: string | null = null;
  let weight: string | null = null;
  let purity: string | null = null;
  let certification: string | null = null;
  let quantity: string | null = null;

  if (assetCategory === "real_estate") {
    const addressRaw = cleanLine(formData.get("address"), 180);
    const propertyRaw = cleanLine(formData.get("property_type"), 40);
    const conditionRaw = cleanLine(formData.get("condition"), 80);
    const reasonRaw = cleanLine(formData.get("reason"), 80);
    if (addressRaw.length < 5) add(errors, "address", "Enter the street address.");
    else address = addressRaw;
    if (!includesOption(PROPERTY_TYPES, propertyRaw)) add(errors, "property_type", "Choose a property type.");
    else propertyType = propertyRaw;
    if (!includesOption(CONDITIONS, conditionRaw)) add(errors, "condition", "Choose the condition.");
    else condition = conditionRaw;
    if (reasonRaw) {
      if (!includesOption(REASONS, reasonRaw)) add(errors, "reason", "Choose a reason from the list.");
      else reason = reasonRaw;
    }
  }

  if (assetCategory === "precious_metals" || assetCategory === "jewelry" || assetCategory === "other") {
    if (description.length < 10) {
      add(errors, "description", "Describe the item in at least 10 characters.");
    }
    const quantityRaw = cleanLine(formData.get("quantity"), 40);
    quantity = quantityRaw || null;
  }

  if (assetCategory === "precious_metals") {
    const itemRaw = cleanLine(formData.get("item_type"), 40);
    if (!includesOption(METAL_ITEMS, itemRaw)) add(errors, "item_type", "Choose the type of metal.");
    else itemType = itemRaw;
    weight = cleanLine(formData.get("weight"), 40) || null;
    purity = cleanLine(formData.get("purity"), 40) || null;
  }

  if (assetCategory === "jewelry") {
    const itemRaw = cleanLine(formData.get("item_type"), 40);
    const certRaw = cleanLine(formData.get("certification"), 40);
    if (!includesOption(JEWELRY_ITEMS, itemRaw)) add(errors, "item_type", "Choose the type of jewelry or stone.");
    else itemType = itemRaw;
    purity = cleanLine(formData.get("purity"), 40) || null;
    if (certRaw) {
      if (!includesOption(CERTIFICATIONS, certRaw)) add(errors, "certification", "Choose a certification, or leave it blank.");
      else certification = certRaw;
    }
  }

  if (assetCategory === "other") {
    itemType = cleanLine(formData.get("item_type"), 80) || null;
  }

  if (tcpa !== "yes") {
    add(errors, "tcpa", "Check the box to consent to calls and texts. It is required to submit this form.");
  }

  if (Object.keys(errors).length || !phone || !assetCategory) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      assetCategory,
      name,
      phone,
      email,
      city,
      state,
      zip,
      timeline,
      askingPrice,
      description: description || null,
      address,
      propertyType,
      condition,
      reason,
      itemType,
      weight,
      purity,
      certification,
      quantity,
    },
  };
}

export function parseBuyer(formData: FormData): ParseResult<BuyerInput> {
  const errors: FieldErrors = {};
  const name = cleanLine(formData.get("name"), 80);
  const phone = formatPhone(cleanLine(formData.get("phone"), 30));
  const email = cleanLine(formData.get("email"), 160).toLowerCase();
  const companyRaw = cleanLine(formData.get("company"), 120);
  const scope = cleanLine(formData.get("market_scope"), 20);
  const priceRange = cleanLine(formData.get("price_range"), 40);
  const buyBox = cleanBlock(formData.get("buy_box"), 4000);
  const proof = cleanLine(formData.get("proof_of_funds"), 3).toLowerCase();
  const tcpa = formData.get("tcpa");

  requireName(errors, name);
  if (!phone) add(errors, "phone", "Enter a valid 10-digit U.S. phone number.");
  requireEmail(errors, email);

  let company: string | null = null;
  if (companyRaw) {
    if (companyRaw.length < 2 || !COMPANY_RE.test(companyRaw)) {
      add(errors, "company", "Enter a company name, or leave this blank.");
    } else {
      company = companyRaw;
    }
  }

  const codes = [
    ...new Set(
      formData
        .getAll("markets")
        .slice(0, 60)
        .map((item) => cleanLine(item, 2).toUpperCase()),
    ),
  ].filter((code) => STATE_NAME.has(code));

  let markets = "";
  if (scope === "nationwide") {
    markets = "Nationwide (all 50 states and Washington, D.C.)";
  } else if (scope === "specific") {
    if (codes.length === 0) add(errors, "markets", "Choose at least one state, or select nationwide.");
    else markets = codes.map((code) => STATE_NAME.get(code) ?? code).join("; ");
  } else {
    add(errors, "markets", "Choose nationwide or specific states.");
  }

  const selectedCategories = [
    ...new Set(
      formData
        .getAll("categories")
        .slice(0, 12)
        .map((item) => cleanLine(item, 40)),
    ),
  ].filter((item) => isAssetCategory(item));
  if (selectedCategories.length === 0) add(errors, "categories", "Choose at least one category.");

  const wantsRealEstate = selectedCategories.includes("real_estate");
  const types = [
    ...new Set(
      formData
        .getAll("property_types")
        .slice(0, 20)
        .map((item) => cleanLine(item, 40)),
    ),
  ].filter((item) => includesOption(PROPERTY_TYPES, item));
  if (wantsRealEstate && types.length === 0) {
    add(errors, "property_types", "Choose at least one property type.");
  }

  if (!includesOption(PRICE_RANGES, priceRange)) add(errors, "price_range", "Choose a price range.");
  if (buyBox.length < 10) {
    add(errors, "buy_box", "Add a short note about what you want to buy (at least 10 characters).");
  }
  const proofOfFunds = proof === "yes" || proof === "no" ? proof : null;
  if (!proofOfFunds) {
    add(errors, "proof_of_funds", "Tell us whether proof of funds is available.");
  }
  if (tcpa !== "yes") {
    add(errors, "tcpa", "Check the box to consent to calls and texts. It is required to submit this form.");
  }

  if (Object.keys(errors).length || !phone || !proofOfFunds) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      name,
      phone,
      email,
      company,
      categories: selectedCategories.map((id) => (isAssetCategory(id) ? categoryLabel(id) : id)).join("; "),
      markets,
      propertyTypes: types.join("; "),
      priceRange,
      buyBox,
      proofOfFunds,
    },
  };
}

export function parseContact(formData: FormData): ParseResult<ContactInput> {
  const errors: FieldErrors = {};
  const name = cleanLine(formData.get("name"), 80);
  const email = cleanLine(formData.get("email"), 160).toLowerCase();
  const phoneRaw = cleanLine(formData.get("phone"), 30);
  const message = cleanBlock(formData.get("message"), 4000);
  const consent = formData.get("consent");

  requireName(errors, name);
  requireEmail(errors, email);

  let phone: string | null = null;
  if (phoneRaw) {
    phone = formatPhone(phoneRaw);
    if (!phone) add(errors, "phone", "Enter a valid 10-digit U.S. phone number, or leave this blank.");
  }
  if (message.length < 10) add(errors, "message", "Enter a message of at least 10 characters.");
  if (consent !== "yes") {
    add(errors, "consent", "Consent to be contacted about this message is required.");
  }

  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors };

  return { ok: true, data: { name, email, phone, message } };
}
