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

export type LibraryAsset = {
  publicId: string;
  url: string;
  resourceType: "image" | "video";
  createdAt: string;
};

/** List uploaded assets in the account (newest first). */
export async function listCloudinaryAssets(
  resourceType: "image" | "video",
  maxResults = 100,
): Promise<LibraryAsset[]> {
  const result = (await cloudinary.api.resources({
    type: "upload",
    resource_type: resourceType,
    max_results: maxResults,
    direction: "desc",
  })) as {
    resources: Array<{
      public_id: string;
      secure_url: string;
      created_at: string;
    }>;
  };

  return result.resources.map((r) => ({
    publicId: r.public_id,
    url: r.secure_url,
    resourceType,
    createdAt: r.created_at,
  }));
}

/** Permanently delete an asset from Cloudinary (invalidates CDN cache). */
export async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video",
): Promise<boolean> {
  const result = (await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  })) as { result?: string };
  return result.result === "ok" || result.result === "not found";
}

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
