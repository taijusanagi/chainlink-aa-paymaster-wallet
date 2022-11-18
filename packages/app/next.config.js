/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true, // this is removed for better demo
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
