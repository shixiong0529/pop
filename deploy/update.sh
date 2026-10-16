#!/usr/bin/env bash
# 更新已部署的站点：拉取最新代码 → 安装依赖 → 构建 → 平滑重启
# 用法：bash deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
pnpm install --frozen-lockfile
NODE_OPTIONS="--max-old-space-size=1536" pnpm build
pm2 reload pop
echo "✓ 已更新"
