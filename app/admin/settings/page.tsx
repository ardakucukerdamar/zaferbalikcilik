"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSettingsData, saveSettings } from "@/lib/actions";

interface BoardItem {
  tag: string;
  name: string;
  note: string;
}

interface FishCalendarItem {
  name: string;
  active: number[];
}

const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    phone: "",
    phone_intl: "",
    address: "",
    hours_open: "",
    hours_close: "",
    announcement: "",
    capacity: "",
    hero_title: "",
    hero_desc: "",
    manifesto_text: "",
    signature_name: "",
    signature_desc: "",
    signature_side: "",
    signature_drink: "",
    signature_cooking: "",
    signature_season: "",
  });

  const [localBoardItems, setLocalBoardItems] = useState<BoardItem[]>([
    { tag: "öne çıkan", name: "Çupra", note: "pleyt ızgara · 12–14 dk" },
    { tag: "mevsim", name: "Karagöz", note: "pleyt ızgara · ½ kg" },
    { tag: "klasik", name: "Lakerda", note: "ince dilim · taze meze" },
    { tag: "sınırlı", name: "Kalamar", note: "ızgara · pleyt ızgara veya tava" },
  ]);

  const [localFishCalendar, setLocalFishCalendar] = useState<FishCalendarItem[]>([
    { name: "Çupra", active: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0] },
    { name: "Levrek", active: [1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
    { name: "Karagöz", active: [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
    { name: "Mercan", active: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0] },
    { name: "Lüfer", active: [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1] },
    { name: "Palamut", active: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
    { name: "Hamsi", active: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1] },
    { name: "İstavrit", active: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0] },
    { name: "Barbun", active: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0] },
    { name: "Çinekop", active: [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0] },
  ]);
  
  const [activeTab, setActiveTab] = useState<"general" | "homepage" | "signature" | "board">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const obj = await fetchSettingsData();

        // Fill keys in state, keeping fallbacks for new ones
        setSettings({
          phone: obj.phone || "0544 352 73 71",
          phone_intl: obj.phone_intl || "+905443527371",
          address: obj.address || "Şok yanı, Artur Gömeç Artur girişi · Balıkesir",
          hours_open: obj.hours_open || "08:00",
          hours_close: obj.hours_close || "21:00",
          announcement: obj.announcement || "",
          capacity: obj.capacity || "70",
          hero_title: obj.hero_title || "Denizden sofranıza tazelik",
          hero_desc: obj.hero_desc || "Artur Gömeç'ın akşam esintisinde, günlük ağdan tezgâha, tezgâhtan sofraya. Zafer Balıkçılık Artur, üç kuşak balık ustalığını alçak sesle anlatan bir deniz sofrası.",
          manifesto_text: obj.manifesto_text || "Balık günlük olur. Sofra sabırlı. Biz aceleyi tezgâhın değil, tencerenin hızına bırakırız. Artur Gömeç'ın tuzlu rüzgârı mezeyi, pleyt ızgara balığı pişirir; biz yalnızca doğru anı beklemeyi öğretiriz.",
          signature_name: obj.signature_name || "Pleyt ızgarada çipura.",
          signature_desc: obj.signature_desc || "Günün tezgâhından, ustanın seçtiği çupra; tuzlanır, dinlendirilir, közün üstünde sabırla pişirilir. Yanında zeytinyağlı semizotu, deniz börülcesi ve roka. Bir limon, bir kadeh; gerisi denizin işi.",
          signature_side: obj.signature_side || "semizotu · börülce · roka",
          signature_drink: obj.signature_drink || "sek rakı · beyaz şarap",
          signature_cooking: obj.signature_cooking || "pleyt ızgara · 12—14 dk",
          signature_season: obj.signature_season || "kasım — şubat aralığı",
        });

        if (obj.board_items) {
          try {
            setLocalBoardItems(JSON.parse(obj.board_items));
          } catch (e) {
            console.error("Error parsing board_items JSON:", e);
          }
        }

        if (obj.fish_calendar) {
          try {
            setLocalFishCalendar(JSON.parse(obj.fish_calendar));
          } catch (e) {
            console.error("Error parsing fish_calendar JSON:", e);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleBoardItemChange = (index: number, field: keyof BoardItem, value: string) => {
    const updated = [...localBoardItems];
    updated[index] = { ...updated[index], [field]: value };
    setLocalBoardItems(updated);
  };

  const handleFishMonthToggle = (fishIndex: number, monthIndex: number) => {
    const updated = [...localFishCalendar];
    const newActive = [...updated[fishIndex].active];
    newActive[monthIndex] = newActive[monthIndex] === 1 ? 0 : 1;
    updated[fishIndex] = { ...updated[fishIndex], active: newActive };
    setLocalFishCalendar(updated);
  };

  const handleFishNameChange = (fishIndex: number, value: string) => {
    const updated = [...localFishCalendar];
    updated[fishIndex] = { ...updated[fishIndex], name: value };
    setLocalFishCalendar(updated);
  };

  const handleAddFish = () => {
    setLocalFishCalendar([
      ...localFishCalendar,
      { name: "Yeni Balık", active: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ]);
  };

  const handleRemoveFish = (index: number) => {
    const updated = localFishCalendar.filter((_, i) => i !== index);
    setLocalFishCalendar(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // Package dynamic JSON settings
      const finalSettings = {
        ...settings,
        board_items: JSON.stringify(localBoardItems),
        fish_calendar: JSON.stringify(localFishCalendar),
      };

      await saveSettings(finalSettings);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-8 shadow-sm space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-[#c9a36b]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-slate-100">
            Restoran & Web Sitesi Ayarları
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            İletişim bilgilerini, anasayfa başlıklarını, tezgâh listelerini ve mevsim takvimini buradan düzenleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#c9a36b]/10 pb-px text-xs font-semibold gap-6 uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "general"
              ? "border-[#c9a36b] text-[#c9a36b]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          İletişim & Saatler
        </button>
        <button
          onClick={() => setActiveTab("homepage")}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "homepage"
              ? "border-[#c9a36b] text-[#c9a36b]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Anasayfa Metinleri
        </button>
        <button
          onClick={() => setActiveTab("signature")}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "signature"
              ? "border-[#c9a36b] text-[#c9a36b]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Şefin İmzası
        </button>
        <button
          onClick={() => setActiveTab("board")}
          className={`pb-3 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "board"
              ? "border-[#c9a36b] text-[#c9a36b]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Tezgâh & Takvim
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-sm text-emerald-400 flex items-center gap-2 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Ayarlar başarıyla kaydedildi.</span>
          </div>
        )}

        {/* Tab 1: General */}
        {activeTab === "general" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Telefon (Görünen)
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="0544 352 73 71"
                />
              </div>

              {/* Phone Intl (WhatsApp link) */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Telefon (Uluslararası / Link için)
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone_intl}
                  onChange={(e) => handleChange("phone_intl", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="+905443527371"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hours Open */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Açılış Saati
                </label>
                <input
                  type="time"
                  required
                  value={settings.hours_open}
                  onChange={(e) => handleChange("hours_open", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                />
              </div>

              {/* Hours Close */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Kapanış Saati
                </label>
                <input
                                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Maksimum Kapasite (Kişi)
                </label>
                <input
                  type="number"
                  required
                  value={settings.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="70"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Fiziksel Adres
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Şok yanı, Artur Gömeç Artur girişi · Balıkesir"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Homepage */}
        {activeTab === "homepage" && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero Title */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Hero Ana Başlık (Giriş)
              </label>
              <input
                type="text"
                required
                value={settings.hero_title}
                onChange={(e) => handleChange("hero_title", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Denizden sofranıza tazelik"
              />
            </div>

            {/* Hero Description */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Hero Alt Açıklama Yazısı
              </label>
              <textarea
                rows={3}
                required
                value={settings.hero_desc}
                onChange={(e) => handleChange("hero_desc", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Açıklama metni..."
              />
            </div>

            {/* Manifesto */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Felsefe / Manifesto Metni (№ 01)
              </label>
              <textarea
                rows={3}
                required
                value={settings.manifesto_text}
                onChange={(e) => handleChange("manifesto_text", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Manifesto metni..."
              />
            </div>

            {/* Announcement Alert Banner */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Duyuru / Alert Banner Yazısı
              </label>
              <textarea
                rows={2}
                value={settings.announcement}
                onChange={(e) => handleChange("announcement", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Örn: Günlük taze kalamar ve çipramız tezgâhta yerini aldı."
              />
            </div>
          </div>
        )}

        {/* Tab 3: Signature */}
        {activeTab === "signature" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Signature Name */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  İmza Yemek Adı
                </label>
                <input
                  type="text"
                  required
                  value={settings.signature_name}
                  onChange={(e) => handleChange("signature_name", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="Pleyt ızgarada çipura."
                />
              </div>

              {/* Signature Cooking */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Pişirme Detayları
                </label>
                <input
                  type="text"
                  required
                  value={settings.signature_cooking}
                  onChange={(e) => handleChange("signature_cooking", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="pleyt ızgara · 12—14 dk"
                />
              </div>
            </div>

            {/* Signature Description */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                Yemek Açıklaması
              </label>
              <textarea
                rows={3}
                required
                value={settings.signature_desc}
                onChange={(e) => handleChange("signature_desc", e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                placeholder="Yemek açıklaması..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Signature Side */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Yan Lezzetler / Garnitür
                </label>
                <input
                  type="text"
                  required
                  value={settings.signature_side}
                  onChange={(e) => handleChange("signature_side", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="semizotu · börülce · roka"
                />
              </div>

              {/* Signature Drink */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  İçecek Uyumu
                </label>
                <input
                  type="text"
                  required
                  value={settings.signature_drink}
                  onChange={(e) => handleChange("signature_drink", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="sek rakı · beyaz şarap"
                />
              </div>

              {/* Signature Season */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Mevsim Aralığı
                </label>
                <input
                  type="text"
                  required
                  value={settings.signature_season}
                  onChange={(e) => handleChange("signature_season", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded-lg outline-none text-slate-200 text-sm"
                  placeholder="kasım — şubat aralığı"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Board & Calendar */}
        {activeTab === "board" && (
          <div className="space-y-8 animate-fade-in text-slate-200">
            {/* Tezgâhta Bu Hafta */}
            <div className="space-y-4">
              <div className="border-b border-[#c9a36b]/15 pb-2">
                <h4 className="font-serif font-bold text-sm text-slate-100">Tezgâhta Bu Hafta (Kara Tahta Ürünleri)</h4>
                <p className="text-[10px] text-slate-400">Anasayfada sergilenen 4 adet öne çıkan haftalık ürün kartı.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localBoardItems.map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#0a141d]/50 border border-[#c9a36b]/10 rounded-xl space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#c9a36b]">Ürün #{idx + 1}</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Etiket</label>
                        <input
                          type="text"
                          required
                          value={item.tag}
                          onChange={(e) => handleBoardItemChange(idx, "tag", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded text-xs text-slate-200 outline-none"
                          placeholder="Örn: öne çıkan"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase font-semibold">Yemek Adı</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleBoardItemChange(idx, "name", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded text-xs text-slate-200 outline-none"
                          placeholder="Örn: Çupra"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Not / Pişirme</label>
                      <input
                        type="text"
                        required
                        value={item.note}
                        onChange={(e) => handleBoardItemChange(idx, "note", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded text-xs text-slate-200 outline-none"
                        placeholder="Örn: pleyt ızgara · 12–14 dk"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mevsim Takvimi */}
            <div className="space-y-4">
              <div className="border-b border-[#c9a36b]/15 pb-2 flex justify-between items-center">
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-100">Mevsim Takvimi</h4>
                  <p className="text-[10px] text-slate-400">Balıkların hangi aylarda aktif/taze olduğunu belirleyen çizelge.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFish}
                  className="px-3 py-1.5 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-[11px] font-semibold rounded cursor-pointer transition-colors"
                >
                  + Yeni Balık Ekle
                </button>
              </div>

              <div className="overflow-x-auto bg-[#070e14]/50 border border-[#c9a36b]/10 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#c9a36b]/10 bg-black/20">
                      <th className="py-2.5 px-3 text-[10px] font-semibold text-[#c9a36b] uppercase tracking-wider w-1/4">Balık Adı</th>
                      {MONTH_NAMES.map((m) => (
                        <th key={m} className="py-2.5 px-1 text-[10px] font-semibold text-[#c9a36b] uppercase tracking-wider text-center">{m}</th>
                      ))}
                      <th className="py-2.5 px-3 text-[10px] font-semibold text-[#c9a36b] uppercase tracking-wider text-right w-16">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c9a36b]/10">
                    {localFishCalendar.map((fish, fishIdx) => (
                      <tr key={fishIdx} className="hover:bg-[#c9a36b]/5">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            value={fish.name}
                            onChange={(e) => handleFishNameChange(fishIdx, e.target.value)}
                            className="px-2 py-1 bg-[#070e14] border border-[#c9a36b]/15 focus:border-[#c9a36b] rounded text-xs text-slate-200 outline-none w-full font-medium"
                            placeholder="Balık adı"
                          />
                        </td>
                        {MONTH_NAMES.map((_, monthIdx) => (
                          <td key={monthIdx} className="py-2 px-1 text-center">
                            <input
                              type="checkbox"
                              checked={fish.active[monthIdx] === 1}
                              onChange={() => handleFishMonthToggle(fishIdx, monthIdx)}
                              className="w-3.5 h-3.5 text-[#c9a36b] rounded bg-[#070e14] border-[#c9a36b]/15 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveFish(fishIdx)}
                            className="p-1 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded cursor-pointer transition-colors"
                            title="Balığı sil"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex gap-4 pt-4 border-t border-[#c9a36b]/10 justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#c9a36b] hover:bg-[#e6c08a] disabled:bg-[#c9a36b]/50 text-[#0a141d] font-semibold text-xs rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
