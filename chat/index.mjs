// 泡泡互动：把数据库、HTTP 接口与实时通信组装到网站的 HTTP 服务器上
import { openDatabase } from './db.mjs';
import { createHttpApi } from './http.mjs';
import { attachRealtime } from './realtime.mjs';

export function createChat(server, { dbPath }) {
  const { db, q } = openDatabase(dbPath);
  const realtime = attachRealtime(server, { q });
  const handle = createHttpApi({ q, realtime });

  return {
    handle,
    close() {
      realtime.io.close();
      db.close();
    },
  };
}
