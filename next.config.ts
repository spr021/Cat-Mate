import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the dev UI clean — the floating indicator overlaps the chat composer.
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com", pathname: "/**" },
      { protocol: "https", hostname: "cataas.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
