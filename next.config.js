/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
    // 完全禁用 ESLint
    ignoreDevelopmentErrors: true,
    ignoreBuildErrors: true
  },
  typescript: {
    // 同样忽略 TypeScript 错误
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig 