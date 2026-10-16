# POP ATLAS · 潮玩图鉴

一个非官方的泡泡玛特（POP MART）潮玩文化与收藏展示网站：用展览馆的方式讲述各 IP 的角色故事，并把各系列、每一款潮玩整理成可检索、可收藏的图鉴。仅供个人学习交流，不提供购物、支付或会员功能。

- 23 个 IP、372 个系列、2390 款潮玩（含 235 款隐藏款）
- 首页、IP 系列馆、IP 故事展厅、IP 产品图鉴、系列详情、产品详情、全站系列图鉴、⌘K 搜索、搜索结果页、我的收藏、关于本站
- 简体中文界面，适配桌面、平板与手机

## 快速开始

需要 Node.js 20.9 及以上（开发时使用 Node 25），以及 pnpm。

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

生产构建：

```bash
pnpm build && pnpm start
```

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

## 目录结构

```
src/
  app/                      路由（全部页面在构建时静态生成）
    page.tsx                首页
    ips/                    IP 系列馆 / [slug] 故事展厅 / [slug]/collection 产品图鉴
    series/                 全站系列图鉴 / [slug] 系列详情
    products/[slug]/        产品详情
    search/ favorites/ about/
    search-index/route.ts   构建期生成的静态搜索索引
    sitemap.ts robots.ts opengraph-image.tsx icon.svg
  components/
    motion/                 Reveal、SplitText、TiltCard、Parallax、Magnetic、Marquee、HorizontalScroll 等动效原语
    home/ ip/ product/ series/ search/ favorites/ cards/ layout/ ui/ seo/ providers/
  content/
    ips/                    每个 IP 的故事、主题色、出处（手写，结构化）
    sources.ts              全站引用的资料来源
    brand.ts                泡泡玛特品牌编年史
    generated/catalog.json  由数据管线生成的系列与产品图鉴
  lib/                      类型、数据访问、命名翻译、收藏与搜索逻辑
scripts/
  scrape-official.mjs       采集泡泡玛特国际站公开数据 → data/official/raw*.json
  build-data.mjs            筛选潮玩、下载与处理图片 → catalog.json + public/images/catalog
data/
  official/                 原始采集数据
  images.json               图片清单（官网原图 ↔ 本地文件、尺寸、主色、模糊占位）
```

## 数据管线

```bash
pnpm data:scrape            # 采集全部 IP（也可指定：pnpm data:scrape molly dimoo）
pnpm data:build             # 生成图鉴并下载新图片（已下载的会复用）
```

- 产品数据来自泡泡玛特国际站（美国区）服务端渲染页面中的公开结构化数据。只读、低频、串行请求。
- `build-data.mjs` 只收录潮玩本体（盲盒手办、搪胶毛绒、MEGA 珍藏、手办摆件），排除杯子、手机壳、冰箱贴等周边。每个 IP 有收录上限（核心 40、精选 20、新锐 12），优先收录多款式的盲盒系列。
- 图片按需从官网阿里云 OSS 取指定尺寸（系列图 1600px、单品 1100px），转为 WebP 存在本地，避免依赖外链。

## 新增一个 IP

1. 在 `src/content/ips/` 新建内容文件，参照 `IPContent` 类型（`src/lib/types.ts`）填写故事、主题色、出处与核实状态，并加入 `src/content/ips/index.ts` 的数组。
2. 在 `scripts/scrape-official.mjs` 的 `COLLECTIONS` 与 `scripts/build-data.mjs` 的 `IP_MAP` 中加入官网合集 slug。
3. 运行 `pnpm data:scrape <slug>` 和 `pnpm data:build`。页面、搜索索引与 sitemap 会自动生成。

## 内容真实性原则

- 故事优先采用官方资料（官网「品牌发展」、官方设计师介绍、IP 合集页简介），其次是维基百科、创作者访谈与主流媒体。每个展厅底部列出全部出处，并标注核实状态：已核实 / 部分待核实 / 示例数据。
- 文字由本站转述，不照搬原文；编辑观点会标注「本站解读」。
- 官网没有单品设计说明，产品页的「背后的故事」展示的是所属 IP 的背景，并在页面上注明。
- 系列中文名只在有把握是官方译名时使用（例如「坐坐派对」「前方高能」），其余保留官方英文名，品类名称为本站翻译。
- 有官方发售日时显示发售日；缺失时显示美国站上架时间，并标注为「上架」。

## 免责声明

本站与泡泡玛特及各 IP 创作者均无隶属、授权或合作关系。所有 IP 名称、角色形象、商标与产品图片的权利归泡泡玛特及原作者所有，本站仅用于非商业的学习与交流。
