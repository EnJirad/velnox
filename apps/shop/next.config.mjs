const nextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    '@velnox/ui',
    '@velnox/types',
    '@velnox/utils',
    '@velnox/config',
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;