// 自定义服务器：同一个端口同时提供网站（Next.js）与「泡泡互动」聊天（/api/chat/* 与 Socket.IO）
// 用法：pnpm dev（开发，默认端口 3002）/ pnpm start（生产，默认端口 3000）；可加 -p 端口或设置 PORT
import { createServer } from 'node:http';
import next from 'next';
import { createChat } from './chat/index.mjs';

const argv = process.argv.slice(2);
const portIndex = argv.findIndex((a) => a === '-p' || a === '--port');
const dev = process.env.NODE_ENV !== 'production';
// 开发默认用 3002，避免和本机其它项目抢 3000；服务器上由 PM2 配置指定 PORT=3000
const port = Number(portIndex >= 0 ? argv[portIndex + 1] : (process.env.PORT ?? (dev ? 3002 : 3000)));
const hostname = process.env.HOST ?? (dev ? 'localhost' : '127.0.0.1');

let chat;
const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/chat/')) return void chat.handle(req, res);
  if (req.url?.startsWith('/socket.io/')) return; // 由 Socket.IO 处理
  handle(req, res);
});

const app = next({ dev, hostname, port, httpServer: server });
const handle = app.getRequestHandler();
await app.prepare();

chat = createChat(server, { dbPath: process.env.CHAT_DB_PATH ?? 'data/chat.db' });

server.listen(port, hostname, () => {
  console.log(`> POP ATLAS 已启动：http://${hostname}:${port}（${dev ? '开发' : '生产'}模式）`);
});

const shutdown = () => {
  chat.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
