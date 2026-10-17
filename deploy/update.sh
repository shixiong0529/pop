#!/usr/bin/env bash
# 更新已部署的站点：拉取最新代码 → （依赖有变化才安装）→ 构建 → 重启
# 用法：bash deploy/update.sh          没有新提交时直接退出
#       bash deploy/update.sh --force  强制重新安装、构建并重启
set -euo pipefail

# 整个流程放在函数里：bash 会先读完整个函数再执行，git pull 更新本脚本也不会影响这次运行
main() {
  cd "$(dirname "$0")/.."

  local FORCE=false
  [ "${1:-}" = "--force" ] && FORCE=true

  # 上一次成功部署的提交，记在 .next 里（.next 被清掉时会自动重新构建）
  local DEPLOYED_FILE=.next/.deployed-commit
  local LAST
  LAST="$(cat "$DEPLOYED_FILE" 2>/dev/null || echo none)"

  git pull --ff-only
  local HEAD_SHA
  HEAD_SHA="$(git rev-parse HEAD)"

  # 判断 1：和上次部署的是同一个提交，就不用重新构建
  if [ "$FORCE" = false ] && [ "$LAST" = "$HEAD_SHA" ]; then
    echo "没有新提交（当前 ${HEAD_SHA:0:7}），无需更新。需要强制重建请加 --force"
    exit 0
  fi

  # 判断 2：依赖文件没变，就跳过安装
  if [ "$FORCE" = true ] || deps_changed "$LAST"; then
    pnpm install --frozen-lockfile
  else
    echo "依赖没有变化，跳过安装"
  fi

  NODE_OPTIONS="--max-old-space-size=1536" pnpm build

  # 按 deploy/ecosystem.config.cjs 重新启动（配置有改动也能生效），并保存为开机自启
  pm2 delete pop >/dev/null 2>&1 || true
  pm2 start deploy/ecosystem.config.cjs
  pm2 save >/dev/null

  echo "$HEAD_SHA" > "$DEPLOYED_FILE"
  echo "✓ 已更新到 ${HEAD_SHA:0:7}"
}

deps_changed() {
  [ ! -d node_modules ] && return 0
  [ "$1" = none ] && return 0
  ! git diff --quiet "$1" HEAD -- package.json pnpm-lock.yaml pnpm-workspace.yaml 2>/dev/null
}

main "$@"; exit
