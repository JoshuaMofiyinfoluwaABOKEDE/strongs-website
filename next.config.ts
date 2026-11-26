import type { NextConfig } from "next";

// Public pages are still pre-built as static HTML; the courses platform
// (accounts, lessons, progress, certificates and admin) runs on the server.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: ["pg", "unpdf"],
  // Assignment uploads (up to 4 MB) go through a Server Action. Vercel's request limit is 4.5 MB.
  experimental: { serverActions: { bodySizeLimit: "4.4mb" } },
  outputFileTracingIncludes: {
    "/certificates/[code]/pdf": ["./src/assets/certificate/**"],
  },
};

export default nextConfig;
