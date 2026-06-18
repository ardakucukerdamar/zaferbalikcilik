"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchReviewsData, saveReview, toggleReviewApproval, deleteReview } from "@/lib/actions";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  avatar_color: string;
  is_approved: boolean;
  created_at: string;
}

const AVATAR_COLORS = [
  "#1e6091", // Blue
  "#2c4a3a", // Green
  "#c9a36b", // Gold/Bronze
  "#c25234", // Terracotta
  "#5c3d75", // Purple
  "#725e43", // Brown
  "#4361ee", // Bright Blue
  "#2ec4b6", // Teal
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isApproved, setIsApproved] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await fetchReviewsData();
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await saveReview({
        author_name: authorName.trim(),
        rating: Number(rating),
        content: content.trim(),
        avatar_color: avatarColor,
        is_approved: isApproved,
      });

      resetForm();
      setIsModalOpen(false);
      loadReviews();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Yorum kaydedilirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAuthorName("");
    setRating(5);
    setContent("");
    setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    setIsApproved(true);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await toggleReviewApproval(id, currentStatus);

      // Update locally immediately
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: !currentStatus } : r))
      );
    } catch (error) {
      console.error("Error toggling approval:", error);
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu tamamen silmek istediğinize emin misiniz?")) return;
    try {
      await deleteReview(id);
      loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Yorum silinirken hata oluştu.");
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
          <h2 className="font-serif text-xl font-semibold text-[#faf5ea]">Müşteri Yorumları</h2>
          <p className="text-xs text-[#506573] mt-0.5">
            Misafir Defteri bölümünde yayınlanan müşteri değerlendirmelerini kontrol edin
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md"
        >
          + Yorum Ekle
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-[#0a141d]/40 border border-[#c9a36b]/10 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#c9a36b]/30 transition-all duration-300 relative group"
          >
            <div className="space-y-4">
              {/* Stars & Approval status badge */}
              <div className="flex justify-between items-center">
                <div className="text-[#c9a36b] text-sm tracking-wider">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider border ${
                    review.is_approved
                      ? "bg-[#2c4a3a]/30 text-[#21c46a] border-[#2c4a3a]/50"
                      : "bg-[#c25234]/15 text-[#c25234] border-[#c25234]/30"
                  }`}
                >
                  {review.is_approved ? "Yayında" : "Gizli"}
                </span>
              </div>

              {/* Comment Content */}
              <p className="text-sm text-[#faf5ea]/90 italic leading-relaxed">
                &quot;{review.content}&quot;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#c9a36b]/5 flex flex-col gap-4">
              {/* Author footer */}
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: review.avatar_color }}
                >
                  {review.author_name.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-[#faf5ea]">
                    {review.author_name}
                  </h4>
                  <small className="text-[10px] text-[#506573] block mt-0.5">
                    Eklenme: {new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </small>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => toggleApproval(review.id, review.is_approved)}
                  className={`px-3 py-1.5 rounded font-medium border transition-colors cursor-pointer ${
                    review.is_approved
                      ? "bg-[#070e14] hover:bg-[#c25234]/10 text-[#c25234]/80 hover:text-[#c25234] border-[#c25234]/20"
                      : "bg-[#2c4a3a]/20 hover:bg-[#2c4a3a]/40 text-[#21c46a] border-[#2c4a3a]/50"
                  }`}
                >
                  {review.is_approved ? "Yayından Kaldır" : "Yayınla"}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-3 py-1.5 bg-[#c25234]/10 hover:bg-[#c25234]/20 text-[#c25234] border border-[#c25234]/20 rounded transition-colors cursor-pointer"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full bg-[#0a141d]/20 border border-[#c9a36b]/10 rounded-xl p-12 text-center">
            <p className="text-[#506573] italic text-sm">Kayıtlı müşteri yorumu bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* ADD COMMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a141d] border border-[#c9a36b]/20 rounded-xl p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#faf5ea] pb-2 border-b border-[#c9a36b]/10">
              Yeni Yorum Ekle
            </h3>
            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Author Name */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Müşteri Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              {/* Rating & Avatar Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Puan (1 - 5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                  >
                    <option value={5}>5 Yıldız (Mükemmel)</option>
                    <option value={4}>4 Yıldız (Çok İyi)</option>
                    <option value={3}>3 Yıldız (Orta)</option>
                    <option value={2}>2 Yıldız (Zayıf)</option>
                    <option value={1}>1 Yıldız (Kötü)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                    Profil Rengi
                  </label>
                  <div className="flex flex-wrap gap-2 items-center h-[42px]">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          avatarColor === color ? "scale-125 border-white" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#c9a36b] font-semibold">
                  Yorum Detayı
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Müşterinin değerlendirme detayları..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#070e14] border border-[#506573]/20 focus:border-[#c9a36b]/60 rounded-lg outline-none text-[#faf5ea] text-sm"
                />
              </div>

              {/* Approval status check */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="r-approved"
                  checked={isApproved}
                  onChange={(e) => setIsApproved(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c9a36b] focus:ring-[#c9a36b]"
                />
                <label htmlFor="r-approved" className="text-xs text-[#faf5ea]/80 font-medium">
                  Misafir Defterinde hemen yayınlansın
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#c9a36b]/10 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#faf5ea]/60 hover:text-[#faf5ea] cursor-pointer"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] text-xs font-semibold rounded-lg cursor-pointer"
                  disabled={submitting}
                >
                  {submitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
