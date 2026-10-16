"use client";

import { useEffect } from "react";
import { useFavorites } from "@/lib/favorites";

/** 收藏数据在客户端挂载后再从 localStorage 恢复，避免水合不一致 */
export function FavoritesHydrator() {
  useEffect(() => {
    try {
      useFavorites.persist.rehydrate();
    } catch {
      // 隐私模式等场景下 localStorage 不可用，收藏仅保存在内存中
    }
  }, []);
  return null;
}
