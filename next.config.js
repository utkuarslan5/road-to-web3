/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Only use basePath for production builds (GitHub Pages)
  // In development, access the app at http://localhost:3000/
  // In production (GitHub Pages), it will be at https://username.github.io/road-to-web3/
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/road-to-web3',
    assetPrefix: '/road-to-web3',
  }),
}

module.exports = nextConfig

