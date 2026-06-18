import MenuClient from "@/components/MenuClient";
import { getCategories, getMenuItems, getSettings } from "@/lib/data";
import "../menu.css";

export const revalidate = 60; // Revalidate page data every minute

export default async function MenuPage() {
  const [categories, menuItems, settings] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getSettings(),
  ]);

  return (
    <MenuClient
      categories={categories}
      menuItems={menuItems}
      settings={settings}
    />
  );
}
