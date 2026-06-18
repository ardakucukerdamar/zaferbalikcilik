import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Initialize server-side client to bypass RLS for public queries
const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface Category {
  id: string;
  name: string;
  slug: string;
  order_num: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string;
  tags: string[];
  order_num: number;
  is_active: boolean;
  image_url: string | null;
  category_slug?: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  category: string;
  caption: string | null;
  order_num: number;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  author_name: string;
  avatar_color: string;
  created_at: string;
}

export async function getSettings() {
  const { data, error } = await supabaseServer.from("settings").select("*");
  if (error) {
    console.error("Error fetching settings:", error.message);
    return {};
  }
  
  const settingsObj: Record<string, string> = {};
  data.forEach((s) => {
    settingsObj[s.key] = s.value;
  });
  return settingsObj;
}

export async function getCategories() {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("order_num", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }
  return data as Category[];
}

export async function getMenuItems() {
  const { data, error } = await supabaseServer
    .from("menu_items")
    .select("*, categories(slug)")
    .eq("is_active", true)
    .order("order_num", { ascending: true });

  if (error) {
    console.error("Error fetching menu items:", error.message);
    return [];
  }

  return data.map((item: any) => ({
    ...item,
    category_slug: item.categories?.slug || "",
  })) as MenuItem[];
}

export async function getGallery() {
  const { data, error } = await supabaseServer
    .from("gallery")
    .select("*")
    .order("order_num", { ascending: true });

  if (error) {
    console.error("Error fetching gallery:", error.message);
    return [];
  }
  return data as GalleryItem[];
}

export async function getReviews() {
  const { data, error } = await supabaseServer
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error.message);
    return [];
  }
  return data as Review[];
}
