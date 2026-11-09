import "./globals.css";
import Link from "next/link";
import { IBM_Plex_Sans } from "next/font/google";
import Header from "@/components/layout/Header.js";
import { ToastProvider } from "@/components/ui/Toast.js";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
} from "@/lib/site.js";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "campus placement",
    "resume screening",
    "student shortlisting",
    "eligibility rules",
    "placement cell",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
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
            <p>
              Built with Claude as part of the AB Talks 60-Day Claude AI
              Challenge.
            </p>
            <p className="mt-1">
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-slate-800"
              >
                Privacy and data
              </Link>
            </p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
