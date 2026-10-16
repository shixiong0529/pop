import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./fonts/noto-serif-sc.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { FavoritesHydrator } from "@/components/providers/FavoritesHydrator";
import { SearchPalette } from "@/components/search/SearchPalette";
import { fetchedAt, getIPs } from "@/lib/data";
import { SITE } from "@/lib/site";

// 字体全部自托管（国内服务器无法访问 Google Fonts），由 scripts/fetch-fonts.mjs 下载
const interTight = localFont({
  src: "./fonts/InterTight-Latin.woff2",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
});
const instrument = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic-Latin.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
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
    <html lang="zh-CN" className={`${interTight.variable} ${instrument.variable}`} suppressHydrationWarning>
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
