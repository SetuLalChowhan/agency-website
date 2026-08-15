import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"] as const;
export type RoleKey = (typeof ROLES)[number];

const adminUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "EDITOR", index: true },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const AdminUser = mongoose.model("AdminUser", adminUserSchema);
export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;

/** Static permission grants per role — keeps RBAC simple and auditable. */
export const ROLE_PERMISSIONS: Record<RoleKey, string[]> = {
  SUPER_ADMIN: [
    "content:read",
    "content:write",
    "content:publish",
    "media:write",
    "leads:read",
    "leads:update",
    "settings:write",
    "seo:write",
    "users:manage",
    "system:read",
    "system:revalidate",
  ],
  ADMIN: [
    "content:read",
    "content:write",
    "content:publish",
    "media:write",
    "leads:read",
    "leads:update",
    "settings:write",
    "seo:write",
    "system:read",
    "system:revalidate",
  ],
  EDITOR: ["content:read", "content:write", "media:write", "seo:write"],
  AUTHOR: ["content:read", "content:write"],
};

export function hasPermission(role: RoleKey, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
