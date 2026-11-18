import type { Metadata } from "next";
// Self-hosted fonts (no build-time network fetch, no third-party font requests).
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/caveat/700.css";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://frisky-design.hrgrrtks2p.workers.dev";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "FR!SKY Design · An open source Claude Design system", template: "%s · FR!SKY Design" },
  description:
    "FR!SKY Design. An open source Claude Design system: gallery + artifact canvas, bring your own key, and a hosted MCP when you want it.",
  applicationName: "FR!SKY Design",
  keywords: ["claude design", "open source", "artifact canvas", "byok", "mcp", "model context protocol", "next.js", "tailwind", "design system", "cloudflare workers"],
  authors: [{ name: "Frisky Developments", url: "https://friskydev.com" }],
  creator: "Frisky Developments",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FR!SKY Design",
    title: "FR!SKY Design · An open source Claude Design system",
    description: "Gallery + artifact canvas, bring your own key, and a hosted MCP when you want it.",
    images: [{ url: "/social-preview.png", width: 1280, height: 640, alt: "FR!SKY Design: an open source Claude Design system" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FR!SKY Design · An open source Claude Design system",
    description: "Gallery + artifact canvas, bring your own key, and a hosted MCP when you want it.",
    images: ["/social-preview.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#121212] text-zinc-100">
        {/* cinematic frame: grain + lens vignette, always on, never interactive */}
        <div className="film-grain" aria-hidden />
        <div className="film-vignette" aria-hidden />
        {children}
      </body>
    </html>
  );
}
