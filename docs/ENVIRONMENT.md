# Environment, tools and configuration

## Environment variables

| Name | Required | Example | Where it is set | Purpose |
|---|---|---|---|---|
| `GEMINI_API_KEY` | Yes | (secret) | `.env.local` on your computer, **Environment Variables** in Vercel | Lets the server call Google's Gemini API |
| `GEMINI_MODEL` | Yes | a Flash or Flash-Lite model ID from AI Studio | Same places | Which Gemini model to use. Never hard-coded, because free models change often |

Rules:

- Neither name starts with `NEXT_PUBLIC_`, so neither is ever sent to the browser.
- `.env.local` is ignored by Git. `.env.example` holds placeholders only and is committed.
- After changing `.env.local`, restart `npm run dev`. After changing a Vercel variable, redeploy.

## Rotating the key

1. Open https://aistudio.google.com, then **Get API key**.
2. Delete the old key and create a new one.
3. Update `.env.local` and the Vercel variable, then redeploy.

Do this at once if a key is ever pasted into a chat, a screenshot or GitHub.

## Choosing a model

Open the model picker in AI Studio and copy a Flash or Flash-Lite model ID. Free models are sometimes busy. To test one without changing code, change `GEMINI_MODEL` and restart. The health check at `/api/health` shows which model the server is using. A good answer is reused for 60 seconds so refreshing the page cannot use up the free allowance.

## Tools and versions

| Tool | Version used | Why |
|---|---|---|
| Node.js | 20 or newer (24 used in development) | Runs Next.js and the tests |
| Next.js | 16 (App Router, Turbopack) | Pages and the three API routes |
| React | 19 | User interface |
| Tailwind CSS | 4 | Styling |
| `@google/genai` | 2 | Calls the Gemini API |
| SheetJS `xlsx` | 0.20.3 (from the SheetJS download) | Reads and writes Excel and CSV files |
| `pdfjs-dist` | 6 | Reads text from PDFs in the browser |
| `lucide-react` | 1 | Icons |
| `server-only` | 0.0.1 | Fails the build if server code is imported into browser code |
| Vitest | 5 | Unit tests |
| `pdfkit` | 0.20 (development only) | Makes the fake sample resumes |

## Files that matter for configuration

| File | Purpose |
|---|---|
| `.env.example` | Names of the settings, with placeholders |
| `next.config.mjs` | Security headers and the Tailwind setup |
| `scripts/copy-pdf-worker.mjs` | Copies the pdf.js worker into `public/` after every install |
| `src/lib/site.js` | The public address, name and description used in page metadata |
| `src/lib/constants.js` | Every limit and fixed value (text lengths, student counts, error codes) |
| `vitest.config.mjs` | Test setup |

## Limits and protections

| Item | Value |
|---|---|
| Request body size | about 200 KB |
| Rate limit | 150 requests per 10 minutes per address, per server instance |
| Function time limit | 30 seconds (the Gemini wrapper plans its retries inside 27) |
| Job description length | 50 to 8000 characters |
| Resume text sent to the AI | first 12000 characters |
| Students per drive | up to 100 |
| Spreadsheet size | 5 MB |
| PDF size | 10 MB each |
| Security headers | no framing, no content sniffing, strict referrer, camera, microphone and location off |

## Free services used

| Service | Plan | What for |
|---|---|---|
| Google Gemini API | Free tier | Skill extraction and resume evidence |
| Vercel | Hobby (free) | Hosting and the three API routes |
| GitHub | Free | Source code and automatic deploys |

No paid service and no Anthropic API key are used anywhere.

## Error codes the API can return

| Code | Meaning | What the app does |
|---|---|---|
| `INVALID_INPUT` | A field is missing or out of range | Shows the message |
| `PAYLOAD_TOO_LARGE` | The request was too big | Shows the message |
| `UNSUPPORTED_MEDIA_TYPE` | The request was not JSON | Shows a generic message |
| `RATE_LIMITED` | Too many requests from one address | Waits and retries |
| `AI_RATE_LIMITED` | The Gemini free limit was reached | Retries, then Basic match |
| `AI_UNAVAILABLE` | Gemini is down, or the key or model is wrong | Retries, then Basic match |
| `AI_BAD_OUTPUT` | The AI answer was unreadable | Retries, then Basic match |
| `AI_TIMEOUT` | The AI took too long | Retries, then Basic match |
| `SERVER_ERROR` | Settings missing or an unexpected bug | Generic message |
