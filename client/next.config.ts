import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // We ship art-directed SVG covers (own assets only) — allow the optimizer to serve them.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
