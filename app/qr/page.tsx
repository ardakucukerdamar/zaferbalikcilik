import { getSettings } from "@/lib/data";
import Link from "next/link";

export const revalidate = 60; // Revalidate settings every minute

export default async function QrPortalPage() {
  const settings = await getSettings();

  const googleReviewUrl = settings.google_review_url || "https://g.page/r/.../review";
  const instagramUrl = settings.instagram_url || "https://www.instagram.com/zaferbalikcilikartur/";
  const phone = settings.phone || "0544 352 73 71";
  const phoneIntl = settings.phone_intl || "+905443527371";

  return (
    <div className="qr-portal-container" style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #070e14 0%, #0d1b26 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      color: "#faf5ea",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "-20%",
        width: "60vw",
        height: "60vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(201,163,107,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "-20%",
        width: "60vw",
        height: "60vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(58,88,73,0.1) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Main Content Card */}
      <div className="qr-portal-card" style={{
        width: "100%",
        maxWidth: "420px",
        textAlign: "center",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        {/* Logo Container */}
        <div style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #c9a36b",
          boxShadow: "0 10px 25px rgba(201, 163, 107, 0.25)",
          marginBottom: "20px",
          background: "#fff",
          display: "grid",
          placeItems: "center"
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="Zafer Balıkçılık Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Brand Details */}
        <h1 style={{
          fontFamily: "var(--font-display), serif",
          fontSize: "1.8rem",
          fontWeight: "800",
          color: "#faf5ea",
          marginBottom: "4px",
          letterSpacing: "-0.01em"
        }}>
          Zafer Balıkçılık
        </h1>
        <p style={{
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "#c9a36b",
          marginBottom: "36px",
          fontWeight: "600"
        }}>
          Artur Gömeç · est. 1994
        </p>

        {/* Buttons List */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
          
          {/* Option 1: Dijital Menü */}
          <Link href="/menu" style={{ textDecoration: "none" }}>
            <div className="qr-portal-btn" style={{
              background: "rgba(250, 245, 234, 0.05)",
              border: "1px solid rgba(201, 163, 107, 0.3)",
              borderRadius: "12px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.25s ease-in-out",
              cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "1rem", color: "#c9a36b", fontWeight: "bold", fontFamily: "var(--font-display), serif" }}>01</span>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#faf5ea" }}>Dijital Menü</h4>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(246,239,225,0.5)" }}>Güncel fiyatlar ve menü kartı</p>
                </div>
              </div>
              <span style={{ color: "#c9a36b", fontSize: "1.1rem" }}>→</span>
            </div>
          </Link>

          {/* Option 2: Web Sitesi */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="qr-portal-btn" style={{
              background: "rgba(250, 245, 234, 0.05)",
              border: "1px solid rgba(201, 163, 107, 0.15)",
              borderRadius: "12px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.25s ease-in-out",
              cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "1rem", color: "#c9a36b", fontWeight: "bold", fontFamily: "var(--font-display), serif" }}>02</span>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#faf5ea" }}>Web Sitesi</h4>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(246,239,225,0.5)" }}>Rezervasyon, konum ve saatlerimiz</p>
                </div>
              </div>
              <span style={{ color: "#c9a36b", fontSize: "1.1rem" }}>→</span>
            </div>
          </Link>

          {/* Option 3: Google Yorum Yap */}
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="qr-portal-btn" style={{
              background: "rgba(250, 245, 234, 0.05)",
              border: "1px solid rgba(201, 163, 107, 0.15)",
              borderRadius: "12px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.25s ease-in-out",
              cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "1rem", color: "#c9a36b", fontWeight: "bold", fontFamily: "var(--font-display), serif" }}>03</span>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#faf5ea" }}>Google Yorum Yaz</h4>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(246,239,225,0.5)" }}>Bizi Google Haritalar&apos;da değerlendirin</p>
                </div>
              </div>
              <span style={{ color: "#c9a36b", fontSize: "1.1rem" }}>→</span>
            </div>
          </a>

          {/* Option 4: Instagram */}
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="qr-portal-btn" style={{
              background: "rgba(250, 245, 234, 0.05)",
              border: "1px solid rgba(201, 163, 107, 0.15)",
              borderRadius: "12px",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.25s ease-in-out",
              cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "1rem", color: "#c9a36b", fontWeight: "bold", fontFamily: "var(--font-display), serif" }}>04</span>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#faf5ea" }}>Instagram</h4>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(246,239,225,0.5)" }}>En son taze kareler ve hikâyelerimiz</p>
                </div>
              </div>
              <span style={{ color: "#c9a36b", fontSize: "1.1rem" }}>→</span>
            </div>
          </a>

        </div>

        {/* Reservation Call Footer */}
        <div style={{
          borderTop: "1px solid rgba(201, 163, 107, 0.15)",
          paddingTop: "24px",
          width: "100%"
        }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "rgba(246,239,225,0.6)" }}>
            Rezervasyon & Bilgi için:
          </p>
          <a href={`tel:${phoneIntl}`} style={{
            fontSize: "1.2rem",
            fontWeight: "700",
            color: "#c9a36b",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span></span> {phone}
          </a>
        </div>
      </div>
    </div>
  );
}
