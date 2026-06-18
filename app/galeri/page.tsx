import GalleryClient from "@/components/GalleryClient";
import { getGallery } from "@/lib/data";

export const revalidate = 60; // Revalidate page data every minute

export default async function GalleryPage() {
  const gallery = await getGallery();

  return <GalleryClient gallery={gallery} />;
}
