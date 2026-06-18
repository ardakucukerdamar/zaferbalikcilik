"use client";

import React, { useState, useEffect } from "react";
import { fetchDashboardStats, updateReservationStatus as apiUpdateStatus } from "@/lib/actions";

interface Reservation {
  id: string;
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  note: string | null;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    menuItems: 0,
    categories: 0,
    reservations: 0,
    reviews: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data.stats);
      setRecentReservations(data.recentReservations);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const updateReservationStatus = async (id: string, newStatus: "confirmed" | "cancelled") => {
    setActionLoading(id);
    try {
      await apiUpdateStatus(id, newStatus);
      
      // Update local state
      setRecentReservations((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
      );
    } catch (error) {
      console.error("Error updating reservation:", error);
      alert("Durum güncellenirken bir hata oluştu.");
    } finally {
      setActionLoading(null);
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-[#0a141d] border border-[#c9a36b]/15 rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-[-20%] right-[-10%] w-[30%] h-[150%] bg-[#c9a36b]/5 rounded-full blur-[80px] pointer-events-none" />
        <h2 className="text-xl font-serif text-[#faf5ea] font-semibold mb-1">
          Hoş Geldiniz, Şef.
        </h2>
        <p className="text-sm text-[#506573] max-w-xl">
          Yönetim panelinden menüyü güncelleyebilir, rezervasyonları kontrol edebilir ve web sitesi ayarlarını düzenleyebilirsiniz.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            name: "Yemek Çeşitleri",
            value: stats.menuItems,
            desc: "Seçenekli menü kalemleri",
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a36b]">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
          {
            name: "Kategoriler",
            value: stats.categories,
            desc: "Aktif menü grupları",
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a36b]">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
          {
            name: "Toplam Rezervasyon",
            value: stats.reservations,
            desc: "Yapılan sofra talepleri",
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a36b]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            name: "Misafir Defteri",
            value: stats.reviews,
            desc: "Kabul edilen yorumlar",
            icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c9a36b]">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm hover:border-[#c9a36b]/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#506573]">
                  {card.name}
                </p>
                <h3 className="text-3xl font-serif font-bold text-[#faf5ea] mt-1">
                  {card.value}
                </h3>
              </div>
              <div className="p-2.5 bg-[#c9a36b]/5 rounded-lg border border-[#c9a36b]/10">
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-[#506573]">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Grid: Reservations + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations (Col span 2) */}
        <div className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#c9a36b]/10">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea]">
              Son Rezervasyon Talepleri
            </h3>
            <span className="text-xs text-[#506573]">En son gelen 5 kayıt</span>
          </div>

          {recentReservations.length === 0 ? (
            <p className="text-sm text-[#506573] py-8 text-center italic">
              Henüz rezervasyon kaydı bulunmuyor.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#faf5ea]/80">
                <thead>
                  <tr className="border-b border-[#c9a36b]/10 text-xs uppercase tracking-wider text-[#506573]">
                    <th className="pb-3">Ad Soyad</th>
                    <th className="pb-3">Tarih / Saat</th>
                    <th className="pb-3">Kişi</th>
                    <th className="pb-3">Durum</th>
                    <th className="pb-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9a36b]/5">
                  {recentReservations.map((res) => (
                    <tr key={res.id} className="group hover:bg-[#0a141d]/20 transition-colors">
                      <td className="py-4 font-medium text-[#faf5ea]">
                        <div>
                          <p>{res.name}</p>
                          <p className="text-xs text-[#506573] mt-0.5">{res.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 text-[#faf5ea]/80">
                        {res.reservation_date} · <span className="font-semibold text-[#c9a36b]">{res.reservation_time}</span>
                      </td>
                      <td className="py-4 font-semibold">{res.guest_count} Kişi</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            res.status === "pending"
                              ? "bg-[#c9a36b]/10 text-[#c9a36b] border border-[#c9a36b]/20 animate-pulse"
                              : res.status === "confirmed"
                              ? "bg-[#2c4a3a]/30 text-[#21c46a] border border-[#2c4a3a]/50"
                              : "bg-[#c25234]/10 text-[#c25234] border border-[#c25234]/20"
                          }`}
                        >
                          {res.status === "pending" && "Beklemede"}
                          {res.status === "confirmed" && "Onaylandı"}
                          {res.status === "cancelled" && "İptal Edildi"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {res.status === "pending" ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => updateReservationStatus(res.id, "confirmed")}
                              disabled={actionLoading !== null}
                              className="px-2.5 py-1.5 bg-[#2c4a3a]/40 hover:bg-[#2c4a3a] text-[#21c46a] text-xs font-semibold rounded transition-colors border border-[#2c4a3a]/60 cursor-pointer disabled:opacity-50"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => updateReservationStatus(res.id, "cancelled")}
                              disabled={actionLoading !== null}
                              className="px-2.5 py-1.5 bg-[#c25234]/10 hover:bg-[#c25234]/20 text-[#c25234] text-xs font-semibold rounded transition-colors border border-[#c25234]/20 cursor-pointer disabled:opacity-50"
                            >
                              Reddet
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#506573] italic">Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links / Status Panel */}
        <div className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#c9a36b]/10">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea]">
              Hızlı İşlemler
            </h3>
          </div>
          
          <div className="space-y-3">
            <a
              href="/admin/menu"
              className="flex items-center justify-between p-4 bg-[#070e14]/50 border border-[#c9a36b]/5 hover:border-[#c9a36b]/20 rounded-lg text-sm text-[#faf5ea] transition-all group"
            >
              <span>Yeni Menü Kalemi Ekle</span>
              <span className="text-[#c9a36b] group-hover:translate-x-1 transition-transform">→</span>
            </a>
            
            <a
              href="/admin/reservations"
              className="flex items-center justify-between p-4 bg-[#070e14]/50 border border-[#c9a36b]/5 hover:border-[#c9a36b]/20 rounded-lg text-sm text-[#faf5ea] transition-all group"
            >
              <span>Tüm Rezervasyonları Gör</span>
              <span className="text-[#c9a36b] group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <a
              href="/admin/settings"
              className="flex items-center justify-between p-4 bg-[#070e14]/50 border border-[#c9a36b]/5 hover:border-[#c9a36b]/20 rounded-lg text-sm text-[#faf5ea] transition-all group"
            >
              <span>Saatleri ve Telefonu Düzenle</span>
              <span className="text-[#c9a36b] group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="p-4 border border-[#c9a36b]/10 rounded-lg bg-[#c9a36b]/5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c9a36b]">
              Karekod Menü Bağlantısı
            </h4>
            <p className="text-xs text-[#506573] leading-relaxed">
              Müşterilerin masadan okuttuğu karekod, doğrudan <strong>zaferbalikcilik.com.tr/menu</strong> adresine yönlenir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
