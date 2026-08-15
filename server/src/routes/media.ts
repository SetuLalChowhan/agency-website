import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { asyncHandler, ApiError, ok } from "../lib/errors";
import { requireAuth, requirePermission, type AuthedRequest } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { logActivity } from "../lib/activity";
import { Media } from "../models/media";
import { uploadBuffer, deleteAsset, cloudinaryEnabled } from "../lib/cloudinary";
import { env } from "../config/env";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const okTypes = /^(image|video)\//;
    if (!okTypes.test(file.mimetype)) {
      cb(new Error("Only images and videos are supported"));
      return;
    }
    cb(null, true);
  },
});

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().trim().optional(),
  type: z.enum(["image", "video", "raw"]).optional(),
  folder: z.string().optional(),
});

const updateSchema = z.object({
  altText: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
  folder: z.string().max(200).optional(),
});

router.use(requireAuth, requirePermission("media:write"));

router.get(
  "/",
  requirePermission("content:read"),
  validateQuery(listQuery),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q.q) {
      filter.$or = [
        { altText: { $regex: q.q, $options: "i" } },
        { caption: { $regex: q.q, $options: "i" } },
        { publicId: { $regex: q.q, $options: "i" } },
      ];
    }
    if (q.type) filter.resourceType = q.type;
    if (q.folder) filter.folder = q.folder;

    const [docs, total] = await Promise.all([
      Media.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      Media.countDocuments(filter),
    ]);
    ok(res, docs, { pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } });
  })
);

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file provided (field name: file)");
    if (!cloudinaryEnabled) {
      throw ApiError.conflict(
        "Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable the media library."
      );
    }

    const resourceType: "image" | "video" | "raw" = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    const result = await uploadBuffer(req.file.buffer, {
      folder: env.cloudinary.folder,
      resourceType,
    });

    const doc = await Media.create({
      publicId: result.publicId,
      url: result.url,
      secureUrl: result.secureUrl,
      format: result.format,
      resourceType: result.resourceType,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      folder: result.folder,
      createdBy: (req as AuthedRequest).user._id,
    });

    await logActivity(req as AuthedRequest, "Uploaded media", "Media", doc._id, { publicId: doc.publicId });
    ok(res, doc.toJSON(), undefined, 201);
  })
);

router.patch(
  "/:id",
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const doc = await Media.findByIdAndUpdate((req.params as { id: string }).id, { $set: req.body }, { new: true });
    if (!doc) throw ApiError.notFound("Media not found");
    await logActivity(req as AuthedRequest, "Updated media metadata", "Media", doc._id, req.body);
    ok(res, doc);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const doc = await Media.findByIdAndDelete((req.params as { id: string }).id);
    if (!doc) throw ApiError.notFound("Media not found");
    try {
      await deleteAsset(doc.publicId, doc.resourceType);
    } catch {
      // Asset may already be gone from Cloudinary — local record removal still wins.
    }
    await logActivity(req as AuthedRequest, "Deleted media", "Media", doc._id, { publicId: doc.publicId });
    ok(res, { deleted: true });
  })
);

export default router;
