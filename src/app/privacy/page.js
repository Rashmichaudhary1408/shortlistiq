import Link from "next/link";
import { REPO_URL } from "@/lib/site.js";

export const metadata = {
  title: "Privacy and data",
  description:
    "What ShortlistIQ does with your files, what is sent to the AI, and what is stored on your device.",
};

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-slate-700">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Privacy and data</h1>
      <p className="mt-3 text-slate-700">
        ShortlistIQ is a free tool with no accounts and no database. This page
        explains in plain words where your data goes.
      </p>

      <Section title="Your files stay in your browser">
        <p>
          The student spreadsheet and the resume PDFs are read inside your
          browser. They are never uploaded to ShortlistIQ&apos;s server and
          nothing is stored on a server.
        </p>
      </Section>

      <Section title="What is sent to the AI">
        <p>
          Two things are sent, through ShortlistIQ&apos;s server, to
          Google&apos;s Gemini API: the job description (to suggest skills) and
          the extracted text of resumes for students who pass your eligibility
          rules (to judge fit). Students who fail a rule are never sent. The
          server does not store this text and does not write it to its logs.
        </p>
        <p>
          This app uses Google&apos;s free tier. Google says content sent
          through the free tier may be used to improve its products. Do not use
          real student data unless your institution has approved it. For demos
          and testing, use fake data.
        </p>
      </Section>

      <Section title="What is saved on your device">
        <p>
          Finished drives are saved in your browser&apos;s local storage, on
          this device only. Clearing your browser data deletes them, and nobody
          can recover them for you. Use the Excel export to keep a permanent
          copy.
        </p>
      </Section>

      <Section title="How scores work, and their limits">
        <p>
          Your rules decide who is eligible. The AI only reports which skills
          appear on a resume, with evidence, and how relevant the resume is. A
          fixed formula turns that into a score. If the AI is busy, a simple
          keyword search called Basic match is used instead, and it is labelled.
        </p>
        <p>
          The AI can be wrong. Treat the ranking as a starting point, read the
          resumes, and make the final decision yourself.
        </p>
      </Section>

      <Section title="Cookies and tracking">
        <p>
          ShortlistIQ sets no cookies and has no analytics or advertising. Its
          hosting provider may keep standard request logs, such as IP addresses,
          for security.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          ShortlistIQ is open source. Questions and bug reports are welcome on{" "}
          <a
            href={REPO_URL}
            className="font-medium text-indigo-700 underline underline-offset-2"
          >
            GitHub
          </a>
          .
        </p>
      </Section>

      <p className="mt-10">
        <Link
          href="/"
          className="font-medium text-indigo-700 underline underline-offset-2"
        >
          Back to home
        </Link>
      </p>
    </article>
  );
}
