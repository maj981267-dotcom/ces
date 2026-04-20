import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 确保开发模式下的热重载
  reactStrictMode: true,
  // 启用快速刷新
  experimental: {
    // 如果需要的话可以添加其他实验性功能
  },
};

export default nextConfig;
