import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack panics on non-ASCII chars in path (Google Drive 'ım) — use webpack
  experimental: {},
};

export default nextConfig;
