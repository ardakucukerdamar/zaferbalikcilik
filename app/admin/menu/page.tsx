"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Category, MenuItem } from "@/lib/data";
import {
  fetchMenuData,
  saveCategory,
  deleteCategory,
  saveMenuItem,
  deleteMenuItem,
  toggleMenuItemActive,
  uploadImage,
} from "@/lib/actions";

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected category filter
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  // Category Modals / Actions
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Menu Item Modals / Actions
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCatId, setItemCatId] = useState("");
  const [itemTags, setItemTags] = useState("");
  const [itemActive, setItemActive] = useState(true);
  const [itemImg, setItemImg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImage(formData);
      if (!res.success || !res.publicUrl) {
        throw new Error(res.error || "Görsel adresi alınamadı");
      }

      setItemImg(res.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Görsel yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const loadData = async () => {
    try {
      const data = await fetchMenuData();
      setCategories(data.categories || []);
      setMenuItems(data.menuItems || []);
      if (data.categories && data.categories.length > 0 && itemCatId === "") {
        setItemCatId(data.categories[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) return;

    try {
      if (editingCatId) {
        await saveCategory({ id: editingCatId, name: catName, slug: catSlug });
      } else {
        const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order_num || 0), 0);
        await saveCategory({ name: catName, slug: catSlug, order_num: maxOrder + 1, is_active: true });
      }

      setCatName("");
      setCatSlug("");
      setEditingCatId(null);
      setIsCatModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Kategori kaydedilirken hata oluştu.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? Kategorideki yemekler sahipsiz kalabilir.")) return;
    try {
      await deleteCategory(id);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Kategori silinirken hata oluştu.");
    }
  };

  const openEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setIsCatModalOpen(true);
  };

  // Menu Item Actions
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemCatId) return;

    const parsedTags = itemTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t);

    try {
      if (editingItemId) {
        await saveMenuItem({
          id: editingItemId,
          category_id: itemCatId,
          name: itemName,
          description: itemDesc.trim() || null,
          price: itemPrice || "—",
          tags: parsedTags,
          image_url: itemImg.trim() || null,
          is_active: itemActive,
        });
      } else {
        const maxOrder = menuItems
          .filter((it) => it.category_id === itemCatId)
          .reduce((max, it) => Math.max(max, it.order_num || 0), 0);

        await saveMenuItem({
          category_id: itemCatId,
          name: itemName,
          description: itemDesc.trim() || null,
          price: itemPrice || "—",
          tags: parsedTags,
          image_url: itemImg.trim() || null,
          is_active: itemActive,
          order_num: maxOrder + 1,
        });
      }

      resetItemForm();
      setIsItemModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Yemek kaydedilirken hata oluştu.");
    }
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName("");
    setItemDesc("");
    setItemPrice("");
    setItemTags("");
    setItemImg("");
    setItemActive(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemDesc(item.description || "");
    setItemPrice(item.price);
    setItemCatId(item.category_id);
    setItemTags((item.tags || []).join(", "));
    setItemImg(item.image_url || "");
    setItemActive(item.is_active);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Bu yemeği silmek istediğinize emin misiniz?")) return;
    try {
      await deleteMenuItem(id);
      loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Yemek silinirken hata oluştu.");
    }
  };

  const toggleItemActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleMenuItemActive(id, !currentStatus);
      
      // Update local state instantly
      setMenuItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_active: !currentStatus } : it))
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
      </div>
    );
  }

  // Filter menu items by selected category
  const filteredMenuItems =
    selectedCatId === "all"
      ? menuItems
      : menuItems.filter((it) => it.category_id === selectedCatId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Category Section Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#c9a36b]/15">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#faf5ea]">Kategoriler</h2>
          <p className="text-xs text-[#506573] mt-0.5">Menüyü oluşturan ana başlıklar</p>
        </div>
        <button
          onClick={() => {
            setEditingCatId(null);
            setCatName("");
            setCatSlug("");
            setIsCatModalOpen(true);
          }}
          className="px-4 py-2 bg-[#c9a36b]/10 hover:bg-[#c9a36b]/20 text-[#c9a36b] text-xs font-semibold rounded-lg border border-[#c9a36b]/20 transition-all cursor-pointer"
        >
          + Yeni Kategori
        </button>
      </div>

      {/* Categories Grid List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-lg p-4 flex flex-col justify-between hover:border-[#c9a36b]/35 transition-all"
          >
            <div>
              <p className="text-xs font-semibold text-[#c9a36b] uppercase tracking-wider">
                Slug: {cat.slug}
              </p>
              <h4 className="font-serif text-[#faf5ea] font-medium text-sm mt-1">{cat.name}</h4>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-[#c9a36b]/5">
              <button
                onClick={() => openEditCat(cat)}
                className="text-xs text-[#faf5ea]/50 hover:text-[#c9a36b] transition-colors cursor-pointer"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-xs text-[#c25234]/60 hover:text-[#c25234] transition-colors cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Items Section Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#c9a36b]/15 gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#faf5ea]">Menü Yemekleri</h2>
          <p className="text-xs text-[#506573] mt-0.5">Müşterilerin masadan göreceği tüm yemekler</p>
        </div>
        <div className="flex gap-3">
          {/* Category Selector */}
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-2 bg-[#070e14] border border-[#506573]/20 rounded-lg outline-none text-[#faf5ea] text-xs transition-all focus:border-[#c9a36b]/50"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              resetItemForm();
              setIsItemModalOpen(true);
            }}
            className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md"
          >
            + Yemek Ekle
          </button>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm overflow-hidden">
        {filteredMenuItems.length === 0 ? (
          <p className="text-sm text-[#506573] py-12 text-center italic">
            Bu kategoride kayıtlı yemek bulunmuyor.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#faf5ea]/80">
              <thead>
                <tr className="border-b border-[#c9a36b]/10 text-xs uppercase tracking-wider text-[#506573]">
                  <th className="pb-3 w-16">Sıra</th>
                  <th className="pb-3">Yemek Adı</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Fiyat</th>
                  <th className="pb-3">Etiketler</th>
                  <th className="pb-3 w-28">Durum</th>
                  <th className="pb-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a36b]/5">
                {filteredMenuItems.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="group hover:bg-[#0a141d]/20 transition-colors">
                      <td className="py-4 text-[#506573] font-mono">{item.order_num || "—"}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-[#c9a36b]/10"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#faf5ea]">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-[#506573] mt-0.5 truncate max-w-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-[#c9a36b]/80">
                        {cat ? cat.name : "Belirsiz"}
                      </td>
                      <td className="py-4 font-semibold text-[#faf5ea]">{item.price}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(item.tags || []).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.5 bg-[#c9a36b]/5 text-[#c9a36b] border border-[#c9a36b]/15 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => toggleItemActive(item.id, item.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider cursor-pointer border ${
                            item.is_active
                              ? "bg-[#2c4a3a]/30 text-[#21c46a] border-[#2c4a3a]/50"
                              : "bg-[#c25234]/10 text-[#c25234] border-[#c25234]/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-[#21c46a]" : "bg-[#c25234]"}`} />
                          <span>{item.is_active ? "Açık" : "Kapalı"}</span>
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditItem(item)}
                            className="px-2.5 py-1.5 bg-[#070e14] hover:bg-[#c9a36b]/10 text-[#c9a36b] text-xs font-medium rounded border border-[#c9a36b]/20 transition-all cursor-pointer"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-2.5 py-1.5 bg-[#c25234]/10 hover:bg-[#c25234]/20 text-[#c25234] text-xs font-medium rounded border border-[#c25234]/20 transition-all cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a141d] border border-[#c9a36b]/20 rounded-xl p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea] pb-2 border-b border-[#c9a36b]/10">
              {editingCatId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Sıcak Başlangıçlar"
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    // Autofill slug
                    if (!editingCatId) {
                      setCatSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                      );
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Kategori Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: sicak-baslangiclar"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#c9a36b]/10 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#faf5ea]/60 hover:text-[#faf5ea] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YEMEK / MENU ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0a141d] border border-[#c9a36b]/20 rounded-xl p-6 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea] pb-2 border-b border-[#c9a36b]/10">
              {editingItemId ? "Yemeği Düzenle" : "Yeni Yemek Ekle"}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Yemek Adı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Tereyağlı Karides"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Kategori
                  </label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Fiyat
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 220 ₺ veya mevsim"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Sarımsak, pul biber ve taze dereotu aromalı tereyağında sote..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Etiketler (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  placeholder="Örn: sef, mevsim, vegan"
                  value={itemTags}
                  onChange={(e) => setItemTags(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Görsel Yükle veya Görsel URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={itemImg}
                    onChange={(e) => setItemImg(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-[#faf5ea] text-sm"
                  />
                  <label className="px-4 py-2.5 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-colors whitespace-nowrap">
                    {uploading ? "Yükleniyor..." : "Dosya Seç"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {itemImg && (
                  <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-[#c9a36b]/15 bg-[#070e14]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={itemImg} alt="Önizleme" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="r-active"
                  checked={itemActive}
                  onChange={(e) => setItemActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c9a36b] focus:ring-[#c9a36b]"
                />
                <label htmlFor="r-active" className="text-xs text-[#faf5ea]/80 font-medium">
                  Menüde aktif olarak gösterilsin
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#c9a36b]/10 justify-end">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#faf5ea]/60 hover:text-[#faf5ea] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
