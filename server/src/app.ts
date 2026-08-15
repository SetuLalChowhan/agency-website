import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { ApiError } from "./lib/errors";

import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import singletonRoutes from "./routes/singletons";
import siteRoutes from "./routes/site";
import leadsRoutes from "./routes/leads";
import mediaRoutes from "./routes/media";
import adminUserRoutes from "./routes/adminUsers";
import activityRoutes from "./routes/activity";
import diagnosticsRoutes from "./routes/diagnostics";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })
  );

  // CORS — credentials allowed for configured origins
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        if (env.nodeEnv === "development") return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  // Basic rate limiting across the API
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { success: false, error: { code: "rate_limited", message: "Too many requests" } },
    })
  );

  // Stricter limit for credential endpoints (login / password change).
  // Not applied to /auth/me or /auth/logout — those run on every admin page load.
  const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, error: { code: "rate_limited", message: "Too many attempts - try again later" } },
  });

  app.get("/api/v1/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
  });

  // Public reads + submissions
  app.use("/api/v1/site", siteRoutes);
  app.use("/api/v1/settings", singletonRoutes); // /settings/:key public reads
  app.use("/api/v1/leads", leadsRoutes);

  // Admin (protected)
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/change-password", authLimiter);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/admin/content", contentRoutes);
  app.use("/api/v1/admin/settings", singletonRoutes);
  app.use("/api/v1/admin/media", mediaRoutes);
  app.use("/api/v1/admin/users", adminUserRoutes);
  app.use("/api/v1/admin/activity", activityRoutes);
  app.use("/api/v1/admin/diagnostics", diagnosticsRoutes);

  // Generic public reads — registered last so it never shadows specific mounts.
  app.use("/api/v1", contentRoutes); // /api/v1/:collection and /:collection/:slug

  app.get("/", (_req, res) => {
    res.json({ success: true, data: { name: "KERN CMS API", version: "1.0.0" } });
  });

  app.use(notFoundHandler);
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const e = err as { code?: string; message?: string };
    // Multer upload errors
    if (e && typeof e.code === "string" && (e.code.startsWith("LIMIT_") || e.message === "Only images and videos are supported")) {
      const message = e.code === "LIMIT_FILE_SIZE" ? "File too large - max 15MB" : e.message ?? "Upload rejected";
      return res.status(400).json({ success: false, error: { code: "upload_error", message } });
    }
    if (err instanceof ApiError) {
      return res.status(err.status).json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
      });
    }
    next(err);
  });
  app.use(errorHandler);

  return app;
}
