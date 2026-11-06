import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  saveDrive,
  getDrive,
  listDrives,
  deleteDrive,
} from "../src/lib/storage.js";
import {
  createDrive,
  createStudent,
  createScreening,
} from "../src/lib/driveModel.js";

let data;
let failWrites;

beforeEach(() => {
  data = new Map();
  failWrites = false;
  globalThis.window = {
    localStorage: {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => {
        if (failWrites) throw new Error("QuotaExceededError");
        data.set(key, String(value));
      },
      removeItem: (key) => {
        data.delete(key);
      },
    },
  };
});

afterEach(() => {
  delete globalThis.window;
});

function makeDrive(name) {
  const scored = createStudent({
    studentId: "A1",
    name: "Asha",
    cgpa: 8,
    eligibility: { eligible: true, failedRules: [] },
    resume: { status: "ok", message: "Scored" },
    screening: { ...createScreening(), method: "ai", score: 80 },
  });
  const rejected = createStudent({
    studentId: "B1",
    name: "Bela",
    eligibility: {
      eligible: false,
      failedRules: [{ rule: "cgpa", message: "CGPA 5.0 < 7.0" }],
    },
    resume: { status: "not_scanned", message: "Not scanned" },
  });
  return createDrive({ name, students: [scored, rejected], topN: 1 });
}

describe("storage", () => {
  it("saves a drive and reads it back", () => {
    const drive = makeDrive("Drive A");
    const saved = saveDrive(drive);
    expect(saved.ok).toBe(true);
    const got = getDrive(drive.id);
    expect(got.ok).toBe(true);
    expect(got.drive.name).toBe("Drive A");
    expect(got.drive.students).toHaveLength(2);
  });

  it("recomputes index counts on every save", () => {
    const drive = makeDrive("Drive A");
    saveDrive(drive);
    const index = JSON.parse(data.get("shortlistiq:index"));
    expect(index[0]).toMatchObject({
      id: drive.id,
      totalCount: 2,
      eligibleCount: 1,
      shortlistedCount: 1,
    });
  });

  it("lists the newest saved drive first and moves a resaved drive to the front", () => {
    const a = makeDrive("Drive A");
    const b = makeDrive("Drive B");
    saveDrive(a);
    saveDrive(b);
    expect(listDrives().drives.map((d) => d.id)).toEqual([b.id, a.id]);
    saveDrive(a);
    expect(listDrives().drives.map((d) => d.id)).toEqual([a.id, b.id]);
  });

  it("deletes a drive and its index entry", () => {
    const drive = makeDrive("Drive A");
    saveDrive(drive);
    expect(deleteDrive(drive.id).ok).toBe(true);
    expect(getDrive(drive.id).ok).toBe(false);
    expect(listDrives().drives).toEqual([]);
  });

  it("reports a missing drive without throwing", () => {
    const result = getDrive("nope");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Drive not found");
  });

  it("treats corrupt JSON as not found", () => {
    const drive = makeDrive("Drive A");
    saveDrive(drive);
    data.set(`shortlistiq:drive:${drive.id}`, "{not json");
    expect(getDrive(drive.id).ok).toBe(false);
  });

  it("treats a wrong schemaVersion as not found", () => {
    const drive = makeDrive("Drive A");
    saveDrive(drive);
    const key = `shortlistiq:drive:${drive.id}`;
    const stored = JSON.parse(data.get(key));
    stored.schemaVersion = 99;
    data.set(key, JSON.stringify(stored));
    expect(getDrive(drive.id).ok).toBe(false);
  });

  it("returns an error instead of throwing when storage is full", () => {
    failWrites = true;
    const result = saveDrive(makeDrive("Drive A"));
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Export your shortlist");
  });

  it("returns errors when browser storage does not exist", () => {
    delete globalThis.window;
    expect(saveDrive(makeDrive("Drive A")).ok).toBe(false);
    expect(getDrive("x").ok).toBe(false);
    const listed = listDrives();
    expect(listed.ok).toBe(false);
    expect(listed.drives).toEqual([]);
  });
});