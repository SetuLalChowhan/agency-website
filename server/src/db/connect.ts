import mongoose from "mongoose";
import dns from "node:dns";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "../config/env";
import { logger } from "../lib/logger";

let memoryServer: MongoMemoryServer | null = null;

/**
 * Point Node's resolver at explicit public DNS servers. On some Windows
 * setups c-ares picks a broken resolver and hosted databases (Atlas SRV
 * records) can't be resolved even though the system can. Harmless to set
 * explicitly; configurable via DNS_SERVERS.
 */
export function applyDnsServers(): void {
  try {
    if (env.dnsServers.length > 0) {
      dns.setServers(env.dnsServers);
      logger.debug("DNS servers configured", { servers: env.dnsServers });
    }
  } catch (err) {
    logger.warn("Could not set DNS servers", { error: (err as Error).message });
  }
}

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  applyDnsServers();

  try {
    await mongoose.connect(env.databaseUrl, { serverSelectionTimeoutMS: 5000 });
    logger.info("MongoDB connected", { url: redact(env.databaseUrl) });
    return;
  } catch (err) {
    logger.warn("MongoDB connection failed — checking fallback", {
      error: (err as Error).message,
    });
  }

  // Local dev fallback: spin up an in-memory MongoDB when Docker/Atlas is unavailable.
  if (env.nodeEnv === "development" && env.allowMemoryDb) {
    logger.info("Starting in-memory MongoDB (MongoMemoryServer)…");
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: "kern" },
    });
    const uri = memoryServer.getUri();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    logger.info("In-memory MongoDB connected");
    return;
  }

  throw new Error(
    `Could not connect to MongoDB at ${redact(env.databaseUrl)}. ` +
      "Start it with `docker compose up -d` (needs Docker) or set ALLOW_MEMORY_DB=true for an in-memory dev database."
  );
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  logger.info("MongoDB disconnected");
}

export function dbState() {
  const states: Array<"connected" | "disconnected" | "connecting" | "disconnecting"> = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ];
  const idx = mongoose.connection.readyState;
  return idx >= 0 && idx < states.length ? states[idx] : "error";
}

export function isMemoryDb(): boolean {
  return memoryServer !== null;
}

function redact(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return url;
  }
}
