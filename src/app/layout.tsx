import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { FavoritesHydrator } from "@/components/providers/FavoritesHydrator";
import { SearchPalette } from "@/components/search/SearchPalette";
import { fetchedAt, getIPs } from "@/lib/data";
import { SITE } from "@/lib/site";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const notoSerif = Noto_Serif_SC({
  weight: "700",
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · 泡泡玛特潮玩文化图鉴`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ["泡泡玛特", "POP MART", "LABUBU", "MOLLY", "SKULLPANDA", "DIMOO", "HIRONO", "CRYBABY", "潮玩", "盲盒", "图鉴"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE.name,
    title: `${SITE.name} · 泡泡玛特潮玩文化图鉴`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6f4f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const ips = getIPs();
  const navIPs = ips.slice(0, 12).map((ip) => ({ slug: ip.slug, name: ip.name, nameZh: ip.nameZh ?? ip.epithet, color: ip.theme.accent }));
  return (
    <html lang="zh-CN" className={`${interTight.variable} ${instrument.variable} ${notoSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-svh bg-[var(--t-bg)] transition-colors duration-700">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          跳到主要内容
        </a>
        <SmoothScroll>
          <Nav ips={navIPs} />
          <main id="main">{children}</main>
          <Footer ips={ips.map((ip) => ({ slug: ip.slug, name: ip.name }))} fetchedAt={fetchedAt} />
        </SmoothScroll>
        <SearchPalette />
        <FavoritesHydrator />
      </body>
    </html>
  );
}
