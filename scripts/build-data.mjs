// 把官网采集数据整理成本站图鉴：筛选潮玩系列 → 下载并处理图片 → 生成 catalog.json
// 用法：node scripts/build-data.mjs [--no-images] [--report]
// 已收录的系列会一直保留（即使官网已下架），新系列按排序规则加入，结束时输出本次更新摘要。
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { CAP, IP_LIST, allIPs, readAutoIPs } from './ips.mjs';

// 手写清单 + 自动登记的新 IP
const IP_MAP = allIPs();

const RAW_FILE = 'data/official/raw.json';
const IMG_DIR = 'public/images/catalog';
const MANIFEST = 'data/images.json';
const OUT = 'src/content/generated/catalog.json';
const SKIP_IMAGES = process.argv.includes('--no-images');
const REPORT = process.argv.includes('--report');

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

/** 美国太平洋时间是否处于夏令时（3 月第二个周日至 11 月第一个周日） */
function pacificDST(y, m, d) {
  const sunday = (month, nth) => {
    const dow = new Date(Date.UTC(y, month - 1, 1)).getUTCDay();
    return 1 + ((7 - dow) % 7) + 7 * (nth - 1);
  };
  if (m > 3 && m < 11) return true;
  if (m === 3) return d >= sunday(3, 2);
  if (m === 11) return d < sunday(11, 1);
  return false;
}

/**
 * 官网发售时刻（Unix 秒）。官网写的是美国太平洋时间，如 “October 22, 2026 at 5:00 PM (PST)”；
 * 没有具体时刻时按当天 0 点计。
 */
function parseReleaseAt(text, date) {
  if (!text || !date || date.length !== 10) return undefined;
  const [y, m, d] = date.split('-').map(Number);
  const t = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let h = t ? Number(t[1]) % 12 : 0;
  if (t && /pm/i.test(t[3])) h += 12;
  const offset = pacificDST(y, m, d) ? 7 : 8;
  return Date.UTC(y, m - 1, d, h + offset, t ? Number(t[2]) : 0) / 1000;
}

// ───────── 自动收录 IP 的主题色 ─────────
function hexToHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

/** 由产品图主色推算一套柔和的展厅配色 */
function themeFrom(hex = '#c9c4bd') {
  let [h, s] = hexToHsl(hex);
  // 主色接近灰色时没有可靠的色相，改用暖灰
  if (s < 0.08) [h, s] = [30, 0.12];
  const sat = Math.min(Math.max(s, 0.2), 0.6);
  return {
    bg: hslToHex(h, Math.min(sat, 0.42), 0.93),
    surface: hslToHex(h, Math.min(sat, 0.35), 0.975),
    accent: hslToHex(h, Math.max(sat, 0.45), 0.4),
    ink: hslToHex(h, 0.3, 0.13),
    glow: [hslToHex(h, 0.65, 0.82), hslToHex((h + 40) % 360, 0.55, 0.85)],
  };
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
  const raw = JSON.parse(await fs.readFile(RAW_FILE, 'utf8'));
  const { collections, products, fetchedAt } = raw;

  // 上一次生成的图鉴：已收录的系列一直保留
  let prev = { series: [], products: [] };
  try {
    prev = JSON.parse(await fs.readFile(OUT, 'utf8'));
  } catch {}
  const prevSeries = new Map(prev.series.map((s) => [Number(s.id), s]));

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

  // 官网已下架、但之前收录过的系列：保留在图鉴中
  const listed = new Set([...owner.keys()].map(Number));
  let delisted = 0;
  for (const [id, prevS] of prevSeries) {
    if (listed.has(id) || !products[id]) continue;
    owner.set(id, { ip: prevS.ip, item: { id, upTime: prevS.listedAt, coverImg: '' } });
    delisted++;
  }

  // 候选系列
  const candidates = {};
  for (const [id, { ip, item }] of owner) {
    const p = products[id];
    if (!p) continue;
    const category = classify(p) ?? prevSeries.get(Number(id))?.category;
    if (REPORT) console.log(`[${ip}] ${category ? category.padEnd(8) : '  ✗     '} ${p.title}  (toys ${p.toys.length})`);
    if (!category) continue;
    const f = fields(p.desc);
    // 发售时间：较早的商品写作 Release Date，较新的写作 Online Release (Official Website)
    const onlineText = p.desc.match(/Online Release[^:：\n]*[:：][ \t]*([^\n]+)/i)?.[1]?.trim();
    const releaseText = f['release date'] ?? f['launch time'] ?? onlineText;
    const releaseDate = parseDate(releaseText);
    const releaseAt = parseReleaseAt(releaseText, releaseDate);
    const time = releaseDate ? Date.parse(releaseDate.length === 7 ? releaseDate + '-01' : releaseDate) / 1000 : item.upTime ?? 0;
    // MEGA 在单品中优先
    const sortKey = time + (category === 'mega' ? 180 * 86400 : 0);
    (candidates[ip] ??= []).push({ p, item, ip, category, f, releaseText, releaseDate, releaseAt, sortKey });
  }

  if (REPORT) return;
  const selected = [];
  for (const [, ip, tier] of IP_MAP) {
    // 多款盲盒系列优先，其次按时间
    const list = (candidates[ip] ?? []).sort(
      (a, b) => Number(b.p.toys.length > 1) - Number(a.p.toys.length > 1) || b.sortKey - a.sortKey,
    );
    // 已收录的全部保留；新系列只收录排在上限以内的（新品通常排在前面）
    const top = new Set(list.slice(0, CAP[tier]));
    const chosen = list.filter((c) => prevSeries.has(Number(c.p.id)) || top.has(c));
    selected.push(...chosen);
    console.log(`${ip.padEnd(16)} 候选 ${String(list.length).padStart(3)} → 收录 ${chosen.length}`);
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
      releaseAt: s.releaseAt,
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

  // 自动收录的 IP：展厅内容全部取自官网数据，网站上标注为示例数据
  const manualOfficial = new Set(IP_LIST.map(([o]) => o));
  const autoIpsOut = readAutoIPs()
    .filter((a) => !manualOfficial.has(a.official))
    .map((a) => {
      const c = collections[a.official];
      const first = seriesOut.find((s) => s.ip === a.slug);
      return {
        slug: a.slug,
        officialSlug: a.official,
        name: c?.name ?? a.name,
        addedAt: a.addedAt,
        theme: themeFrom(first?.cover.color ?? collectionsOut[a.slug]?.banner?.color),
      };
    });

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(
    OUT,
    JSON.stringify({
      generatedAt: fetchedAt,
      series: seriesOut,
      products: productsOut,
      collections: collectionsOut,
      autoIps: autoIpsOut,
    }),
  );
  console.log(`✓ 系列 ${seriesOut.length} 个，产品 ${productsOut.length} 款 → ${OUT}`);

  // ───────── 本次更新摘要 ─────────
  if (prev.series.length) {
    const ipName = (slug) => slug.toUpperCase();
    const prevSlugs = new Set(prev.products.map((p) => p.slug));
    const added = seriesOut.filter((s) => !prevSeries.has(s.id));
    const addedProducts = productsOut.filter((p) => !prevSlugs.has(p.slug));
    const kept = new Set(seriesOut.map((s) => s.id));
    const lost = [...prevSeries.values()].filter((s) => !kept.has(Number(s.id)));
    console.log('\n── 本次更新 ──');
    console.log(`新增系列 ${added.length} 个，新增单品 ${addedProducts.length} 款`);
    for (const s of added) console.log(`  + [${ipName(s.ip)}] ${s.title}（${s.products.length} 款）`);
    if (delisted) console.log(`官网已下架、仍保留在图鉴中的系列：${delisted} 个`);
    if (lost.length) {
      console.log(`⚠ 有 ${lost.length} 个系列没能保留（通常是缺少图片或商品详情）：`);
      for (const s of lost) console.log(`  - [${ipName(s.ip)}] ${s.title}`);
    }
    const prevAuto = new Set((prev.autoIps ?? []).map((a) => a.slug));
    const newAuto = autoIpsOut.filter((a) => !prevAuto.has(a.slug));
    for (const a of newAuto) {
      const n = seriesOut.filter((s) => s.ip === a.slug).length;
      console.log(`★ 新收录 IP：${a.name}（${n} 个系列，展厅故事待补充 → /ips/${a.slug}）`);
    }
    if (!added.length && !addedProducts.length && !lost.length && !newAuto.length) console.log('内容没有变化。');
  }
  const known = new Set(IP_MAP.map(([o]) => o));
  const freshIPs = (raw.officialCharacters ?? []).filter((c) => !known.has(c.slug));
  if (freshIPs.length) {
    console.log(`\n⚠ 官网有 ${freshIPs.length} 个本站尚未收录的 IP：${freshIPs.map((c) => c.name).join('、')}`);
    console.log('  全量运行 pnpm data:update 即可自动收录。');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
