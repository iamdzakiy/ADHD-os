/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // FIX: Externalize heavy Node packages to prevent bundling errors
    serverComponentsExternalPackages: ['undici', 'firebase-admin', 'googleapis'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      };
    }
    return config;
  },
  swcMinify: true,
};

module.exports = nextConfig;