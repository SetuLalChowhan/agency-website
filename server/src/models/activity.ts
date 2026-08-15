import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    adminName: { type: String, default: "" },
    action: { type: String, required: true }, // e.g. "Created project", "Changed primary color"
    entity: { type: String, default: "" }, // e.g. "Project"
    entityId: { type: Schema.Types.Mixed }, // document id or slug
    changes: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ entity: 1, entityId: 1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
