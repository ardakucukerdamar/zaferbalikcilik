"use client";

import React, { useState } from "react";
import Link from "next/link";

interface MenuClientProps {
  categories: any[];
  menuItems: any[];
  settings: Record<string, string>;
}

export default function MenuClient({ settings }: MenuClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Parse menu images from settings or use initial fallback
  const menuImages = settings.menu_images
    ? JSON.parse(settings.menu_images)
    : [
        { "title": "Balıklar", "image_url": "/menugorseller/baliklar.jpeg" },
        { "title": "Ara Sıcaklar", "image_url": "/menugorseller/arasicaklar.jpeg" },
        { "title": "İçecekler", "image_url": "/menugorseller/icecekler.jpeg" },
        { "title": "Tatlılar", "image_url": "/menugorseller/tatlilar.jpeg" }
      ];

  return (
    <div className="menu-page">
      {/* MENU HERO */}
      <header className="m-hero">
        <div className="m-hero-bg" aria-hidden="true"></div>
        <div className="m-hero-grad" aria-hidden="true"></div>

        <div className="container m-hero-inner">


          <div className="m-hero-brand">
            <span className="brand-logo-container" style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", display: "grid", placeItems: "center", background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpeg" alt="Zafer Balıkçılık Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <div>
              <strong>Zafer Balıkçılık</strong>
              <small>Artur Gömeç · Balıkesir</small>
            </div>
          </div>

          <p className="m-kicker">Menü</p>
          <h1 className="m-title">
            <span>Mevsim</span> <em>sofrası.</em>
          </h1>
          <p className="m-sub">
            Günlük balık tezgâhımız, usta eli ara sıcaklarımız ve içecek seçeneklerimizle lezzet kartımız. Fiyatlar tedarike göre güncellenebilir.
          </p>

          <div className="m-hero-actions">
            <a href={`tel:${settings.phone_intl || '+905443527371'}`} className="btn btn-gold">
              Ara: {settings.phone || "0544 352 73 71"}
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Zafer+Bal%C4%B1k%C3%A7%C4%B1l%C4%B1k+Artur+G%C3%B6me%C3%A7+Bal%C4%B1kesir"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-line"
            >
              Yol Tarifi
            </a>
          </div>
        </div>
      </header>

      {/* STICKY TOOLBAR */}
      <div className="m-toolbar stuck" id="mToolbar">
        <div className="container m-toolbar-inner" style={{ padding: "14px 0" }}>
          <nav className="m-cats" id="mCats" aria-label="Kategoriler" style={{ justifyContent: "center" }}>
            {menuImages.map((sheet: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`m-cat-btn ${activeTab === idx ? "active" : ""}`}
                style={{
                  background: activeTab === idx ? "var(--ink)" : "transparent",
                  color: activeTab === idx ? "var(--paper)" : "var(--ink-soft)",
                  border: "1px solid " + (activeTab === idx ? "var(--ink)" : "var(--line)"),
                  padding: "10px 24px",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  margin: "0 4px",
                  transition: "all 0.25s ease"
                }}
              >
                {sheet.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* MENU CONTENT */}
      <main className="m-main" style={{ padding: "40px 0" }}>
        <div className="container">
          {menuImages[activeTab] ? (
            <div className="m-sheet-container">
              <div 
                className="m-sheet-card"
                onClick={() => setLightboxOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={menuImages[activeTab].image_url} 
                  alt={menuImages[activeTab].title}
                  className="m-sheet-img"
                />
                <div className="m-sheet-zoom-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                  <span>Yakınlaştırmak için dokunun</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="gp-empty">Kategoriye ait menü görseli eklenmemiş.</p>
          )}

          {/* NOTES CARD */}
          <section className="m-notes" style={{ marginTop: "50px" }}>
            <div className="m-notes-card" style={{ padding: "36px" }}>
              <h3 style={{ fontSize: "1.15rem", marginBottom: "16px" }}>Bilgilendirme</h3>
              <ul>
                <li>
                  Fiyatlar ve menü içerikleri mevsimsel tedarike göre değişiklik gösterebilir.
                </li>
                <li>
                  Alerjen hassasiyetiniz varsa lütfen siparişten önce personelimize bilgi veriniz.
                </li>
                <li>
                  Restoranımız 10 masa kapasitelidir. Rezervasyon yapılması önerilir.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER MINI */}
      <footer className="m-foot">
        <div className="container m-foot-inner">
          <div>
            <strong>Zafer Balıkçılık Artur</strong>
            <p>{settings.address || "Şok yanı, Artur Gömeç girişi · Balıkesir"}</p>
          </div>
          <div className="m-foot-links">
            <Link href="/">Ana sayfa</Link>
            <a href={`tel:${settings.phone_intl || '+905443527371'}`}>
              {settings.phone || "0544 352 73 71"}
            </a>
          </div>
        </div>
      </footer>

      {/* STICKY ACTION BAR */}
      <div className="m-sticky">
        <a href={`tel:${settings.phone_intl || '+905443527371'}`} className="m-sticky-btn m-sticky-call">
          Ara
        </a>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Zafer+Bal%C4%B1k%C3%A7%C4%B1l%C4%B1k+Artur+G%C3%B6me%C3%A7+Bal%C4%B1kesir"
          target="_blank"
          rel="noopener noreferrer"
          className="m-sticky-btn m-sticky-wa"
          style={{ background: "#2c4a3a", color: "#faf5ea" }}
        >
          Yol Tarifi
        </a>
        <button
          className="m-sticky-btn m-sticky-top"
          id="mTopBtn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Üste Git
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && menuImages[activeTab] && (
        <div 
          className="lightbox open" 
          id="lightbox" 
          aria-hidden="false" 
          onClick={() => setLightboxOpen(false)}
          style={{ cursor: "zoom-out" }}
        >
          <button className="lb-close" aria-label="Kapat" onClick={() => setLightboxOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M6 6l12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          
          <div className="lb-figure" onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={menuImages[activeTab].image_url} 
              alt={menuImages[activeTab].title} 
              style={{
                maxWidth: "96vw",
                maxHeight: "86vh",
                objectFit: "contain",
                borderRadius: "4px",
                boxShadow: "0 30px 80px rgba(0,0,0,0.8)"
              }}
            />
            <figcaption style={{ color: "var(--paper)", marginTop: "12px", textAlign: "center", fontStyle: "italic", fontSize: "1.1rem" }}>
              {menuImages[activeTab].title}
            </figcaption>
          </div>
        </div>
      )}
    </div>
  );
}
