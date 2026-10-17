# 部署到阿里云服务器（Ubuntu）

部署方式：代码托管在 GitHub，服务器从 GitHub 拉取代码，在服务器上构建，用 PM2 运行，再由 Nginx 对外提供服务。

```
本地修改 → git push → GitHub → 服务器 git pull → pnpm build → pm2 重启
```

适用环境：Ubuntu 22.04 / 24.04，2 核 2 GiB 及以上。项目针对国内网络做了处理：

- 字体已自托管，构建时不访问 Google Fonts。
- Node 和 npm 使用 npmmirror 镜像。

## 一、首次部署（在服务器上执行）

用 Termius 以 root 登录服务器，依次执行：

```bash
apt-get update && apt-get install -y git
```

```bash
git clone https://github.com/shixiong0529/pop.git /var/www/pop
```

```bash
cd /var/www/pop && bash deploy/setup-ubuntu.sh http://101.133.227.55
```

`setup-ubuntu.sh` 会自动完成以下几步：

1. 创建 4G swap，避免 2G 内存在构建时不够用。
2. 安装 Nginx。
3. 安装 Node.js 24、pnpm 和 PM2。
4. 安装依赖并构建，大约需要 3–8 分钟。
5. 用 PM2 启动站点，并设置开机自启。
6. 配置 Nginx，把 80 端口转发到站点。

完成后，在浏览器打开 `http://101.133.227.55`。

如果打不开，到阿里云控制台 → 云服务器 ECS → 安全组 → 入方向，添加规则放行 **TCP 80**（来源 `0.0.0.0/0`）。

> GitHub 在国内访问较慢。首次 `git clone` 大约要下载 230 MB（主要是图片），如果中途断开，重新执行一次即可。

## 二、日常更新

在本地改完代码，执行 `git push`，然后在服务器上执行：

```bash
cd /var/www/pop && bash deploy/update.sh
```

没有新提交时脚本会直接退出；依赖没有变化时会跳过安装。需要强制重新构建，就在命令末尾加 `--force`。

> **一次性操作**：第一次更新到带「泡泡互动」聊天室的版本时，服务器上旧的更新脚本只会按原来的方式重启，聊天室还用不了。更新完成后再执行一次：
>
> ```bash
> cd /var/www/pop && pm2 delete pop && pm2 start deploy/ecosystem.config.cjs && pm2 save
> ```
>
> 之后的更新照常执行 `bash deploy/update.sh` 即可。

官网出了新 IP、新系列或新单品时，先在 Mac 上更新数据再推送，步骤见 [README.md](README.md)「更新网站内容」。

## 三、可选：推送后自动部署（GitHub Actions）

仓库里已经有 `.github/workflows/deploy.yml`。配置好以下三个密钥后，每次推送到 `main`，GitHub 都会自动登录服务器执行 `deploy/update.sh`。没有配置密钥时，这个工作流会直接跳过。

1. 在服务器上生成一对专门用于部署的密钥，并允许它登录：

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" && cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
   ```

2. 查看私钥内容，完整复制（包括 BEGIN 和 END 两行）：

   ```bash
   cat ~/.ssh/github_deploy
   ```

3. 打开 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret，依次添加：

   | 名称 | 值 |
   |---|---|
   | `SERVER_HOST` | `101.133.227.55` |
   | `SERVER_USER` | `root` |
   | `SERVER_SSH_KEY` | 上一步复制的私钥全文 |

4. 在 GitHub 的 Actions 页面手动运行一次 “Deploy”，确认成功。

## 四、常用命令

```bash
pm2 status              # 查看运行状态
pm2 logs pop            # 查看日志
pm2 restart pop         # 重启站点（聊天中的页面会自动重连）
systemctl reload nginx  # 重新加载 Nginx 配置
```

## 五、绑定域名与 HTTPS

国内服务器绑定域名，需要先在阿里云完成 **ICP 备案**，否则域名访问会被拦截；直接用 IP 访问不受影响。备案完成后：

1. 把 `deploy/nginx-pop.conf` 里的 `server_name _;` 改成你的域名，复制到 `/etc/nginx/sites-available/pop`，然后执行 `systemctl reload nginx`。
2. 安装证书工具并申请 HTTPS 证书：

   ```bash
   apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d 你的域名
   ```

3. 修改 `.env.production.local` 里的 `NEXT_PUBLIC_SITE_URL` 为 `https://你的域名`，然后执行一次 `bash deploy/update.sh --force`。站点地图和分享链接会使用这个地址。

## 六、泡泡互动聊天数据

聊天室的账号和消息保存在 `/var/www/pop/data/chat.db`。这个文件不在 git 里，`git pull` 和重新部署都不会动它。Nginx 配置已经支持 WebSocket，不需要额外设置。

设置管理员（先在网站上注册好账号）：

```bash
cd /var/www/pop && node scripts/chat-admin.mjs grant 你的用户名
```

备份数据库（网站运行中也可以执行，备份文件在 `data/backups/` 下）：

```bash
cd /var/www/pop && node scripts/chat-admin.mjs backup
```

从备份恢复：先 `pm2 stop pop`，把备份文件复制为 `data/chat.db`，并删除同目录下的 `chat.db-wal`、`chat.db-shm`，再 `pm2 start pop`。

全部管理命令见 [README.md](README.md)「泡泡互动（聊天室）」。
