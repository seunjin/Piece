import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // @ts-expect-error: Next.js types might not be perfectly up to date
  turbopack: {
    rules: {
      // ...
    },
    root: "/Users/jin/Desktop/dev/ai/piece-web",
  },
};

export default nextConfig;
