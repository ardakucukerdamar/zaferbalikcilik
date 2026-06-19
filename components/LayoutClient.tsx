"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReservationModal from "./ReservationModal";

export default function LayoutClient({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Record<string, string>;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loaderTick, setLoaderTick] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [scrollWidth, setScrollWidth] = useState("0%");
  
  // Custom cursor states disabled

  // Reservation Modal & Live Status States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveText, setLiveText] = useState("Açık · 21:00'a kadar");
  const [closed, setClosed] = useState(false);
  
  // refs for cursor removed

  const isAdmin = pathname.startsWith("/admin");

  // Cinematic preloader ticks
  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      setLoaded(true);
      return;
    }

    document.body.classList.add("loading");
    let tick = 0;
    const interval = setInterval(() => {
      tick = Math.min(99, tick + Math.ceil(Math.random() * 9));
      setLoaderTick(tick);
      if (tick >= 99) {
        clearInterval(interval);
        setLoaderTick(100);
        setTimeout(() => {
          setLoading(false);
          setLoaded(true);
          document.body.classList.remove("loading");
          document.body.classList.add("loaded");
        }, 400);
      }
    }, 90);

    return () => {
      clearInterval(interval);
      document.body.classList.remove("loading");
    };
  }, [isAdmin]);

  // Handle scroll state (header background toggle, progress bar)
  useEffect(() => {
    const onScroll = () => {
      const header = document.getElementById("header");
      const y = window.scrollY;
      if (header) {
        if (y > 40) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollWidth(max > 0 ? `${(y / max) * 100}%` : "0%");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live Hours status checker
  useEffect(() => {
    if (isAdmin) return;
    
    const refreshLive = () => {
      const now = new Date();
      const min = now.getHours() * 60 + now.getMinutes();
      
      const openTime = settings.hours_open || "08:00";
      const closeTime = settings.hours_close || "21:00";
      
      const [oH, oM] = openTime.split(":").map(Number);
      const [cH, cM] = closeTime.split(":").map(Number);
      
      const open = oH * 60 + oM;
      const close = cH * 60 + cM;
      
      if (min >= open && min < close) {
        setClosed(false);
        setLiveText(`Açık · ${closeTime}'a kadar`);
      } else {
        setClosed(true);
        setLiveText(min < open ? `Kapalı · ${openTime}'da açılır` : `Kapalı · Yarın ${openTime}'da`);
      }
    };
    
    refreshLive();
    const interval = setInterval(refreshLive, 60_000);
    return () => clearInterval(interval);
  }, [settings, isAdmin]);

  // Global click and custom event listeners for opening the reservation modal
  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener("open-reserve-modal", handleOpen);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.classList.contains("js-open-reserve") || target.closest(".js-open-reserve"))) {
        setIsModalOpen(true);
      }
    };
    document.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("open-reserve-modal", handleOpen);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  // Magnetic items, tilt items, reveal on scroll, and counters
  useEffect(() => {
    // Check if desktop for mouse interactions
    const checkDesktop = () =>
      window.matchMedia("(hover:hover) and (pointer:fine) and (min-width: 1100px)").matches;
    
    let isDesktop = checkDesktop();

    const onResize = () => {
      isDesktop = checkDesktop();
    };
    window.addEventListener("resize", onResize);

    // 1. Magnetic & tilt setups
    const setupInteractions = () => {
      if (!isDesktop || isAdmin) return;

      const items = document.querySelectorAll("a, button, .ga, [data-cursor], [data-tilt]");
      items.forEach((el) => {
        // Magnetic effect if class contains .magnetic
        if (el.classList.contains("magnetic")) {
          const onMagneticMove = (e: Event) => {
            const me = e as MouseEvent;
            const r = el.getBoundingClientRect();
            const dx = me.clientX - r.left - r.width / 2;
            const dy = me.clientY - r.top - r.height / 2;
            (el as HTMLElement).style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
          };
          const onMagneticLeave = () => {
            (el as HTMLElement).style.transform = "";
          };
          el.addEventListener("mousemove", onMagneticMove);
          el.addEventListener("mouseleave", onMagneticLeave);
        }

        // 3D tilt effect if attribute data-tilt is present
        if (el.hasAttribute("data-tilt")) {
          const onTiltMove = (e: Event) => {
            const me = e as MouseEvent;
            const r = el.getBoundingClientRect();
            const x = (me.clientX - r.left) / r.width - 0.5;
            const y = (me.clientY - r.top) / r.height - 0.5;
            (el as HTMLElement).style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
          };
          const onTiltLeave = () => {
            (el as HTMLElement).style.transform = "";
          };
          el.addEventListener("mousemove", onTiltMove);
          el.addEventListener("mouseleave", onTiltLeave);
        }
      });
    };

    // Delay a bit to ensure DOM is fully ready
    const timerId = setTimeout(setupInteractions, 600);

    // 2. Reveal on scroll (IntersectionObserver)
    let observer: IntersectionObserver;
    const revealItems = document.querySelectorAll("[data-fade], .reveal");
    if ("IntersectionObserver" in window && revealItems.length > 0) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              const el = en.target as HTMLElement;
              el.style.opacity = "";
              el.style.transform = "";
              el.classList.add("in");
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealItems.forEach((el) => observer.observe(el));
    }

    // 3. Stats Counter Animation
    let counterObserver: IntersectionObserver;
    const counters = document.querySelectorAll("[data-count]");
    const animateCount = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count || "0");
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1500;
      let start: number | null = null;
      
      const tick = (now: number) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (decimals > 0 ? val.toFixed(decimals) : Math.round(val)) + suffix;
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
        }
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window && counters.length > 0) {
      counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              animateCount(en.target as HTMLElement);
              counterObserver.unobserve(en.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => counterObserver.observe(c));
    } else {
      counters.forEach((c) => animateCount(c as HTMLElement));
    }

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timerId);
      if (observer) observer.disconnect();
      if (counterObserver) counterObserver.disconnect();
    };
  }, [pathname, isAdmin]);

  // Escape key close mobile panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanelOpen(false);
        document.body.classList.remove("no-scroll");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePanel = () => {
    setPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
      return next;
    });
  };

  const closePanel = () => {
    setPanelOpen(false);
    document.body.classList.remove("no-scroll");
  };

  // If we are in the admin dashboard, render simple container without restaurant shell
  if (isAdmin) {
    return <div className="admin-wrapper">{children}</div>;
  }

  return (
    <>
      {/* CINEMATIC PRELOADER */}
      {!loaded && (
        <div className={`loader ${loaded ? "loaded" : ""}`} id="loader" aria-hidden="true">
          <div className="loader-inner">
            <div className="loader-mark">
              <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
                <path
                  d="M32 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10v32m-12-20h24M12 38c2 9 9 14 20 14s18-5 20-14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="loader-name">
              <span>Z</span><span>A</span><span>F</span><span>E</span><span>R</span>
              <i>·</i>
              <span>B</span><span>A</span><span>L</span><span>I</span><span>K</span><span>Ç</span><span>I</span><span>L</span><span>I</span><span>K</span>
            </div>
            <div className="loader-meta">
              <span>Artur Gömeç · Balıkesir</span>
              <span className="loader-count" id="loaderCount">
                {String(loaderTick).padStart(2, "0")}
              </span>
            </div>
            <div className="loader-bar">
              <i style={{ width: `${loaderTick}%` }}></i>
            </div>
          </div>
        </div>
      )}

      {/* GRAIN OVERLAY */}
      <div className="grain" aria-hidden="true"></div>

      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" id="scrollProgress" aria-hidden="true">
        <i style={{ width: scrollWidth }}></i>
      </div>

      {/* CUSTOM CURSOR REMOVED */}

      {/* MOBILE PANEL */}
      <aside className={`panel ${panelOpen ? "open" : ""}`} id="panel" aria-hidden={!panelOpen}>
        <div className="panel-inner">
          <ul className="panel-nav">
            <li>
              <a href="/#manifesto" onClick={closePanel}>
                <i>01</i> Felsefe
              </a>
            </li>
            <li>
              <a href="/#hakkimizda" onClick={closePanel}>
                <i>02</i> Hikâye
              </a>
            </li>
            <li>
              <a href="/#mutfak" onClick={closePanel}>
                <i>03</i> Mutfak
              </a>
            </li>
            <li>
              <Link href="/menu" onClick={closePanel}>
                <i>04</i> Menü
              </Link>
            </li>
            <li>
              <a href="/#mevsim" onClick={closePanel}>
                <i>05</i> Mevsim
              </a>
            </li>
            <li>
              <a href="/#galeri" onClick={closePanel}>
                <i>06</i> Galeri
              </a>
            </li>
            <li>
              <a href="/#defter" onClick={closePanel}>
                <i>07</i> Misafir Defteri
              </a>
            </li>
            <li>
              <a href="/#iletisim" onClick={closePanel}>
                <i>08</i> İletişim
              </a>
            </li>
          </ul>
          <div className="panel-foot">
            <a href={`tel:${settings.phone_intl || '+905443527371'}`}>{settings.phone || '0544 352 73 71'}</a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Zafer+Bal%C4%B1k%C3%A7%C4%B1l%C4%B1k+Artur+G%C3%B6me%C3%A7+Bal%C4%B1kesir"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yol Tarifi
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Zafer+Balıkçılık+Artur+Balıkesir"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yol Tarifi
            </a>
          </div>
        </div>
      </aside>

      {/* VERTICAL EDGE TEXT */}
      <div className="edge-text edge-text-left" aria-hidden="true">
        <span>Z A F E R · B A L I K Ç I L I K · A R T U R · 0544 352 73 71</span>
      </div>
      <div className="edge-text edge-text-right" aria-hidden="true">
        <span>A R T U R · G Ö M E Ç · B A L I K E S İ R · 39°39&apos;N 27°53&apos;E</span>
      </div>

      {/* RENDER HEADER */}
      <header className="header" id="header">
        <div className="container header-inner">
          <Link href="/" className="brand" data-cursor="home">
            <span className="brand-mark">
              <svg width="22" height="22">
                <use href="#i-anchor" />
              </svg>
            </span>
            <span className="brand-text">
              <strong>Zafer Balıkçılık</strong>
              <small>
                Artur · est. <em>gömeç</em>
              </small>
            </span>
          </Link>

          <nav className="nav" id="nav" aria-label="Ana menü">
            <ul>
              <li>
                <a href="/#manifesto" data-num="01">
                  Felsefe
                </a>
              </li>
              <li>
                <a href="/#hakkimizda" data-num="02">
                  Hikâye
                </a>
              </li>
              <li>
                <a href="/#mutfak" data-num="03">
                  Mutfak
                </a>
              </li>
              <li>
                <Link href="/menu" data-num="04">
                  Menü{" "}
                  <svg width="11" height="11" className="ext">
                    <use href="#i-arrow-up-right" />
                  </svg>
                </Link>
              </li>
              <li>
                <a href="/#mevsim" data-num="05">
                  Mevsim
                </a>
              </li>
              <li>
                <a href="/#galeri" data-num="06">
                  Galeri
                </a>
              </li>
              <li>
                <a href="/#defter" data-num="07">
                  Defter
                </a>
              </li>
              <li>
                <a href="/#iletisim" data-num="08">
                  İletişim
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <span className={`live ${closed ? "closed" : ""}`} id="liveStatus" aria-live="polite">
              <i className="live-dot"></i>
              <span className="live-text">{liveText}</span>
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-gold reserve-btn js-open-reserve"
              data-cursor="rezerve"
            >
              <span>Rezervasyon</span>
              <svg width="14" height="14">
                <use href="#i-arrow" />
              </svg>
            </button>
            <button
              onClick={togglePanel}
              className={`burger ${panelOpen ? "open" : ""}`}
              id="burger"
              aria-label="Menüyü aç"
              aria-expanded={panelOpen}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* SVG DEFS REQUIRED GLOBALLY */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="i-fish" viewBox="0 0 100 40">
            <path
              d="M70 20 C 70 5, 40 5, 25 20 C 40 35, 70 35, 70 20 Z M70 20 L95 5 L90 20 L95 35 Z M35 18 a2 2 0 1 1 -.1 0"
              fill="currentColor"
            />
          </symbol>
          <symbol id="i-anchor" viewBox="0 0 64 64">
            <path
              d="M32 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10v32m-12-20h24M12 38c2 9 9 14 20 14s18-5 20-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-arrow" viewBox="0 0 24 24">
            <path
              d="M5 12h14m-6-6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-arrow-up-right" viewBox="0 0 24 24">
            <path
              d="M7 17 17 7m0 0H9m8 0v8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-qr" viewBox="0 0 24 24">
            <path
              d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 14h3M14 18v3M18 18h3v3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </symbol>
          <symbol id="i-star" viewBox="0 0 24 24">
            <path
              d="M12 2 14.39 8.62 21.5 9.27 16.13 14.06 17.78 21l-5.78-3.69L6.22 21l1.65-6.94L2.5 9.27 9.61 8.62z"
              fill="currentColor"
            />
          </symbol>
          <symbol id="i-wave" viewBox="0 0 200 20">
            <path
              d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </symbol>
          <symbol id="i-leaf" viewBox="0 0 24 24">
            <path
              d="M5 19c0-7 7-14 14-14 0 7-7 14-14 14zm0 0 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-flame" viewBox="0 0 24 24">
            <path
              d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-2-3-2-5 0 0 4 2 4 7a6 6 0 0 1-12 0c0-5 6-6 6-11Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-glass" viewBox="0 0 24 24">
            <path
              d="M6 3h12l-1 8a5 5 0 0 1-10 0L6 3Zm6 13v5m-3 0h6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-hand" viewBox="0 0 24 24">
            <path
              d="M7 11V5a2 2 0 1 1 4 0v6m0 0V3a2 2 0 1 1 4 0v8m0 0V5a2 2 0 1 1 4 0v10a6 6 0 0 1-12 0V9a2 2 0 1 1 4 0v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </symbol>
          <symbol id="i-wa" viewBox="0 0 24 24">
            <path
              d="M12 2a10 10 0 0 0-8.94 14.46L2 22l5.66-1.04A10 10 0 1 0 12 2zm5.13 14.42c-.22.62-1.27 1.18-1.78 1.22-.45.04-1.02.05-1.65-.1-.38-.1-.87-.26-1.5-.53-2.65-1.14-4.38-3.81-4.51-3.99-.13-.18-1.08-1.43-1.08-2.73 0-1.3.68-1.94.93-2.21.24-.27.53-.34.71-.34l.51.01c.16 0 .39-.06.6.46l.85 2.06c.07.13.11.29.02.46l-.26.4c-.13.18-.27.4-.13.66.13.27.6.99 1.29 1.6.88.78 1.62 1.02 1.86 1.13.24.1.38.09.52-.06l.62-.72c.18-.22.36-.18.62-.09l1.96.93c.27.13.45.2.51.31.07.13.07.73-.15 1.35z"
              fill="currentColor"
            />
          </symbol>
        </defs>
      </svg>

      {children}
      
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        phone={settings.phone || "0544 352 73 71"}
      />
    </>
  );
}
