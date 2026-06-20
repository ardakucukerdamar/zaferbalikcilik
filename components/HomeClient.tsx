"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroCanvas from "./HeroCanvas";
import { GalleryItem, Review } from "@/lib/data";

interface HomeClientProps {
  settings: Record<string, string>;
  gallery: GalleryItem[];
  reviews: Review[];
}

export default function HomeClient({ settings, gallery, reviews }: HomeClientProps) {
  const wordsRef = useRef<HTMLHeadingElement>(null);
  const defterTrackRef = useRef<HTMLDivElement>(null);

  const boardItems = (() => {
    try {
      if (settings.board_items) {
        return JSON.parse(settings.board_items);
      }
    } catch (e) {
      console.error("Error parsing board_items:", e);
    }
    return [
      { tag: "öne çıkan", name: "Çipura", note: "pleyt ızgara · 12–14 dk" },
      { tag: "mevsim", name: "Karagöz", note: "pleyt ızgara · ½ kg" },
      { tag: "klasik", name: "Lakerda", note: "ince dilim · meze" },
      { tag: "sınırlı", name: "Kalamar", note: "sadece tava" },
    ];
  })();

  // Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(0);

  // Active Rhythm Time State
  const [activeRhythmIndex, setActiveRhythmIndex] = useState(-1);

  useEffect(() => {
    // Set current month
    const m = new Date().getMonth();
    setCurrentMonth(m);

    // Set current rhythm item index based on hours
    const hr = new Date().getHours();
    const targetHours = [6, 8, 11, 14, 17, 19, 21];
    let bestIdx = -1;
    for (let i = 0; i < targetHours.length; i++) {
      if (hr >= targetHours[i]) bestIdx = i;
    }
    setActiveRhythmIndex(bestIdx);
  }, []);

  // 1. Parallax Scroll Effect
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const onScrollPx = () => {
      const parallaxEls = document.querySelectorAll("[data-parallax]");
      parallaxEls.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.1");
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        (el as HTMLElement).style.transform = `translate3d(0, ${-center * speed}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScrollPx, { passive: true });
    onScrollPx();
    return () => window.removeEventListener("scroll", onScrollPx);
  }, []);

  // 2. Split-words Manifesto Reveal on Scroll
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wordsEl = wordsRef.current;
    if (!wordsEl || reduceMotion) return;

    const text = wordsEl.innerHTML;
    // Wrap words in span.mw
    const wrapped = text
      .replace(/<em>/g, " <em>")
      .replace(/<\/em>/g, "</em> ")
      .split(/(\s+)/)
      .map((chunk) => {
        if (!chunk.trim()) return chunk;
        return `<span className="mw">${chunk}</span>`;
      })
      .join("")
      .replace(/ /g, "");
    wordsEl.innerHTML = wrapped;

    const wordEls = wordsEl.querySelectorAll(".mw") as NodeListOf<HTMLElement>;
    wordEls.forEach((w) => {
      w.style.display = "inline-block";
      w.style.opacity = ".18";
      w.style.transition = "opacity .8s ease, color .8s ease";
    });

    const onWordsScroll = () => {
      const rect = wordsEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.15;
      const total = wordEls.length;
      const top = rect.top;
      const p = (start - top) / (start - end);
      const litCount = Math.max(0, Math.min(total, Math.floor(p * total)));
      wordEls.forEach((w, i) => {
        w.style.opacity = i < litCount ? "1" : ".18";
      });
    };

    window.addEventListener("scroll", onWordsScroll, { passive: true });
    onWordsScroll();
    return () => window.removeEventListener("scroll", onWordsScroll);
  }, []);

  // 3. Shimmer Effect on Hero Title Letters
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(hover:hover) and (pointer:fine) and (min-width: 1100px)").matches;
    const heroTitle = document.querySelector(".hero-title");
    if (!heroTitle || !isDesktop || reduceMotion) return;

    const words = heroTitle.querySelectorAll(".word");
    words.forEach((word) => {
      const original = word.textContent || "";
      const chars = [...original].map((ch) => {
        const span = document.createElement("span");
        span.className = "hch";
        span.textContent = ch === " " ? "\u00A0" : ch;
        return span;
      });
      word.textContent = "";
      chars.forEach((c) => word.appendChild(c));
    });

    const handleMouseEnter = () => {
      const chars = heroTitle.querySelectorAll(".hch") as NodeListOf<HTMLElement>;
      chars.forEach((c, i) => {
        c.style.transition = `transform .35s var(--ease) ${i * 22}ms, color .35s ease ${i * 22}ms, opacity .3s ease ${i * 22}ms`;
        c.style.transform = `translateY(-6px)`;
        c.style.color = "var(--gold)";
      });
    };

    const handleMouseLeave = () => {
      const chars = heroTitle.querySelectorAll(".hch") as NodeListOf<HTMLElement>;
      chars.forEach((c) => {
        c.style.transform = "";
        c.style.color = "";
      });
    };

    heroTitle.addEventListener("mouseenter", handleMouseEnter);
    heroTitle.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      heroTitle.removeEventListener("mouseenter", handleMouseEnter);
      heroTitle.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Testimonial Carousel Scrolling
  const handleCarouselScroll = (direction: "prev" | "next") => {
    const dt = defterTrackRef.current;
    if (!dt) return;
    const firstChild = dt.firstElementChild as HTMLElement;
    const step = firstChild ? firstChild.getBoundingClientRect().width + 22 : 360;
    dt.scrollBy({ left: direction === "prev" ? -step : step, behavior: "smooth" });
  };

  // Gallery grid layout mapping classes
  const gridClasses = ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ga-7", "ga-8"];

  // Gallery items for preview (homepage displays first 8)
  const homeGallery = gallery.slice(0, 8);

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
    if (homeGallery.length === 0) return;
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev - 1 + homeGallery.length) % homeGallery.length);
    } else {
      setLightboxIndex((prev) => (prev + 1) % homeGallery.length);
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
  }, [lightboxOpen]);

  // Seasonal Calendar Config
  const fishCalendar: { name: string; active: number[] }[] = (() => {
    try {
      if (settings.fish_calendar) {
        return JSON.parse(settings.fish_calendar);
      }
    } catch (e) {
      console.error("Error parsing fish_calendar:", e);
    }
    return [
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
    ];
  })();

  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  const formattedPhone = (settings.phone || "0544 352 73 71").replace(/\s+/g, "").replace("+", "");

  // Open reservation modal trigger helper
  const triggerOpenReserve = () => {
    window.dispatchEvent(new CustomEvent("open-reserve-modal"));
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero" id="top">
        <HeroCanvas />

        <div className="hero-bg" aria-hidden="true">
          <div className="hero-img" data-parallax="0.18"></div>
          <div className="hero-vignette"></div>
        </div>



        <div className="container hero-content">
          <p className="kicker"><i></i> Balıkesir · Artur Gömeç</p>

          <h1 className="hero-title">
            {(settings.hero_title || "Denizden sofranıza tazelik").split(" ").map((word, idx) => {
              let className = "word";
              if (idx === 1) className += " italic";
              if (idx === 2) className += " stroke";
              return (
                <span key={idx} className="line">
                  <span className={className}>{word}</span>
                </span>
              );
            })}
          </h1>

          <p
            className="hero-lede"
            data-fade
            dangerouslySetInnerHTML={{
              __html: settings.hero_desc || "Gömeç Artur&apos;un akşam esintisinde, günlük ağdan tezgâha, tezgâhtan sofraya. Zafer Balıkçılık Artur, üç kuşak balık ustalığını alçak sesle anlatan bir <em>deniz sofrası</em>."
            }}
          />

          <div className="hero-cta" data-fade>
            <button
              onClick={triggerOpenReserve}
              className="btn btn-gold magnetic js-open-reserve"
              data-cursor="rezerve"
            >
              <span>Sofra Ayır</span>
              <svg width="14" height="14"><use href="#i-arrow" /></svg>
            </button>
            <Link href="/menu" className="btn btn-line magnetic" data-cursor="menü">
              <span>Menüyü Aç</span>
              <svg width="14" height="14"><use href="#i-arrow-up-right" /></svg>
            </Link>
          </div>

          <div className="hero-foot" data-fade>
            <div className="hf-item">
              <span className="hf-num">4,6</span>
              <span className="hf-bar"><i style={{ width: "92%" }}></i></span>
              <small>Google · 20+ yorum</small>
            </div>
            <div className="hf-item">
              <span className="hf-num">
                {(settings.hours_open || "08:00").substring(0, 2)}—
                {(settings.hours_close || "21:00").substring(0, 2)}
              </span>
              <small>her gün açık</small>
            </div>
            <div className="hf-item">
              <span className="hf-num">↗</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Zafer+Balıkçılık+Artur+Balıkesir"
                target="_blank"
                rel="noopener noreferrer"
                className="hf-link"
              >
                Yol tarifi
              </a>
            </div>
          </div>
        </div>

        <div className="hero-bigtype" aria-hidden="true">
          <span>balık</span>
        </div>

        <a href="#manifesto" className="hero-scroll" aria-label="Aşağı kaydır">
          <span className="hs-line"></span>
          <span className="hs-text">kaydır</span>
        </a>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>günlük taze balık</span><i>✦</i>
          <span>açık hava sofrası</span><i>✦</i>
          <span>ev yapımı mezeler</span><i>✦</i>
          <span>pleyt ızgara</span><i>✦</i>
          <span>Artur Gömeç · balıkesir</span><i>✦</i>
          <span>{settings.phone || "0544 352 73 71"}</span><i>✦</i>
          <span>günlük taze balık</span><i>✦</i>
          <span>açık hava sofrası</span><i>✦</i>
          <span>ev yapımı mezeler</span><i>✦</i>
          <span>pleyt ızgara</span><i>✦</i>
          <span>Artur Gömeç · balıkesir</span><i>✦</i>
          <span>{settings.phone || "0544 352 73 71"}</span><i>✦</i>
        </div>
      </div>

      {/* TEZGÂHTA BU HAFTA */}
      <section className="board">
        <div className="container board-inner">
          <div className="board-head">
            <p className="section-num">tezgâhta · bu hafta</p>
            <h2 className="board-title"><em>Bu hafta</em> öne çıkanlar.</h2>
            <p className="board-sub">Mevsime ve günlük tedarike göre güncellenen küçük bir liste.</p>
          </div>
          <ul className="board-list">
            {boardItems.map((item: any, idx: number) => (
              <li key={idx}>
                <span className="bl-tag">{item.tag}</span>
                <strong>{item.name}</strong>
                <small>{item.note}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto" id="manifesto">
        <div className="container">
          <p className="section-num">№ 01 · Felsefe</p>
          <h2
            ref={wordsRef}
            className="manifesto-text"
            data-words
            dangerouslySetInnerHTML={{
              __html: settings.manifesto_text || "Balık günlük olur. <em>Sofra</em> sabırlı. Biz <em>aceleyi</em> tezgâhın değil, <em>tencerenin</em> hızına bırakırız. Artur&apos;un <em>tuzlu rüzgârı</em> mezeyi, pleyt ızgara balığı pişirir; biz yalnızca <em>doğru anı</em> beklemeyi öğretiriz."
            }}
          />
          <div className="manifesto-sign" data-fade>
            <div className="ms-line"></div>
            <p><strong>Artur Mutfağı</strong> · Artur Gömeç, Balıkesir</p>
          </div>
        </div>
      </section>

      {/* HIKAYE */}
      <section className="story" id="hakkimizda">
        <div className="container story-grid">
          <div className="story-media" data-fade>
            <div className="sm-frame">
              <div className="sm-img sm-1" data-parallax="0.08"></div>
            </div>
            <div className="sm-frame sm-frame-2">
              <div className="sm-img sm-2" data-parallax="0.12"></div>
            </div>
            <div className="sm-badge">
              <span className="sm-badge-num">01</span>
              <span className="sm-badge-text">üç kuşak<br />balık ustalığı</span>
            </div>
          </div>

          <div className="story-body">
            <p className="section-num">№ 02 · Hikâye</p>
            <h2 className="display"><span>Denizin</span> <em>dilini</em><br />bilenler.</h2>

            <p className="story-lead" data-fade>
              Artur Gömeç sahili, Balıkesir&apos;in kıyıya en alçak sesle bakan köşesi. Zafer Balıkçılık Artur, bu sahilin ritmiyle açar, ritmiyle kapanır. Sabah erkenden tezgâha gelen mevsim balığını ustamızın elinde dinlendirir; akşam, pleyt ızgaranın üzerinde sofranızla buluştururuz.
            </p>

            <p data-fade>
              Burada misafir, sadece yemek için değil; <em>oturup, susup, denizi dinlemek</em> için gelir. Sofra geniş, lokma yavaş, akşam uzundur.
            </p>

            <ul className="story-list" data-fade>
              <li><i>↳</i> günlük tedarik, mevsim balığı önceliği</li>
              <li><i>↳</i> ev yapımı meze, ustanın eli</li>
              <li><i>↳</i> pleyt ızgara, geleneksel tava</li>
              <li><i>↳</i> açık hava ve kapalı salon · 10 masalık</li>
            </ul>

            <div className="story-stats">
              <div className="stat">
                <strong data-count="4.6" data-decimals="1">4.6</strong>
                <span>Google puanı</span>
              </div>
              <div className="stat">
                <strong data-count="20" data-suffix="+">20+</strong>
                <span>memnun yorum</span>
              </div>
              <div className="stat">
                <strong data-count="3">3</strong>
                <span>kuşak ustalık</span>
              </div>
              <div className="stat">
                <strong data-count="10">10</strong>
                <span>masalık sofra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MUTFAK / NEDEN BIZ */}
      <section className="mutfak" id="mutfak">
        <div className="container">
          <header className="section-head">
            <p className="section-num">№ 03 · Mutfak</p>
            <h2 className="display"><span>Tabakta</span> <em>tazelik</em>,<br />tezgâhta <em>özen</em>.</h2>
          </header>

          <div className="bento">
            <article className="bento-card bento-img">
              <div className="bento-bg-img" style={{ backgroundImage: "url('/gorsel/bento_chef_hands.png')" }}></div>
              <div className="bc-overlay"></div>
              <div className="bc-body">
                <h3>Usta eli</h3>
                <p>Üç kuşak süzgecinden geçmiş, yavaş öğrenilmiş bir mutfak.</p>
              </div>
            </article>

            <article className="bento-card bento-img">
              <div className="bento-bg-img" style={{ backgroundImage: "url('/gorsel/bento_grilled_fish.png')" }}></div>
              <div className="bc-overlay"></div>
              <div className="bc-body">
                <h3>Pleyt ızgara</h3>
                <p>Izgara özeni, usta pişirimi.</p>
              </div>
            </article>

            <article className="bento-card bento-img">
              <div className="bento-bg-img" style={{ backgroundImage: "url('/gorsel/bento_seaside_table.png')" }}></div>
              <div className="bc-overlay"></div>
              <div className="bc-body">
                <h3>Açık hava sofrası</h3>
                <p>Esinti eşliğinde uzun akşamlar. Kapalı salonda 10 masalık kapasite.</p>
              </div>
            </article>
          </div>

          <div className="mutfak-cta" data-fade>
            <Link href="/menu" className="big-link magnetic" data-cursor="menü">
              <span className="bl-num">04</span>
              <span className="bl-text">tam menüyü <em>aç</em></span>
              <svg width="22" height="22"><use href="#i-arrow-up-right" /></svg>
            </Link>
            <p className="mutfak-note">menü <strong>karekod</strong> ile masadan açılır · veya <Link href="/menu">zaferbalikcilik.com.tr/menu</Link></p>
          </div>
        </div>
      </section>

      {/* TIMELINE RHYTHM */}
      <section className="rhythm" id="ritim">
        <div className="rhythm-bg" aria-hidden="true"></div>
        <div className="container">
          <header className="section-head section-head-row">
            <div>
              <p className="section-num">Ritim · ek bölüm</p>
              <h2 className="display"><em>Ustanın</em><br />bir günü.</h2>
            </div>
            <p className="rhythm-note">Saat saat, balıkçının ritmi.<br /><em>Sabahın ilk ışığından</em> son siparişe.</p>
          </header>

          <ol className="rhythm-line">
            {[
              { time: "06:00", title: "Tezgâh açılır", desc: "Sabahın ilk ışığında balık gelir, kontrolden geçer; günün listesi belirlenir." },
              { time: "08:00", title: "Kapı açık", desc: "Aile sahili dolaşır, kahveler taze; tezgâhta sergilenen mevsim balıkları görülebilir." },
              { time: "11:00", title: "Meze tezgâhı", desc: "Haydari karıştırılır, ezme dövülür, lakerda dilimlenir. Hepsi ev yapımı, hepsi günlük." },
              { time: "14:00", title: "Öğle sofrası", desc: "Hafif öğle, küçük gruplar. Tava ve sıcak başlangıçlar yoğunlaşır." },
              { time: "17:00", title: "Izgara ısınır", desc: "Akşam ızgaralarına hazırlık; pleyt ızgara ısıtılır, hazırlıklar tamamlanır." },
              { time: "19:30", title: "Akşam masaları", desc: "Sofranın asıl saati. Açık hava dolar, balık közde, sohbet uzun." },
              { time: "21:00", title: "Son servis", desc: "Son tabaklar çıkar, çay servis edilir. Akşam sona erene dek devam eder." },
            ].map((r, i) => (
              <li key={i}>
                <span className="rl-time">{r.time.split(":")[0]}<i>:{r.time.split(":")[1]}</i></span>
                <span className={`rl-dot ${i === activeRhythmIndex ? "rl-dot-active" : ""}`}></span>
                <div className="rl-body">
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                  {i === activeRhythmIndex && <span className="rl-now">şu an</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ŞEFİN İMZASI */}
      <section className="signature">
        <div className="signature-grid">
          <div className="sig-media">
            <div className="sig-img" data-parallax="0.06"></div>
            <span className="sig-tag">şefin imzası · bu hafta</span>
          </div>
          <div className="sig-body">
            <p className="section-num">№ 04 · İmza</p>
            <h2
              className="display"
              dangerouslySetInnerHTML={{
                __html: settings.signature_name || "Pleyt ızgarada<br /><em>çipura</em>."
              }}
            />
            <p className="sig-lede" data-fade>
              {settings.signature_desc || "Günün tezgâhından, ustanın seçtiği çipura; tuzlanır, dinlendirilir, pleyt ızgarada sabırla pişirilir. Yanında zeytinyağlı deniz börülcesi ve roka. Bir limon; gerisi denizin işi."}
            </p>

            <ul className="sig-pairs" data-fade>
              <li><i>yan</i> {settings.signature_side || "deniz börülcesi · roka"}</li>
              <li><i>içecek</i> {settings.signature_drink || "şalgam · soğuk çay · asitli içecekler"}</li>
              <li><i>pişirme</i> {settings.signature_cooking || "pleyt ızgara · 12—14 dk"}</li>
              <li><i>mevsim</i> {settings.signature_season || "kasım — şubat aralığı"}</li>
            </ul>

            <div className="sig-actions" data-fade>
              <button onClick={triggerOpenReserve} className="btn btn-gold magnetic js-open-reserve">
                <span>Bu akşam ayır</span>
                <svg width="14" height="14"><use href="#i-arrow" /></svg>
              </button>
              <Link href="/menu#izgara" className="btn btn-line">Tüm ızgaralar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEVSİM TAKVİMİ */}
      <section className="calendar" id="mevsim">
        <div className="container">
          <header className="section-head section-head-row">
            <div>
              <p className="section-num">Takvim · mevsime göre</p>
              <h2 className="display">Hangi <em>ay</em>,<br />hangi <em>balık?</em></h2>
            </div>
            <p className="cal-side">Denizin takvimine uyarız.<br /><em>Mevsim balığı</em>, mevsiminde sofradadır.</p>
          </header>

          <div className="cal-wrap">
            <div className="cal-grid" id="calGrid">
              <div className="cal-head">
                <span className="ch-label"></span>
                {months.map((mName, mIdx) => (
                  <span
                    key={mIdx}
                    data-m={mIdx}
                    className={mIdx === currentMonth ? "now-month" : ""}
                  >
                    {mName}
                  </span>
                ))}
              </div>

              {fishCalendar.map((f, fIdx) => (
                <div key={fIdx} className="cal-row" data-fish={f.name}>
                  <span className="cal-fish">{f.name}</span>
                  {f.active.map((activeVal, mIdx) => (
                    <i
                      key={mIdx}
                      data-on={activeVal}
                      className={mIdx === currentMonth ? "now" : ""}
                    ></i>
                  ))}
                </div>
              ))}
            </div>

            <p className="cal-foot">
              <span className="cal-legend"><i className="cal-leg cal-leg-on"></i> aktif mevsim</span>
              <span className="cal-legend"><i className="cal-leg cal-leg-now"></i> bu ay</span>
              <span className="cal-note">stoğa ve hava koşullarına göre günlük değişebilir</span>
            </p>
          </div>
        </div>
      </section>

      {/* DYNAMIC GALLERY */}
      <section className="gallery" id="galeri">
        <div className="container">
          <header className="section-head section-head-row">
            <div>
              <p className="section-num">№ 05 · Galeri</p>
              <h2 className="display">Mekândan <em>kareler</em>.</h2>
            </div>
            <p className="gallery-note">tıkla, <em>büyüt</em> · ok tuşlarıyla gezin</p>
          </header>

          <div className="gallery-grid">
            {homeGallery.map((item, idx) => {
              const gridClass = gridClasses[idx] || "ga";
              return (
                <button
                  key={item.id}
                  className={`ga ${gridClass}`}
                  style={{ backgroundImage: `url('${item.image_url}')` }}
                  onClick={() => openLightbox(idx)}
                  data-cursor="büyüt"
                >
                  <span className="ga-label">
                    № {String(idx + 1).padStart(2, "0")} · {item.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="gallery-cta">
            <Link href="/galeri" className="big-link big-link-dark magnetic" data-cursor="galeri">
              <span className="bl-num">↗</span>
              <span className="bl-text">tüm <em>galeri</em></span>
              <svg width="22" height="22"><use href="#i-arrow-up-right" /></svg>
            </Link>
            <p className="gallery-cta-note">kategori filtreli · masonry grid</p>
          </div>
        </div>
      </section>

      {/* DYNAMIC MISAFIR DEFTERI */}
      <section className="defter" id="defter">
        <div className="container">
          <header className="section-head section-head-row">
            <div>
              <p className="section-num">№ 06 · Misafir Defteri</p>
              <h2 className="display"><em>Sofranın</em> dilinden.</h2>
            </div>
            <div className="rating">
              <span className="rating-num">4,6</span>
              <div>
                <span className="rating-stars" aria-hidden="true">★★★★<i>★</i></span>
                <small>20+ google yorumu</small>
              </div>
            </div>
          </header>

          <div className="defter-track" id="defterTrack" ref={defterTrackRef}>
            {reviews.map((r) => (
              <article key={r.id} className="defter-card">
                <div className="dc-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p>&quot;{r.content}&quot;</p>
                <footer>
                  <span
                    className="avatar"
                    style={{ background: r.avatar_color || "#1e6091" }}
                  >
                    {(r.author_name || "M").substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <strong>{r.author_name}</strong>
                    <small>google · {new Date(r.created_at).getFullYear()}</small>
                  </div>
                </footer>
              </article>
            ))}
          </div>

          <div className="defter-controls">
            <button className="dc-prev" aria-label="Önceki" onClick={() => handleCarouselScroll("prev")}>
              ‹
            </button>
            <button className="dc-next" aria-label="Sonraki" onClick={() => handleCarouselScroll("next")}>
              ›
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="sorular">
        <div className="container faq-grid">
          <div className="faq-left">
            <p className="section-num">Sorular · sıkça sorulanlar</p>
            <h2 className="display"><em>Aklınızdaki</em><br />sorular.</h2>
            <p>Merak ettiklerinizin çoğu burada cevaplanır. Bulamadığınızı sorun, telefonla anında dönelim.</p>
            <div className="faq-cta">
              <a href={`tel:${formattedPhone}`} className="btn btn-gold magnetic">Telefonla Ara</a>
            </div>
          </div>

          <div className="faq-list">
            <details className="faq-item" open>
              <summary>
                <span className="fq-num">01</span>
                <span className="fq-q">Rezervasyon nasıl yapılır?</span>
                <span className="fq-icon" aria-hidden="true"></span>
              </summary>
              <div className="fq-a">
                <p>
                  Sitedeki <strong>Sofra Ayır</strong> formundan bilgilerinizi bırakarak ya da doğrudan{" "}
                  <strong>{settings.phone || "0544 352 73 71"}</strong> numaralı hattan arayarak.
                  Hafta sonu akşamları için 1–2 gün önceden yerinizi ayırtmanızı öneririz.
                </p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="fq-num">02</span>
                <span className="fq-q">Açık hava bölümünüz var mı?</span>
                <span className="fq-icon" aria-hidden="true"></span>
              </summary>
              <div className="fq-a">
                <p>
                  Evet. Hem açık hava bahçe soframız hem de kapalı salonumuz mevcuttur. Toplamda 70 misafire aynı anda hizmet verebiliyoruz.
                </p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="fq-num">03</span>
                <span className="fq-q">Çocuk menüsü ya da yüksek sandalye var mı?</span>
                <span className="fq-icon" aria-hidden="true"></span>
              </summary>
              <div className="fq-a">
                <p>
                  Çocuklara özel kılçıksız kızartma/tava balık, köfte ve patates kızartması hazırlayabiliyoruz. Bebek/yüksek sandalyelerimiz mevcuttur.
                </p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="fq-num">04</span>
                <span className="fq-q">Alerjenler ve özel diyet?</span>
                <span className="fq-icon" aria-hidden="true"></span>
              </summary>
              <div className="fq-a">
                <p>
                  Glüten, kabuklu deniz ürünleri, süt ürünleri alerjilerinizi sipariş öncesinde garsonumuza bildirdiğiniz takdirde mezeleri ve sosları size uygun şekilde servis ediyoruz.
                </p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="fq-num">05</span>
                <span className="fq-q">Otopark imkânı?</span>
                <span className="fq-icon" aria-hidden="true"></span>
              </summary>
              <div className="fq-a">
                <p>
                  Şok marketin yanındaki Artur giriş yolu üzerinde müşterilerimize özel geniş ve ücretsiz açık otopark alanı bulunmaktadır.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA BANT */}
      <section className="ctabar">
        <div className="ctabar-bg" aria-hidden="true"></div>
        <div className="ctabar-inner">
          <p className="section-num section-num-light">№ 07 · Davet</p>
          <h2 className="ctabar-title">Bu akşam <em>sofranız</em><br />bizde <span className="under">ayrılsın</span>.</h2>
          <div className="ctabar-actions">
            <button
              onClick={triggerOpenReserve}
              className="btn btn-gold magnetic js-open-reserve"
              data-cursor="rezerve"
            >
              <span>Sofra Ayır</span>
              <svg width="14" height="14"><use href="#i-arrow" /></svg>
            </button>
            <a href={`tel:${formattedPhone}`} className="btn btn-line magnetic">
              Ara · {settings.phone || "0544 352 73 71"}
            </a>
          </div>
        </div>
      </section>

      {/* İLETİŞİM */}
      <section className="contact" id="iletisim">
        <div className="container contact-grid">
          <div className="contact-body">
            <p className="section-num">№ 08 · İletişim</p>
            <h2 className="display">Artur&apos;da<br /><em>buluşalım</em>.</h2>

            <ul className="contact-list">
              <li>
                <span className="cl-key">Adres</span>
                <span className="cl-val">{settings.address || "Şok yanı, Artur Gömeç girişi, Artur Yolu Cad, Gömeç / Balıkesir"}</span>
              </li>
              <li>
                <span className="cl-key">Telefon</span>
                <span className="cl-val"><a href={`tel:${formattedPhone}`}>{settings.phone || "0544 352 73 71"}</a></span>
              </li>
              <li>
                <span className="cl-key">Saatler</span>
                <span className="cl-val">
                  Pazartesi — Pazar · {settings.hours_open || "08:00"} — {settings.hours_close || "21:00"}
                </span>
              </li>
              <li>
                <span className="cl-key">Sosyal</span>
                <span className="cl-val">
                  <a href={`https://wa.me/${formattedPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> ·{" "}
                  <a href="https://www.google.com/maps/search/?api=1&query=Zafer+Balıkçılık+Artur+Balıkesir" target="_blank" rel="noopener noreferrer">Google Maps</a>
                </span>
              </li>
            </ul>

            <div className="contact-cta">
              <a href={`tel:${formattedPhone}`} className="btn btn-gold magnetic">Telefonla Ara</a>
            </div>
          </div>

          <div className="contact-map">
            <div className="cm-frame">
              <iframe
                title="Zafer Balıkçılık Artur konumu"
                src="https://www.google.com/maps?q=Zafer+Balıkçılık+Artur+Gömeç+Balıkesir&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
            <div className="cm-caption">
              <span>39° 39&apos; N · 27° 53&apos; E</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Zafer+Balıkçılık+Artur+Balıkesir"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yol tarifi <svg width="11" height="11"><use href="#i-arrow-up-right" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <span className="brand-mark" style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", display: "grid", placeItems: "center", background: "#fff", marginBottom: "16px" }}>
              <img src="/logo.jpeg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </span>
            <strong>Zafer Balıkçılık <em>Artur</em></strong>
            <p>Artur&apos;un denize bakan deniz sofrası. Günlük taze, üç kuşak ustalık.</p>
          </div>
          <div>
            <h5>İletişim</h5>
            <p>{settings.address || "Artur Gömeç, Balıkesir"}</p>
            <p><a href={`tel:${formattedPhone}`}>{settings.phone || "0544 352 73 71"}</a></p>
            <p><a href={`tel:${formattedPhone}`}>Hemen Arayın</a></p>
          </div>
          <div>
            <h5>Saatler</h5>
            <p>Pazartesi — Pazar<br />{settings.hours_open || "08:00"} — {settings.hours_close || "21:00"}</p>
          </div>
          <div>
            <h5>Bağlantılar</h5>
            <p><Link href="/menu">Tam menü</Link></p>
            <p><Link href="/galeri">Galeri</Link></p>
            <p><a href="#sorular">Sıkça sorulanlar</a></p>
            <p><a href="#iletisim">İletişim</a></p>
          </div>
        </div>
        <div className="container footer-bottom">
          <small>© {new Date().getFullYear()} Zafer Balıkçılık Artur · tüm hakları saklıdır</small>
          <small className="credit">tasarım <em>deniz esintisinde</em> hazırlandı</small>
        </div>
      </footer>

      {/* FLOATING ACTIONS */}
      <div className="fab-stack">
        <a href={`tel:${formattedPhone}`} className="fab fab-call" style={{ bottom: "24px" }} aria-label="Telefon Et">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.44.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z" />
          </svg>
        </a>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className="m-bar">
        <a href={`tel:${formattedPhone}`} className="m-bar-btn m-bar-call">Ara</a>
        <Link href="/menu" className="m-bar-btn m-bar-menu">Menü</Link>
        <button onClick={triggerOpenReserve} className="m-bar-btn m-bar-res js-open-reserve">Rezerve</button>
      </div>

      {/* LIGHTBOX FOR PREVIEW */}
      {lightboxOpen && homeGallery[lightboxIndex] && (
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
            <img id="lbImg" src={homeGallery[lightboxIndex].image_url} alt={homeGallery[lightboxIndex].caption || ""} />
            <figcaption>
              <span id="lbCap">{homeGallery[lightboxIndex].caption}</span>
              <span className="lb-counter">
                <i id="lbIdx">{lightboxIndex + 1}</i> / <i id="lbTotal">{homeGallery.length}</i>
              </span>
            </figcaption>
          </figure>
          <button className="lb-next" aria-label="Sonraki" onClick={() => navigateLightbox("next")}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
