"use client";

import React, { useState, useEffect } from "react";
import {
  fetchSettingsData,
  saveSettings,
  uploadImage,
} from "@/lib/actions";

interface MenuSheet {
  title: string;
  image_url: string;
}

export default function AdminMenuPage() {
  const [menuSheets, setMenuSheets] = useState<MenuSheet[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetImg, setSheetImg] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const settings = await fetchSettingsData();
      if (settings.menu_images) {
        setMenuSheets(JSON.parse(settings.menu_images));
      } else {
        // Fallback default sheets
        setMenuSheets([
          { title: "Balıklar", image_url: "/menugorseller/baliklar.jpeg" },
          { title: "Ara Sıcaklar", image_url: "/menugorseller/arasicaklar.jpeg" },
          { title: "İçecekler", image_url: "/menugorseller/icecekler.jpeg" },
          { title: "Tatlılar", image_url: "/menugorseller/tatlilar.jpeg" }
        ]);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadImage(formData);
      if (!res.success || !res.publicUrl) {
        throw new Error(res.error || "Görsel yüklenemedi");
      }

      setSheetImg(res.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Görsel yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetTitle.trim() || !sheetImg.trim()) {
      alert("Lütfen başlık ve görsel alanlarını doldurun.");
      return;
    }

    const updated = [...menuSheets];
    const newSheet = { title: sheetTitle.trim(), image_url: sheetImg.trim() };

    if (editingIndex !== null) {
      updated[editingIndex] = newSheet;
    } else {
      updated.push(newSheet);
    }

    await saveSheetsToDb(updated);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteSheet = async (index: number) => {
    if (!confirm("Bu menü görselini silmek istediğinize emin misiniz?")) return;
    const updated = menuSheets.filter((_, idx) => idx !== index);
    await saveSheetsToDb(updated);
  };

  const handleMoveSheet = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === menuSheets.length - 1) return;

    const updated = [...menuSheets];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    await saveSheetsToDb(updated);
  };

  const saveSheetsToDb = async (sheets: MenuSheet[]) => {
    setLoading(true);
    try {
      await saveSettings({
        menu_images: JSON.stringify(sheets),
      });
      setMenuSheets(sheets);
    } catch (error) {
      console.error("Error saving menu sheets:", error);
      alert("Değişiklikler kaydedilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sheet: MenuSheet, index: number) => {
    setEditingIndex(index);
    setSheetTitle(sheet.title);
    setSheetImg(sheet.image_url);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingIndex(null);
    setSheetTitle("");
    setSheetImg("");
  };

  if (loading && menuSheets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#c9a36b]/15">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#faf5ea]">Menü Görselleri Yönetimi</h2>
          <p className="text-xs text-[#506573] mt-0.5">Müşterilerin /menu sayfasında göreceği menü kartı resimlerini yönetin</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md"
        >
          + Menü Sayfası Ekle
        </button>
      </div>

      {/* Sheets List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuSheets.map((sheet, idx) => (
          <div
            key={idx}
            className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-4 flex flex-col justify-between hover:border-[#c9a36b]/35 transition-all shadow-sm"
          >
            <div>
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-[#c9a36b]/15 bg-[#070e14]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sheet.image_url}
                  alt={sheet.title}
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-[#070e14]/80 text-[#c9a36b] text-[10px] font-bold px-2 py-0.5 rounded border border-[#c9a36b]/15">
                  Sıra: {idx + 1}
                </span>
              </div>
              <h4 className="font-serif text-[#faf5ea] font-medium text-base mt-3 text-center">{sheet.title}</h4>
            </div>

            <div className="flex flex-col gap-2 mt-4 pt-2 border-t border-[#c9a36b]/5">
              {/* Order management buttons */}
              <div className="flex justify-between items-center bg-[#070e14]/40 p-1 rounded-lg border border-[#c9a36b]/5">
                <span className="text-[10px] text-[#506573] pl-1">Sıralama:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveSheet(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-[#c9a36b] disabled:text-[#506573]/30 hover:bg-[#c9a36b]/10 rounded transition-colors cursor-pointer"
                    title="Yukarı Taşı"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveSheet(idx, "down")}
                    disabled={idx === menuSheets.length - 1}
                    className="p-1 text-[#c9a36b] disabled:text-[#506573]/30 hover:bg-[#c9a36b]/10 rounded transition-colors cursor-pointer"
                    title="Aşağı Taşı"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex justify-between pt-1">
                <button
                  onClick={() => openEditModal(sheet, idx)}
                  className="text-xs px-3 py-1 bg-[#c9a36b]/10 text-[#c9a36b] hover:bg-[#c9a36b]/20 border border-[#c9a36b]/20 rounded-md transition-colors cursor-pointer"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeleteSheet(idx)}
                  className="text-xs px-3 py-1 bg-[#c25234]/10 text-[#c25234] hover:bg-[#c25234]/20 border border-[#c25234]/20 rounded-md transition-colors cursor-pointer"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sheet Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a141d] border border-[#c9a36b]/20 rounded-xl p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea] pb-2 border-b border-[#c9a36b]/10">
              {editingIndex !== null ? "Menü Sayfasını Düzenle" : "Yeni Menü Sayfası Ekle"}
            </h3>
            <form onSubmit={handleSaveSheet} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Menü Sayfası Başlığı / Kategorisi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Balıklar, Ara Sıcaklar, İçecekler"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Menü Görseli (Dosya Yükleme veya Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/menugorseller/baliklar.jpeg veya internet linki"
                    value={sheetImg}
                    onChange={(e) => setSheetImg(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-[#faf5ea] text-sm"
                  />
                  <label className="px-4 py-2.5 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-colors whitespace-nowrap">
                    {uploading ? "Yükleniyor..." : "Görsel Seç"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {sheetImg && (
                  <div className="mt-2 relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-[#c9a36b]/15 bg-[#070e14] p-2 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sheetImg} alt="Önizleme" className="max-w-full max-h-48 object-contain" />
                  </div>
                )}
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
                  disabled={uploading}
                  className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
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
