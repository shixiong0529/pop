// PM2 进程配置：pm2 start deploy/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "pop",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      instances: 1,
      autorestart: true,
      max_memory_restart: "800M",
      time: true,
    },
  ],
};
