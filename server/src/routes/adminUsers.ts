import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { asyncHandler, ApiError, ok } from "../lib/errors";
import { requireAuth, requirePermission, type AuthedRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { logActivity } from "../lib/activity";
import { AdminUser, ROLES, ROLE_PERMISSIONS, type RoleKey } from "../models/user";

const router = Router();

router.use(requireAuth, requirePermission("users:manage"));

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().trim().optional(),
});

router.get(
  "/",
  validateQuery(listQuery),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      filter.$or = [
        { name: { $regex: q.q, $options: "i" } },
        { email: { $regex: q.q, $options: "i" } },
      ];
    }
    const [docs, total] = await Promise.all([
      AdminUser.find(filter).select("-passwordHash").sort({ createdAt: 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      AdminUser.countDocuments(filter),
    ]);
    ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
  })
);

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES).default("EDITOR"),
});

router.post(
  "/",
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const existing = await AdminUser.findOne({ email: body.email.toLowerCase() });
    if (existing) throw ApiError.conflict("A user with that email already exists");

    const doc = await AdminUser.create({
      name: body.name,
      email: body.email,
      role: body.role,
      passwordHash: await bcrypt.hash(body.password, 12),
    });
    await logActivity(req as AuthedRequest, "Created admin user", "AdminUser", doc._id, { email: doc.email });
    ok(res, doc.toJSON(), undefined, 201);
  })
);

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

router.patch(
  "/:id",
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const me = (req as AuthedRequest).user;
    const body = req.body as z.infer<typeof updateSchema>;

    const doc = await AdminUser.findById(id);
    if (!doc) throw ApiError.notFound("User not found");

    // Guard: don't allow deactivating or demoting yourself.
    if (String(doc._id) === String(me._id)) {
      if (body.active === false) throw ApiError.badRequest("You cannot deactivate your own account");
      if (body.role && body.role !== doc.role) throw ApiError.badRequest("You cannot change your own role");
    }

    if (body.name) doc.name = body.name;
    if (body.role) doc.role = body.role;
    if (body.active !== undefined) doc.active = body.active;
    if (body.password) doc.passwordHash = await bcrypt.hash(body.password, 12);

    await doc.save();
    await logActivity(req as AuthedRequest, "Updated admin user", "AdminUser", doc._id, { email: doc.email });
    ok(res, doc.toJSON());
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const me = (req as AuthedRequest).user;
    if (String(id) === String(me._id)) throw ApiError.badRequest("You cannot delete your own account");
    await AdminUser.findByIdAndDelete(id);
    await logActivity(req as AuthedRequest, "Deleted admin user", "AdminUser", id);
    ok(res, { deleted: true });
  })
);

/** Roles + permission map for the admin UI. */
router.get(
  "/roles",
  asyncHandler(async (_req, res) => {
    ok(res, ROLES.map((role) => ({ role, permissions: ROLE_PERMISSIONS[role as RoleKey] })));
  })
);

export default router;
