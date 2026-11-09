# ShortlistIQ

Shortlist students with reasons you can show. Rules decide who is eligible. AI only checks how well each resume fits.

**Live app:** https://shortlistiq-sigma.vercel.app/
**Privacy and data:** https://shortlistiq-sigma.vercel.app/privacy

Built with Claude as part of the AB Talks 60-Day Claude AI Challenge. Everything runs on free tools. No paid service and no Anthropic API key is needed.

## What it does

1. **Upload** a student spreadsheet (.xlsx, .xls or .csv) and the resume PDFs, named by Student ID.
2. **Skills:** paste a job description. Google's free Gemini AI suggests the role title, required and preferred skills and any eligibility hints. You edit everything.
3. **Rules:** set minimum CGPA, allowed branches, maximum backlogs and graduation year. Every failed rule is recorded for each student.
4. **Run:** eligible resumes are read in your browser and scored. Students who fail a rule are never sent to the AI.
5. **Results:** a ranked list, a Top N shortlist, manual Add and Remove, evidence for every score, and an Excel export with three sheets.

## How it works

- **Rules decide eligibility. AI judges fit.** The AI returns facts only: which skills appear (with evidence), relevant projects and a 0 to 5 relevance rating.
- **The score is computed in code:** 60% required skills, 20% preferred skills and 20% relevance. Parts that do not apply are left out and the rest are rescaled.
- **Degrade, never crash:** if Gemini is busy or its free limit is used up, the app retries, then falls back to a keyword search labelled "Basic match". After three failures in a row the AI is skipped for the rest of the run, so a run always finishes.
- **Privacy:** the spreadsheet and PDFs stay in the browser. Only the extracted text of eligible students' resumes and the job description go to Gemini, through the app's server, which stores and logs nothing. Finished drives are saved in the browser's local storage, so export to Excel to keep a permanent copy. Free-tier content may be used by Google to improve its products, so use fake data for demos.
- **Messy spreadsheets are fine:** a title line above the column names is skipped, and a Resume column can hold a file name, a path or a name without ".pdf".

## Tech

Next.js (App Router) and React, Tailwind CSS, Google Gemini API (free tier) through `@google/genai`, SheetJS for Excel, pdf.js for PDF text, Vitest for tests, GitHub and Vercel Hobby for hosting. See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for every tool and setting.

## Run it yourself

The short version. The full beginner guide is in [docs/SETUP.md](docs/SETUP.md).

1. Install Node.js 20 or newer and Git.
2. Run `npm install`.
3. Create a free key in Google AI Studio (https://aistudio.google.com).
4. Copy `.env.example` to `.env.local` and fill in `GEMINI_API_KEY` and `GEMINI_MODEL`. Model names change often, so copy a Flash or Flash-Lite model name from AI Studio.
5. Run `npm run dev` and open http://localhost:3000.
6. Run `npm test` for the unit tests and `npm run build` for a production build.

## Sample data

`sample-data/` holds fake students, resumes and a job description. Recreate them with `node scripts/generate-sample-data.mjs`.

## Project layout

- `src/app/`: pages and the three API routes (`health`, `extract-skills`, `score-resume`)
- `src/components/`: wizard steps, results screens and shared UI
- `src/lib/`: pure logic (parsing, rules, scoring, ranking, storage, export)
- `src/lib/server/`: server-only code (Gemini wrapper, prompts, request guard)
- `tests/`: Vitest tests for the logic modules
- `docs/`: setup, environment and test notes

## Security notes

The Gemini key lives only on the server and is never sent to the browser. Requests are size-limited, rate-limited per address, and validated. Pages send basic security headers. See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

## Known limits

- The Gemini free tier has per-minute and per-day limits. When it is used up, scoring falls back to Basic match, which has no relevance rating, so read those resumes yourself.
- Drives live only in one browser on one device.
- The AI can be wrong. The ranking is a starting point, not a decision.

## License

MIT. See [LICENSE](LICENSE).
