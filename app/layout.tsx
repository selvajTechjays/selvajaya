import type { Metadata, Viewport } from "next";
import { Fira_Code, Sora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["300", "400", "600", "700"], variable: "--font-sora", display: "swap" });
const fira = Fira_Code({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira", display: "swap" });
// The SJ >> logo face from the original site, self-hosted over HTTPS.
const amillina = localFont({ src: "./fonts/Amillina.woff", variable: "--font-amillina", display: "block" });

export const metadata: Metadata = {
  title: "Selva Jaya · Senior AI Engineer",
  description:
    "Senior AI Engineer at Techjays. I build AI-powered products end to end: LLM chat and voice interfaces, Claude agent workflows and automated testing, pixel-perfect in React and Next.js.",
  authors: [{ name: "Selva Jaya" }],
  openGraph: {
    title: "Selva Jaya · Senior AI Engineer",
    description: "LLM chat & voice, Claude agent workflows and automated testing. Pixel-perfect, in React and Next.js.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a192f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${fira.variable} ${amillina.variable}`}>
      <body>{children}</body>
    </html>
  );
}
