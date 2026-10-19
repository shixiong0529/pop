# POP ATLAS · 潮玩图鉴

一个非官方的泡泡玛特（POP MART）潮玩文化与收藏展示网站：用展览馆的方式讲述各 IP 的角色故事，并把各系列、每一款潮玩整理成可检索、可收藏的图鉴。仅供个人学习交流，不提供购物、支付或会员功能（「泡泡互动」聊天室只需用户名和密码注册）。

- 收录 23 个 IP 的数百个系列、两千多款潮玩（含隐藏款），数据随官网更新
- 首页、IP 系列馆、IP 故事展厅、IP 产品图鉴、系列详情、产品详情、全站系列图鉴、⌘K 搜索、搜索结果页、我的收藏、泡泡互动（实时聊天室）、关于本站
- 简体中文界面，适配桌面、平板与手机

## 快速开始

需要 Node.js 22.13 及以上（聊天室用到 Node 内置的 SQLite；开发时使用 Node 25，服务器为 Node 24），以及 pnpm。

```bash
pnpm install
pnpm dev          # http://localhost:3002，网站和聊天室一起启动
```

生产构建：

```bash
pnpm build && pnpm start
```

## 更新服务器

代码推送到 GitHub 后，在服务器上执行：

```bash
cd /var/www/pop && bash deploy/update.sh
```

脚本会拉取最新代码；依赖文件有变化才重新安装；然后构建，并按 `deploy/ecosystem.config.cjs` 重启网站（重启时网站有几秒钟打不开，正在聊天的页面会自动重连）。没有新提交时会直接退出，不会白白构建。需要强制重新构建时加 `--force`：

```bash
cd /var/www/pop && bash deploy/update.sh --force
```

> **一次性操作**：服务器第一次更新到带「泡泡互动」的版本时，旧的更新脚本只会按原来的方式重启，聊天室还用不了。更新完成后再执行一次下面这条命令，把站点切换到新的启动方式（以后正常更新即可，不用再执行）：
>
> ```bash
> cd /var/www/pop && pm2 delete pop && pm2 start deploy/ecosystem.config.cjs && pm2 save
> ```

首次部署、Nginx、域名与 HTTPS 见 [DEPLOY.md](DEPLOY.md)。

## 更新网站内容（官网出了新 IP、新系列或新单品）

内容更新在 **Mac 上** 完成，数据和图片随代码一起提交到 GitHub，服务器只负责构建。服务器访问官网和 GitHub 都不稳定，所以不在服务器上抓取数据。

下面的命令都以 `cd /Users/shixiong/Developer/pop` 开头：pnpm 会按当前目录查找 `package.json` 来确定要操作哪个项目，必须先进入项目目录。

1. 抓取官网最新数据并生成图鉴：

   ```bash
   cd /Users/shixiong/Developer/pop && pnpm data:update
   ```

   结束时会打印一份摘要：新增了哪些系列、多少款单品，以及是否自动收录了新 IP。

2. （可选）在本地预览新内容，启动后打开 http://localhost:3002：

   ```bash
   cd /Users/shixiong/Developer/pop && pnpm dev
   ```

3. 提交并推送：

   ```bash
   cd /Users/shixiong/Developer/pop && git add -A && git commit -m "更新图鉴数据" && git push
   ```

4. 在服务器上执行 `cd /var/www/pop && bash deploy/update.sh`。

说明：

- **频率**：官网上新没有固定节奏，每周或每月跑一次就够了。没有新内容时，摘要会显示“内容没有变化”。
- **已收录的内容不会消失**：官网下架的商品仍保留在图鉴里，收藏链接也不会失效。新系列按“多款式盲盒优先、其次按时间”的规则加入，每个 IP 首次收录的上限是核心 40、精选 20、新锐 12 个系列。
- **已有商品的款式有变化时**：默认只抓取新商品的详情。如果官网修改了已有商品（例如追加隐藏款），可以运行 `cd /Users/shixiong/Developer/pop && node scripts/scrape-official.mjs --refresh && pnpm data:build` 重新获取全部详情，耗时约 30–40 分钟。
- **出现新 IP 时**：会自动收录，摘要里显示“★ 新收录 IP：XXX”。它的系列和单品照常进入图鉴；展厅先用官网资料生成（官网简介、产品图配色），创作者显示“待核实”，故事章节显示“待补充”，并标注“示例数据”。正式故事需要整理，做法见下面「为自动收录的 IP 补写故事」，推荐直接交给 Claude。

## 为自动收录的 IP 补写故事

`pnpm data:update` 是普通脚本，只能抓取官网数据，不会调研和撰写角色故事。新 IP 的创作者、起源、世界观、性格和发展历程，需要从官方公告、访谈和媒体报道中整理并标注出处，这一步交给 Claude 完成。

### 推荐做法：交给 Claude

1. 跑完 `pnpm data:update` 后，看摘要里有没有 **“★ 新收录 IP：XXX”**。没有就不用管。
2. 有的话，在 Claude 桌面应用里打开本项目文件夹（`/Users/shixiong/Developer/pop`），新建一个对话，说一句：

   ```
   帮我补 XXX 的故事
   ```

3. Claude 会调研资料、写好故事并标注出处，本地验证后提交并推送到 GitHub。
4. 在服务器上执行：

   ```bash
   cd /var/www/pop && bash deploy/update.sh
   ```

补全之前，新 IP 的展厅会先用官网资料显示并标注“示例数据 · 故事待补充”，不影响网站正常访问。

### 自己动手

自动收录的 IP 记录在 `data/auto-ips.json`（官网合集 slug、本站 slug、名称）。补写故事后，手写内容会自动替换占位内容，网址保持不变：

1. 在 `scripts/ips.mjs` 的 `IP_LIST` 中加一行：`[官网合集 slug, 本站 slug, 层级]`，两个 slug 照抄 `data/auto-ips.json` 里的值；层级为 `core` / `featured` / `rising` 之一。
2. 在 `src/content/ips/` 新建故事文件，参照 `IPContent` 类型（`src/lib/types.ts`）填写故事、主题色、出处与核实状态，`slug` 与上一步一致，并加入 `src/content/ips/index.ts` 的数组。
3. 运行 `cd /Users/shixiong/Developer/pop && pnpm data:update`，提交推送后在服务器上执行 `update.sh`。

### 其他

如果官网角色菜单里出现了不属于单个 IP 的入口（例如“ALL”），把它的合集 slug 加进 `scripts/ips.mjs` 的 `NON_IP_COLLECTIONS`，并从 `data/auto-ips.json` 中删掉对应条目。

## 泡泡互动（聊天室）

导航栏「泡泡互动」是一个公共实时聊天室：注册只需用户名和密码，登录后可以实时收发消息、查看历史记录、发表情、撤回自己的消息。每个用户注册时会随机获得一个卡通泡泡头像。

**数据保存在哪里**：服务器上的 `/var/www/pop/data/chat.db`（SQLite 数据库，已加入 .gitignore，不会被 git 同步或覆盖）。网站重启、重新部署后，账号和聊天记录都还在。

**管理员**：先在网站上正常注册一个账号，然后在服务器上把它设为管理员。管理员在聊天室里把鼠标移到任意消息上（手机上点一下消息），就可以删除消息或禁言用户。

```bash
cd /var/www/pop && node scripts/chat-admin.mjs grant 你的用户名
```

其它管理命令（都在 `/var/www/pop` 目录下执行，网站运行中也可以直接用）：

| 命令 | 作用 |
|---|---|
| `node scripts/chat-admin.mjs list` | 列出全部用户 |
| `node scripts/chat-admin.mjs grant 用户名` / `revoke 用户名` | 设为管理员 / 取消管理员 |
| `node scripts/chat-admin.mjs mute 用户名` / `unmute 用户名` | 禁言 / 解除禁言 |
| `node scripts/chat-admin.mjs purge 用户名` | 删除该用户的全部消息 |
| `node scripts/chat-admin.mjs backup` | 备份聊天数据库到 `data/backups/` |

**安全措施**：密码用 scrypt 加盐哈希保存；登录状态用 HttpOnly Cookie 保存 30 天，服务器只存令牌的哈希；接口和 WebSocket 只接受本站页面的请求；注册、登录有频率限制，连续输错密码会被暂时锁定；单条消息最多 500 字，发言过快、重复刷屏会被拦截；消息内容会去掉控制字符和隐形字符，并且始终按纯文本显示，不会被当作网页代码执行。

**本地开发**：`pnpm dev` 会同时启动网站和聊天室，本地聊天数据保存在项目里的 `data/chat.db`，删掉这个文件即可清空。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router、Cache Components、Turbopack）+ React 19 + TypeScript |
| 样式 | Tailwind CSS v4（设计令牌写在 `src/app/globals.css` 的 `@theme` 中） |
| 动画 | Framer Motion（`motion/react`）+ React `<ViewTransition>` 跨页面共享元素过渡 |
| 滚动 | Lenis 平滑滚动 |
| 状态 | Zustand（收藏保存在 localStorage） |
| 搜索 | Fuse.js 模糊搜索 + pinyin-pro（支持拼音全拼与首字母） |
| 图片 | 官网图片下载到本地后用 sharp 处理（WebP、模糊占位、主色），由 `next/image` 输出 AVIF / WebP |
| 字体 | 全部自托管（国内服务器无法访问 Google Fonts），由 `scripts/fetch-fonts.mjs` 下载 |
| 聊天室 | 自定义 Node 服务器 `server.mjs`，网站与 Socket.IO 实时通信共用一个端口；数据存在 Node 内置 SQLite（`node:sqlite`），无需额外数据库服务 |

## 目录结构

```
server.mjs                  启动入口：Next.js 网站 + 聊天接口（/api/chat/*）+ Socket.IO
chat/                       聊天服务端：数据库（db）、接口（http）、实时通信（realtime）、安全校验与限流（security）
src/
  app/                      路由
    page.tsx                首页
    ips/                    IP 系列馆 / [slug] 故事展厅 / [slug]/collection 产品图鉴（构建时生成）
    series/                 全站系列图鉴 / [slug] 系列详情（构建时生成）
    products/[slug]/        产品详情（首次访问时生成并缓存）
    search/ favorites/ about/
    chat/                   泡泡互动聊天室
    search-index/route.ts   构建期生成的静态搜索索引
    sitemap.ts robots.ts opengraph-image.tsx icon.svg
    fonts/                  自托管字体
  components/
    motion/                 Reveal、SplitText、TiltCard、Parallax、Magnetic、Marquee、HorizontalScroll 等动效原语
    home/ ip/ product/ series/ search/ favorites/ cards/ layout/ ui/ seo/ providers/
    chat/                   聊天室界面：消息列表、输入框、表情面板、登录注册弹窗、泡泡头像
  content/
    ips/                    每个 IP 的故事、主题色、出处（手写，结构化）；auto.ts 为自动收录 IP 的占位内容
    sources.ts              全站引用的资料来源
    brand.ts                泡泡玛特品牌编年史
    generated/catalog.json  由数据管线生成的系列与产品图鉴
  lib/                      类型、数据访问、命名翻译、收藏与搜索逻辑；chat/ 为聊天接口与登录状态
scripts/
  ips.mjs                   手写收录的 IP 清单（采集与生成共用），自动收录的见 data/auto-ips.json
  scrape-official.mjs       采集泡泡玛特国际站公开数据 → data/official/raw.json
  build-data.mjs            筛选潮玩、下载与处理图片 → catalog.json + public/images/catalog
  fetch-fonts.mjs           下载自托管字体
  chat-admin.mjs            聊天室管理工具（设管理员、禁言、备份）
deploy/                     服务器部署与更新脚本、PM2 与 Nginx 配置
data/
  official/raw.json         原始采集数据
  images.json               图片清单（官网原图 ↔ 本地文件、尺寸、主色、模糊占位）
  chat.db                   聊天数据库（运行时生成，不纳入 git）
```

## 数据管线

```bash
pnpm data:update            # 采集 + 生成（日常用这一个）
pnpm data:scrape            # 只采集（也可指定 IP：pnpm data:scrape molly dimoo）
pnpm data:build             # 只生成图鉴并下载新图片（已下载的会复用）
```

- 产品数据来自泡泡玛特国际站（美国区）服务端渲染页面中的公开结构化数据。只读、低频、串行请求。
- `build-data.mjs` 只收录潮玩本体（盲盒手办、搪胶毛绒、MEGA 珍藏、手办摆件），排除杯子、手机壳、冰箱贴等周边。
- 图片按需从官网阿里云 OSS 取指定尺寸（系列图 1600px、单品 1100px），转为 WebP 存在本地，避免依赖外链。

## 内容真实性原则

- 故事优先采用官方资料（官网「品牌发展」、官方设计师介绍、IP 合集页简介），其次是维基百科、创作者访谈与主流媒体。每个展厅底部列出全部出处，并标注核实状态：已核实 / 部分待核实 / 示例数据。
- 文字由本站转述，不照搬原文；编辑观点会标注「本站解读」。
- 官网没有单品设计说明，产品页的「背后的故事」展示的是所属 IP 的背景，并在页面上注明。
- 系列中文名只在有把握是官方译名时使用（例如「坐坐派对」「前方高能」），其余保留官方英文名，品类名称为本站翻译。
- 有官方发售日时显示发售日；缺失时显示美国站上架时间，并标注为「上架」。

## 免责声明

本站与泡泡玛特及各 IP 创作者均无隶属、授权或合作关系。所有 IP 名称、角色形象、商标与产品图片的权利归泡泡玛特及原作者所有，本站仅用于非商业的学习与交流。
