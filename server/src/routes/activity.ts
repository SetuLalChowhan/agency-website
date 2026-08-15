import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../lib/errors";
import { requireAuth, requirePermission } from "../middleware/auth";
import { validateQuery } from "../middleware/validate";
import { ActivityLog } from "../models/activity";

const router = Router();

router.use(requireAuth, requirePermission("system:read"));

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().trim().optional(),
  entity: z.string().optional(),
});

router.get(
  "/",
  validateQuery(listQuery),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q.q) filter.action = { $regex: q.q, $options: "i" };
    if (q.entity) filter.entity = q.entity;

    const [docs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);
    ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
  })
);

export default router;
