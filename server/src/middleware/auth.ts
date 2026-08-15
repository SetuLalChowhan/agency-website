import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../lib/errors";
import { AdminUser, hasPermission, type RoleKey } from "../models/user";
import type { Types } from "mongoose";

export type AuthedRequest = Request & {
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: RoleKey;
  };
};

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = req.cookies?.kern_token;
  return typeof cookie === "string" ? cookie : null;
}

/** Requires a valid admin token. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized();

    let payload: { sub: string };
    try {
      payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    } catch {
      throw ApiError.unauthorized("Session expired — please sign in again");
    }

    const user = await AdminUser.findById(payload.sub).lean();
    if (!user || !user.active) throw ApiError.unauthorized("Account no longer active");

    (req as AuthedRequest).user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role as RoleKey,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Requires a specific permission. Must run after requireAuth. */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user) return next(ApiError.unauthorized());
    if (!hasPermission(user.role, permission)) return next(ApiError.forbidden());
    next();
  };
}
