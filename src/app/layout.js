import "./globals.css";
import Header from "@/components/layout/Header.js";

export const metadata = {
  title: "ShortlistIQ",
  description:
    "Rule-based eligibility plus AI-assisted resume matching for campus placement drives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
          Built with Claude as part of the AB Talks 60-Day Claude AI Challenge.
        </footer>
      </body>
    </html>
  );
}