// Reads text from a PDF inside the browser. The PDF never leaves the device.
// Call this only from client components.
import { LIMITS } from "./constants.js";

const MAX_PAGES = 10;
const MAX_CHARS = 20000;

let pdfjsPromise = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((module) => {
      module.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return module;
    });
  }
  return pdfjsPromise;
}

export function cleanPdfText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}

// Returns { status: "ok" | "unreadable" | "error", text, pages }.
export async function extractPdfText(file) {
  try {
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const totalPages = doc.numPages;
    const parts = [];
    for (let i = 1; i <= Math.min(totalPages, MAX_PAGES); i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      parts.push(
        content.items.map((item) => ("str" in item ? item.str : "")).join(" ")
      );
    }
    if (typeof doc.destroy === "function") await doc.destroy();
    const extracted = cleanPdfText(parts.join("\n"));
    return {
      status: extracted.length >= LIMITS.resumeMinChars ? "ok" : "unreadable",
      text: extracted,
      pages: totalPages,
    };
  } catch {
    return { status: "error", text: "", pages: 0 };
  }
}