"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GalleryItem } from "@/lib/data";
import { fetchGalleryData, saveGalleryItem, deleteGalleryItem, uploadImage } from "@/lib/actions";

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState("");
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

      setImageURL(res.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Görsel yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const [category, setCategory] = useState("Mekan");
  const [caption, setCaption] = useState("");
  const [orderNum, setOrderNum] = useState(1);

  const loadGallery = async () => {
    try {
      const data = await fetchGalleryData();
      setGallery(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageURL.trim()) return;

    try {
      if (editingItemId) {
        await saveGalleryItem({
          id: editingItemId,
          image_url: imageURL.trim(),
          category: category.trim(),
          caption: caption.trim() || null,
          order_num: Number(orderNum) || 1,
        });
      } else {
        await saveGalleryItem({
          image_url: imageURL.trim(),
          category: category.trim(),
          caption: caption.trim() || null,
          order_num: Number(orderNum) || (gallery.length + 1),
        });
      }

      resetForm();
      setIsModalOpen(false);
      loadGallery();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      alert("Görsel kaydedilirken hata oluştu.");
    }
  };

  const resetForm = () => {
    setEditingItemId(null);
    setImageURL("");
    setCategory("Mekan");
    setCaption("");
    setOrderNum(gallery.length + 1);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItemId(item.id);
    setImageURL(item.image_url);
    setCategory(item.category);
    setCaption(item.caption || "");
    setOrderNum(item.order_num);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    try {
      await deleteGalleryItem(id);
      loadGallery();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Görsel silinirken hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#c9a36b]/15">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#faf5ea]">Galeri Görselleri</h2>
          <p className="text-xs text-[#506573] mt-0.5">Ana sayfada ve galeri sekmesinde gösterilecek resimler</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md"
        >
          + Görsel Ekle
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:border-[#c9a36b]/30 transition-all duration-300"
          >
            <div className="relative aspect-video overflow-hidden bg-[#070e14]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.caption || ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0a141d]/90 border border-[#c9a36b]/20 text-[#c9a36b] text-[10px] uppercase font-semibold rounded tracking-wider">
                {item.category}
              </span>
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a141d]/90 border border-[#506573]/20 text-[#faf5ea]/80 text-[10px] font-mono rounded">
                Sıra: {item.order_num}
              </span>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
              <p className="text-sm text-[#faf5ea]/80 italic line-clamp-2">
                {item.caption || <span className="text-[#506573]/40">Açıklama belirtilmemiş</span>}
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#c9a36b]/5 text-xs">
                <button
                  onClick={() => openEdit(item)}
                  className="px-2.5 py-1.5 bg-[#070e14] hover:bg-[#c9a36b]/15 text-[#c9a36b] border border-[#c9a36b]/20 rounded transition-colors cursor-pointer"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-2.5 py-1.5 bg-[#c25234]/10 hover:bg-[#c25234]/20 text-[#c25234] border border-[#c25234]/20 rounded transition-colors cursor-pointer"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a141d] border border-[#c9a36b]/20 rounded-xl p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea] pb-2 border-b border-[#c9a36b]/10">
              {editingItemId ? "Görseli Düzenle" : "Yeni Görsel Ekle"}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Görsel Yükle veya Görsel URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageURL}
                    onChange={(e) => setImageURL(e.target.value)}
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
                {imageURL && (
                  <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-[#c9a36b]/15 bg-[#070e14]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageURL} alt="Önizleme" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                  >
                    <option value="Mekan">Mekân</option>
                    <option value="Izgara">Izgara</option>
                    <option value="Mezeler">Mezeler</option>
                    <option value="Sofra">Sofra</option>
                    <option value="Tezgâh">Tezgâh</option>
                    <option value="Hazırlık">Hazırlık</option>
                    <option value="Detay">Detay</option>
                    <option value="Sahil">Sahil</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Sıra Numarası
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={orderNum}
                    onChange={(e) => setOrderNum(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Açıklama (Caption)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Pleyt ızgarada pişirilen günlük çipura"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#c9a36b]/10 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
