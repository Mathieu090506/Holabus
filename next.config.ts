import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // 1. Bỏ qua lỗi ESLint (Biến chưa dùng, v.v...)
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // 2. Bỏ qua lỗi TypeScript (Sai kiểu dữ liệu, any...)
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Cho phép ảnh từ mọi nguồn (Tránh lỗi ảnh không hiện)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;