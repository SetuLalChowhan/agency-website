import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ApiError, ok } from "../lib/errors";
import { requireAuth, requirePermission, type AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { logActivity } from "../lib/activity";
import { triggerRevalidation } from "../lib/revalidate";
import {
  SiteSettings,
  ThemeSettings,
  Navigation,
  Footer,
  SeoDefaults,
  HomePage,
} from "../models/settings";
import type { Document, Model } from "mongoose";

const router = Router();

/** Get-or-create a singleton document. */
async function singleton<T extends Document>(model: Model<T>, seed: () => Record<string, unknown>): Promise<T> {
  const existing = await model.findOne();
  if (existing) return existing as T;
  return model.create(seed());
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const THEME_COLOR_KEYS = [
  "primary", "secondary", "accent", "background", "surface", "heading", "body",
  "muted", "border", "button", "buttonHover", "buttonText", "link", "selection",
  "ink", "ink2", "ink3", "paper", "paper2", "acid", "smoke", "stone",
];

function validateTheme(body: Record<string, unknown>): void {
  for (const k of Object.keys(body)) {
    if (THEME_COLOR_KEYS.includes(k)) {
      if (typeof body[k] !== "string" || !HEX.test(body[k] as string)) {
        throw ApiError.badRequest(`Theme color "${k}" must be a 6-digit hex value`);
      }
    }
  }
}

const SINGLETONS: Array<{
  key: string;
  label: string;
  model: Model<any>;
  seed: () => Record<string, unknown>;
  tag: string;
}> = [
  { key: "settings", label: "Site settings", model: SiteSettings, seed: () => ({}), tag: "settings" },
  { key: "theme", label: "Theme", model: ThemeSettings, seed: () => ({}), tag: "theme" },
  { key: "navigation", label: "Navigation", model: Navigation, seed: () => ({ items: [] }), tag: "navigation" },
  { key: "footer", label: "Footer", model: Footer, seed: () => ({}), tag: "footer" },
  { key: "seo", label: "SEO defaults", model: SeoDefaults, seed: () => ({}), tag: "seo" },
  { key: "homepage", label: "Homepage", model: HomePage, seed: () => ({ sections: [] }), tag: "homepage" },
];

/* ------------------------- Public reads ------------------------- */

router.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const def = SINGLETONS.find((s) => s.key === key);
    if (!def) throw ApiError.notFound();
    const doc = await singleton(def.model, def.seed);
    ok(res, doc, { tag: def.tag });
  })
);

/* ------------------------- Admin updates ------------------------- */

router.patch(
  "/:key",
  requireAuth,
  requirePermission("settings:write"),
  validateBody(z.record(z.unknown())),
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const def = SINGLETONS.find((s) => s.key === key);
    if (!def) throw ApiError.notFound();

    if (key === "theme") validateTheme(req.body as Record<string, unknown>);

    const doc = await singleton(def.model, def.seed);
    const before = doc.toObject();

    // Atomic update to ensure nested arrays/subdocs (sections, columns, socials, items) are fully persisted
    const updated = await def.model.findByIdAndUpdate(
      doc._id,
      { $set: req.body },
      { new: true, runValidators: false }
    );

    const resultDoc = updated || doc;

    await logActivity(req as AuthedRequest, `Updated ${def.label}`, def.label, resultDoc._id, {
      changes: key === "theme" ? themeDiff(before, req.body as Record<string, unknown>) : undefined,
    });
    await triggerRevalidation([def.tag, "settings", "site"]);
    ok(res, resultDoc);
  })
);

function themeDiff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of Object.keys(after)) {
    if (before[k] !== undefined && before[k] !== after[k]) {
      changed[k] = { from: before[k], to: after[k] };
    }
  }
  return changed;
}

export default router;
