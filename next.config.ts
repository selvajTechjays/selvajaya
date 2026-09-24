import type { NextConfig } from "next";

// Static export for GitHub Pages. The site is served from /selvajaya on
// selvajayarose.github.io, so CI sets NEXT_PUBLIC_BASE_PATH=/selvajaya.
// Locally it stays empty so `npm run dev` serves from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
