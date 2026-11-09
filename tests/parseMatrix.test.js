import { describe, it, expect } from "vitest";
import { matrixToRows, parseStudentRows } from "../src/lib/parseStudents.js";

const head = ["Student ID", "Name", "Branch", "CGPA"];

describe("matrixToRows", () => {
  it("skips title rows above the header and keeps real row numbers", () => {
    const matrix = [
      ["Placement list 2027"],
      [],
      head,
      ["A1", "Asha", "CSE", 8],
      ["A2", "", "CSE", 8],
    ];
    const { rows, headerRowIndex } = matrixToRows(matrix);
    expect(headerRowIndex).toBe(2);
    expect(rows).toHaveLength(2);

    const result = parseStudentRows(rows, { rowOffset: headerRowIndex });
    expect(result.students).toHaveLength(1);
    expect(
      result.warnings.some((w) => w.startsWith("Row 5: skipped (missing Name"))
    ).toBe(true);
  });

  it("uses the first row when it is the header", () => {
    const { headerRowIndex } = matrixToRows([head, ["A1", "Asha", "CSE", 8]]);
    expect(headerRowIndex).toBe(0);
  });

  it("falls back to the first row when no header is recognised", () => {
    const { rows, headerRowIndex } = matrixToRows([
      ["x", "y"],
      [1, 2],
    ]);
    expect(headerRowIndex).toBe(0);
    expect(rows).toEqual([{ x: 1, y: 2 }]);
  });

  it("handles an empty grid and rows that are shorter than the header", () => {
    expect(matrixToRows([])).toEqual({ rows: [], headerRowIndex: 0 });
    const { rows } = matrixToRows([head, ["A1", "Asha"]]);
    expect(rows[0].CGPA).toBe("");
  });

  it("keeps the old row numbers when no offset is given", () => {
    const result = parseStudentRows([
      { "Student ID": "", Name: "x", Branch: "CSE", CGPA: 8 },
    ]);
    expect(result.warnings.some((w) => w.startsWith("Row 2:"))).toBe(true);
  });
});
