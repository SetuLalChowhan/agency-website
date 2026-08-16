/**
 * Vercel serverless entry — exports the Express app instead of calling
 * app.listen(). Deployed via vercel.json with the @vercel/node builder.
 * Local development keeps using src/index.ts (which listens on PORT).
 */
import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { assertSecureEnv } from "../src/config/env";
import { connectDb } from "../src/db/connect";

let app: Express;
let appInitError: Error | null = null;

try {
  assertSecureEnv();
  app = createApp();
} catch (err) {
  appInitError = err instanceof Error ? err : new Error(String(err));
  const message = appInitError.message;
  console.error("[api] server misconfigured:", message);
  app = express();
  app.use((_req, res) => {
    res.status(503).json({
      success: false,
      error: { code: "server_misconfigured", message },
    });
  });
}

let dbConnectingPromise: Promise<void> | null = null;

async function ensureDbConnected(): Promise<void> {
  if (appInitError) return;
  if (mongoose.connection.readyState === 1) return;
  if (!dbConnectingPromise) {
    dbConnectingPromise = connectDb().finally(() => {
      dbConnectingPromise = null;
    });
  }
  await dbConnectingPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureDbConnected();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api] MongoDB connection failed during serverless request:", message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "database_connection_failed",
          message: `Database connection failed: ${message}`,
        },
      })
    );
    return;
  }

  return app(req, res);
}
