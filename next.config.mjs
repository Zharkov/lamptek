/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // На проде замените на ваш S3/CDN-домен. Картинки из старого сайта — на время переноса.
    remotePatterns: [
      { protocol: "https", hostname: "lamptek.ru" },
    ],
  },
};
export default nextConfig;
