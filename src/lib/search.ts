"use client";

import type Fuse from "fuse.js";

export type SearchKind = "ip" | "series" | "product";

/** 搜索索引条目（字段名保持简短以减小体积） */
export interface SearchEntry {
  t: SearchKind;
  /** 名称 */
  n: string;
  /** 中文名 / 描述 */
  z: string;
  /** 副标题 */
  s: string;
  /** 额外关键词（别名、拼音等） */
  k: string;
  h: string;
  i: string;
  c: string;
}

let fusePromise: Promise<Fuse<SearchEntry>> | null = null;

export function loadSearch() {
  fusePromise ??= Promise.all([fetch("/search-index").then((r) => r.json() as Promise<SearchEntry[]>), import("fuse.js")])
    .then(
      ([entries, { default: FuseCtor }]) =>
        new FuseCtor(entries, {
          keys: [
            { name: "n", weight: 3 },
            { name: "z", weight: 2.2 },
            { name: "k", weight: 1.4 },
            { name: "s", weight: 0.8 },
          ],
          threshold: 0.32,
          ignoreLocation: true,
          minMatchCharLength: 1,
          includeMatches: true,
        }),
    )
    .catch((err) => {
      fusePromise = null;
      throw err;
    });
  return fusePromise;
}

export const KIND_LABEL: Record<SearchKind, string> = { ip: "IP", series: "系列", product: "产品" };

export function groupResults(results: { item: SearchEntry }[], limits: Record<SearchKind, number>) {
  const groups: Record<SearchKind, SearchEntry[]> = { ip: [], series: [], product: [] };
  for (const { item } of results) {
    if (groups[item.t].length < limits[item.t]) groups[item.t].push(item);
  }
  return groups;
}
