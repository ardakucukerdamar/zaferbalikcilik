import HomeClient from "@/components/HomeClient";
import { getSettings, getGallery, getReviews } from "@/lib/data";

export const revalidate = 60; // Revalidate page data every minute

export default async function Home() {
  const [settings, gallery, reviews] = await Promise.all([
    getSettings(),
    getGallery(),
    getReviews(),
  ]);

  return <HomeClient settings={settings} gallery={gallery} reviews={reviews} />;
}
