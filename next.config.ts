import type { NextConfig } from "next";

// Static export: the app is fully client-side (BYOK keys stay in the browser).
// Security headers live in public/_headers (read by Cloudflare and Netlify).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["clsx", "tailwind-merge"] },
};

export default nextConfig;
