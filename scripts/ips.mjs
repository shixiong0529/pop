// 本站收录的 IP：[官网合集 slug, 本站 IP slug, 层级]，顺序即归属优先级。
// 采集脚本与生成脚本共用这份清单。
// 新增 IP：在这里加一行，并在 src/content/ips/ 新建故事文件、加入 src/content/ips/index.ts。
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
