/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE ??
      (process.env.NODE_ENV === "production"
        ? "https://thetiermaker.com"
        : "http://localhost:8000");
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*/` },
      { source: "/media/:path*", destination: `${apiUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
