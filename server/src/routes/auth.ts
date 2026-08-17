import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { asyncHandler, ok } from "../lib/errors";
import { ApiError } from "../lib/errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { AdminUser } from "../models/user";
import { logActivity } from "../lib/activity";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd || env.cookieSecure,
  sameSite: (env.isProd || env.cookieSecure ? "none" : "lax") as "none" | "lax",
  maxAge: 12 * 60 * 60 * 1000,
  path: "/",
};

function sign(user: { _id: unknown; role: string; email: string }) {
  return jwt.sign({ sub: String(user._id), role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await AdminUser.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !user.passwordHash) throw ApiError.unauthorized("Invalid email or password");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw ApiError.unauthorized("Invalid email or password");
    if (!user.active) throw ApiError.forbidden("This account has been deactivated");

    user.lastLoginAt = new Date();
    await user.save();

    const token = sign(user);
    res.cookie("kern_token", token, COOKIE_OPTS);
    ok(res, { token, user: user.toJSON() });
  })
);

router.post(
  "/logout",
  (_req, res) => {
    res.clearCookie("kern_token", { ...COOKIE_OPTS, maxAge: undefined });
    res.json({ success: true, data: null });
  }
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const fresh = await AdminUser.findById(user._id).lean();
    ok(res, fresh ?? user);
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

router.post(
  "/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { user } = req as AuthedRequest;
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;

    const doc = await AdminUser.findById(user._id).select("+passwordHash");
    if (!doc || !doc.passwordHash) throw ApiError.notFound("Account not found");

    const match = await bcrypt.compare(currentPassword, doc.passwordHash);
    if (!match) throw ApiError.badRequest("Current password is incorrect");

    doc.passwordHash = await bcrypt.hash(newPassword, 12);
    await doc.save();
    await logActivity(req as AuthedRequest, "Changed password", "AdminUser", doc._id);
    ok(res, { message: "Password updated" });
  })
);

export default router;
