/** @type {import('next').NextConfig} */
const nextConfig = {
  // devIndicators:false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "thumbs.dreamstime.com",
      },
       {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
