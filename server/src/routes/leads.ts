import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ApiError, ok } from "../lib/errors";
import { requireAuth, requirePermission, type AuthedRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { logActivity } from "../lib/activity";
import {
  ContactSubmission,
  QuoteRequest,
  NewsletterSubscriber,
  LEAD_STATUS,
} from "../models/leads";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  company: z.string().max(160).optional().default(""),
  budget: z.string().max(60).optional().default(""),
  service: z.string().max(160).optional().default(""),
  message: z.string().min(1).max(5000),
});

const newsletterSchema = z.object({ email: z.string().email() });

router.post("/contact", validateBody(contactSchema), asyncHandler(async (req, res) => {
  const doc = await ContactSubmission.create(req.body);
  ok(res, { id: doc._id, message: "Message received - we reply within 48 hours." }, undefined, 201);
}));

router.post("/quotes", validateBody(contactSchema), asyncHandler(async (req, res) => {
  const doc = await QuoteRequest.create(req.body);
  ok(res, { id: doc._id, message: "Quote request received." }, undefined, 201);
}));

router.post("/newsletter", validateBody(newsletterSchema), asyncHandler(async (req, res) => {
  const { email } = req.body as z.infer<typeof newsletterSchema>;
  await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { email: email.toLowerCase(), status: "SUBSCRIBED", source: "public" } },
    { upsert: true, new: true }
  );
  ok(res, { message: "Subscribed - thank you." }, undefined, 201);
}));

const leadListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().trim().optional(),
  status: z.enum(LEAD_STATUS).optional(),
  sort: z.enum(["createdAt", "updatedAt", "name", "email"]).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

const statusSchema = z.object({ status: z.enum(LEAD_STATUS), notes: z.string().max(2000).optional() });

function leadRouter(model: any) {
  const r = Router();

  r.get("/", requireAuth, requirePermission("leads:read"), validateQuery(leadListQuery),
    asyncHandler(async (req, res) => {
      const q = req.query as unknown as z.infer<typeof leadListQuery>;
      const filter: Record<string, unknown> = {};
      if (q.q) {
        filter.$or = [
          { name: { $regex: q.q, $options: "i" } },
          { email: { $regex: q.q, $options: "i" } },
          { company: { $regex: q.q, $options: "i" } },
        ];
      }
      if (q.status) filter.status = q.status;
      const [docs, total] = await Promise.all([
        model.find(filter).sort({ [q.sort]: q.dir === "desc" ? -1 : 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
        model.countDocuments(filter),
      ]);
      ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
    })
  );

  r.patch("/:id", requireAuth, requirePermission("leads:update"), validateBody(statusSchema),
    asyncHandler(async (req, res) => {
      const doc = await model.findByIdAndUpdate((req.params as { id: string }).id, { $set: req.body }, { new: true });
      if (!doc) throw ApiError.notFound("Lead not found");
      await logActivity(req as AuthedRequest, "Updated lead status", "Lead", doc._id, req.body);
      ok(res, doc);
    })
  );

  r.delete("/:id", requireAuth, requirePermission("leads:update"),
    asyncHandler(async (req, res) => {
      await model.findByIdAndDelete((req.params as { id: string }).id);
      await logActivity(req as AuthedRequest, "Deleted lead", "Lead", (req.params as { id: string }).id);
      ok(res, { deleted: true });
    })
  );

  return r;
}

router.use("/contact-messages", leadRouter(ContactSubmission));
router.use("/quote-requests", leadRouter(QuoteRequest));

router.get("/newsletter-subscribers", requireAuth, requirePermission("leads:read"), validateQuery(leadListQuery),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof leadListQuery>;
    const filter: Record<string, unknown> = {};
    if (q.q) filter.email = { $regex: q.q, $options: "i" };
    if (q.status) filter.status = q.status;
    const [docs, total] = await Promise.all([
      NewsletterSubscriber.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      NewsletterSubscriber.countDocuments(filter),
    ]);
    ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
  })
);

router.delete("/newsletter-subscribers/:id", requireAuth, requirePermission("leads:update"),
  asyncHandler(async (req, res) => {
    await NewsletterSubscriber.findByIdAndDelete((req.params as { id: string }).id);
    await logActivity(req as AuthedRequest, "Deleted newsletter subscriber", "Newsletter", (req.params as { id: string }).id);
    ok(res, { deleted: true });
  })
);

export default router;
