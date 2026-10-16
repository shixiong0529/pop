#!/usr/bin/env bash
# 更新已部署的站点：拉取最新代码 → （依赖有变化才安装）→ 构建 → 平滑重启
# 用法：bash deploy/update.sh          没有新提交时直接退出
#       bash deploy/update.sh --force  强制重新安装、构建并重启
set -euo pipefail
cd "$(dirname "$0")/.."

FORCE=false
[ "${1:-}" = "--force" ] && FORCE=true

# 上一次成功部署的提交，记在 .next 里（.next 被清掉时会自动重新构建）
DEPLOYED_FILE=.next/.deployed-commit
LAST="$(cat "$DEPLOYED_FILE" 2>/dev/null || echo none)"

git pull --ff-only
HEAD_SHA="$(git rev-parse HEAD)"

# 判断 1：和上次部署的是同一个提交，就不用重新构建
if [ "$FORCE" = false ] && [ "$LAST" = "$HEAD_SHA" ]; then
  echo "没有新提交（当前 ${HEAD_SHA:0:7}），无需更新。需要强制重建请加 --force"
  exit 0
fi

# 判断 2：依赖文件没变，就跳过安装
deps_changed() {
  [ ! -d node_modules ] && return 0
  [ "$LAST" = none ] && return 0
  ! git diff --quiet "$LAST" HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml 2>/dev/null
}

if [ "$FORCE" = true ] || deps_changed; then
  pnpm install --frozen-lockfile
else
  echo "依赖没有变化，跳过安装"
fi

NODE_OPTIONS="--max-old-space-size=1536" pnpm build
pm2 reload pop
echo "$HEAD_SHA" > "$DEPLOYED_FILE"
echo "✓ 已更新到 ${HEAD_SHA:0:7}"
