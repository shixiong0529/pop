import { pinyin } from "pinyin-pro";
import { getAllProducts, getAllSeries, getIPCover, getIPs, getSeriesById } from "@/lib/data";
import { seriesName } from "@/lib/naming";
import type { SearchEntry } from "@/lib/search";

const hasHan = (s: string) => /\p{Script=Han}/u.test(s);

function py(text: string) {
  const han = [...text].filter((ch) => hasHan(ch)).join("");
  if (!han) return "";
  const full = pinyin(han, { toneType: "none", type: "array" }).join("");
  const initials = pinyin(han, { pattern: "first", toneType: "none", type: "array" }).join("");
  return `${full} ${initials}`;
}

/** 构建期生成的静态搜索索引，供 ⌘K 搜索与搜索页在浏览器端检索 */
export async function GET() {
  const ips = getIPs();
  const ipName = new Map(ips.map((ip) => [ip.slug, ip.name]));
  const entries: SearchEntry[] = [];

  for (const ip of ips) {
    const cover = getIPCover(ip);
    const zh = [ip.nameZh, ip.epithet].filter(Boolean).join(" ");
    entries.push({
      t: "ip",
      n: ip.name,
      z: zh,
      s: ip.artist.name,
      k: [...(ip.aliases ?? []), ip.family ?? "", ip.artist.nameEn ?? "", ...ip.keywords, py(zh), py(ip.artist.name)].join(" "),
      h: `/ips/${ip.slug}`,
      i: cover?.src ?? "",
      c: ip.theme.bg,
    });
  }

  for (const s of getAllSeries()) {
    const n = seriesName(s);
    const z = [n.nameZh, n.kind].filter(Boolean).join(" ");
    entries.push({
      t: "series",
      n: n.name,
      z,
      s: ipName.get(s.ip) ?? "",
      k: [s.title, py(z)].join(" "),
      h: `/series/${s.slug}`,
      i: s.cover.src,
      c: s.cover.color,
    });
  }

  for (const p of getAllProducts()) {
    const s = getSeriesById(p.seriesId);
    if (!s) continue;
    const n = seriesName(s);
    entries.push({
      t: "product",
      n: p.name,
      z: p.isSecret ? "隐藏款" : "",
      s: `${ipName.get(p.ip) ?? ""} · ${n.nameZh ?? n.name}`,
      k: p.isSecret ? "secret yinc hk" : "",
      h: `/products/${p.slug}`,
      i: p.image.src,
      c: p.image.color,
    });
  }

  return Response.json(entries, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
