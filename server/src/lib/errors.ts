import type { NextFunction, Request, Response } from "express";

/** Typed operational error — carries an HTTP status and optional details. */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code ?? (status >= 500 ? "internal_error" : "request_error");
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, "bad_request", details);
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, "unauthorized");
  }
  static forbidden(message = "You do not have permission to do that") {
    return new ApiError(403, message, "forbidden");
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "not_found");
  }
  static conflict(message: string) {
    return new ApiError(409, message, "conflict");
  }
  static tooManyRequests(message = "Too many requests — please slow down") {
    return new ApiError(429, message, "rate_limited");
  }
  static internal(message = "Something went wrong on our side") {
    return new ApiError(500, message, "internal_error");
  }
}

/** Wraps async route handlers so rejections reach the error middleware. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/** Consistent success envelope. */
export function ok<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}
