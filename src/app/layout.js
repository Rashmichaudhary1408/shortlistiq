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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}