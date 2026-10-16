"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** 客户端水合完成后返回 true，用于读取 localStorage 等仅客户端状态 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
