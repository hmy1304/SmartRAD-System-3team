import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: true,
  // devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/common-codes/:path*",
        destination: `${backendUrl}/common-codes/:path*`,
      },
      {
        source: "/common-codes",
        destination: `${backendUrl}/common-codes`,
      },
      {
        source: "/api-system/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
