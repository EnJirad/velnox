const nextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    '@velnox/ui',
    '@velnox/types',
    '@velnox/utils',
    '@velnox/config',
    '@velnox/i18n',
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