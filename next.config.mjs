/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
        domains: [
            'https://narutodb.xyz/api/character',
            'vignette.wikia.nocookie.net',
            'static.wikia.nocookie.net',
            'avatar.iran.liara.run'],
        remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vignette.wikia.nocookie.net',
        port: '',
        pathname: '/your-account/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        port: '',
        pathname: '/your-account/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/your-account/**',
      },
    ],
  },
};

export default nextConfig;
