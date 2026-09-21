import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Hide the dev-tools indicator (bottom-left) — it overlaps the WhatsApp FAB
  // and other bottom-left UI in the dev preview; never present in production.
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
