# Setup guide

This guide takes you from nothing to a running copy of ShortlistIQ. It assumes no technical experience. Commands are for Windows PowerShell. On a Mac, use Terminal and the same commands.

## 1. Install the tools

| Tool | Why you need it | How to check it |
|---|---|---|
| Node.js 20 or newer | Runs JavaScript outside the browser. Next.js needs it. | `node -v` shows v20 or higher |
| npm (comes with Node) | Installs the libraries the app uses | `npm -v` shows a number |
| Git | Tracks your code and sends it to GitHub | `git --version` shows a version |
| VS Code (optional) | A friendly editor | Open it from the Start menu |

Get Node.js from https://nodejs.org (choose the LTS button) and Git from https://git-scm.com. Then close and reopen PowerShell and run the three check commands.

## 2. Get the code

```
cd C:\dev
git clone https://github.com/Rashmichaudhary1408/shortlistiq.git
cd shortlistiq
npm install
```

If `C:\dev` does not exist, run `mkdir C:\dev` first. Avoid folders inside OneDrive, because syncing thousands of library files slows things down.

## 3. Get a free Gemini key

1. Open https://aistudio.google.com and sign in with a Google account.
2. Click **Get API key**, then **Create API key**.
3. Copy the key. Treat it like a password. Never paste it into a chat, a screenshot or GitHub.
4. In AI Studio, open the model picker and copy the **model ID** of a Flash or Flash-Lite model. Model names change often, so copy it from the screen.

No payment card is needed for the free tier.

## 4. Add your settings

1. In the project folder, copy `.env.example` to a new file named `.env.local`.
2. Open `.env.local` and fill in the two lines:

```
GEMINI_API_KEY=your-key
GEMINI_MODEL=your-model-id
```

3. Save. `.env.local` is ignored by Git, so it never goes to GitHub. Run `git status` to make sure it is not listed.

## 5. Run it

```
npm run dev
```

Wait for `Ready`, then open http://localhost:3000. Check the AI connection at http://localhost:3000/api/health. It should show `"ok":true`.

## 6. Try it with sample data

1. Click **Start a new drive** and enter a drive name.
2. Upload `sample-data/students.xlsx`, then select all files in `sample-data/resumes` (click once in the file window, then press Ctrl+A).
3. On the Skills step, paste the contents of `sample-data/jd-sample.txt` and click **Extract skills with AI**, then **Apply to rules**.
4. Continue to the Run step and click **Start screening**. Do one run at a time, because the free AI allowance is limited.

## 7. Check everything

```
npm test
npm run build
```

Both should finish without red errors.

## 8. Put it online for free (Vercel)

1. Push your code to your own GitHub repository.
2. Sign up at https://vercel.com with GitHub (the free **Hobby** plan).
3. Click **Add New**, then **Project**, and import your repository.
4. Under **Environment Variables**, add `GEMINI_API_KEY` and `GEMINI_MODEL` with the same values as in `.env.local`.
5. Click **Deploy**. When it finishes, open the link Vercel gives you and visit `/api/health`.

Every push to the `main` branch redeploys automatically.

## When something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| `node` is not recognized | Node is not installed, or PowerShell was not reopened | Install Node, reopen PowerShell |
| Page says "Compiling" forever | A stuck dev server | Press Ctrl+C, run `npm run dev` again |
| Health check says `SERVER_ERROR` | The settings file is missing or misnamed | Check `.env.local` is in the main folder and restart |
| Health check says `AI_RATE_LIMITED` | The free allowance is used up | Wait, or try another model name |
| Every result says Basic match | The AI is busy or the limit is used up | Wait and run again, or change `GEMINI_MODEL` |
