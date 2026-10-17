// 泡泡互动：基于 Socket.IO 的实时聊天
import { Server } from 'socket.io';
import { toMessage, toPublicUser } from './db.mjs';
import { SESSION_COOKIE, cleanMessage, createLimiter, hashToken, parseCookies, sameOrigin } from './security.mjs';

const MIN_INTERVAL_MS = 600;
const DUPLICATE_WINDOW_MS = 20_000;

export function attachRealtime(server, { q }) {
  const io = new Server(server, {
    path: '/socket.io',
    serveClient: false,
    // 不销毁其它路径的 WebSocket 升级请求（开发模式下 Next.js 热更新也用 WebSocket）
    destroyUpgrade: false,
    maxHttpBufferSize: 16 * 1024,
    pingInterval: 25_000,
    pingTimeout: 20_000,
    // 只接受本站页面发起的连接，防止跨站 WebSocket 劫持
    allowRequest: (req, cb) => cb(null, sameOrigin(req)),
  });

  /** userId → 在线连接数 */
  const online = new Map();
  /** 会话 → 连接，退出登录时断开 */
  const bySession = new Map();
  /** userId → 上一条消息（防刷屏） */
  const lastSent = new Map();
  const burst = createLimiter({ limit: 6, windowMs: 15_000 });

  const broadcastPresence = () => io.emit('presence', { online: online.size });

  io.use((socket, next) => {
    const token = parseCookies(socket.request.headers.cookie)[SESSION_COOKIE];
    const tokenHash = token ? hashToken(token) : '';
    const user = tokenHash ? q.sessionUser.get(tokenHash, Date.now()) : null;
    if (!user) return next(new Error('unauthorized'));
    socket.data.userId = Number(user.id);
    socket.data.tokenHash = tokenHash;
    next();
  });

  io.on('connection', (socket) => {
    const { userId, tokenHash } = socket.data;
    online.set(userId, (online.get(userId) ?? 0) + 1);
    if (!bySession.has(tokenHash)) bySession.set(tokenHash, new Set());
    bySession.get(tokenHash).add(socket);
    broadcastPresence();

    /** 每次操作都从数据库读取最新的用户状态（角色、禁言） */
    const me = () => q.userById.get(userId);
    const reply = (ack, data) => typeof ack === 'function' && ack(data);

    socket.on('message:send', (payload, ack) => {
      const user = me();
      if (!user) return reply(ack, { ok: false, error: '账号不存在，请重新登录' });
      if (user.muted) return reply(ack, { ok: false, error: '你已被管理员禁言' });

      const { text, error } = cleanMessage(payload?.text);
      if (error) return reply(ack, { ok: false, error });

      const now = Date.now();
      const last = lastSent.get(userId);
      if (last && now - last.at < MIN_INTERVAL_MS) return reply(ack, { ok: false, error: '发送太快了，歇一下吧' });
      if (last && last.text === text && now - last.at < DUPLICATE_WINDOW_MS) {
        return reply(ack, { ok: false, error: '请不要重复发送相同的内容' });
      }
      if (!burst.hit(userId)) return reply(ack, { ok: false, error: '发言太频繁，请稍后再试' });

      const id = Number(q.insertMessage.run(userId, text, now).lastInsertRowid);
      lastSent.set(userId, { at: now, text });
      const message = toMessage({
        id,
        body: text,
        created_at: now,
        user_id: user.id,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        muted: user.muted,
      });
      io.emit('message:new', message);
      reply(ack, { ok: true, id });
    });

    socket.on('message:delete', (payload, ack) => {
      const user = me();
      const id = Number(payload?.id);
      const msg = Number.isInteger(id) ? q.messageById.get(id) : null;
      if (!user || !msg || msg.deleted_at) return reply(ack, { ok: false, error: '消息不存在或已删除' });
      const isOwner = Number(msg.user_id) === userId;
      if (!isOwner && user.role !== 'admin') return reply(ack, { ok: false, error: '只能删除自己的消息' });
      q.deleteMessage.run(Date.now(), userId, id);
      io.emit('message:deleted', { id, byAdmin: !isOwner });
      reply(ack, { ok: true });
    });

    // 管理员：禁言 / 解除禁言
    socket.on('admin:mute', (payload, ack) => {
      const user = me();
      if (user?.role !== 'admin') return reply(ack, { ok: false, error: '没有权限' });
      const target = q.userById.get(Number(payload?.userId));
      if (!target) return reply(ack, { ok: false, error: '用户不存在' });
      if (target.role === 'admin') return reply(ack, { ok: false, error: '不能禁言管理员' });
      q.setMuted.run(payload?.muted ? 1 : 0, target.id);
      io.emit('user:updated', toPublicUser(q.userById.get(target.id)));
      reply(ack, { ok: true });
    });

    socket.on('disconnect', () => {
      const n = (online.get(userId) ?? 1) - 1;
      if (n > 0) online.set(userId, n);
      else online.delete(userId);
      bySession.get(tokenHash)?.delete(socket);
      if (!bySession.get(tokenHash)?.size) bySession.delete(tokenHash);
      broadcastPresence();
    });
  });

  return {
    io,
    onlineCount: () => online.size,
    /** 退出登录后断开该会话的所有连接 */
    disconnectSession(tokenHash) {
      for (const socket of bySession.get(tokenHash) ?? []) socket.disconnect(true);
    },
  };
}
