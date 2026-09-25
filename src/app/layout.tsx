import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://open-claude-design.netlify.app";
const OG_IMAGE = `${SITE_URL}/og-image.svg`;

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", weight: ["400", "600", "700", "800"], subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const caveat = Caveat({ variable: "--font-caveat", weight: ["600", "700"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Diseño — PUPFR!SKY × Claude Design · Open source · Netlify OSS", template: "%s · Open Claude Design" },
  description:
    "Open-source clone of claude.ai Diseño (Diseños / Sistemas + artifact canvas). Clean rebuild — PUPFR!SKY Obsidian #121212 + Yellow/Cyan/Amethyst · die-cut · BYOK · Admin frk_live_ · Mobbin gated · Netlify 1-click. Every screen ships breathtaking (1440px proof).",
  applicationName: "Open Claude Design",
  keywords: ["claude", "claude design", "open source", "next.js", "tailwind", "shadcn", "netlify", "awwwards", "mcp", "figma tokens", "mobbin", "zeabur"],
  authors: [{ name: "Frisky Developments", url: "https://friskydev.com" }],
  creator: "Frisky Developments",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Open Claude Design",
    title: "Diseño — PUPFR!SKY × Claude Design · Netlify Open Source",
    description: "Cloned Diseños gallery + Admin frk_live_ keys + Mobbin platform fix. Every screen ships breathtaking or it doesn't ship. 1440px proof.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Open Claude Design — Diseño + Admin + Netlify OSS · PUPFR!SKY tweak" }],
  },
  twitter: { card: "summary_large_image", title: "Open Claude Design — PUPFR!SKY × Claude · Netlify OSS", description: "1-click Deploy to Netlify. BYOK. Admin frk_live_. Mobbin gated. Awwwards floor." },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bricolage.variable} ${manrope.variable} ${jetbrains.variable} ${caveat.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-[#121212] text-zinc-100">
        {/* cinematic frame: grain + lens vignette, always on, never interactive */}
        <div className="film-grain" aria-hidden />
        <div className="film-vignette" aria-hidden />
        {children}
      </body>
    </html>
  );
}
