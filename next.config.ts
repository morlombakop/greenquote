import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prevents Next.js from aggressively bundling pino/pino-pretty on the server side
  serverExternalPackages: ['pino', 'pino-pretty'],
};

export default nextConfig;
