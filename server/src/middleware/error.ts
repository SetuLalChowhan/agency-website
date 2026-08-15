import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../lib/errors";
import { logger } from "../lib/logger";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "not_found", message: "Route not found" } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Mongoose validation / duplicate key
  const mongoErr = err as { name?: string; code?: number; keyValue?: Record<string, unknown>; message?: string };
  if (mongoErr.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: { code: "validation_error", message: "Validation failed", details: mongoErr.message },
    });
  }
  if (mongoErr.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: "duplicate_key",
        message: `A record with that value already exists (${Object.keys(mongoErr.keyValue ?? {}).join(", ")})`,
      },
    });
  }

  logger.error("Unhandled error", {
    message: err instanceof Error ? err.message : String(err),
    stack: env.isProd ? undefined : err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: "internal_error",
      message: env.isProd ? "Something went wrong on our side" : (err as Error).message ?? String(err),
    },
  });
}
