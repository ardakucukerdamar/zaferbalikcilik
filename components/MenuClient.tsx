"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Category, MenuItem } from "@/lib/data";

interface MenuClientProps {
  categories: Category[];
  menuItems: MenuItem[];
  settings: Record<string, string>;
}

export default function MenuClient({ categories, menuItems, settings }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("");
  const [isStuck, setIsStuck] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const toolbarRef = useRef<HTMLDivElement>(null);
  const catsNavRef = useRef<HTMLDivElement>(null);

  // 1. Sticky Toolbar Stuck State
  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Scroll Spy: Track active category
  useEffect(() => {
    const handleScrollSpy = () => {
      const probe = window.scrollY + 220; // threshold
      let active = "";

      // Find which section is currently active
      for (const cat of categories) {
        const el = categoryRefs.current[cat.slug];
        if (el && el.offsetTop <= probe) {
          active = cat.slug;
        }
      }

      if (active) {
        setActiveCategory(active);
        // Scroll active category nav item into view
        const activeLink = document.getElementById(`nav-link-${active}`);
        const wrap = catsNavRef.current;
        if (wrap && activeLink) {
          const r = activeLink.getBoundingClientRect();
          const wr = wrap.getBoundingClientRect();
          if (r.left < wr.left + 12 || r.right > wr.right - 12) {
            wrap.scrollTo({
              left: activeLink.offsetLeft - wrap.clientWidth / 2 + activeLink.offsetWidth / 2,
              behavior: "smooth",
            });
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [categories]);

  // 3. Smooth scroll to category
  const scrollToCategory = (slug: string) => {
    const target = categoryRefs.current[slug];
    if (!target) return;
    const toolbarH = toolbarRef.current?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - toolbarH - 16;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // 4. Filtering Logic
  const getFilteredItems = (catId: string) => {
    const q = searchQuery.toLowerCase().trim();
    return menuItems.filter((item) => {
      if (item.category_id !== catId) return false;

      // Filter chip match
      const tagsStr = (item.tags || []).join(" ").toLowerCase();
      const tagMatch = activeFilter === "all" || tagsStr.includes(activeFilter);

      // Search query match
      const textMatch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q);

      return tagMatch && textMatch;
    });
  };

  // Group beverage items for columns
  const getBeverageGroup = (item: MenuItem) => {
    const t = (item.tags?.[0] || "").toLowerCase();
    if (t.includes("şarap") || t.includes("sarap") || t.includes("sek")) return "sek";
    if (t.includes("bira")) return "bira";
    if (t.includes("alkols")) return "alkolsüz";
    if (t.includes("sıcak") || t.includes("sicak")) return "sıcak";
    return "alkolsüz"; // default fallback
  };

  const hasVisibleItems = (catId: string) => {
    return getFilteredItems(catId).length > 0;
  };

  const formattedPhone = (settings.phone || "0544 352 73 71").replace(/\s+/g, "").replace("+", "");

  return (
    <div className="menu-page">
      {/* MENU HERO */}
      <header className="m-hero">
        <div className="m-hero-bg" aria-hidden="true"></div>
        <div className="m-hero-grad" aria-hidden="true"></div>

        <div className="container m-hero-inner">
          <Link href="/" className="m-back">
            <svg width="16" height="16">
              <use href="#i-arrow-left" />
            </svg>
            <span>Ana sayfa</span>
          </Link>

          <div className="m-hero-brand">
            <span className="brand-mark">
              <svg width="22" height="22">
                <use href="#i-anchor" />
              </svg>
            </span>
            <div>
              <strong>Zafer Balıkçılık</strong>
              <small>Artur Gömeç · Balıkesir</small>
            </div>
          </div>

          <p className="m-kicker">№ 04 · Menü</p>
          <h1 className="m-title">
            <span>Mevsim</span> <em>sofrası.</em>
          </h1>
          <p className="m-sub">
            Mevsim balığı, taze salata ve pleyt ızgara. Fiyatlar bilgi amaçlıdır; günlük tedarike göre değişebilir.
            Güncel için telefonla doğrulayın.
          </p>

          <div className="m-hero-actions">
            <a href={`tel:${settings.phone_intl || '+905443527371'}`} className="btn btn-gold">
              Ara · {settings.phone || "0544 352 73 71"}
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
      <div ref={toolbarRef} className={`m-toolbar ${isStuck ? "stuck" : ""}`} id="mToolbar">
        <div className="container m-toolbar-inner">
          <nav ref={catsNavRef} className="m-cats" id="mCats" aria-label="Kategoriler">
            {categories.map((cat) => {
              // Only show category in nav if it has visible items under current search/filters
              const visible = hasVisibleItems(cat.id);
              if (!visible && (searchQuery || activeFilter !== "all")) return null;

              return (
                <button
                  key={cat.id}
                  id={`nav-link-${cat.slug}`}
                  onClick={() => scrollToCategory(cat.slug)}
                  className={activeCategory === cat.slug ? "active" : ""}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>

          <div className="m-tool-actions">
            <div className="m-search">
              <svg width="15" height="15">
                <use href="#i-search" />
              </svg>
              <input
                id="mSearch"
                type="search"
                placeholder="Ara: çupra, haydari, rakı…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  id="mSearchClear"
                  aria-label="Temizle"
                  onClick={() => setSearchQuery("")}
                >
                  <svg width="14" height="14">
                    <use href="#i-close" />
                  </svg>
                </button>
              )}
            </div>
            <div className="m-filters">
              {[
                { label: "Tümü", value: "all" },
                { label: "Şef", value: "sef" },
                { label: "Mevsim", value: "mevsim" },
                { label: "Vegan", value: "vegan" },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setActiveFilter(chip.value)}
                  className={`m-chip ${activeFilter === chip.value ? "active" : ""}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MENU CONTENT */}
      <main className="m-main">
        <div className="container">
          {categories.map((cat, index) => {
            const filteredItems = getFilteredItems(cat.id);

            // Skip rendering if no items match
            if (filteredItems.length === 0) return null;

            return (
              <section
                key={cat.id}
                ref={(el) => {
                  categoryRefs.current[cat.slug] = el;
                }}
                className="m-cat"
                id={cat.slug}
              >
                <header className="m-cat-head">
                  <span className="m-cat-num">№ {String(index + 1).padStart(2, "0")}</span>
                  <h2 className="display">
                    {cat.name.split(" ").map((w, idx, arr) => {
                      if (idx === arr.length - 1) return <em key={idx}>{w}</em>;
                      return <span key={idx}>{w} </span>;
                    })}
                  </h2>
                  <p>
                    {cat.slug === "bugun" && "Sabah tezgâhına gelen, ustanın seçtiği üç imza tabak."}
                    {cat.slug === "mezeler" && "Sabah hazırlanır, akşam sofraya iner. Ev yapımı, ustanın eli."}
                    {cat.slug === "sicak" && "Tencere ve tavadan; ortadan paylaşılmaya uygun."}
                    {cat.slug === "izgara" && "Mevsime göre değişir, ustanın elinde közlenir."}
                    {cat.slug === "tava" && "Mısır unu kabuk, sıcak yağ; klasik."}
                    {cat.slug === "salata" && "Balığın hafif yoldaşları."}
                    {cat.slug === "icecek" && "Balığın yanına yakışanlar — alkollü ve alkolsüz."}
                    {cat.slug === "tatli" && "Akşamı tatlıya bağlamak için."}
                  </p>
                </header>

                {/* Render style depending on category slug */}
                {cat.slug === "bugun" ? (
                  <div className="m-feature">
                    {filteredItems.map((item, itemIdx) => {
                      const isLarge = itemIdx === 0;
                      return (
                        <div
                          key={item.id}
                          className={`mf-card ${isLarge ? "mf-card-lg" : ""}`}
                          data-tags={(item.tags || []).join(" ")}
                        >
                          {item.image_url && (
                            <div
                              className={`mf-img ${!isLarge ? "mf-img-sm" : ""}`}
                              style={{ backgroundImage: `url('${item.image_url}')` }}
                            >
                              {isLarge && <span className="mf-stamp">şefin imzası</span>}
                            </div>
                          )}
                          <div className="mf-body">
                            <div className="mf-head">
                              <span className="mf-num">{String(itemIdx + 1).padStart(2, "0")}</span>
                              <h3>{item.name}</h3>
                              <span className="mf-price">
                                <i>₺</i>
                                {item.price}
                              </span>
                            </div>
                            {item.description && <p>{item.description}</p>}
                            {item.tags && item.tags.length > 0 && (
                              <ul className="mf-tags">
                                {item.tags.map((t, tIdx) => (
                                  <li key={tIdx}>{t}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : cat.slug === "icecek" ? (
                  <div className="m-cols">
                    {[
                      { key: "sek", title: "Sek & Şarap" },
                      { key: "bira", title: "Bira" },
                      { key: "alkolsüz", title: "Alkolsüz" },
                      { key: "sıcak", title: "Sıcak" },
                    ].map((group) => {
                      const groupItems = filteredItems.filter(
                        (item) => getBeverageGroup(item) === group.key
                      );
                      if (groupItems.length === 0) return null;

                      return (
                        <div key={group.key} className="m-col">
                          <h3 className="m-col-title">{group.title}</h3>
                          <ul className="m-mini">
                            {groupItems.map((item) => (
                              <li key={item.id}>
                                <span>{item.name}</span>
                                <i>{item.price}</i>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="m-list">
                    {filteredItems.map((item, itemIdx) => (
                      <article
                        key={item.id}
                        className="m-item"
                        data-tags={(item.tags || []).join(" ")}
                      >
                        <div className="mi-head">
                          <span className="mi-num">{String(itemIdx + 1).padStart(2, "0")}</span>
                          <h4>{item.name}</h4>
                          <span className="mi-dots"></span>
                          <span className="mi-price">{item.price}</span>
                        </div>
                        {item.description && <p>{item.description}</p>}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* NOTES CARD */}
          <section className="m-notes">
            <div className="m-notes-card">
              <h3>Notlar</h3>
              <ul>
                <li>
                  Fiyatlar <em>bilgi amaçlıdır</em>; günlük tedarike ve mevsime göre değişebilir. Güncel için telefonla
                  doğrulayın.
                </li>
                <li>
                  Mevsim balıkları her sabah tezgâhımıza taze ulaşır. Stokta olmayan balıklar için ustamızdan öneri
                  alabilirsiniz.
                </li>
                <li>Alerjeniz varsa lütfen siparişten önce bildirin; meze ve sosları size göre düzenleriz.</li>
                <li>Toplamda 10 masa kapasitemiz vardır. Rahatınız için rezervasyon önerilir.</li>
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
          ↑ Üste
        </button>
      </div>
    </div>
  );
}
