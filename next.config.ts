import type { NextConfig } from "next";

// Static export: every page becomes plain HTML, so the site can be hosted
// anywhere (Vercel, Netlify, cPanel) and deep links like /about/ always work.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
