"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "../globals.css";
import "../admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // If we are already on the login page, skip verification here
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setUserEmail(session.user?.email || null);
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <div className="admin-wrapper">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e14] text-[#faf5ea]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
          <p className="text-xs tracking-widest text-[#506573] uppercase">Yetki Kontrol Ediliyor...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    {
      name: "Kontrol Paneli",
      href: "/admin",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      name: "Yemek Menüsü",
      href: "/admin/menu",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      name: "Galeri Yönetimi",
      href: "/admin/gallery",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
    },
    {
      name: "Rezervasyonlar",
      href: "/admin/reservations",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      name: "Müşteri Yorumları",
      href: "/admin/reviews",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      name: "Karekod Paneli",
      href: "/admin/qr",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M7 7h2v2H7zM15 15h2v2h-2z" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: "Genel Ayarlar",
      href: "/admin/settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-wrapper min-h-screen flex bg-[#070e14] text-[#faf5ea] font-sans">
      {/* Sidebar background graphics */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(201,163,107,0.02)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#060b10] border-r border-[#c9a36b]/10 flex flex-col justify-between fixed h-full z-20">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-[#c9a36b]/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c9a36b]/10 text-[#c9a36b] rounded-full flex items-center justify-center border border-[#c9a36b]/20">
              <svg viewBox="0 0 64 64" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M32 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10v32m-12-20h24M12 38c2 9 9 14 20 14s18-5 20-14" />
              </svg>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-base leading-tight text-slate-100">Zafer Balıkçılık</h2>
              <span className="text-[10px] text-[#c9a36b]/80 uppercase tracking-widest font-semibold">Yönetim Paneli</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${
                    active
                      ? "bg-[#c9a36b]/10 text-[#c9a36b] border border-[#c9a36b]/20 font-medium"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/20 border border-transparent"
                  }`}
                >
                  <span className={active ? "text-[#c9a36b]" : "text-slate-500 group-hover:text-slate-300 transition-colors"}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-[#c9a36b]/10 bg-black/20">
          {userEmail && (
            <div className="px-4 py-2 mb-2">
              <p className="text-[10px] text-[#c9a36b]/60 uppercase tracking-wider font-semibold">Giriş Yapıldı</p>
              <p className="text-xs text-slate-300 truncate mt-0.5">{userEmail}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-rose-400/90 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-[#070e14]/90 backdrop-blur-md border-b border-[#c9a36b]/10 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-sans font-semibold text-lg text-slate-100">
              {pathname === "/admin" && "Kontrol Paneli"}
              {pathname === "/admin/menu" && "Yemek Menüsü Yönetimi"}
              {pathname === "/admin/gallery" && "Galeri Yönetimi"}
              {pathname === "/admin/reservations" && "Rezervasyon Yönetimi"}
              {pathname === "/admin/reviews" && "Müşteri Yorumları"}
              {pathname === "/admin/qr" && "Karekod Paneli"}
              {pathname === "/admin/settings" && "Genel Ayarlar"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs px-3 py-1.5 bg-[#0a141d] hover:bg-[#c9a36b]/10 text-[#c9a36b] hover:text-[#e6c08a] border border-[#c9a36b]/20 rounded transition-all duration-300 flex items-center gap-1.5"
            >
              <span>Siteyi Görüntüle</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-grow p-8 relative z-10">{children}</main>
      </div>
    </div>
  );
}
