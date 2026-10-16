// 本站收录的 IP：[官网合集 slug, 本站 IP slug, 层级]，顺序即归属优先级。
// 采集脚本与生成脚本共用这份清单。
// 官网出现的新 IP 会被自动登记到 data/auto-ips.json，网站先用官网数据生成占位展厅；
// 为它写好正式故事后，在这里加一行，并在 src/content/ips/ 新建故事文件、加入 index.ts。
import fs from 'node:fs';

export const IP_LIST = [
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

/** 每个 IP 首次收录的系列上限；已收录的系列之后会一直保留 */
export const CAP = { core: 40, featured: 20, rising: 12 };

/** 官网角色菜单里不属于单个 IP 的入口 */
export const NON_IP_COLLECTIONS = new Set(['characters-all']);

/** 自动登记的新 IP 清单 */
export const AUTO_FILE = 'data/auto-ips.json';

/** @returns {{ official: string, slug: string, name: string, addedAt: string }[]} */
export function readAutoIPs() {
  try {
    return JSON.parse(fs.readFileSync(AUTO_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export function writeAutoIPs(list) {
  fs.writeFileSync(AUTO_FILE, JSON.stringify(list, null, 2) + '\n');
}

/** 手写清单 + 自动登记的 IP（手写优先，自动登记的一律为新锐层级） */
export function allIPs() {
  const manual = new Set(IP_LIST.map(([official]) => official));
  const auto = readAutoIPs()
    .filter((a) => !manual.has(a.official))
    .map((a) => [a.official, a.slug, 'rising']);
  return [...IP_LIST, ...auto];
}

/** 由官网合集 slug 生成本站 slug，避免与已有 IP 重名 */
export function siteSlugFor(official, taken) {
  let slug = official.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'ip';
  while (taken.has(slug)) slug += '-ip';
  return slug;
}
