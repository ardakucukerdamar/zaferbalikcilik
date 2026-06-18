"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
      } else {
        setCheckingSession(false);
      }
    }
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === "Invalid login credentials" 
          ? "E-posta veya şifre hatalı." 
          : error.message);
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setErrorMsg("Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a141d] text-[#faf5ea]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#070e14] via-[#0a141d] to-[#12212f] p-6 relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c9a36b]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2c4a3a]/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grain overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-30" />

      <div className="w-full max-w-md bg-[#0c1924]/80 backdrop-blur-xl border border-[#c9a36b]/15 rounded-xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] relative z-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#c9a36b] text-[#0a141d] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(201,163,107,0.3)]">
            <svg viewBox="0 0 64 64" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M32 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10v32m-12-20h24M12 38c2 9 9 14 20 14s18-5 20-14" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#faf5ea] font-serif">
            Zafer Balıkçılık
          </h1>
          <p className="text-sm text-[#506573] mt-1 font-sans">
            Yönetim Paneli Girişi
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {errorMsg && (
            <div className="bg-[#c25234]/10 border border-[#c25234]/30 rounded-lg p-4 text-sm text-[#c25234] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#c9a36b]">
              E-posta
            </label>
            <input
              type="email"
              required
              placeholder="admin@zaferbalikcilik.com.tr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded-lg outline-none text-[#faf5ea] text-sm transition-all focus:ring-4 focus:ring-[#c9a36b]/10 placeholder-[#506573]/40"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#c9a36b]">
              Şifre
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded-lg outline-none text-[#faf5ea] text-sm transition-all focus:ring-4 focus:ring-[#c9a36b]/10 placeholder-[#506573]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#c9a36b] hover:bg-[#e6c08a] disabled:bg-[#c9a36b]/50 text-[#0a141d] font-semibold text-sm rounded-lg transition-all duration-300 shadow-[0_4px_12px_rgba(201,163,107,0.15)] hover:shadow-[0_4px_20px_rgba(201,163,107,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a141d]"></div>
            ) : (
              <>
                <span>Giriş Yap</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
