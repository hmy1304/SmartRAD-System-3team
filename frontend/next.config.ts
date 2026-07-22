import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: true,
  // devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*", // 백엔드 포트에 맞게 수정
      },
    ];
  },
};

export default nextConfig;
