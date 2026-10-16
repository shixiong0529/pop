// 把官网采集数据整理成本站图鉴：筛选潮玩系列 → 下载并处理图片 → 生成 catalog.json
// 用法：node scripts/build-data.mjs [--no-images]
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const RAW_DIR = 'data/official';
const IMG_DIR = 'public/images/catalog';
const MANIFEST = 'data/images.json';
const OUT = 'src/content/generated/catalog.json';
const SKIP_IMAGES = process.argv.includes('--no-images');
const REPORT = process.argv.includes('--report');

// [官网合集 slug, 本站 IP slug, 层级]，顺序即归属优先级
const IP_MAP = [
  ['the-monsters', 'labubu', 'core'],
  ['molly', 'molly', 'core'],
  ['skullpanda', 'skullpanda', 'core'],
  ['dimoo', 'dimoo', 'core'],
  ['hirono', 'hirono', 'core'],
  ['crybaby', 'crybaby', 'core'],
  ['twinkle-twinkle', 'twinkle-twinkle', 'featured'],
  ['pucky', 'pucky', 'featured'],
  ['hacipupu', 'hacipupu', 'featured'],
  ['peach-riot', 'peach-riot', 'featured'],
  ['kubo', 'kubo', 'featured'],
  ['nyota', 'nyota', 'featured'],
  ['chaka', 'chaka', 'rising'],
  ['zsiga', 'zsiga', 'rising'],
  ['polar', 'polar', 'rising'],
  ['pino-jelly', 'pino-jelly', 'rising'],
  ['inosoul', 'inosoul', 'rising'],
  ['tiny-tiny', 'tiny-tiny', 'rising'],
  ['duckoo', 'duckoo', 'rising'],
  ['merodi', 'merodi', 'rising'],
  ['sweet-bean', 'sweet-bean', 'rising'],
  ['1001moons', '1001moons', 'rising'],
  ['supertutu', 'supertutu', 'rising'],
];
const CAP = { core: 40, featured: 20, rising: 12 };
/** 品牌名 → IP（用于把联名/跨合集商品归到正确的 IP） */
const BRAND_ALIAS = { LABUBU: 'labubu', 'THE MONSTERS': 'labubu', 'TWINKLE TWINKLE': 'twinkle-twinkle' };

// ───────── 分类 ─────────
const INCLUDE = /(figure|figurine|plush|vinyl|doll|mega|\d{3,4}%|blind box|scene set)/i;
/** 无论是否毛绒都排除的周边品类 */
const HARD =
  /\b(bags?|case|cards?|cardholder|holder|breastpins?|brooch|crystal ball|hourglass|night ?light|nightlight|hair tie|cups?|mugs?|lamp|light|blanket|pillow|cushion|slippers|hat|tumbler|bottle|glass|magnet|charger|phone|earphone|airpods|notebook|book|sticker|mat|pad|badge|spray|fragrance|sachet|clip|opener|pouch|bundle|blocks?|album|frame|mirror|tray|container|cable|calendar|towel|umbrella|socks?|scarf|lanyard|sign|prop|diffuser|ornament|jewelry|necklace|bracelet|earrings?|shirt|tee|hoodie|poster|puzzle|keychain)\b/i;
/** 毛绒挂件等可保留，其余挂饰类排除 */
const SOFT = /\b(charm|pendant|chain|sets?|gift|bonus)\b/i;

function typePart(title) {
  const parts = title.split(/series\s*[-–—:]?\s*|\s[-–—]\s/i).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts.at(-1) : title;
}

function classify(p) {
  const t = p.title;
  const tp = typePart(t);
  const toys = p.toys?.length ?? 0;
  if (HARD.test(tp)) return null;
  const plush = /plush|vinyl face|vinyl doll|\bdoll\b|hand puppet/i.test(tp);
  const scene = /scene set/i.test(tp);
  if (SOFT.test(tp) && !plush && !scene) return null;
  if (/\bMEGA\b|\d{3,4}%/i.test(t)) return 'mega';
  if (plush) return 'plush';
  if (INCLUDE.test(tp) || scene || toys >= 3) {
    return toys > 1 || /figures|blind box|scene set/i.test(tp) || toys >= 3 ? 'figure' : 'figurine';
  }
  return null;
}

// ───────── 字段解析 ─────────
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function parseDate(text) {
  if (!text) return undefined;
  const s = text.trim().toLowerCase();
  let m = s.match(/([a-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (m && MONTHS.indexOf(m[1]) >= 0) return `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  m = s.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/([a-z]+)\s+(\d{4})/);
  if (m && MONTHS.indexOf(m[1]) >= 0) return `${m[2]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}`;
  return undefined;
}

function fields(desc) {
  const out = {};
  for (const line of desc.split(/\n/)) {
    const m = line.match(/^\s*([A-Za-z][A-Za-z ]{1,25}?)\s*[:：]\s*(.+)$/);
    if (!m) continue;
    const k = m[1].trim().toLowerCase();
    if (!out[k]) out[k] = m[2].trim();
  }
  return out;
}

const slugify = (s) =>
  s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[×x]\s/g, 'x ')
    .replace(/%/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');

// ───────── 图片 ─────────
function ossUrl(url, width) {
  const base = url.split('?')[0];
  return `${base}?x-oss-process=image/resize,w_${width}/quality,q_86/format,webp`;
}

async function processImage(manifest, origin, ip, width) {
  if (manifest[origin]) return manifest[origin];
  if (SKIP_IMAGES) return null;
  const hash = crypto.createHash('md5').update(origin).digest('hex').slice(0, 14);
  const rel = `${IMG_DIR}/${ip}/${hash}.webp`;
  let buf;
  if (existsSync(rel)) {
    buf = await fs.readFile(rel);
  } else {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(ossUrl(origin, width), { signal: AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        buf = Buffer.from(await res.arrayBuffer());
        break;
      } catch (err) {
        if (i === 2) {
          console.warn(`  ! 下载失败 ${origin}: ${err.message}`);
          return null;
        }
        await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
      }
    }
    // 统一转码，确保落地文件为 webp
    buf = await sharp(buf).webp({ quality: 84 }).toBuffer();
    await fs.mkdir(path.dirname(rel), { recursive: true });
    await fs.writeFile(rel, buf);
  }
  const img = sharp(buf);
  const meta = await img.metadata();
  const { dominant } = await img.stats();
  const tiny = await sharp(buf).resize(16, 16, { fit: 'inside' }).webp({ quality: 45 }).toBuffer();
  const hex = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const asset = {
    src: '/' + rel.replace(/^public\//, ''),
    w: meta.width,
    h: meta.height,
    blur: `data:image/webp;base64,${tiny.toString('base64')}`,
    color: hex,
    origin,
  };
  manifest[origin] = asset;
  return asset;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

// ───────── 主流程 ─────────
async function main() {
  const files = (await fs.readdir(RAW_DIR)).filter((f) => /^raw.*\.json$/.test(f));
  const collections = {};
  const products = {};
  let fetchedAt = '';
  for (const f of files) {
    const d = JSON.parse(await fs.readFile(path.join(RAW_DIR, f), 'utf8'));
    for (const [k, c] of Object.entries(d.collections)) {
      if (!collections[k] || c.products.length > collections[k].products.length) collections[k] = c;
    }
    Object.assign(products, d.products);
    if (d.fetchedAt > fetchedAt) fetchedAt = d.fetchedAt;
  }

  const missing = IP_MAP.filter(([o]) => !collections[o]).map(([o]) => o);
  if (missing.length) console.warn('缺少合集数据：', missing.join(', '));

  // 归属：品牌别名优先，其次按 IP_MAP 顺序首次出现
  const nameToIp = Object.fromEntries(IP_MAP.map(([o, ip]) => [collections[o]?.name?.toUpperCase(), ip]));
  Object.assign(nameToIp, BRAND_ALIAS);
  const owner = new Map();
  for (const [o, ip] of IP_MAP) {
    for (const item of collections[o]?.products ?? []) {
      const byBrand = nameToIp[item.brand?.toUpperCase()];
      if (byBrand && IP_MAP.some(([, s]) => s === byBrand) && collections[IP_MAP.find(([, s]) => s === byBrand)[0]]) {
        if (!owner.has(item.id) || owner.get(item.id).ip !== byBrand) owner.set(item.id, { ip: byBrand, item });
      } else if (!owner.has(item.id)) {
        owner.set(item.id, { ip, item });
      }
    }
  }

  // 候选系列
  const candidates = {};
  for (const [id, { ip, item }] of owner) {
    const p = products[id];
    if (!p) continue;
    const category = classify(p);
    if (REPORT) console.log(`[${ip}] ${category ? category.padEnd(8) : '  ✗     '} ${p.title}  (toys ${p.toys.length})`);
    if (!category) continue;
    const f = fields(p.desc);
    const releaseText = f['release date'] ?? f['launch time'];
    const releaseDate = parseDate(releaseText);
    const time = releaseDate ? Date.parse(releaseDate.length === 7 ? releaseDate + '-01' : releaseDate) / 1000 : item.upTime ?? 0;
    // MEGA 在单品中优先
    const sortKey = time + (category === 'mega' ? 180 * 86400 : 0);
    (candidates[ip] ??= []).push({ p, item, ip, category, f, releaseText, releaseDate, sortKey });
  }

  if (REPORT) return;
  const selected = [];
  for (const [, ip, tier] of IP_MAP) {
    // 多款盲盒系列优先，其次按时间
    const list = (candidates[ip] ?? []).sort(
      (a, b) => Number(b.p.toys.length > 1) - Number(a.p.toys.length > 1) || b.sortKey - a.sortKey,
    );
    selected.push(...list.slice(0, CAP[tier]));
    console.log(`${ip.padEnd(16)} 候选 ${String(list.length).padStart(3)} → 收录 ${Math.min(list.length, CAP[tier])}`);
  }

  // 图片任务
  let manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'));
  } catch {}

  const jobs = [];
  const want = (origin, ip, width) => origin && jobs.push({ origin, ip, width });
  for (const s of selected) {
    const banners = s.p.banners.length ? s.p.banners : [s.item.coverImg].filter(Boolean);
    banners.slice(0, 6).forEach((u) => want(u, s.ip, 1600));
    for (const t of s.p.toys) want(t.url, s.ip, 1100);
  }
  for (const [o, ip] of IP_MAP) {
    want(collections[o]?.mainImagePc, ip, 2400);
    want(collections[o]?.mainImage, ip, 1500);
  }
  const unique = [...new Map(jobs.map((j) => [j.origin, j])).values()];
  const todo = unique.filter((j) => !manifest[j.origin]);
  console.log(`图片：共 ${unique.length} 张，待处理 ${todo.length} 张`);

  let done = 0;
  await pool(todo, 24, async (j) => {
    await processImage(manifest, j.origin, j.ip, j.width);
    if (++done % 50 === 0) {
      console.log(`  已处理 ${done}/${todo.length}`);
      await fs.writeFile(MANIFEST, JSON.stringify(manifest));
    }
  });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest));

  // 生成图鉴
  const seriesOut = [];
  const productsOut = [];
  for (const s of selected) {
    const banners = (s.p.banners.length ? s.p.banners : [s.item.coverImg]).map((u) => manifest[u]).filter(Boolean);
    if (!banners.length) continue;
    const id = Number(s.p.id);
    const slug = `${id}-${slugify(s.p.title)}`;
    const toys = s.p.toys.filter((t) => manifest[t.url] && !/whole\s*set|full\s*set/i.test(t.name));
    const productSlugs = [];
    const used = new Set();
    const items = toys.length
      ? toys.map((t) => ({ name: t.name.replace(/\s*[（(]\s*secret\s*[)）]\s*/i, '').trim() || t.name, isSecret: t.type === 2 || /secret/i.test(t.name), image: manifest[t.url] }))
      : [{ name: s.p.title, isSecret: false, image: banners[0] }];
    items.forEach((it, i) => {
      let ps = `${id}-${slugify(it.name) || i + 1}`;
      while (used.has(ps)) ps += `-${i + 1}`;
      used.add(ps);
      productSlugs.push(ps);
      productsOut.push({ slug: ps, seriesId: id, ip: s.ip, name: it.name, isSecret: it.isSecret, index: i + 1, image: it.image });
    });
    seriesOut.push({
      id,
      slug,
      ip: s.ip,
      title: s.p.title.replace(/\s+/g, ' ').trim(),
      category: s.category,
      releaseDate: s.releaseDate,
      releaseText: s.releaseText,
      listedAt: s.item.upTime ?? 0,
      designer: s.f.designer && !/^pop\s*mart$/i.test(s.f.designer) ? s.f.designer : undefined,
      size: s.f.size ?? s.f.height,
      material: s.f.material,
      cover: banners[0],
      gallery: banners.slice(0, 6),
      products: productSlugs,
      secretCount: items.filter((i) => i.isSecret).length,
      boxesPerSet: Number(s.p.desc.match(/whole set contains\s+(\d+)/i)?.[1]) || undefined,
      officialUrl: s.p.url,
    });
  }

  const collectionsOut = {};
  for (const [o, ip] of IP_MAP) {
    const c = collections[o];
    if (!c) continue;
    collectionsOut[ip] = {
      desc: c.desc ?? '',
      banner: manifest[c.mainImagePc] ?? undefined,
      bannerMobile: manifest[c.mainImage] ?? undefined,
    };
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(
    OUT,
    JSON.stringify({ generatedAt: fetchedAt, series: seriesOut, products: productsOut, collections: collectionsOut }),
  );
  console.log(`✓ 系列 ${seriesOut.length} 个，产品 ${productsOut.length} 款 → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
