import { cloudinaryUrl } from "./cloudinary";

export type PublicProject = {
  slug: string;
  title: string;
  pitch: string;
  tag?: string;
  year: number;
  imagePath: string;
  liveUrl?: string;
  featured?: boolean;
};

export function projectImageUrl(imagePath: string, width = 1200): string {
  return cloudinaryUrl(imagePath, { width });
}
