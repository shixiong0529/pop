// 从泡泡玛特国际站（美国区）采集 IP 合集与商品的公开结构化数据。
// 官网页面为服务端渲染，数据嵌在 __NEXT_DATA__ 中；本脚本只做低频、串行的只读请求。
// 用法：node scripts/scrape-official.mjs [slug ...] [--refresh]
//   默认采集全部 IP（scripts/ips.mjs + 自动登记的新 IP）；已有详情的商品不重复请求，--refresh 则全部重新获取。
//   全量采集时，官网角色菜单里新出现的 IP 会自动登记到 data/auto-ips.json 并一起采集。
import fs from 'node:fs/promises';
import path from 'node:path';
import { NON_IP_COLLECTIONS, allIPs, readAutoIPs, siteSlugFor, writeAutoIPs } from './ips.mjs';

const BASE = 'https://www.popmart.com/us';
const OUT = path.resolve('data/official/raw.json');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const COLLECTIONS = allIPs().map(([official]) => official);
const REFRESH = process.argv.includes('--refresh');
/** 官网导航“CHARACTERS”菜单中的全部角色合集 */
let officialCharacters = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function nextData(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, 'accept-language': 'en-US' },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) throw new Error('no __NEXT_DATA__');
      return JSON.parse(m[1]).props.pageProps;
    } catch (err) {
      if (i === tries - 1) throw new Error(`${url}: ${err.message}`);
      await sleep(1500 * (i + 1));
    }
  }
}

async function scrapeCollection(slug) {
  const first = await nextData(`${BASE}/collection/${slug}?page=1`);
  officialCharacters ??= readCharacters(first.serverNavData);
  const raw = first.serverCollectionRaw;
  const pages = Math.ceil(raw.total / 20);
  const items = [...raw.productData];
  for (let p = 2; p <= pages; p++) {
    await sleep(300);
    const pp = await nextData(`${BASE}/collection/${slug}?page=${p}`);
    items.push(...pp.serverCollectionRaw.productData);
  }
  return {
    slug,
    id: raw.id,
    name: raw.name,
    desc: raw.desc,
    mainImage: raw.mainImage,
    mainImagePc: raw.mainImagePc,
    seoDescription: first.seoDescription,
    total: raw.total,
    products: items.map((p) => ({
      id: p.id,
      title: p.title,
      coverImg: p.coverImg || p.skus?.[0]?.mainImage || '',
      bannerImages: p.bannerImages ?? [],
      upTime: p.upTime,
      brand: p.brand?.name ?? '',
      type: p.type,
    })),
  };
}

function readCharacters(nav) {
  const menu = (nav ?? []).find((n) => /^characters$/i.test(n.title?.trim() ?? ''));
  return (menu?.jsonData?.secondMenu ?? [])
    .map((m) => ({ name: m.title, slug: m.webUrl?.match(/\/collection\/([^/?#]+)/)?.[1] }))
    .filter((m) => m.slug && !NON_IP_COLLECTIONS.has(m.slug));
}

async function scrapeProduct(id) {
  const pp = await nextData(`${BASE}/products/${id}`);
  const c = pp.serverSeoData?.commonInfo;
  if (!c || !c.title) return null;
  return {
    id,
    title: c.title,
    desc: c.desc ?? '',
    banners: (c.banners ?? []).filter((b) => b.type === 'image').map((b) => b.url),
    toys: (c.toys ?? []).map((t) => ({ name: t.name, type: t.type, url: t.url })),
    brand: c.ipDesignerInfo?.brandName ?? '',
    designer: c.ipDesignerInfo?.designerName ?? '',
    url: `${BASE}/products/${id}`,
  };
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const full = only.length === 0;
  const queue = full ? [...COLLECTIONS] : only;
  let db = { fetchedAt: '', collections: {}, products: {} };
  try {
    db = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}

  let added = 0;
  let checkedMenu = false;
  const registered = [];
  for (let i = 0; i < queue.length; i++) {
    const slug = queue[i];
    process.stdout.write(`• ${slug} … `);
    const col = await scrapeCollection(slug);
    db.collections[slug] = col;
    let n = 0;
    for (const p of col.products) {
      if (db.products[p.id] && !REFRESH) continue;
      await sleep(250);
      try {
        const detail = await scrapeProduct(p.id);
        if (detail) db.products[p.id] = detail;
        n++;
      } catch (err) {
        console.warn(`\n  ! ${err.message}`);
      }
    }
    added += n;
    console.log(`${col.products.length} 件商品${n ? `，获取详情 ${n} 条` : ''}`);

    // 第一次拿到官网角色菜单后，检查是否有新 IP
    if (!checkedMenu && officialCharacters) {
      checkedMenu = true;
      const known = new Set(allIPs().map(([o]) => o));
      const fresh = officialCharacters.filter((c) => !known.has(c.slug));
      if (fresh.length && full) {
        const auto = readAutoIPs();
        const taken = new Set(allIPs().map(([, s]) => s));
        for (const c of fresh) {
          const entry = { official: c.slug, slug: siteSlugFor(c.slug, taken), name: c.name, addedAt: new Date().toISOString().slice(0, 10) };
          taken.add(entry.slug);
          auto.push(entry);
          registered.push(entry);
          queue.push(c.slug);
        }
        writeAutoIPs(auto);
      } else if (fresh.length) {
        console.log(`\n⚠ 官网有本站尚未收录的 IP：${fresh.map((c) => c.name).join('、')}（全量运行 pnpm data:update 时会自动收录）`);
      }
    }

    db.fetchedAt = new Date().toISOString();
    if (officialCharacters?.length) db.officialCharacters = officialCharacters;
    await fs.mkdir(path.dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, JSON.stringify(db, null, 1));
  }

  console.log(`\n✓ 采集完成：${queue.length} 个合集，获取商品详情 ${added} 条`);
  if (registered.length) {
    console.log('\n★ 已自动收录官网新出现的 IP（展厅先用官网资料生成，故事待补充）：');
    for (const r of registered) console.log(`   - ${r.name}（官网合集 ${r.official} → 本站 /ips/${r.slug}）`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
