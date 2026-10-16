#!/usr/bin/env bash
# 在全新的 Ubuntu 22.04 / 24.04 服务器上一键部署 POP ATLAS（以 root 运行）。
# 用法：bash deploy/setup-ubuntu.sh [站点地址，例如 http://101.133.227.55]
# 针对国内网络：Node 与 npm 均使用 npmmirror 镜像。
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SITE_URL="${1:-http://$(curl -s --max-time 5 ifconfig.me || hostname -I | awk '{print $1}')}"
NODE_MAJOR=24
MIRROR="https://npmmirror.com/mirrors/node"

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "请以 root 运行（或使用 sudo）"; exit 1
fi

log "1/7 创建交换分区（内存 2G 时构建需要）"
if ! swapon --show | grep -q .; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "已创建 4G swap"
else
  echo "已有 swap，跳过"
fi

log "2/7 安装 Nginx、Git 等基础软件"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx git curl xz-utils ca-certificates

log "3/7 安装 Node.js ${NODE_MAJOR}（npmmirror 镜像）"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  FILE=$(curl -fsSL "${MIRROR}/latest-v${NODE_MAJOR}.x/SHASUMS256.txt" | awk '/linux-x64.tar.xz$/ {print $2}')
  VERSION_DIR=$(echo "$FILE" | sed -E 's/^(node-v[0-9.]+)-linux-x64.tar.xz$/\1/')
  curl -fsSL "${MIRROR}/latest-v${NODE_MAJOR}.x/${FILE}" -o "/tmp/${FILE}"
  rm -rf /usr/local/lib/nodejs && mkdir -p /usr/local/lib/nodejs
  tar -xJf "/tmp/${FILE}" -C /usr/local/lib/nodejs
  ln -sf "/usr/local/lib/nodejs/${VERSION_DIR}/bin/"{node,npm,npx} /usr/local/bin/
fi
node -v

log "4/7 配置 npm 镜像并安装 pnpm、pm2"
npm config set registry https://registry.npmmirror.com
NODE_BIN="$(dirname "$(readlink -f "$(command -v node)")")"
npm install -g pnpm@11 pm2
ln -sf "${NODE_BIN}/pnpm" /usr/local/bin/pnpm
ln -sf "${NODE_BIN}/pm2" /usr/local/bin/pm2
pnpm config set registry https://registry.npmmirror.com

log "5/7 安装依赖并构建（约 3–8 分钟）"
cd "$APP_DIR"
pnpm install --frozen-lockfile
export NEXT_PUBLIC_SITE_URL="$SITE_URL"
echo "NEXT_PUBLIC_SITE_URL=$SITE_URL" > .env.production.local
NODE_OPTIONS="--max-old-space-size=1536" pnpm build

log "6/7 用 PM2 启动并设置开机自启"
pm2 delete pop >/dev/null 2>&1 || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null

log "7/7 配置 Nginx 反向代理"
cp deploy/nginx-pop.conf /etc/nginx/sites-available/pop
ln -sf /etc/nginx/sites-available/pop /etc/nginx/sites-enabled/pop
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx >/dev/null
systemctl reload nginx

log "部署完成：${SITE_URL}"
echo "如果浏览器打不开，请到阿里云控制台 → 安全组，放行入方向 TCP 80 端口。"
