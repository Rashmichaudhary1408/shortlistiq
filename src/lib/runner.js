// Orchestrates one screening run in the browser: read PDFs, score with the AI,
// retry, and fall back to the keyword scorer. Nothing here touches React.
import { createScreening, defaultTopN } from "./driveModel.js";
import { computeScore } from "./scoring.js";
import { fallbackScore as realFallbackScore } from "./fallbackScore.js";
import { extractPdfText as realExtractPdfText } from "./pdfText.js";
import { scoreResume as realScoreResume } from "./aiClient.js";

const RETRY_WAITS_MS = [2000, 4000];
const PAUSE_AFTER_RATE_LIMITS_MS = 10000;
const CONCURRENCY = 2;
// After this many students in a row end on Basic match because the AI failed,
// the AI is skipped for the rest of the run, so the run still finishes quickly.
const BREAKER_THRESHOLD = 3;

function cancelledError() {
  const err = new Error("Run cancelled");
  err.cancelled = true;
  return err;
}

function defaultSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(cancelledError());
      return;
    }
    let timer = null;
    const onAbort = () => {
      clearTimeout(timer);
      reject(cancelledError());
    };
    timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    if (signal) signal.addEventListener("abort", onAbort, { once: true });
  });
}

// Returns a finished copy of the drive. Rejects with { cancelled: true } if aborted.
// "deps" lets tests replace the PDF reader, the AI call and the waiting.
export async function runScreening(
  { drive, resumeFiles, onProgress, signal },
  deps = {}
) {
  const extractPdfText = deps.extractPdfText || realExtractPdfText;
  const scoreResume = deps.scoreResume || realScoreResume;
  const fallbackScore = deps.fallbackScore || realFallbackScore;
  const sleep = deps.sleep || defaultSleep;
  const concurrency = deps.concurrency || CONCURRENCY;

  const files = resumeFiles instanceof Map ? resumeFiles : new Map();
  const students = drive.students.map((student) => ({ ...student }));
  const warnings = [...drive.warnings];
  const skills = drive.skills.map(({ name, importance }) => ({
    name,
    importance,
  }));
  const total = students.length;

  let done = 0;
  let usedFallbackCount = 0;
  let consecutiveRateLimits = 0;
  let pausedOnce = false;
  let failureStreak = 0;
  let breakerOpen = false;
  let skippedByBreaker = 0;

  const report = (message) => {
    if (onProgress) onProgress({ done, total, message });
  };
  const check = () => {
    if (signal && signal.aborted) throw cancelledError();
  };

  // Phase 1: decide each student's status and read PDFs of eligible students.
  const queue = [];
  report("Starting...");
  for (let index = 0; index < students.length; index += 1) {
    check();
    const student = students[index];

    if (!student.eligibility?.eligible) {
      student.resume = {
        status: "not_scanned",
        message: "Not scanned because the student is not eligible",
      };
      student.screening = createScreening();
      done += 1;
      report(`Skipped ${student.name} (not eligible)`);
      continue;
    }

    const file = files.get(student.studentId);
    if (!file) {
      student.resume = {
        status: "missing",
        message: "No matching PDF was uploaded",
      };
      student.screening = createScreening();
      done += 1;
      report(`No resume for ${student.name}`);
      continue;
    }

    report(`Reading ${student.name}'s resume`);
    const extracted = await extractPdfText(file);
    check();
    if (extracted.status !== "ok") {
      student.resume = {
        status: "unreadable",
        message:
          extracted.status === "error"
            ? "This PDF could not be opened"
            : "No readable text found (the PDF may be scanned images)",
      };
      student.screening = createScreening();
      done += 1;
      continue;
    }
    queue.push({ index, text: extracted.text });
  }

  // Phase 2: score the readable resumes, a few at a time.
  async function scoreOne({ index, text }) {
    const student = students[index];
    report(`Scoring ${student.name}`);
    const payload = { roleTitle: drive.roleTitle, skills, resumeText: text };

    let data = null;
    if (breakerOpen) {
      skippedByBreaker += 1;
    } else {
      for (let attempt = 0; attempt <= RETRY_WAITS_MS.length; attempt += 1) {
        check();
        const response = await scoreResume(payload);
        check();
        if (response.ok) {
          consecutiveRateLimits = 0;
          data = response.data;
          break;
        }
        if (
          response.code === "RATE_LIMITED" ||
          response.code === "AI_RATE_LIMITED"
        ) {
          consecutiveRateLimits += 1;
          if (consecutiveRateLimits >= 3 && !pausedOnce) {
            pausedOnce = true;
            report("The AI is busy. Pausing for 10 seconds...");
            await sleep(PAUSE_AFTER_RATE_LIMITS_MS, signal);
            consecutiveRateLimits = 0;
          }
        } else {
          consecutiveRateLimits = 0;
        }
        if (!response.retryable || attempt === RETRY_WAITS_MS.length) break;
        await sleep(RETRY_WAITS_MS[attempt], signal);
      }

      if (data) {
        failureStreak = 0;
      } else {
        failureStreak += 1;
        if (failureStreak >= BREAKER_THRESHOLD) {
          breakerOpen = true;
          report("The AI keeps failing. Using Basic match for the rest.");
        }
      }
    }

    if (data) {
      const scored = computeScore({
        skills,
        skillResults: data.skillResults,
        relevanceRating: data.relevanceRating,
      });
      student.screening = {
        method: "ai",
        score: scored.score,
        breakdown: scored.breakdown,
        skillResults: scored.skillResults,
        relevantExperience: data.relevantExperience || [],
        explanation: data.explanation || "",
      };
    } else {
      const basic = fallbackScore({ skills, resumeText: text });
      usedFallbackCount += 1;
      student.screening = {
        method: "fallback",
        score: basic.score,
        breakdown: basic.breakdown,
        skillResults: basic.skillResults,
        relevantExperience: [],
        explanation:
          "Basic match: keyword search only, because the AI was unavailable.",
      };
    }
    student.resume = { status: "ok", message: "Scored" };
    done += 1;
    report(`Finished ${student.name}`);
  }

  let next = 0;
  async function worker() {
    for (;;) {
      check();
      const item = queue[next];
      next += 1;
      if (!item) return;
      await scoreOne(item);
    }
  }
  const workerCount = Math.min(concurrency, queue.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  check();

  if (usedFallbackCount > 0) {
    warnings.push(
      `The AI was busy for ${usedFallbackCount} resume(s). Basic match (keyword search) was used for them.`
    );
  }
  if (skippedByBreaker > 0) {
    warnings.push(
      `The AI kept failing, so it was paused. Basic match was used for ${skippedByBreaker} more resume(s) without trying the AI.`
    );
  }
  const unreadable = students.filter((s) => s.resume.status === "unreadable").length;
  if (unreadable > 0) {
    warnings.push(`${unreadable} resume(s) could not be read and were not scored.`);
  }

  const scoredCount = students.filter(
    (s) => typeof s.screening.score === "number"
  ).length;
  return {
    ...drive,
    students,
    warnings,
    usedFallbackCount,
    topN: defaultTopN(scoredCount),
    updatedAt: new Date().toISOString(),
  };
}
