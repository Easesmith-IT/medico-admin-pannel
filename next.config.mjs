import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // devIndicators:false,
  turbopack: {
    root: __dirname,
  },
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
