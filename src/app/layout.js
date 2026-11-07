import "./globals.css";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/layout/Header.js";
import { ToastProvider } from "@/components/ui/Toast.js";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata = {
  title: "ShortlistIQ",
  description:
    "Rule-based eligibility plus AI-assisted resume matching for campus placement drives.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e6f6b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plex.variable}>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none"
          >
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
            Built with Claude as part of the AB Talks 60-Day Claude AI Challenge.
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
