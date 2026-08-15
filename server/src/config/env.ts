import dotenv from "dotenv";

dotenv.config();

function str(key: string, fallback = ""): string {
  const v = process.env[key];
  return v === undefined || v === "" ? fallback : v;
}

function bool(key: string, fallback = false): boolean {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  return v === "true" || v === "1";
}

function int(key: string, fallback: number): number {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
}

export const env = {
  nodeEnv: str("NODE_ENV", "development"),
  isProd: str("NODE_ENV", "development") === "production",
  port: int("PORT", 4000),
  publicApiUrl: str("PUBLIC_API_URL", "http://localhost:4000"),

  databaseUrl: str("DATABASE_URL", "mongodb://localhost:27017/kern"),
  allowMemoryDb: bool("ALLOW_MEMORY_DB", false),

  jwtSecret: str("JWT_SECRET", "dev-only-insecure-secret-change-me"),
  jwtExpiresIn: str("JWT_EXPIRES_IN", "12h"),
  cookieSecure: bool("COOKIE_SECURE", false),

  corsOrigins: str("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  cloudinary: {
    cloudName: str("CLOUDINARY_CLOUD_NAME"),
    apiKey: str("CLOUDINARY_API_KEY"),
    apiSecret: str("CLOUDINARY_API_SECRET"),
    folder: str("CLOUDINARY_FOLDER", "kern-studio"),
  },

  revalidateSecret: str("REVALIDATE_SECRET", "dev-only-revalidate-secret"),
  revalidateUrl: str("REVALIDATE_URL", "http://localhost:3000/api/revalidate"),

  /** Comma-separated DNS resolvers used for hosted databases (e.g. Atlas). */
  dnsServers: str("DNS_SERVERS", "8.8.8.8,1.1.1.1")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

/** True when Cloudinary credentials are fully configured. */
export const cloudinaryConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);
