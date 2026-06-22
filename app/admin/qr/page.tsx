"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { fetchSettingsData, saveSettings } from "@/lib/actions";

interface QRCardProps {
  num: string;
  title: string;
  desc: string;
  text: string;
  name: string;
  filename: string;
}

function QRCard({ num, title, desc, text, name, filename }: QRCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          margin: 1,
          width: 440,
          errorCorrectionLevel: "M",
          color: {
            dark: "#0a141d",
            light: "#ffffff",
          },
        },
        (err) => {
          if (err) console.error("Error drawing QR code:", err);
          if (canvasRef.current) {
            canvasRef.current.style.width = "100%";
            canvasRef.current.style.height = "100%";
          }
        }
      );
    }
  }, [text]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `zafer-balikcilik-${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <article className="qr-card p-6 bg-[#0c1924]/80 backdrop-blur-xl border border-[#c9a36b]/15 rounded-xl shadow-xl flex flex-col items-center justify-between text-center min-h-[460px] relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#c9a36b]/30">
      <span className="absolute top-4 left-6 font-serif italic font-bold text-sm text-[#c9a36b]">{num}</span>
      <span className="absolute top-4 right-6 uppercase tracking-wider text-[10px] text-[#506573] font-semibold">
        Zafer <span className="italic text-[#c9a36b] font-normal">Balıkçılık</span>
      </span>

      <div className="qr-canvas-wrap p-3 bg-white border border-[#c9a36b]/15 rounded-lg flex items-center justify-center w-[200px] h-[200px] mt-10">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="space-y-2 mt-4 flex-grow flex flex-col justify-center">
        <h3 className="font-serif font-bold text-[#faf5ea] text-lg">{title}</h3>
        <p className="text-xs text-[#506573] leading-relaxed max-w-[280px]">{desc}</p>
      </div>

      <div className="w-full pt-4 border-t border-[#c9a36b]/10 mt-4 flex flex-col gap-2">
        <span className="uppercase text-[9px] tracking-widest text-[#c9a36b] font-semibold">tara · {name}</span>
        <button
          onClick={downloadPNG}
          className="text-[10px] text-[#506573] hover:text-[#c9a36b] transition-colors mt-1 no-print font-semibold cursor-pointer underline decoration-[#506573]/20 hover:decoration-[#c9a36b]/40"
        >
          PNG Olarak İndir
        </button>
      </div>
    </article>
  );
}

export default function AdminQRPage() {
  const [menuUrl, setMenuUrl] = useState("https://zaferbalikcilik.com.tr/qr");
  const [phone, setPhone] = useState("+905443527371");
  const [whatsappMsg, setWhatsappMsg] = useState("Merhaba, rezervasyon yaptırmak istiyorum.");
  const [placeId, setPlaceId] = useState("");
  const [customReviewUrl, setCustomReviewUrl] = useState("");
  const [mapsLocation, setMapsLocation] = useState("Zafer Balıkçılık Artur Gömeç Balıkesir");
  const [websiteUrl, setWebsiteUrl] = useState("https://zaferbalikcilik.com.tr");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const obj = await fetchSettingsData();
        if (obj.qr_menu_url) setMenuUrl(obj.qr_menu_url);
        if (obj.phone_intl) setPhone(obj.phone_intl);
        if (obj.qr_whatsapp_msg) setWhatsappMsg(obj.qr_whatsapp_msg);
        if (obj.google_review_url) setCustomReviewUrl(obj.google_review_url);
        if (obj.qr_place_id) setPlaceId(obj.qr_place_id);
        if (obj.qr_maps_location) setMapsLocation(obj.qr_maps_location);
        if (obj.qr_website_url) setWebsiteUrl(obj.qr_website_url);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveSettings({
        qr_menu_url: menuUrl,
        phone_intl: phone,
        qr_whatsapp_msg: whatsappMsg,
        google_review_url: customReviewUrl,
        qr_place_id: placeId,
        qr_maps_location: mapsLocation,
        qr_website_url: websiteUrl,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadAll = () => {
    // Collect data to download
    const cards = [
      { text: menuUrl, filename: "menu" },
      { text: `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMsg)}`, filename: "rezervasyon" },
      { text: customReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId || "ChIJ8Yk4j3rsxxQRZxxxx"}`, filename: "yorum" },
      { text: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLocation)}`, filename: "konum" },
      { text: `tel:${phone}`, filename: "telefon" },
      { text: websiteUrl, filename: "site" },
    ];

    cards.forEach((card, index) => {
      setTimeout(() => {
        const canvas = document.createElement("canvas");
        QRCode.toCanvas(
          canvas,
          card.text,
          {
            margin: 1,
            width: 500,
            errorCorrectionLevel: "M",
          },
          (err) => {
            if (err) return;
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `zafer-balikcilik-${card.filename}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        );
      }, index * 250); // Small interval to trigger multiple downloads safely in browser
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a36b]"></div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMsg)}`;
  const reviewUrl = customReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId || "ChIJ8Yk4j3rsxxQRZxxxx"}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLocation)}`;
  const telUrl = `tel:${phone}`;

  return (
    <div className="space-y-8 pb-16">
      {/* Dynamic styles to override admin layout during print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except print area */
          .admin-wrapper aside,
          .admin-wrapper header,
          .no-print,
          .control-panel-wrap {
            display: none !important;
          }
          
          /* Remove pl-64 margin & padding from layouts */
          .admin-wrapper > div,
          .admin-wrapper .pl-64,
          .admin-wrapper main {
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }

          .print-area {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-title {
            display: block !important;
            text-align: center;
            margin-bottom: 24px;
            font-family: Georgia, serif;
          }

          .qr-grid-print {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            width: 100% !important;
          }

          .qr-card {
            background: #ffffff !important;
            border: 2px solid #c9a36b !important;
            box-shadow: none !important;
            color: #0a141d !important;
            transform: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            min-height: 400px !important;
            padding: 24px !important;
          }

          .qr-card h3 {
            color: #0a141d !important;
          }

          .qr-card p,
          .qr-card span {
            color: #506573 !important;
          }

          .qr-canvas-wrap {
            border: 1px solid #c9a36b !important;
            background: #ffffff !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}} />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c9a36b]/10 pb-6 no-print">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#faf5ea]">Masaya İnecek Karekodlar</h2>
          <p className="text-sm text-[#506573] mt-1">
            Misafirlerinizin menüye, rezervasyona, konuma ve yorum sayfasına hızlıca ulaşması için karekodları yönetin ve bastırın.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadAll}
            className="px-4 py-2.5 bg-[#0a141d] hover:bg-[#c9a36b]/10 text-[#c9a36b] hover:text-[#e6c08a] border border-[#c9a36b]/20 rounded-lg transition-all text-xs font-semibold cursor-pointer"
          >
            Tümünü PNG İndir
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#c9a36b] hover:bg-[#e6c08a] text-[#0a141d] rounded-lg transition-all text-xs font-semibold shadow-[0_4px_12px_rgba(201,163,107,0.15)] cursor-pointer"
          >
            Yazdır (Print)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <form onSubmit={handleSave} className="xl:col-span-1 bg-[#0c1924]/85 border border-[#c9a36b]/15 rounded-xl p-6 space-y-6 no-print">
          <h3 className="font-serif font-semibold text-[#faf5ea] text-md border-b border-[#c9a36b]/10 pb-2">Karekod İçerik Ayarları</h3>
          
          <div className="space-y-4 text-xs">
            {/* Menu URL */}
            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">1. Menü Bağlantısı</label>
              <input
                type="text"
                value={menuUrl}
                onChange={(e) => setMenuUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">2. İletişim Telefonu</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
                placeholder="+905443527371"
              />
              <span className="text-[10px] text-[#506573]">Uluslararası formatta yazın (Örn: +90...)</span>
            </div>

            {/* WhatsApp Msg */}
            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">WhatsApp Rezervasyon Mesajı</label>
              <textarea
                rows={2}
                value={whatsappMsg}
                onChange={(e) => setWhatsappMsg(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
              />
            </div>

            {/* Google Review Direct Link or Place ID */}
            <div className="space-y-1.5 pt-2 border-t border-[#c9a36b]/10">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">3. Google Yorum Linki (Öncelikli)</label>
              <input
                type="text"
                value={customReviewUrl}
                onChange={(e) => setCustomReviewUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
                placeholder="https://g.page/r/... veya direkt Maps linki"
              />
              <span className="text-[10px] text-[#506573] block mt-0.5">Doğrudan Google yorum/paylaş linkinizi buraya yapıştırabilirsiniz.</span>
            </div>

            {/* Place ID */}
            {!customReviewUrl && (
              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">veya Google Place ID</label>
                <input
                  type="text"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
                  placeholder="ChIJ8Yk4j3rsxxQRZxxxx"
                />
              </div>
            )}

            {/* Maps Location */}
            <div className="space-y-1.5 pt-2 border-t border-[#c9a36b]/10">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">4. Yol Tarifi Konum Araması</label>
              <input
                type="text"
                value={mapsLocation}
                onChange={(e) => setMapsLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
              />
            </div>

            {/* Website Home */}
            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#c9a36b]">6. Web Sitesi URL</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#070e14]/90 border border-[#506573]/20 focus:border-[#c9a36b]/80 rounded outline-none text-[#faf5ea]"
              />
            </div>
            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-[11px] text-emerald-400 flex items-center gap-1.5 mt-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Ayarlar başarıyla kaydedildi.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 bg-[#c9a36b] hover:bg-[#e6c08a] disabled:bg-[#c9a36b]/50 text-[#0a141d] font-semibold text-xs rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer text-center"
            >
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </form>

        {/* QR Grid Display / Print Area */}
        <div className="xl:col-span-3 print-area">
          <div className="hidden print-title">
            <h1 className="text-2xl font-bold tracking-wider">ZAFER BALIKÇILIK ARTUR</h1>
            <p className="text-xs text-[#506573] mt-1">Masaya Yerleştirilebilir Dijital Karekod Kartları</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 qr-grid-print">
            <QRCard
              num="№ 01"
              title="Masaüstü Karekodu (Ortak Giriş)"
              desc="Masalara yapıştırılacak tek karekoddur. Okutulduğunda; Web Sitesi, Dijital Menü, Yorum Yap ve Instagram bağlantılarını içeren ortak portal açılır."
              text={menuUrl}
              name="portalı aç"
              filename="masa_karekodu_ortak_portal"
            />

            <QRCard
              num="№ 02"
              title="Rezervasyon Talebi"
              desc="Doğrudan WhatsApp hattımız üzerinden rezervasyon oluşturun — tarih, saat ve kişi sayısını belirterek anında yerinizi ayırtın."
              text={whatsappUrl}
              name="rezervasyon yap"
              filename="whatsapp_rezervasyon"
            />

            <QRCard
              num="№ 03"
              title="Google Değerlendirme"
              desc="Lezzetlerimiz ve hizmetimiz hakkında Google Haritalar üzerinde yorum bırakarak deneyimlerinizi paylaşın."
              text={reviewUrl}
              name="yorum yaz"
              filename="google_yorum"
            />

            <QRCard
              num="№ 04"
              title="Yol Tarifi & Konum"
              desc="Artur sahilindeki mekanımıza en hızlı rota ile ulaşmak için Google Haritalar üzerinden navigasyon başlatın."
              text={mapsUrl}
              name="konuma git"
              filename="konum"
            />

            <QRCard
              num="№ 05"
              title="Telefon İletişim"
              desc="Detaylı bilgi almak, özel organizasyonlar düzenlemek veya doğrudan arayarak iletişime geçmek için arayın."
              text={telUrl}
              name="telefon ara"
              filename="telefon_arama"
            />

            <QRCard
              num="№ 06"
              title="Web Sitesi & Galeri"
              desc="Zafer Balıkçılık'ın hikayesini, lezzet galerisini, detaylı açılış saatlerini ve mekan özelliklerini görüntüleyin."
              text={websiteUrl}
              name="siteye git"
              filename="web_sitesi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
