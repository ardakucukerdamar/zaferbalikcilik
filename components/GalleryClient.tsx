"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GalleryItem } from "@/lib/data";

interface GalleryClientProps {
  gallery: GalleryItem[];
}

export default function GalleryClient({ gallery }: GalleryClientProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Normalize categories from DB to match page tabs
  const mapCategory = (dbCat: string) => {
    const c = dbCat.toLowerCase();
    if (c.includes("sofra")) return "sofra";
    if (
      c.includes("balık") ||
      c.includes("balik") ||
      c.includes("ızgara") ||
      c.includes("izgara") ||
      c.includes("tezgâh") ||
      c.includes("tezgah")
    )
      return "sofra"; // map balık to sofra/balik categories appropriately
    if (c.includes("meze")) return "meze";
    if (
      c.includes("mekan") ||
      c.includes("mekân") ||
      c.includes("hazırlık") ||
      c.includes("hazirlik") ||
      c.includes("detay")
    )
      return "mekan";
    if (c.includes("sahil") || c.includes("deniz")) return "sahil";
    return "mekan";
  };

  // We can also categorize them as: Sofra, Balık (Izgara/Tezgâh), Mezeler, Mekân, Sahil
  const tabs = [
    { label: "Hepsi", value: "all", count: gallery.length },
    { label: "Sofra", value: "sofra", count: gallery.filter((item) => mapCategory(item.category) === "sofra").length },
    { label: "Balık", value: "balik", count: gallery.filter((item) => ["izgara", "tezgâh", "tezgah", "balik", "balık"].includes(item.category.toLowerCase())).length },
    { label: "Mezeler", value: "meze", count: gallery.filter((item) => mapCategory(item.category) === "meze").length },
    { label: "Mekân", value: "mekan", count: gallery.filter((item) => mapCategory(item.category) === "mekan").length },
    { label: "Sahil", value: "sahil", count: gallery.filter((item) => mapCategory(item.category) === "sahil").length },
  ];

  const getFilteredItems = () => {
    if (activeTab === "all") return gallery;
    return gallery.filter((item) => {
      if (activeTab === "balik") {
        return ["izgara", "tezgâh", "tezgah", "balik", "balık"].includes(item.category.toLowerCase());
      }
      return mapCategory(item.category) === activeTab;
    });
  };

  const filteredItems = getFilteredItems();

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
    document.body.classList.add("no-scroll");
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.classList.remove("no-scroll");
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (filteredItems.length === 0) return;
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else {
      setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, filteredItems]);

  return (
    <div className="galeri-page">
      <div className="grain" aria-hidden="true"></div>

      <header className="gp-hero">
        <div className="container">
          <Link href="/" className="gp-back">
            ← Ana sayfa
          </Link>
          <p className="section-num">№ 07 · Galeri</p>
          <h1>
            Mekândan, <em>sofradan,</em>
            <br />
            denizden kareler.
          </h1>
          <p>
            Karaağaç sahilinden, ustanın elinden, sofranın ortasından; Zafer Balıkçılık Artur&apos;un kayıt altına
            alınmış halleri.
          </p>

          <div className="gp-tabs" role="tablist">
            {tabs.map((tab, idx) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`gp-tab ${activeTab === tab.value ? "active" : ""}`}
              >
                <i>{String(idx).padStart(2, "0")}</i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container gp-board">
        {filteredItems.length === 0 ? (
          <p className="gp-empty show" id="gpEmpty">
            bu kategoride henüz kare yok.
          </p>
        ) : (
          <div className="gp-grid" id="gpGrid">
            {filteredItems.map((item, idx) => (
              <figure key={item.id} onClick={() => openLightbox(idx)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.caption || "Galeri Görseli"} />
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        <div className="gp-foot">
          <span>
            kayıt: <strong>{gallery.length} kare</strong> · güncellenir
          </span>
          <Link href="/menu">menü sayfasına git →</Link>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && filteredItems[lightboxIndex] && (
        <div className="lightbox open" id="lightbox" aria-hidden="false">
          <button className="lb-close" aria-label="Kapat" onClick={closeLightbox}>
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
          <button className="lb-prev" aria-label="Önceki" onClick={() => navigateLightbox("prev")}>
            ‹
          </button>
          <figure className="lb-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={filteredItems[lightboxIndex].image_url} alt={filteredItems[lightboxIndex].caption || ""} />
            <figcaption>
              <span>{filteredItems[lightboxIndex].caption}</span>
              <span className="lb-counter">
                <i>{lightboxIndex + 1}</i> / <i>{filteredItems.length}</i>
              </span>
            </figcaption>
          </figure>
          <button className="lb-next" aria-label="Sonraki" onClick={() => navigateLightbox("next")}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
