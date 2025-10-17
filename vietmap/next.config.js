/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    instrumentationHook: false,
  },
  // Disable OpenTelemetry
  env: {
    OTEL_SDK_DISABLED: 'true',
  },
  webpack: (config, { isServer, webpack }) => {
    // Handle client-side fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Fix for D3 and other ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
};

module.exports = nextConfig;
