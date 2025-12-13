import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable browserslist for SWC to transpile for older browsers like iOS 15
  },
  // Transpile packages that may use modern regex features unsupported in iOS 15/Safari 15
  transpilePackages: [
    'date-fns',
    'react-day-picker',
    'react-markdown',
    'remark-gfm',
    'lucide-react',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
