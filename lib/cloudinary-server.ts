import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadResult = {
  publicId: string;
  url: string;
  width: number;
  height: number;
};

export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "video";
  },
): Promise<UploadResult> {
  const resourceType = options.resourceType ?? "image";

  return await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: true,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      },
    );
    upload.end(file);
  });
}
