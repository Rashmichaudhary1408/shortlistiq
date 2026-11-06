// Saves drives in the browser's localStorage. Every function returns
// { ok: true, ... } or { ok: false, error } and never throws.
import { STORAGE_KEYS, SCHEMA_VERSION } from "./constants.js";
import { createIndexEntry } from "./driveModel.js";
import { getFinalShortlistIds } from "./shortlist.js";

const UNAVAILABLE =
  "Browser storage is not available. Export your shortlist now.";
const SAVE_FAILED =
  "Could not save in this browser (storage may be full or blocked). Export your shortlist now.";

function getStore() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function driveKey(id) {
  return `${STORAGE_KEYS.drivePrefix}${id}`;
}

function readIndex(store) {
  try {
    const raw = store.getItem(STORAGE_KEYS.index);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry && typeof entry.id === "string")
      : [];
  } catch {
    return [];
  }
}

const notFound = () => ({ ok: false, error: "Drive not found" });

export function saveDrive(drive) {
  const store = getStore();
  if (!store) return { ok: false, error: UNAVAILABLE };
  try {
    const saved = { ...drive, updatedAt: new Date().toISOString() };
    const entry = createIndexEntry(saved, getFinalShortlistIds(saved).length);
    store.setItem(driveKey(saved.id), JSON.stringify(saved));
    const index = [
      entry,
      ...readIndex(store).filter((item) => item.id !== saved.id),
    ];
    store.setItem(STORAGE_KEYS.index, JSON.stringify(index));
    return { ok: true, drive: saved };
  } catch {
    return { ok: false, error: SAVE_FAILED };
  }
}

export function getDrive(id) {
  const store = getStore();
  if (!store) return { ok: false, error: UNAVAILABLE };
  try {
    const raw = store.getItem(driveKey(id));
    if (!raw) return notFound();
    const drive = JSON.parse(raw);
    if (
      !drive ||
      typeof drive !== "object" ||
      drive.id !== id ||
      drive.schemaVersion !== SCHEMA_VERSION ||
      !Array.isArray(drive.students)
    ) {
      return notFound();
    }
    return { ok: true, drive };
  } catch {
    return notFound();
  }
}

// Newest saved drive first.
export function listDrives() {
  const store = getStore();
  if (!store) return { ok: false, error: UNAVAILABLE, drives: [] };
  return { ok: true, drives: readIndex(store) };
}

export function deleteDrive(id) {
  const store = getStore();
  if (!store) return { ok: false, error: UNAVAILABLE };
  try {
    store.removeItem(driveKey(id));
    const index = readIndex(store).filter((item) => item.id !== id);
    store.setItem(STORAGE_KEYS.index, JSON.stringify(index));
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the drive." };
  }
}