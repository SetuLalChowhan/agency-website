import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ApiError, ok } from "../lib/errors";
import { getRegistry } from "../lib/registry";
import { slugify } from "../lib/slugify";
import { requireAuth, requirePermission, type AuthedRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { logActivity } from "../lib/activity";
import { triggerRevalidation } from "../lib/revalidate";
import type { Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  IMPORTANT — public and admin routes are SEPARATE routers.          */
/*  Express matches handlers in definition order, so mixing them in    */
/*  one router lets the public GET handlers shadow the authenticated    */
/*  admin ones (which silently exposed admin endpoints).               */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Public reads — published content only, no authentication           */
/* ------------------------------------------------------------------ */

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().trim().optional(),
  sort: z.string().trim().default("order"),
  dir: z.enum(["asc", "desc"]).default("asc"),
  status: z.string().optional(),
  featured: z.string().optional(),
  category: z.string().optional(),
});

export const publicRouter = Router();

publicRouter.get(
  "/:key",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const reg = getRegistry(key);
    if (!reg || !reg.public) throw ApiError.notFound();

    const q = req.query as unknown as z.infer<typeof listQuerySchema>;
    const model = reg.model as Model<any>;

    const filter: Record<string, unknown> = {
      status: "PUBLISHED",
      $or: [{ publishedAt: { $exists: false } }, { publishedAt: null }, { publishedAt: { $lte: new Date() } }],
    };
    if (q.q && reg.searchFields.length) {
      filter.$and = [{ $or: reg.searchFields.map((fld) => ({ [fld]: { $regex: q.q, $options: "i" } })) }];
    }
    if (q.featured === "true") filter.featured = true;

    const sortField = reg.sortable.includes(q.sort) ? q.sort : "order";
    const sortDir = q.dir === "desc" ? -1 : 1;

    const [docs, total] = await Promise.all([
      model
        .find(filter)
        .select(reg.publicFields)
        .sort({ [sortField]: sortDir })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      model.countDocuments(filter),
    ]);

    ok(res, docs, {
      pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) },
      tag: reg.tag,
    });
  })
);

publicRouter.get(
  "/:key/:slug",
  asyncHandler(async (req, res) => {
    const { key, slug } = req.params as { key: string; slug: string };
    const reg = getRegistry(key);
    if (!reg || !reg.public) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const isId = /^[0-9a-fA-F]{24}$/.test(slug);
    const filter: Record<string, unknown> = { status: "PUBLISHED" };
    filter[isId ? "_id" : "slug"] = slug;

    const doc = await model.findOne(filter).select(reg.publicFields).populate(reg.populate ?? "").lean();
    if (!doc) throw ApiError.notFound(`${reg.label} not found`);
    ok(res, doc, { tag: reg.tag });
  })
);

/* ------------------------------------------------------------------ */
/*  Admin CRUD — every route requires authentication + permission     */
/* ------------------------------------------------------------------ */

/** Loose but meaningful validation for every registry collection. */
function collectionSchema(key: string) {
  const base = {
    title: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    question: z.string().min(1).optional(),
    quote: z.string().min(1).optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes").optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    enabled: z.boolean().optional(),
    visible: z.boolean().optional(),
    featured: z.boolean().optional(),
    order: z.number().optional(),
  };
  void key;
  return z.object(base).passthrough();
}

const adminListQuerySchema = listQuerySchema.extend({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

const reorderSchema = z.object({ order: z.array(z.string()).min(1) });

function buildSlug(body: Record<string, unknown>, existing?: { slug: string }): string {
  if (typeof body.slug === "string" && body.slug.trim()) return slugify(body.slug);
  if (existing?.slug) return existing.slug;
  const source = body.title ?? body.name ?? body.question ?? "untitled";
  return slugify(String(source));
}

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get(
  "/:key",
  requirePermission("content:read"),
  validateQuery(adminListQuerySchema),
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const q = req.query as unknown as z.infer<typeof adminListQuerySchema>;
    const model = reg.model as Model<any>;
    const filter: Record<string, unknown> = {};
    if (q.q && reg.searchFields.length) {
      filter.$or = reg.searchFields.map((fld) => ({ [fld]: { $regex: q.q, $options: "i" } }));
    }
    if (q.status) filter.status = q.status;
    if (q.featured === "true") filter.featured = true;

    const sortField = reg.sortable.includes(q.sort) ? q.sort : "createdAt";
    const sortDir = q.dir === "desc" ? -1 : 1;

    const [docs, total] = await Promise.all([
      model
        .find(filter)
        .sort({ [sortField]: sortDir })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .populate(reg.populate ?? "")
        .lean(),
      model.countDocuments(filter),
    ]);

    ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
  })
);

adminRouter.post(
  "/:key",
  requirePermission("content:write"),
  validateBody(collectionSchema("base").partial()),
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const body = { ...req.body } as Record<string, unknown>;
    body.slug = buildSlug(body);

    const doc = await model.create(body);
    await logActivity(req as AuthedRequest, `Created ${reg.label}`, reg.label, doc._id, { slug: doc.slug });
    await triggerRevalidation([reg.tag]);
    ok(res, doc.toJSON(), undefined, 201);
  })
);

adminRouter.get(
  "/:key/:id",
  requirePermission("content:read"),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params as { key: string; id: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const doc = await (reg.model as Model<any>).findById(id).populate(reg.populate ?? "").lean();
    if (!doc) throw ApiError.notFound(`${reg.label} not found`);
    ok(res, doc);
  })
);

adminRouter.patch(
  "/:key/reorder",
  requirePermission("content:write"),
  validateBody(reorderSchema),
  asyncHandler(async (req, res) => {
    const { key } = req.params as { key: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const ids = (req.body as { order: string[] }).order;

    await Promise.all(
      ids.map((id, index) => model.updateOne({ _id: id }, { $set: { order: index } }))
    );

    await logActivity(req as AuthedRequest, `Reordered ${reg.label}s`, reg.label);
    await triggerRevalidation([reg.tag]);
    ok(res, { reordered: ids.length });
  })
);

adminRouter.patch(
  "/:key/:id",
  requirePermission("content:write"),
  validateBody(collectionSchema("base").partial()),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params as { key: string; id: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const existing = await model.findById(id);
    if (!existing) throw ApiError.notFound(`${reg.label} not found`);

    const body = { ...req.body } as Record<string, unknown>;
    body.slug = buildSlug(body, existing);

    Object.assign(existing, body);
    if (body.status === "PUBLISHED" && !existing.publishedAt) existing.publishedAt = new Date();
    if (body.status === "DRAFT" && existing.publishedAt) existing.publishedAt = null;
    if (body.publishedAt) existing.publishedAt = new Date(body.publishedAt as string);

    await existing.save();
    await logActivity(req as AuthedRequest, `Updated ${reg.label}`, reg.label, existing._id, { slug: existing.slug });
    await triggerRevalidation([reg.tag]);
    ok(res, existing.toJSON());
  })
);

adminRouter.delete(
  "/:key/:id",
  requirePermission("content:write"),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params as { key: string; id: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const doc = await model.findByIdAndDelete(id);
    if (!doc) throw ApiError.notFound(`${reg.label} not found`);

    await logActivity(req as AuthedRequest, `Deleted ${reg.label}`, reg.label, id, { slug: doc.slug });
    await triggerRevalidation([reg.tag]);
    ok(res, { deleted: true });
  })
);

adminRouter.post(
  "/:key/:id/duplicate",
  requirePermission("content:write"),
  asyncHandler(async (req, res) => {
    const { key, id } = req.params as { key: string; id: string };
    const reg = getRegistry(key);
    if (!reg) throw ApiError.notFound();

    const model = reg.model as Model<any>;
    const existing = await model.findById(id).lean();
    if (!existing) throw ApiError.notFound(`${reg.label} not found`);

    const { _id, createdAt, updatedAt, publishedAt, ...rest } = existing as Record<string, unknown>;
    void _id;
    const copy = {
      ...rest,
      title: `${rest.title ?? "Copy"} (copy)`,
      slug: `${slugify(String(rest.slug ?? "copy"))}-copy`,
      status: "DRAFT",
    };

    const doc = await model.create(copy);
    await logActivity(req as AuthedRequest, `Duplicated ${reg.label}`, reg.label, doc._id, { from: id });
    await triggerRevalidation([reg.tag]);
    ok(res, doc.toJSON(), undefined, 201);
  })
);

export default adminRouter;
