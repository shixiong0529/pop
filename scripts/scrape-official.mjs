// 从泡泡玛特国际站（美国区）采集 IP 合集与商品的公开结构化数据。
// 官网页面为服务端渲染，数据嵌在 __NEXT_DATA__ 中；本脚本只做低频、串行的只读请求。
// 用法：node scripts/scrape-official.mjs [slug ...] [--refresh]
//   默认采集 scripts/ips.mjs 中的全部 IP；已有详情的商品不重复请求，--refresh 则全部重新获取。
import fs from 'node:fs/promises';
import path from 'node:path';
import { IP_LIST, NON_IP_COLLECTIONS } from './ips.mjs';

const BASE = 'https://www.popmart.com/us';
const OUT = path.resolve('data/official/raw.json');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

const COLLECTIONS = IP_LIST.map(([official]) => official);
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
  const slugs = only.length ? only : COLLECTIONS;
  let db = { fetchedAt: '', collections: {}, products: {} };
  try {
    db = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}

  let added = 0;
  for (const slug of slugs) {
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
    db.fetchedAt = new Date().toISOString();
    if (officialCharacters?.length) db.officialCharacters = officialCharacters;
    await fs.mkdir(path.dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, JSON.stringify(db, null, 1));
  }

  console.log(`\n✓ 采集完成：${slugs.length} 个合集，获取商品详情 ${added} 条`);
  const known = new Set(COLLECTIONS);
  const fresh = (officialCharacters ?? []).filter((c) => !known.has(c.slug));
  if (fresh.length) {
    console.log('\n⚠ 官网出现了本站尚未收录的 IP：');
    for (const c of fresh) console.log(`   - ${c.name}（官网合集 ${c.slug}）`);
    console.log('  收录方法见 README「新增一个 IP」。');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
