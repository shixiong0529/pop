// PM2 进程配置：pm2 start deploy/ecosystem.config.cjs
// server.mjs 在同一个端口上同时提供网站（Next.js）和「泡泡互动」聊天（接口 + WebSocket）
module.exports = {
  apps: [
    {
      name: "pop",
      cwd: __dirname + "/..",
      script: "server.mjs",
      env: { NODE_ENV: "production", PORT: "3000", HOST: "127.0.0.1" },
      // 聊天在线状态保存在进程内存里，只能运行一个实例
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "800M",
      kill_timeout: 5000,
      time: true,
    },
  ],
};
