// 泡泡互动：前端调用 /api/chat/* 的封装（接口由 server.mjs 中的 chat 模块提供）

export type ChatRole = "user" | "admin";

export interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  role: ChatRole;
  muted: boolean;
}

export interface ChatMessage {
  id: number;
  text: string;
  createdAt: number;
  user: ChatUser;
}

export const MAX_MESSAGE_LENGTH = 500;
export const USERNAME_RULE = /^[\p{Script=Han}A-Za-z0-9_]+$/u;

export class ChatApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/chat/${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ChatApiError(0, "网络连接失败，请检查网络后重试");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new ChatApiError(res.status, data?.error ?? "聊天服务暂时不可用，请稍后再试");
  return data as T;
}

export const chatApi = {
  me: () => request<{ user: ChatUser | null }>("me"),
  stats: () => request<{ online: number }>("stats"),
  messages: (before?: number) =>
    request<{ messages: ChatMessage[]; hasMore: boolean }>(`messages${before ? `?before=${before}` : ""}`),
  login: (username: string, password: string) => request<{ user: ChatUser }>("login", { username, password }),
  register: (username: string, password: string) => request<{ user: ChatUser }>("register", { username, password }),
  logout: () => request<{ ok: true }>("logout", {}),
};

/** 与服务端一致的用户名校验，提前给出提示 */
export function checkUsername(name: string): string | null {
  const len = [...name].length;
  if (len < 2 || len > 16) return "用户名需要 2–16 个字符";
  if (!USERNAME_RULE.test(name)) return "用户名只能包含中文、字母、数字和下划线";
  return null;
}

export function checkPassword(pw: string): string | null {
  if (pw.length < 6) return "密码至少 6 位";
  if (pw.length > 72) return "密码不能超过 72 位";
  return null;
}
