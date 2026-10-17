// 泡泡互动：HTTP 接口（/api/chat/*）
import { toMessage, toPublicUser } from './db.mjs';
import {
  DUMMY_HASH,
  SESSION_COOKIE,
  SESSION_DAYS,
  checkPassword,
  checkUsername,
  clientIp,
  createLimiter,
  hashPassword,
  hashToken,
  isSecureRequest,
  newSessionToken,
  parseCookies,
  randomAvatarSeed,
  sameOrigin,
  sessionCookie,
  usernameKey,
  verifyPassword,
} from './security.mjs';

const MAX_BODY = 4096;
const PAGE_SIZE = 40;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (!String(req.headers['content-type'] ?? '').includes('application/json')) {
      return reject(new HttpError(415, '请求格式不正确'));
    }
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, '请求内容过大'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new HttpError(400, '请求格式不正确'));
      }
    });
    req.on('error', reject);
  });
}

export function createHttpApi({ q, realtime }) {
  const registerLimit = createLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });
  const loginLimit = createLimiter({ limit: 20, windowMs: 15 * 60 * 1000 });
  const loginFailLimit = createLimiter({ limit: 8, windowMs: 15 * 60 * 1000 });

  // 每小时清理过期会话
  setInterval(() => q.purgeSessions.run(Date.now()), 60 * 60 * 1000).unref();

  function currentSession(req) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    if (!token) return null;
    const tokenHash = hashToken(token);
    const user = q.sessionUser.get(tokenHash, Date.now());
    return user ? { user, tokenHash } : null;
  }

  function startSession(res, req, userId) {
    const token = newSessionToken();
    const now = Date.now();
    q.insertSession.run(hashToken(token), userId, now, now + SESSION_DAYS * 86400 * 1000);
    return sessionCookie(token, { secure: isSecureRequest(req) });
  }

  const routes = {
    'GET /api/chat/me': (req) => {
      const s = currentSession(req);
      return { user: s ? toPublicUser(s.user) : null };
    },

    'GET /api/chat/stats': () => ({ online: realtime.onlineCount() }),

    'GET /api/chat/messages': (req, res, url) => {
      if (!currentSession(req)) throw new HttpError(401, '请先登录');
      const before = Number(url.searchParams.get('before'));
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || PAGE_SIZE, 1), 50);
      const rows = before > 0 ? q.messagesBefore.all(before, limit) : q.latestMessages.all(limit);
      return { messages: rows.reverse().map(toMessage), hasMore: rows.length === limit };
    },

    'POST /api/chat/register': async (req, res) => {
      const ip = clientIp(req);
      const body = await readJson(req);
      const nameError = checkUsername(body.username);
      if (nameError) throw new HttpError(400, nameError);
      const pwError = checkPassword(body.password);
      if (pwError) throw new HttpError(400, pwError);
      if (!registerLimit.hit(ip)) throw new HttpError(429, '注册太频繁，请稍后再试');

      const username = String(body.username).normalize('NFKC').trim();
      const key = usernameKey(username);
      if (q.userByKey.get(key)) throw new HttpError(409, '这个用户名已经被使用了');
      const hash = await hashPassword(String(body.password));
      let id;
      try {
        id = Number(q.insertUser.run(username, key, hash, randomAvatarSeed(), 'user', Date.now()).lastInsertRowid);
      } catch {
        throw new HttpError(409, '这个用户名已经被使用了');
      }
      const cookie = startSession(res, req, id);
      return [201, { user: toPublicUser(q.userById.get(id)) }, { 'Set-Cookie': cookie }];
    },

    'POST /api/chat/login': async (req, res) => {
      const ip = clientIp(req);
      const body = await readJson(req);
      const key = usernameKey(String(body.username ?? '').trim());
      const failKey = `${ip}|${key}`;
      if (!loginLimit.hit(ip)) throw new HttpError(429, '尝试次数过多，请稍后再试');
      const user = key ? q.userByKey.get(key) : null;
      const ok = await verifyPassword(String(body.password ?? ''), user ? user.password_hash : DUMMY_HASH);
      if (!user || !ok) {
        if (!loginFailLimit.hit(failKey)) throw new HttpError(429, '密码错误次数过多，请 15 分钟后再试');
        throw new HttpError(401, '用户名或密码不正确');
      }
      loginFailLimit.reset(failKey);
      const cookie = startSession(res, req, user.id);
      return [200, { user: toPublicUser(user) }, { 'Set-Cookie': cookie }];
    },

    'POST /api/chat/logout': (req) => {
      const s = currentSession(req);
      if (s) {
        q.deleteSession.run(s.tokenHash);
        realtime.disconnectSession(s.tokenHash);
      }
      return [200, { ok: true }, { 'Set-Cookie': sessionCookie('', { secure: isSecureRequest(req), clear: true }) }];
    },
  };

  return async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const route = routes[`${req.method} ${url.pathname}`];
    try {
      if (!route) throw new HttpError(404, '接口不存在');
      if (req.method !== 'GET' && !sameOrigin(req)) throw new HttpError(403, '请求来源不合法');
      const result = await route(req, res, url);
      if (Array.isArray(result)) send(res, result[0], result[1], result[2]);
      else send(res, 200, result);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error('[chat]', err);
      if (!res.headersSent) send(res, status, { error: status === 500 ? '服务器开小差了，请稍后再试' : err.message });
    }
  };
}
