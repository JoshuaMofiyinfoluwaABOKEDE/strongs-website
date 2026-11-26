import type { NextConfig } from "next";

// Public pages are still pre-built as static HTML; the courses platform
// (accounts, lessons, progress, certificates and admin) runs on the server.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: ["pg"],
  outputFileTracingIncludes: {
    "/certificates/[code]/pdf": ["./src/assets/certificate/**"],
  },
};

export default nextConfig;
