import type { NextConfig } from "next";

const apiUpstream =
  process.env.API_BASE_URL ?? "https://hinza.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Browser calls same-origin /hinza-api/* to avoid CORS on hinza.vercel.app
        source: "/hinza-api/:path*",
        destination: `${apiUpstream.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
