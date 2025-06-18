/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["www.garaad.org"],
  },
  webpack: (config, { isServer }) => {
    // Increase chunk loading timeout
    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 600,
    };
    config.performance = {
      ...config.performance,
      maxAssetSize: 500000,
      maxEntrypointSize: 500000,
    };
    return config;
  },
};

module.exports = nextConfig;
