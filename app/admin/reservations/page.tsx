"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchReservationsData, updateReservationStatus, deleteReservation } from "@/lib/actions";

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

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const data = await fetchReservationsData();
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateStatus = async (id: string, newStatus: "confirmed" | "cancelled" | "pending") => {
    setActionLoading(id);
    try {
      await updateReservationStatus(id, newStatus);

      // Update local state
      setReservations((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Durum güncellenirken hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Bu rezervasyon kaydını silmek istediğinize emin misiniz?")) return;
    setActionLoading(id);
    try {
      await deleteReservation(id);
      setReservations((prev) => prev.filter((res) => res.id !== id));
    } catch (error) {
      console.error("Error deleting reservation:", error);
      alert("Kayıt silinirken hata oluştu.");
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

  // Filter & search logic
  const filteredReservations = reservations.filter((res) => {
    const statusMatch = filter === "all" || res.status === filter;
    const nameMatch =
      res.name.toLowerCase().includes(search.toLowerCase()) ||
      res.phone.includes(search);
    return statusMatch && nameMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#c9a36b]/15 gap-4">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Hepsi", value: "all" },
            { label: "Bekleyenler", value: "pending" },
            { label: "Onaylananlar", value: "confirmed" },
            { label: "İptal Edilenler", value: "cancelled" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                filter === item.value
                  ? "bg-[#c9a36b]/15 text-[#c9a36b] border-[#c9a36b]/30"
                  : "bg-transparent text-[#506573] hover:text-[#faf5ea] border-transparent"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64 bg-[#070e14]/60 border border-[#506573]/20 focus-within:border-[#c9a36b]/50 rounded-lg flex items-center px-3 py-1.5 transition-all text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#506573] mr-2">
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.5" y2="16.5" />
          </svg>
          <input
            type="search"
            placeholder="İsim veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-[#faf5ea] placeholder-[#506573]/50"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm overflow-hidden">
        {filteredReservations.length === 0 ? (
          <p className="text-sm text-[#506573] py-12 text-center italic">
            Aranan kriterlere uygun rezervasyon bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#faf5ea]/80">
              <thead>
                <tr className="border-b border-[#c9a36b]/10 text-xs uppercase tracking-wider text-[#506573]">
                  <th className="pb-3">Misafir Bilgisi</th>
                  <th className="pb-3">Tarih</th>
                  <th className="pb-3">Saat</th>
                  <th className="pb-3">Kişi</th>
                  <th className="pb-3">Özel Not</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a36b]/5">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="group hover:bg-[#0a141d]/20 transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-[#faf5ea]">{res.name}</p>
                        <p className="text-xs text-[#506573] mt-0.5">{res.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-[#faf5ea]/90">{res.reservation_date}</td>
                    <td className="py-4 font-semibold text-[#c9a36b]">{res.reservation_time}</td>
                    <td className="py-4 font-medium">{res.guest_count} Kişi</td>
                    <td className="py-4 text-xs max-w-xs truncate text-[#faf5ea]/60" title={res.note || ""}>
                      {res.note || <span className="text-[#506573]/40 italic">Yok</span>}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                          res.status === "pending"
                            ? "bg-[#c9a36b]/15 text-[#c9a36b] border-[#c9a36b]/30 animate-pulse"
                            : res.status === "confirmed"
                            ? "bg-[#2c4a3a]/30 text-[#21c46a] border-[#2c4a3a]/50"
                            : "bg-[#c25234]/15 text-[#c25234] border-[#c25234]/20"
                        }`}
                      >
                        {res.status === "pending" && "Beklemede"}
                        {res.status === "confirmed" && "Onaylandı"}
                        {res.status === "cancelled" && "İptal Edildi"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="inline-flex gap-2">
                        {res.status === "pending" && (
                          <button
                            onClick={() => updateStatus(res.id, "confirmed")}
                            disabled={actionLoading === res.id}
                            className="px-2.5 py-1.5 bg-[#2c4a3a]/40 hover:bg-[#2c4a3a] text-[#21c46a] text-xs font-semibold rounded transition-colors border border-[#2c4a3a]/50 cursor-pointer"
                          >
                            Onayla
                          </button>
                        )}
                        {res.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(res.id, "cancelled")}
                            disabled={actionLoading === res.id}
                            className="px-2.5 py-1.5 bg-[#c25234]/10 hover:bg-[#c25234]/20 text-[#c25234] text-xs font-medium rounded border border-[#c25234]/20 transition-all cursor-pointer"
                          >
                            İptal Et
                          </button>
                        )}
                        {res.status === "cancelled" && (
                          <button
                            onClick={() => updateStatus(res.id, "pending")}
                            disabled={actionLoading === res.id}
                            className="px-2.5 py-1.5 bg-[#c9a36b]/10 hover:bg-[#c9a36b]/20 text-[#c9a36b] text-xs font-medium rounded border border-[#c9a36b]/20 transition-all cursor-pointer"
                          >
                            Geri Al
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReservation(res.id)}
                          disabled={actionLoading === res.id}
                          className="px-2.5 py-1.5 bg-transparent hover:bg-[#c25234]/10 text-[#506573] hover:text-[#c25234] text-xs font-medium rounded transition-colors cursor-pointer"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
