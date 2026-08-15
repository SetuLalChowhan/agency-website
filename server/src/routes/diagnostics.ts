import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler, ok } from "../lib/errors";
import { requireAuth, requirePermission } from "../middleware/auth";
import { env, cloudinaryConfigured } from "../config/env";
import { cloudinaryEnabled } from "../lib/cloudinary";
import { dbState } from "../lib/diagnostics";
import { ActivityLog } from "../models/activity";
import { ContactSubmission } from "../models/leads";

import { triggerRevalidation } from "../lib/revalidate";

const router = Router();

router.use(requireAuth, requirePermission("system:read"));

/** Manual revalidation trigger from Admin dashboard. */
router.post(
  "/revalidate",
  asyncHandler(async (_req, res) => {
    await triggerRevalidation(["site", "settings", "theme", "navigation", "footer", "seo", "homepage", "services", "projects", "testimonials", "blog", "faqs", "team", "pages"], ["/"]);
    ok(res, { revalidated: true });
  })
);


/** Health of the API + database — public, no secrets. */
router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const db = dbState();
    const status = db === "connected" ? "ok" : "degraded";
    ok(res, {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: db,
      environment: env.nodeEnv,
    });
  })
);

/** Deep diagnostics for the admin console — presence checks only, never values. */
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const db = dbState();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const [recentErrors, recentActivity, newLeads] = await Promise.all([
      ActivityLog.countDocuments({ action: { $regex: /error|fail/i }, createdAt: { $gte: new Date(now - oneDay) } }),
      ActivityLog.countDocuments({ createdAt: { $gte: new Date(now - oneDay) } }),
      ContactSubmission.countDocuments({ status: "NEW" }),
    ]);

    ok(res, {
      api: { status: "ok", uptime: Math.round(process.uptime()), version: "1.0.0" },
      database: {
        status: db,
        name: mongoose.connection.name || null,
        readyState: mongoose.connection.readyState,
      },
      cloudinary: {
        configured: cloudinaryConfigured,
        enabled: cloudinaryEnabled,
      },
      environment: {
        name: env.nodeEnv,
        publicApiUrl: env.publicApiUrl,
      },
      revalidation: {
        configured: Boolean(env.revalidateUrl && env.revalidateSecret),
        url: env.revalidateUrl || null,
      },
      activity: {
        last24h: recentActivity,
        errorLikeLast24h: recentErrors,
      },
      leads: { new: newLeads },
    });
  })
);

/** Lightweight content counts for the admin dashboard. */
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [projects, services, caseStudies, blogPosts, testimonials, team, faqs, pages, media, contacts, quotes, subscribers, users, newLeads] =
      await Promise.all([
        mongoose.models.Project?.countDocuments() ?? 0,
        mongoose.models.Service?.countDocuments() ?? 0,
        mongoose.models.CaseStudy?.countDocuments() ?? 0,
        mongoose.models.BlogPost?.countDocuments() ?? 0,
        mongoose.models.Testimonial?.countDocuments() ?? 0,
        mongoose.models.TeamMember?.countDocuments() ?? 0,
        mongoose.models.FAQ?.countDocuments() ?? 0,
        mongoose.models.Page?.countDocuments() ?? 0,
        mongoose.models.Media?.countDocuments() ?? 0,
        mongoose.models.ContactSubmission?.countDocuments() ?? 0,
        mongoose.models.QuoteRequest?.countDocuments() ?? 0,
        mongoose.models.NewsletterSubscriber?.countDocuments() ?? 0,
        mongoose.models.AdminUser?.countDocuments() ?? 0,
        mongoose.models.ContactSubmission?.countDocuments({ status: "NEW" }) ?? 0,
      ]);

    ok(res, {
      content: { projects, services, caseStudies, blogPosts, testimonials, team, faqs, pages },
      media,
      leads: { contacts, quotes, subscribers, new: newLeads },
      users,
    });
  })
);

export default router;
