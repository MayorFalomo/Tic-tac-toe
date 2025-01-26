import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,      // Enable React strict mode for improved error handling
    swcMinify: true,            // Enable SWC minification for improved performance
    compiler: {
        removeConsole: process.env.NODE_ENV !== "development"     // Remove console.log in production
    },
     images: {
        domains: [
            'https://narutodb.xyz/api/character',
            'vignette.wikia.nocookie.net',
            'static.wikia.nocookie.net',
         'avatar.iran.liara.run',
         'i.pinimg.com',
         'res.cloudinary.com',
      'ui-avatars.com'
    ],
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
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/your-account/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/your-account/**',
      },
      {
        protocol: 'https',
        hostname: 'https://ui-avatars.com',
        port: '',
        pathname: '/your-account/**',
      },
    ],
  },
};

export default withPWA({
    dest: "public",         // destination directory for the PWA files
    disable: process.env.NODE_ENV === "development",        // disable PWA in the development environment
    register: true,         // register the PWA service worker
    skipWaiting: true,      // skip waiting for service worker activation
})(nextConfig);