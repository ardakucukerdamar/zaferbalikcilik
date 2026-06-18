import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import "./styles.css";
import LayoutClient from "@/components/LayoutClient";
import { getSettings } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Zafer Balıkçılık Artur — Balıkesir Karaağaç · Deniz Sofrası",
  description: "Balıkesir Karaağaç'ta günlük taze balık, usta eli mezeler ve denize bakan açık hava sofrası. Rezervasyon: 0532 798 52 44 — Zafer Balıkçılık Artur.",
  keywords: "balıkesir balık restoranı, zafer balıkçılık, karaağaç balıkçı, artur balık, balık restoran, taze balık balıkesir, balık mezeleri",
  metadataBase: new URL("https://zaferbalikcilik.com.tr"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="tr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <LayoutClient settings={settings}>{children}</LayoutClient>
      </body>
    </html>
  );
}
