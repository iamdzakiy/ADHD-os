/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ Penting: Jangan bundling undici untuk client
  experimental: {
    serverComponentsExternalPackages: ['undici'],
  },
  // Konfigurasi Webpack untuk mencegah undici masuk ke client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client: Jangan bundling undici sama sekali
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      };
    }
    return config;
  },
  // Biarkan Next.js menggunakan SWC dengan target ES modern
  swcMinify: true,
};

module.exports = nextConfig;