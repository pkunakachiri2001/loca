/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  // Proxy all /api/* requests through Next.js to avoid CORS entirely.
  // The browser only ever talks to loca-webpkuna.vercel.app (same origin).
  async rewrites() {
    // Use env var if set, otherwise fall back to the known Vercel API URL.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://project-nxl93.vercel.app/api';
    // Strip trailing /api if present so we don't double it up
    const base = apiUrl.replace(/\/api$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
