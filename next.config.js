/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK,
    NEXT_PUBLIC_MIRROR_NODE_URL: process.env.NEXT_PUBLIC_MIRROR_NODE_URL,
  }
}

module.exports = nextConfig
