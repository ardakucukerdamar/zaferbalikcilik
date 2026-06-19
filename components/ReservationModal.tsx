"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { createReservation } from "@/lib/actions";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
}

export default function ReservationModal({ isOpen, onClose, phone }: ReservationModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:30");
  const [guests, setGuests] = useState("4");
  const [phoneInput, setPhoneInput] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const iso = today.toISOString().split("T")[0];
      setDate(iso);

      // Focus on first input
      setTimeout(() => {
        const firstInput = document.getElementById("r-name");
        if (firstInput) firstInput.focus();
      }, 350);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Save to Supabase reservations table using server action
      await createReservation({
        name,
        phone: phoneInput,
        reservation_date: date,
        reservation_time: time,
        guest_count: parseInt(guests, 10) || 4,
        note: note.trim() || null,
      });

      const formattedPhone = phone.replace(/\s+/g, "").replace("+", "");

      // Open Phone Dial instead of WhatsApp
      window.location.href = `tel:${formattedPhone}`;

      // Reset form and close
      setName("");
      setPhoneInput("");
      setNote("");
      setGuests("4");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formattedPhone = phone.replace(/\s+/g, "").replace("+", "");

  return (
    <div className="modal open" id="reserveModal" aria-hidden="false" role="dialog" aria-labelledby="resTitle">
      <div className="modal-back js-close-reserve" onClick={onClose}></div>
      <div className="modal-card">
        <button className="modal-close js-close-reserve" onClick={onClose} aria-label="Kapat">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M6 6l12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="modal-grid">
          <aside className="modal-aside">
            <div className="modal-aside-bg"></div>
            <div className="modal-aside-content">
              <p className="section-num section-num-light">№ rezervasyon</p>
              <h2 className="display">
                Sofranızı<br />
                <em>ayıralım</em>.
              </h2>
              <p className="modal-side-lede">
                Bilgilerinizi bırakın, onay için arama ekranına yönlendirileceksiniz.
              </p>
              <ul className="modal-side-list">
                <li>
                  <span>Telefon</span>
                  <b>{phone}</b>
                </li>
                <li>
                  <span>Saatler</span>
                  <b>08:00 — 21:00</b>
                </li>
                <li>
                  <span>Konum</span>
                  <b>Artur Gömeç, Balıkesir</b>
                </li>
              </ul>
            </div>
          </aside>

          <form className="modal-form" id="reserveForm" onSubmit={handleSubmit} noValidate>
            <h2 id="resTitle" className="modal-form-title">
              Sofra ayır
            </h2>
            <p className="modal-form-sub">Formu doldurun, onay için doğrudan arama ekranına yönlendirileceksiniz.</p>

            <div className="field">
              <label htmlFor="r-name">Ad Soyad</label>
              <input
                id="r-name"
                name="name"
                type="text"
                required
                placeholder="Adınız Soyadınız"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="r-date">Tarih</label>
                <input
                  id="r-date"
                  name="date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="r-time">Saat</label>
                <input
                  id="r-time"
                  name="time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="r-people">Kişi</label>
                <select
                  id="r-people"
                  name="people"
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10+">10+</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="r-phone">Telefon</label>
                <input
                  id="r-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="05xx xxx xx xx"
                  autoComplete="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="r-note">Not</label>
              <textarea
                id="r-note"
                name="note"
                rows={2}
                placeholder="Doğum günü, masa tercihi, alerji…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="field-actions">
              <button type="submit" className="btn btn-gold magnetic" disabled={submitting}>
                <span>{submitting ? "Gönderiliyor..." : "Rezervasyonu Ara ve Tamamla"}</span>
                <svg width="14" height="14">
                  <use href="#i-arrow" />
                </svg>
              </button>
              <a href={`tel:${formattedPhone}`} className="btn btn-line">
                Doğrudan Telefon Et
              </a>
            </div>
            <small className="field-note">
              Bilgileriniz veri tabanına kaydedilir ve onay için arama ekranına yönlendirilir.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}
