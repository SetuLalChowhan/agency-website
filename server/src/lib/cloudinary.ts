import { v2 as cloudinary } from "cloudinary";
import { env, cloudinaryConfigured } from "../config/env";
import { ApiError } from "./errors";

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export const cloudinaryEnabled = cloudinaryConfigured;

export type UploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes: number;
  folder: string;
};

/** Upload a buffer (e.g. from multer memory storage) to Cloudinary. */
export async function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; resourceType?: "image" | "video" | "raw"; publicId?: string; transformation?: string }
): Promise<UploadResult> {
  if (!cloudinaryConfigured) {
    throw ApiError.conflict(
      "Cloudinary is not configured on the server. Add CLOUDINARY_* env vars to enable uploads."
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? "image",
        public_id: options.publicId,
        transformation: options.transformation ? [{ fetch_format: "auto", quality: "auto" }] : undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.internal(error?.message ?? "Cloudinary upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.url ?? result.secure_url ?? "",
          secureUrl: result.secure_url ?? result.url ?? "",
          format: result.format ?? "",
          resourceType: result.resource_type ?? "image",
          width: result.width,
          height: result.height,
          bytes: result.bytes ?? 0,
          folder: options.folder,
        });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType = "image"): Promise<void> {
  if (!cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as "image" });
}
