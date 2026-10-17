"use client";

import { create } from "zustand";
import { chatApi, type ChatUser } from "./api";

export type AuthStatus = "loading" | "guest" | "authed" | "error";
export type AuthModal = "login" | "register" | null;

interface ChatAuthState {
  status: AuthStatus;
  user: ChatUser | null;
  modal: AuthModal;
  /** 刚登录 / 注册时的欢迎提示 */
  greeting: string | null;
  /** 读取登录状态（Cookie 由服务端保存，刷新页面后依然有效） */
  refresh: () => Promise<void>;
  signedIn: (user: ChatUser, greeting: string) => void;
  patchUser: (user: Partial<ChatUser>) => void;
  signedOut: () => void;
  logout: () => Promise<void>;
  openModal: (modal: Exclude<AuthModal, null>) => void;
  closeModal: () => void;
  clearGreeting: () => void;
}

export const useChatAuth = create<ChatAuthState>()((set) => ({
  status: "loading",
  user: null,
  modal: null,
  greeting: null,
  async refresh() {
    try {
      const { user } = await chatApi.me();
      set({ user, status: user ? "authed" : "guest" });
    } catch {
      set({ user: null, status: "error" });
    }
  },
  signedIn: (user, greeting) => set({ user, status: "authed", modal: null, greeting }),
  patchUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : {})),
  signedOut: () => set({ user: null, status: "guest" }),
  async logout() {
    try {
      await chatApi.logout();
    } finally {
      set({ user: null, status: "guest" });
    }
  },
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  clearGreeting: () => set({ greeting: null }),
}));
