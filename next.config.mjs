import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,   
    // swcMinify: true,          
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
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA({
    dest: "public",         // destination directory for the PWA files
    disable: process.env.NODE_ENV === "development",        // disable PWA in the development environment
    register: true,         // register the PWA service worker
    skipWaiting: true,      // skip waiting for service worker activation,
})(nextConfig);