"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Initialize server client that bypasses RLS
const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// ==========================================
// 1. Dashboard Actions
// ==========================================

export async function fetchDashboardStats() {
  try {
    const [
      { count: menuCount },
      { count: catCount },
      { count: resCount },
      { count: revCount },
    ] = await Promise.all([
      supabaseServer.from("menu_items").select("*", { count: "exact", head: true }),
      supabaseServer.from("categories").select("*", { count: "exact", head: true }),
      supabaseServer.from("reservations").select("*", { count: "exact", head: true }),
      supabaseServer.from("reviews").select("*", { count: "exact", head: true }),
    ]);

    const { data: recentRes, error: resError } = await supabaseServer
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (resError) throw resError;

    return {
      stats: {
        menuItems: menuCount || 0,
        categories: catCount || 0,
        reservations: resCount || 0,
        reviews: revCount || 0,
      },
      recentReservations: recentRes || [],
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error.message);
    throw new Error(error.message);
  }
}

export async function updateReservationStatus(id: string, newStatus: "confirmed" | "cancelled" | "pending") {
  try {
    const { data, error } = await supabaseServer
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error updating reservation status:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 2. Menu Actions
// ==========================================

export async function fetchMenuData() {
  try {
    const [
      { data: cats, error: catsError },
      { data: items, error: itemsError },
    ] = await Promise.all([
      supabaseServer.from("categories").select("*").order("order_num"),
      supabaseServer.from("menu_items").select("*").order("order_num"),
    ]);

    if (catsError) throw catsError;
    if (itemsError) throw itemsError;

    return {
      categories: cats || [],
      menuItems: items || [],
    };
  } catch (error: any) {
    console.error("Error fetching menu data:", error.message);
    throw new Error(error.message);
  }
}

export async function saveCategory(category: { id?: string; name: string; slug: string; order_num?: number; is_active?: boolean }) {
  try {
    if (category.id) {
      const { data, error } = await supabaseServer
        .from("categories")
        .update({
          name: category.name,
          slug: category.slug,
          is_active: category.is_active ?? true,
        })
        .eq("id", category.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseServer
        .from("categories")
        .insert([
          {
            name: category.name,
            slug: category.slug,
            order_num: category.order_num || 0,
            is_active: category.is_active ?? true,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error("Error saving category:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabaseServer.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting category:", error.message);
    throw new Error(error.message);
  }
}

export async function saveMenuItem(item: {
  id?: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string;
  tags: string[];
  image_url: string | null;
  is_active: boolean;
  order_num?: number;
}) {
  try {
    if (item.id) {
      const { data, error } = await supabaseServer
        .from("menu_items")
        .update({
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          price: item.price,
          tags: item.tags,
          image_url: item.image_url,
          is_active: item.is_active,
        })
        .eq("id", item.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseServer
        .from("menu_items")
        .insert([
          {
            category_id: item.category_id,
            name: item.name,
            description: item.description,
            price: item.price,
            tags: item.tags,
            image_url: item.image_url,
            is_active: item.is_active,
            order_num: item.order_num || 0,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error("Error saving menu item:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const { error } = await supabaseServer.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting menu item:", error.message);
    throw new Error(error.message);
  }
}

export async function toggleMenuItemActive(id: string, newStatus: boolean) {
  try {
    const { data, error } = await supabaseServer
      .from("menu_items")
      .update({ is_active: newStatus })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error toggling menu item status:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 3. Gallery Actions
// ==========================================

export async function fetchGalleryData() {
  try {
    const { data, error } = await supabaseServer
      .from("gallery")
      .select("*")
      .order("order_num", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching gallery data:", error.message);
    throw new Error(error.message);
  }
}

export async function saveGalleryItem(item: {
  id?: string;
  image_url: string;
  category: string;
  caption: string | null;
  order_num: number;
}) {
  try {
    if (item.id) {
      const { data, error } = await supabaseServer
        .from("gallery")
        .update({
          image_url: item.image_url,
          category: item.category,
          caption: item.caption,
          order_num: item.order_num,
        })
        .eq("id", item.id)
        .select();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseServer
        .from("gallery")
        .insert([
          {
            image_url: item.image_url,
            category: item.category,
            caption: item.caption,
            order_num: item.order_num,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error("Error saving gallery item:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    const { error } = await supabaseServer.from("gallery").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting gallery item:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 4. Reviews Actions
// ==========================================

export async function fetchReviewsData() {
  try {
    const { data, error } = await supabaseServer
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching reviews data:", error.message);
    throw new Error(error.message);
  }
}

export async function saveReview(review: {
  author_name: string;
  rating: number;
  content: string;
  avatar_color: string;
  is_approved: boolean;
}) {
  try {
    const { data, error } = await supabaseServer
      .from("reviews")
      .insert([
        {
          author_name: review.author_name,
          rating: review.rating,
          content: review.content,
          avatar_color: review.avatar_color,
          is_approved: review.is_approved,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error saving review:", error.message);
    throw new Error(error.message);
  }
}

export async function toggleReviewApproval(id: string, currentStatus: boolean) {
  try {
    const { data, error } = await supabaseServer
      .from("reviews")
      .update({ is_approved: !currentStatus })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error toggling review approval:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteReview(id: string) {
  try {
    const { error } = await supabaseServer.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting review:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 5. Settings Actions
// ==========================================

export async function fetchSettingsData() {
  try {
    const { data, error } = await supabaseServer.from("settings").select("*");
    if (error) throw error;

    const obj: Record<string, string> = {};
    data?.forEach((item) => {
      obj[item.key] = item.value;
    });
    return obj;
  } catch (error: any) {
    console.error("Error fetching settings data:", error.message);
    throw new Error(error.message);
  }
}

export async function saveSettings(settings: Record<string, string>) {
  try {
    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    const { data, error } = await supabaseServer
      .from("settings")
      .upsert(upsertData, { onConflict: "key" })
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error saving settings data:", error.message);
    throw new Error(error.message);
  }
}

// ==========================================
// 6. Reservations Actions
// ==========================================

export async function fetchReservationsData() {
  try {
    const { data, error } = await supabaseServer
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching reservations data:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteReservation(id: string) {
  try {
    const { error } = await supabaseServer.from("reservations").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting reservation:", error.message);
    throw new Error(error.message);
  }
}

export async function createReservation(reservation: {
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  note: string | null;
}) {
  try {
    const { data, error } = await supabaseServer
      .from("reservations")
      .insert([
        {
          ...reservation,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating reservation:", error.message);
    throw new Error(error.message);
  }
}

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Dosya bulunamadı");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

    const { error } = await supabaseServer.storage
      .from("gallery")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseServer.storage
      .from("gallery")
      .getPublicUrl(fileName);

    return { success: true, publicUrl };
  } catch (error: any) {
    console.error("Upload image error:", error.message);
    return { success: false, error: error.message };
  }
}
