# ShortlistIQ

Rule-based eligibility plus AI-assisted resume matching for campus placement drives.

**Live demo:** https://shortlistiq-sigma.vercel.app/

Built with Claude as part of the AB Talks 60-Day Claude AI Challenge.

## What it does

1. **Upload** a student spreadsheet (.xlsx, .xls or .csv) and a folder of resume PDFs named after each Student ID.
2. **Skills:** paste a job description. Google's free Gemini AI suggests the role title, required and preferred skills, and any eligibility hints. You can edit everything.
3. **Rules:** set minimum CGPA, allowed branches, maximum backlogs and graduation year. Every failed rule is recorded for each student.
4. **Run:** eligible resumes are read in your browser and scored. Students who fail a rule are never sent to the AI.
5. **Results:** ranked list, Top N shortlist, manual Add and Remove, per-student evidence, and an Excel export.

## How it works

- **Rules decide eligibility. AI judges fit.** The AI returns facts only: which skills appear (with evidence), relevant projects and a 0 to 5 relevance rating.
- **The score is computed in code:** 60% required skills, 20% preferred skills and 20% relevance. Parts that do not apply are left out and the rest are rescaled.
- **Degrade, never crash:** if Gemini is busy or rate-limited, the app retries and then falls back to a free keyword search labelled "Basic match".
- **Privacy:** the spreadsheet and PDFs stay in the browser. Only the extracted text of eligible students is sent to Gemini. Drives are saved in the browser's localStorage, so export to Excel to keep a permanent copy. Free-tier content may be used by Google to improve its products, so use fake data for demos.

## Free tools only

Next.js and React, Tailwind CSS, Google Gemini API (free tier), SheetJS, pdf.js, Vitest, GitHub and Vercel Hobby. No paid service or Anthropic key is needed.

## Run it locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Create a free key in Google AI Studio (https://aistudio.google.com).
4. Copy `.env.example` to `.env.local` and fill in `GEMINI_API_KEY` and `GEMINI_MODEL`. Model names change often, so copy one from AI Studio. A Flash or Flash-Lite model works well.
5. Run `npm run dev` and open http://localhost:3000.
6. Run `npm test` to run the 92 unit tests.

## Sample data

`sample-data/` holds fake students, resumes and a job description. Regenerate them with `node scripts/generate-sample-data.mjs`.

## Project layout

- `src/app/`: pages and the three API routes (`health`, `extract-skills`, `score-resume`)
- `src/components/`: wizard, results and shared UI
- `src/lib/`: pure logic (parsing, rules, scoring, ranking, storage, export)
- `src/lib/server/`: server-only code (Gemini wrapper, prompts, request guard)
- `tests/`: Vitest tests for every logic module

## Known limits

The Gemini free tier has per-minute and per-day limits. When it is exhausted, scoring falls back to Basic match, which has no relevance rating, so read those resumes yourself.