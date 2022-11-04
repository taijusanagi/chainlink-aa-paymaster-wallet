/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CHAIN_ID: process.env.CHAIN_ID,
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
