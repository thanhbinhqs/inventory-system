import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép truy cập dev server qua IP local từ thiết bị khác trong mạng LAN
  allowedDevOrigins: ['192.168.1.9', '*.local'],
};

export default nextConfig;
