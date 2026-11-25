"use server";

import { redirect } from "next/navigation";
import { isAuthed } from "./auth";
import { writeBlob, deleteBlob } from "./db";
import {
  addLibraryFile,
  deleteInquiry,
  deleteLibraryFile,
  deleteListing,
  getListing,
  listingPhotoName,
  ownsListingPhoto,
  photoList,
  saveListing,
  setListingPhotos,
  updateInquiry,
} from "./inventory";
import { deleteLead, updateLead, type LeadKind } from "./leads";
import { saveSiteContact } from "./settings";
import { PHOTO_TYPES, parseListing, parsePipeline, parseSettings, photoError } from "./validate";

async function requireAdmin(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin/login");
}

function filesOf(formData: FormData, name: string): File[] {
  return formData.getAll(name).filter((item): item is File => item instanceof File && item.size > 0);
}

export async function saveInventory(id: number | null, _prev: { status: string; message: string; fieldErrors: Record<string, string> }, formData: FormData) {
  await requireAdmin();
  const parsed = parseListing(formData);
  if (!parsed.ok) return { status: "error" as const, message: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };
  const uploads = filesOf(formData, "photos");
  const problem = photoError(uploads.map((file) => ({ type: file.type, size: file.size })));
  if (problem) return { status: "error" as const, message: problem, fieldErrors: { photos: problem } };
  if (uploads.length > 12) return { status: "error" as const, message: "You can attach up to 12 photos.", fieldErrors: { photos: "You can attach up to 12 photos." } };

  const listingId = await saveListing(parsed.data, id);
  const existing = id ? photoList((await getListing(listingId))?.photo_names) : [];
  const ordered = String(formData.get("photo_order") ?? "")
    .split("|")
    .map((name) => name.trim())
    .filter((name) => ownsListingPhoto(listingId, name));
  const removed = new Set(formData.getAll("photo_remove").map((value) => String(value)));
  const base = (ordered.length ? ordered : existing).filter((name) => !removed.has(name));
  const added: string[] = [];
  for (const [index, file] of uploads.entries()) {
    const ext = PHOTO_TYPES[file.type];
    if (!ext) continue;
    const key = listingPhotoName(listingId, ext, index);
    const stored = await writeBlob(key, new Uint8Array(await file.arrayBuffer()), file.type);
    if (stored !== "skipped") added.push(key);
  }
  for (const name of existing) {
    if (removed.has(name)) await deleteBlob(name);
  }
  await setListingPhotos(listingId, [...base, ...added]);
  redirect(`/admin/inventory/${listingId}?saved=1`);
}

export async function removeInventory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await deleteListing(id);
  redirect("/admin/inventory");
}

export async function saveRecord(kind: LeadKind | "inquiries", id: number, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = parsePipeline(formData);
  if (!parsed || !Number.isInteger(id) || id < 1) redirect("/admin");
  if (kind === "inquiries") await updateInquiry(id, parsed.status, parsed.notes);
  else await updateLead(kind, id, parsed.status, parsed.notes);
  redirect(`/admin/${kind}/${id}?saved=1`);
}

export async function removeRecord(kind: LeadKind | "inquiries", formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) {
    if (kind === "inquiries") await deleteInquiry(id);
    else await deleteLead(kind, id);
  }
  redirect(`/admin/${kind}`);
}

const LIBRARY_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadLibrary(_prev: { message: string }, formData: FormData): Promise<{ message: string }> {
  await requireAdmin();
  const files = filesOf(formData, "files").slice(0, 10);
  if (files.length === 0) return { message: "Choose a file to upload." };
  let saved = 0;
  for (const file of files) {
    if (!LIBRARY_TYPES.has(file.type) || file.size > 20 * 1024 * 1024) continue;
    const id = await addLibraryFile({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()), contentType: file.type });
    if (id) saved += 1;
  }
  if (saved === 0) return { message: "Nothing was stored. Use PDF, Word, or an image under 20 MB, and make sure photo storage is available." };
  redirect("/admin/files?saved=1");
}

export async function removeLibrary(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await deleteLibraryFile(id);
  redirect("/admin/files");
}

export async function saveSettings(_prev: { status: string; message: string; fieldErrors: Record<string, string> }, formData: FormData) {
  await requireAdmin();
  const parsed = parseSettings(formData);
  if (!parsed.ok) return { status: "error" as const, message: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };
  await saveSiteContact(parsed.data.email, parsed.data.phone);
  redirect("/admin/settings?saved=1");
}
