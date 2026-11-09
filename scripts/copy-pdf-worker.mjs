// Copies the pdf.js worker into public/ after every install, so its version always
// matches the installed pdfjs-dist. Never fails the install.
import fs from "node:fs";
import path from "node:path";

const source = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const target = path.join(process.cwd(), "public", "pdf.worker.min.mjs");

try {
  if (fs.existsSync(source)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    console.log("pdf.js worker copied to public/");
  } else {
    console.log("pdf.js worker not found, skipping copy");
  }
} catch (error) {
  console.log("Could not copy the pdf.js worker:", error.message);
}
