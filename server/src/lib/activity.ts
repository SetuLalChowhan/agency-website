import { ActivityLog } from "../models/activity";
import type { AuthedRequest } from "../middleware/auth";
import type { Types } from "mongoose";

export async function logActivity(
  req: AuthedRequest,
  action: string,
  entity: string,
  entityId?: Types.ObjectId | string | null,
  changes?: unknown
): Promise<void> {
  try {
    await ActivityLog.create({
      adminId: req.user?._id,
      adminName: req.user?.name ?? "system",
      action,
      entity,
      entityId,
      changes,
      ip: req.ip ?? "",
    });
  } catch {
    // Logging must never break the primary request.
  }
}
