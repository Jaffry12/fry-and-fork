import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The photos in public/images are already compressed WebP at the sizes the page uses,
  // so serve them as they are rather than re-processing them on the server.
  images: { unoptimized: true },
  // This folder sits inside a larger directory tree; pin the project root explicitly.
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
