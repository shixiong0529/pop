import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "搜索",
  description: "按 IP、系列名称或产品名称搜索泡泡玛特潮玩图鉴，支持中文、英文与拼音。",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="min-h-svh bg-paper pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <Suspense fallback={<div className="container-page py-24 text-ink-mute">正在载入…</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
