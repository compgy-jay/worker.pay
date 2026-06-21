import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:local.db",
  },
};

export default nextConfig;
