import { describe, it, expect } from "vitest";
import { cleanPdfText } from "../src/lib/pdfText.js";

describe("cleanPdfText", () => {
  it("collapses whitespace and trims", () => {
    expect(cleanPdfText("  a \n\n b\t c ")).toBe("a b c");
  });

  it("caps very long text", () => {
    expect(cleanPdfText("x".repeat(30000))).toHaveLength(20000);
  });

  it("handles empty input", () => {
    expect(cleanPdfText(null)).toBe("");
  });
});