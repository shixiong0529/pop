"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { chatApi, type ChatMessage, type ChatUser } from "@/lib/chat/api";
import { useChatAuth } from "@/lib/chat/auth";

export type Connection = "connecting" | "online" | "offline";
export type Ack = { ok: boolean; error?: string; id?: number };

const ACK_TIMEOUT = 8000;

/** 聊天室的实时连接与消息状态（Socket.IO + 历史记录分页） */
export function useChatRoom(user: ChatUser) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [online, setOnline] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const userId = user.id;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /** 拉取最新一页，与已有消息合并（断线重连后补齐期间的消息） */
  const syncLatest = useCallback(async () => {
    try {
      const page = await chatApi.messages();
      const prev = messagesRef.current;
      const fresh = page.messages;
      const oldest = fresh[0]?.id ?? Infinity;
      const newest = fresh.at(-1)?.id ?? 0;
      const gap = !prev.length || !fresh.length || oldest > (prev.at(-1)?.id ?? 0);
      setMessages((cur) => [
        ...(gap ? [] : cur.filter((m) => m.id < oldest)),
        ...fresh,
        ...cur.filter((m) => m.id > newest),
      ]);
      if (gap) setHasMore(page.hasMore);
      setLoaded(true);
    } catch (err) {
      if ((err as { status?: number }).status === 401) void useChatAuth.getState().refresh();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;

    (async () => {
      const { io } = await import("socket.io-client");
      if (cancelled) return;
      socket = io({ path: "/socket.io", withCredentials: true, reconnectionDelayMax: 8000 });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnection("online");
        void syncLatest();
      });
      socket.on("disconnect", async (reason) => {
        setConnection("connecting");
        // 服务端主动断开（例如在其它标签页退出了登录）：确认登录状态后再决定是否重连
        if (reason === "io server disconnect") {
          await useChatAuth.getState().refresh();
          if (useChatAuth.getState().status === "authed") socket?.connect();
          else setConnection("offline");
        }
      });
      socket.on("connect_error", (err) => {
        if (err.message === "unauthorized") {
          setConnection("offline");
          void useChatAuth.getState().refresh();
        } else setConnection("connecting");
      });
      socket.on("presence", ({ online }: { online: number }) => setOnline(online));
      socket.on("message:new", (msg: ChatMessage) => {
        setMessages((cur) => (cur.some((m) => m.id === msg.id) ? cur : [...cur, msg]));
      });
      socket.on("message:deleted", ({ id }: { id: number }) => {
        setMessages((cur) => cur.filter((m) => m.id !== id));
      });
      socket.on("user:updated", (u: ChatUser) => {
        setMessages((cur) => cur.map((m) => (m.user.id === u.id ? { ...m, user: { ...m.user, ...u } } : m)));
        if (u.id === userId) useChatAuth.getState().patchUser(u);
      });
    })();

    return () => {
      cancelled = true;
      socket?.removeAllListeners();
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [userId, syncLatest]);

  const emit = useCallback((event: string, payload: unknown) => {
    return new Promise<Ack>((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) return resolve({ ok: false, error: "连接已断开，正在重新连接…" });
      socket.timeout(ACK_TIMEOUT).emit(event, payload, (err: Error | null, res: Ack) => {
        resolve(err ? { ok: false, error: "网络有点慢，请稍后再试" } : res);
      });
    });
  }, []);

  const send = useCallback((text: string) => emit("message:send", { text }), [emit]);
  const remove = useCallback((id: number) => emit("message:delete", { id }), [emit]);
  const mute = useCallback((targetId: number, muted: boolean) => emit("admin:mute", { userId: targetId, muted }), [emit]);

  const loadMore = useCallback(async () => {
    const first = messagesRef.current[0];
    if (!first || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const page = await chatApi.messages(first.id);
      setMessages((cur) => [...page.messages.filter((m) => !cur.some((c) => c.id === m.id)), ...cur]);
      setHasMore(page.hasMore);
    } catch {
      // 加载失败时保留“查看更早的消息”按钮，用户可再次点击
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  return { messages, hasMore, loaded, loadingMore, connection, online, send, remove, mute, loadMore };
}
