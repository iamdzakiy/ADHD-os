/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi Webpack untuk menangani package Node.js di Browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Externalize package berat agar tidak dibundel oleh Next.js
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'googleapis', 'crypto-js'],
  },
};

module.exports = nextConfig;