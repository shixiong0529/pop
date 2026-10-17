// 泡泡互动：密码哈希、会话令牌、Cookie、输入校验与限流
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

export const SESSION_COOKIE = 'pop_session';
export const SESSION_DAYS = 30;
export const MAX_MESSAGE_LENGTH = 500;

// ───────── 密码 ─────────
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verifyPassword(password, stored) {
  const [algo, N, r, p, saltB64, hashB64] = String(stored).split('$');
  if (algo !== 'scrypt') return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/** 用于在用户不存在时也执行一次哈希，避免通过响应时间探测用户名 */
export const DUMMY_HASH = await hashPassword(crypto.randomBytes(12).toString('hex'));

// ───────── 会话 ─────────
export function newSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      out[k] = part.slice(i + 1).trim();
    }
  }
  return out;
}

export function sessionCookie(token, { secure, clear = false } = {}) {
  const parts = [
    `${SESSION_COOKIE}=${clear ? '' : encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${clear ? 0 : SESSION_DAYS * 86400}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

// ───────── 输入校验 ─────────
const USERNAME_RE = /^[\p{Script=Han}A-Za-z0-9_]+$/u;
const RESERVED = new Set(['admin', 'administrator', 'root', 'system', 'popmart', 'popatlas', '管理员', '系统', '泡泡玛特', '官方']);

export function usernameKey(name) {
  return String(name).normalize('NFKC').toLowerCase();
}

/** 校验用户名，返回错误文案或 null */
export function checkUsername(name) {
  const n = String(name ?? '').normalize('NFKC').trim();
  const len = [...n].length;
  if (len < 2 || len > 16) return '用户名需要 2–16 个字符';
  if (!USERNAME_RE.test(n)) return '用户名只能包含中文、字母、数字和下划线';
  if (RESERVED.has(usernameKey(n))) return '这个用户名不可使用';
  return null;
}

export function checkPassword(pw) {
  const p = String(pw ?? '');
  if (p.length < 6) return '密码至少 6 位';
  if (p.length > 72) return '密码不能超过 72 位';
  return null;
}

/**
 * 清洗聊天内容：去掉控制字符、零宽字符与文字方向控制符，合并多余空行。
 * 内容在前端以纯文本渲染（React 自动转义），不会被当作 HTML 执行。
 */
export function cleanMessage(raw) {
  let text = String(raw ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    // 零宽字符与文字方向控制符（保留 U+200D，组合表情如 ❤️‍🔥 需要它）
    .replace(/[\u200B\u200C\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const length = [...text].length;
  if (!length) return { error: '消息不能为空' };
  if (length > MAX_MESSAGE_LENGTH) return { error: `消息不能超过 ${MAX_MESSAGE_LENGTH} 字` };
  return { text };
}

// ───────── 限流 ─────────
/** 简单的滑动窗口计数器：key 在 windowMs 内最多 limit 次 */
export function createLimiter({ limit, windowMs }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, list] of hits) {
      const kept = list.filter((t) => now - t < windowMs);
      if (kept.length) hits.set(k, kept);
      else hits.delete(k);
    }
  }, windowMs).unref();
  return {
    /** 记录一次并返回是否允许 */
    hit(key) {
      const now = Date.now();
      const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (list.length >= limit) {
        hits.set(key, list);
        return false;
      }
      list.push(now);
      hits.set(key, list);
      return true;
    },
    reset(key) {
      hits.delete(key);
    },
  };
}

/** 客户端 IP：只信任来自本机反向代理（Nginx）的转发头 */
export function clientIp(req) {
  const remote = req.socket?.remoteAddress ?? '';
  const fromProxy = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (fromProxy) {
    const real = req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    if (real) return real;
  }
  return remote;
}

export function isSecureRequest(req) {
  return req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket?.encrypted);
}

/** 同源检查：浏览器发起的请求必须来自本站页面 */
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers['x-forwarded-host'] || req.headers.host);
  } catch {
    return false;
  }
}

export function randomAvatarSeed() {
  return crypto.randomBytes(6).toString('hex');
}
