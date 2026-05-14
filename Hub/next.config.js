const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Point outputFileTracingRoot to workspace root to avoid lockfile root warnings
  outputFileTracingRoot: path.join(__dirname, '..'),
}

module.exports = nextConfig
