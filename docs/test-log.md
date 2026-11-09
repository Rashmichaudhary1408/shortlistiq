# ShortlistIQ test log

Record of what was tested before release. Fill in the Result column as you test.

## Automated checks

| Check | Command | Expected | Result |
|---|---|---|---|
| Unit tests | `npm test` | 20 files, 115 tests pass | |
| Production build | `npm run build` | Compiles, 7 routes, no red errors | |

## Manual checks on the live site

Live site: https://shortlistiq-sigma.vercel.app/

| # | Test | Expected | Result |
|---|---|---|---|
| 1 | Upload a .txt file as the spreadsheet | Friendly error message | |
| 2 | Upload a spreadsheet with no CGPA column | "Missing required column(s)" | |
| 3 | Upload a spreadsheet with a title line above the headers | Students import normally | |
| 4 | Paste fewer than 50 characters as the job description | AI button stays disabled | |
| 5 | Turn Wi-Fi off, click Extract skills with AI | "Could not reach the server"; skills can be typed by hand | |
| 6 | Upload only the spreadsheet (no PDFs) and reach the Run step | "Nothing to score yet" and Start screening is disabled | |
| 7 | Reload the page after uploading the spreadsheet | The browser asks before leaving | |
| 8 | Start a run, then click Cancel run | "Nothing was saved" | |
| 9 | Open /drive/does-not-exist | "Drive not found" | |
| 10 | Open /nope | "Page not found" | |
| 11 | Phone-width window: home, wizard, results table | Readable, no sideways scrolling of the page | |
| 12 | Delete a drive with the trash icon | Dialog with Cancel focused; Esc closes it | |
| 13 | Clear the Top N box and type a new number | Accepts it without snapping back | |
| 14 | Add and Remove a student | A message appears and the counts update | |
| 15 | One full run with the sample files | Method column shows AI or Basic match with an explaining banner | |
| 16 | Download Excel | Three sheets: Shortlist, All students, Drive Info | |

## Issues found

| Date | Issue | Fix | Status |
|---|---|---|---|
| | | | |
