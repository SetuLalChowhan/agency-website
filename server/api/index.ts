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

try {
  assertSecureEnv();
  app = createApp();
} catch (err) {
  // Fail with a readable JSON error instead of a bare serverless crash, so a
  // missing env var (e.g. JWT_SECRET or REVALIDATE_SECRET) is obvious in the
  // Vercel dashboard rather than surfacing as FUNCTION_INVOCATION_FAILED.
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api] server misconfigured:", message);
  app = express();
  app.use((_req, res) => {
    res.status(503).json({
      success: false,
      error: { code: "server_misconfigured", message },
    });
  });
}

// Warm the DB connection without blocking boot. Mongoose buffers queries
// until the connection is ready, so a cold start may be slow but will not
// crash the invocation on connection latency.
if (mongoose.connection.readyState === 0) {
  connectDb().catch((err) => {
    console.error("[api] MongoDB connection failed:", err instanceof Error ? err.message : err);
  });
}

// @vercel/node recognizes a plain `(req, res)` function export. An Express
// app is callable, so delegate to it — this works regardless of the
// launcher's handler-shape detection (a bare Express-app export is not
// guaranteed to be recognized and crashes with FUNCTION_INVOCATION_FAILED).
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
