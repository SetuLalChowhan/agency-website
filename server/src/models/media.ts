import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    secureUrl: { type: String },
    format: { type: String, default: "" },
    resourceType: { type: String, default: "image" },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    folder: { type: String, default: "" },
    altText: { type: String, default: "" },
    caption: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ resourceType: 1 });

export const Media = mongoose.model("Media", mediaSchema);
