import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "我的收藏",
  description: "你收藏的 IP、系列与潮玩，保存在本地浏览器中。",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="min-h-svh bg-paper pb-24 pt-[calc(var(--nav-h)+4rem)]">
      <FavoritesView />
    </div>
  );
}
