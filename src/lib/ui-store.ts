"use client";

import { create } from "zustand";

interface UIState {
  searchOpen: boolean;
  menuOpen: boolean;
  setSearch: (open: boolean) => void;
  setMenu: (open: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  searchOpen: false,
  menuOpen: false,
  setSearch: (searchOpen) => set({ searchOpen, menuOpen: false }),
  setMenu: (menuOpen) => set({ menuOpen }),
}));
