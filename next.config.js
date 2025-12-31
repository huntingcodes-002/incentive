/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  // Base path for subpath deployment (e.g., /apps/incentive-iq)
  // Set NEXT_PUBLIC_BASE_PATH environment variable to override
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/apps/incentive-iq',
  images: {
    domains: [],
    unoptimized: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;

