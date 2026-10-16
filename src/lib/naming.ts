import type { Series, SeriesCategory } from "./types";

export const CATEGORY_LABEL: Record<SeriesCategory, string> = {
  figure: "盲盒手办",
  plush: "搪胶毛绒",
  mega: "MEGA 珍藏",
  figurine: "手办摆件",
};

/**
 * 有把握的官方中文系列名（官网 id → 中文名）。
 * 没有把握的不翻译，保留官方英文名。
 */
export const OFFICIAL_ZH: Record<number, string> = {
  675: "前方高能",
  1372: "坐坐派对",
};

/** 品类后缀的中文对照，按从长到短匹配 */
const KIND_RULES: [RegExp, string][] = [
  [/reversible plush toy blind box/i, "双面毛绒盲盒"],
  [/vinyl plush pendant blind box/i, "搪胶毛绒挂件盲盒"],
  [/vinyl face plush blind box/i, "搪胶脸毛绒盲盒"],
  [/vinyl face blind box/i, "搪胶脸毛绒盲盒"],
  [/vinyl plush doll pendant/i, "搪胶毛绒挂件"],
  [/vinyl plush blister pack/i, "搪胶毛绒吸塑装"],
  [/vinyl plush hanging card/i, "搪胶毛绒挂卡"],
  [/vinyl plush blind box/i, "搪胶毛绒盲盒"],
  [/vinyl plush pendant/i, "搪胶毛绒挂件"],
  [/action vinyl doll/i, "可动搪胶公仔"],
  [/vinyl face doll/i, "搪胶脸毛绒公仔"],
  [/vinyl plush doll/i, "搪胶毛绒公仔"],
  [/plush doll pendant blind box/i, "毛绒挂件盲盒"],
  [/plush pendant blister pack/i, "毛绒挂件吸塑装"],
  [/plush pendant blind box/i, "毛绒挂件盲盒"],
  [/plush doll pendant/i, "毛绒挂件"],
  [/plush flower blind box/i, "毛绒花朵盲盒"],
  [/plush gift box/i, "毛绒礼盒"],
  [/plush hand puppet/i, "毛绒手偶"],
  [/cotton doll blind box/i, "棉花娃娃盲盒"],
  [/cotton doll/i, "棉花娃娃"],
  [/plush doll/i, "毛绒公仔"],
  [/\d+(\.\d+)?\s*inch plush/i, "毛绒公仔"],
  [/plush/i, "毛绒公仔"],
  [/1\/8 action figure/i, "1/8 可动人偶"],
  [/1\/6 action figure/i, "1/6 可动人偶"],
  [/action figure/i, "可动人偶"],
  [/scene sets?/i, "场景套组"],
  [/series figures/i, "系列手办"],
  [/figures/i, "手办"],
  [/figurine|figure/i, "手办"],
  [/blind box/i, "盲盒"],
];

const IP_PREFIX =
  /^(THE MONSTERS|LABUBU|MOLLY|SKULLPANDA|DIMOO WORLD|DIMOO|HIRONO|CRYBABY|TWINKLE TWINKLE|PUCKY|HACIPUPU|PEACH RIOT|KUBO|NYOTA|CHAKA|ZSIGA|POLAR|PINO JELLY|INOSOUL|TINY TINY|DUCKOO|MERODI|SWEET BEAN|1001MOONS|SUPERTUTU)\b\s*[-–—:：_]?\s*/i;

export interface SeriesName {
  /** 系列专名（官方英文） */
  name: string;
  /** 官方中文名（如有） */
  nameZh?: string;
  /** 品类中文描述 */
  kind: string;
}

const cache = new Map<number, SeriesName>();

/** 把官方英文标题拆为“系列专名 + 中文品类” */
export function seriesName(s: Pick<Series, "id" | "title" | "category">): SeriesName {
  const hit = cache.get(s.id);
  if (hit) return hit;
  const title = s.title.trim();
  let kind = "";
  let name = title;

  if (s.category === "mega") {
    kind = "MEGA 珍藏";
  } else {
    for (const [re, zh] of KIND_RULES) {
      const m = name.match(re);
      if (m && m.index !== undefined) {
        kind = zh;
        name = (name.slice(0, m.index) + name.slice(m.index + m[0].length)).trim();
        break;
      }
    }
  }

  name = name
    .replace(/\bseries\b/gi, "")
    .replace(/\s*[-–—]\s*$/g, "")
    .replace(/^\s*[-–—]\s*/g, "")
    .replace(/\s+[-–—]\s+/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const stripped = name.replace(IP_PREFIX, "").trim();
  if (stripped && !/^[×x]\s/i.test(stripped) && stripped.length >= 3 && s.category !== "mega") name = stripped;
  name = name.replace(/^[·\-–—:\s]+|[·\-–—:\s]+$/g, "") || title;

  const result: SeriesName = { name, nameZh: OFFICIAL_ZH[s.id], kind: kind || CATEGORY_LABEL[s.category] };
  cache.set(s.id, result);
  return result;
}

/** 用于页面标题、搜索的完整中文名 */
export function seriesFullName(s: Pick<Series, "id" | "title" | "category">) {
  const n = seriesName(s);
  return `${n.nameZh ? `${n.nameZh}（${n.name}）` : n.name} ${n.kind}`;
}

/** 日期展示：发售日优先，否则显示美国站上架时间 */
export function seriesDate(s: Pick<Series, "releaseDate" | "listedAt">): { label: string; value: string; year?: number } {
  if (s.releaseDate) {
    const v = s.releaseDate.replaceAll("-", ".");
    return { label: "发售日期", value: v, year: Number(s.releaseDate.slice(0, 4)) };
  }
  if (s.listedAt) {
    const d = new Date(s.listedAt * 1000);
    const v = `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    return { label: "官网上架", value: v, year: d.getUTCFullYear() };
  }
  return { label: "发售日期", value: "—" };
}

export function seriesTime(s: Pick<Series, "releaseDate" | "listedAt">) {
  if (s.releaseDate) return Date.parse(s.releaseDate.length === 7 ? `${s.releaseDate}-01` : s.releaseDate) / 1000;
  return s.listedAt;
}
