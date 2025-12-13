import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable browserslist for SWC to transpile for older browsers like iOS 15
  },
  transpilePackages: [],
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
