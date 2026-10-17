// 泡泡互动管理工具（在服务器上运行）
// 用法：
//   node scripts/chat-admin.mjs list               列出全部用户
//   node scripts/chat-admin.mjs grant  <用户名>     设为管理员
//   node scripts/chat-admin.mjs revoke <用户名>     取消管理员
//   node scripts/chat-admin.mjs mute   <用户名>     禁言
//   node scripts/chat-admin.mjs unmute <用户名>     解除禁言
//   node scripts/chat-admin.mjs purge  <用户名>     删除该用户的全部消息
//   node scripts/chat-admin.mjs backup             备份数据库到 data/backups/
// 数据库默认为 data/chat.db，可用环境变量 CHAT_DB_PATH 指定。网站运行中也可以直接执行，立即生效。
import fs from 'node:fs';
import path from 'node:path';
import { openDatabase } from '../chat/db.mjs';
import { usernameKey } from '../chat/security.mjs';

const [cmd, name] = process.argv.slice(2);
const dbPath = process.env.CHAT_DB_PATH ?? 'data/chat.db';
const { db, q } = openDatabase(dbPath);

function find() {
  if (!name) fail('请提供用户名');
  const user = q.userByKey.get(usernameKey(name.trim()));
  if (!user) fail(`找不到用户：${name}`);
  return user;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  db.close();
  process.exit(1);
}

switch (cmd) {
  case 'list': {
    const rows = q.listUsers.all();
    if (!rows.length) console.log('还没有注册用户');
    for (const u of rows) {
      const tags = [u.role === 'admin' ? '管理员' : '', u.muted ? '已禁言' : ''].filter(Boolean).join('、');
      console.log(`${String(u.id).padStart(4)}  ${u.username}${tags ? `（${tags}）` : ''}  注册于 ${new Date(Number(u.created_at)).toLocaleString('zh-CN')}`);
    }
    break;
  }
  case 'grant':
  case 'revoke': {
    const u = find();
    q.setRole.run(cmd === 'grant' ? 'admin' : 'user', u.id);
    console.log(`✓ ${u.username} ${cmd === 'grant' ? '已设为管理员' : '已取消管理员'}（刷新聊天页面后生效）`);
    break;
  }
  case 'mute':
  case 'unmute': {
    const u = find();
    q.setMuted.run(cmd === 'mute' ? 1 : 0, u.id);
    console.log(`✓ ${u.username} ${cmd === 'mute' ? '已被禁言' : '已解除禁言'}`);
    break;
  }
  case 'purge': {
    const u = find();
    const r = q.deleteUserMessages.run(Date.now(), 0, u.id);
    console.log(`✓ 已删除 ${u.username} 的 ${r.changes} 条消息（其他人刷新页面后不再显示）`);
    break;
  }
  case 'backup': {
    // VACUUM INTO 会生成一份完整一致的副本，网站运行中也可以安全执行
    const dir = path.join(path.dirname(path.resolve(dbPath)), 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toLocaleString('sv-SE', { hour12: false }).replace(/[-: ]/g, '').slice(0, 14);
    const file = path.join(dir, `chat-${stamp}.db`);
    db.exec(`VACUUM INTO '${file.replaceAll("'", "''")}'`);
    const shown = path.relative(process.cwd(), file);
    console.log(`✓ 已备份到 ${shown.startsWith('..') ? file : shown}（${(fs.statSync(file).size / 1024).toFixed(1)} KB）`);
    break;
  }
  default:
    console.log('用法：node scripts/chat-admin.mjs <list|grant|revoke|mute|unmute|purge|backup> [用户名]');
}

db.close();
