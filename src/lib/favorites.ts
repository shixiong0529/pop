"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteKind = "ip" | "series" | "product";

/** 收藏时保存展示所需的最小信息，收藏页无需加载完整图鉴数据 */
export interface FavoriteItem {
  kind: FavoriteKind;
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  image: string;
  color: string;
  addedAt: number;
}

interface FavoritesState {
  items: FavoriteItem[];
  toggle: (item: Omit<FavoriteItem, "addedAt">) => boolean;
  remove: (kind: FavoriteKind, key: string) => void;
  clear: (kind?: FavoriteKind) => void;
}

const id = (kind: FavoriteKind, key: string) => `${kind}:${key}`;

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => id(i.kind, i.key) === id(item.kind, item.key));
        set((s) => ({
          items: exists
            ? s.items.filter((i) => id(i.kind, i.key) !== id(item.kind, item.key))
            : [{ ...item, addedAt: Date.now() }, ...s.items],
        }));
        return !exists;
      },
      remove: (kind, key) => set((s) => ({ items: s.items.filter((i) => id(i.kind, i.key) !== id(kind, key)) })),
      clear: (kind) => set((s) => ({ items: kind ? s.items.filter((i) => i.kind !== kind) : [] })),
    }),
    {
      name: "pop-atlas:favorites",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export const isFavorite = (items: FavoriteItem[], kind: FavoriteKind, key: string) =>
  items.some((i) => i.kind === kind && i.key === key);
