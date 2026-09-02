<h1 align="center">HomeNest</h1>
<p align="center">
  <i>一个简单的自托管服务之家，把你的所有服务放在一个入口</i>
  <br/><br/>
  <b><a href="#快速开始">快速开始</a></b> | <b><a href="#部署">部署</a></b> | <b><a href="#使用方式">使用方式</a></b> | <b><a href="README.md">English</a></b>
  <br/><br/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-609966?logo=opensourceinitiative&logoColor=fff" alt="License MIT"/></a>
  <a href="NOTICE"><img src="https://img.shields.io/badge/Forked%20from-Mafl-609966?logo=github&logoColor=fff" alt="Forked from Mafl"/></a>
  <img src="https://img.shields.io/badge/Nuxt-4-609966?logo=nuxtdotjs&logoColor=fff" alt="Nuxt 4"/>
  <img src="https://img.shields.io/badge/TypeScript-5-609966?logo=typescript&logoColor=fff" alt="TypeScript 5"/>
</p>

---

## 关于

**HomeNest** 是 [Mafl](https://github.com/hywax/mafl)（作者 Hywax）的 fork，针对多平台 Serverless 部署进行了现代化改造和扩展。保留了原项目的极简设计和 YAML 配置方式，同时增加了存储抽象层、Nuxt 4 迁移、Cloudflare/Vercel 免费额度优化。

<p align="center">
  <img src="docs/public/HomeNest.png" alt="HomeNest 仪表板" width="100%"/>
</p>

> **致谢**：本项目衍生自 [Mafl](https://github.com/hywax/mafl)（MIT 许可证，Copyright (c) 2023-PRESENT Hywax）。原始版权声明和许可证保留在 [LICENSE](LICENSE) 和 [NOTICE](NOTICE) 中。

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | [Nuxt 4](https://nuxt.com)（Vue 3 + Nitro 服务引擎） |
| 语言 | TypeScript 5 |
| 样式 | [Tailwind CSS](https://tailwindcss.com)，通过 `@nuxtjs/tailwindcss` |
| 校验 | [Zod](https://zod.dev) schema（`h3-zod`） |
| 国际化 | `@nuxtjs/i18n` — 2 种语言（en, zh），无前缀策略 |
| 主题 | `@nuxtjs/color-mode` — system/light/dark/deep/sepia/bluer |
| PWA | `@vite-pwa/nuxt` — 可安装为渐进式 Web 应用 |
| 图标 | `@nuxt/icon`（Iconify）+ 自定义 URL/本地图标 |
| 头像 | [DiceBear](https://dicebear.com) — 25+ 种风格 |
| 存储 | `FilesystemDriver`（自托管）/ `VercelKVDriver`（Serverless） |
| 配置 | YAML 解析（`yaml` 包） |
| 编辑器 | 拖拽排序（`vue-draggable-plus`） |
| 构建 | Vite 8、ESLint（@antfu/eslint-config）、Husky + lint-staged |

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── editor/          # 编辑器 UI（PropertyPanel, StyleFields, IconPicker…）
│   └── service/         # 服务卡片组件（Base, IpApi, OpenWeatherMap）
├── composables/         # Vue 组合式函数（useEditor, useServiceData, useContentI18n…）
├── locales/             # i18n 翻译文件（en-US.js, zh-CN.js, …）
├── plugins/             # Nuxt 插件（settings, auth）
├── server/
│   ├── api/             # API 路由（config, auth, services, geo, update）
│   ├── storage/         # 存储驱动与 Store（Config, User, Preferences）
│   ├── utils/           # 服务端工具（auth, config, services, favicon）
│   └── validations/     # Zod schema（config, service）
├── types/               # TypeScript 类型定义
└── utils/               # 共享工具（registry, style）
data/                    # 运行时数据（config.yml, users.json, icons/）
```

## 快速开始

### 开发环境

```shell
git clone https://github.com/ThunderLotus/homenest.git
cd homenest
npm install --legacy-peer-deps
npm run dev          # → http://localhost:13008
```

默认登录：**Admin / Admin**

### 生产环境（Node）

```shell
npm run build
node .output/server/index.mjs    # → http://localhost:3000
```

### 生产环境（Docker）

```yaml
# docker-compose.yml
services:
  homenest:
    image: thunderlotus/homenest:latest
    restart: unless-stopped
    ports:
      - '13008:3000'
    volumes:
      - ./data:/app/data
```

```shell
docker compose up -d
```

## 部署

### 自托管（Docker / VPS）

默认模式 — 使用 `FilesystemDriver` 与 `data/` 目录，无需额外配置。

### Vercel

**前置条件**：拥有 [Vercel](https://vercel.com) 账号和 [GitHub](https://github.com) 账号。

#### 步骤 1 — Fork 仓库

1. 访问 `https://github.com/ThunderLotus/homenest`（你的 fork）
2. 点击 **Fork** 创建你自己的副本

#### 步骤 2 — 创建 Upstash Redis 数据库

1. 进入 [Upstash 控制台](https://console.upstash.com) → **Redis** — **Create Database**
2. 命名为 `homenest-kv`，选择与 Vercel 部署区域较近的区域
3. 点击 **Create**
4. 复制 **REST URL**（`https://....upstash.io`）和 **REST Token** — 步骤 4 会用到

#### 步骤 3 — 导入 Vercel

1. 进入 [Vercel 仪表板](https://vercel.com/dashboard) → **Add New** — **Project**
2. 导入你 fork 的 `homenest` 仓库
3. Vercel 会自动识别 Nuxt — 保持默认构建设置
4. **先不要部署** — 先点击 **Environment Variables** 配置环境变量

#### 步骤 4 — 配置环境变量

在 Vercel 项目设置 → **Environment Variables** 中添加：

| 名称 | 值 | 环境 |
|---|---|---|
| `KV_REST_API_URL` | 步骤 2 获取的 Upstash REST URL | Production, Preview, Development |
| `KV_REST_API_TOKEN` | 步骤 2 获取的 Upstash REST Token | Production, Preview, Development |

> **替代方案**：也可以不手动设置环境变量，而是关联 Vercel KV 存储（Storage → KV — Create — Connect to Project），Vercel 会自动注入相同的变量。两种方式均可。

#### 步骤 5 — 部署

1. 点击 **Deploy**
2. 等待构建完成（约 2-3 分钟）
3. 访问部署地址（如 `https://homenest-xxx.vercel.app`）
4. 使用 **Admin / Admin** 登录 — 请立即修改密码

#### 步骤 6 — 验证持久化

1. 在编辑器中添加几个服务并点击 **保存**
2. 重新部署项目（或推送新提交）— 配置应该保持不变
3. 查看 Upstash 控制台 — **Data** 标签页，确认存储的 key（`config.yml`、`users.json` 等）

> **注意**：Vercel Serverless 不支持长连接，WebSocket 会自动禁用，改用 10 秒版本轮询同步配置。

#### 步骤 7 — 在 GitHub 上隐藏 Vercel 部署信息（可选）

默认情况下，Vercel 会在 fork 仓库的 GitHub 页面暴露你的 App URL，出现在两处：**Deployments** 侧边栏和 **About** 区域（Homepage URL）。要阻止这种情况，**在 Vercel 端从源头关闭**：

1. Vercel 仪表板 → 你的项目 → **Settings** → **Git** → **Connected Git Repository**
2. 关闭 **Pull Request Comments** —阻止 Vercel bot 在 PR 上评论
3. 关闭 **deployment_status Events** —阻止 Vercel 在 GitHub 上创建部署记录

然后一次性清理已有记录：

4. Fork 仓库 → **Actions** → **Cleanup All Deployments** → **Run workflow** —删除所有旧的部署记录、环境，并清除 Homepage URL
5. Fork 仓库 → **Settings** → **General** → **Homepage URL** → 清空 → **Save**（如果仍被设置）

之后，GitHub 不会再显示任何 Vercel 部署信息。

---

### Cloudflare Pages

**前置条件**：拥有 [Cloudflare](https://cloudflare.com) 账号和 [GitHub](https://github.com) 账号。

#### 步骤 1 — Fork 仓库

与 Vercel 步骤 1 相同 — 将 `ThunderLotus/homenest` fork 到你的 GitHub 账号。

#### 步骤 2 — 创建 Upstash Redis 数据库

与 Vercel 步骤 2 相同 — 创建 Upstash Redis 实例并复制 REST URL 和 Token。

> **为什么用 Upstash 而不用 Cloudflare KV？** HomeNest 使用 `@vercel/kv` SDK，它通过 REST API 连接 Upstash Redis。Cloudflare KV 的 API 不同，目前不兼容。Upstash 免费额度（每天 10K 命令）对个人使用足够。

#### 步骤 3 — 创建 Cloudflare Pages 项目

1. 进入 [Cloudflare 仪表板](https://dash.cloudflare.com) → **Workers & Pages** — **Create** — **Pages** — **Connect to Git**
2. 选择你 fork 的 `homenest` 仓库
3. 将 **Framework preset** 设为 `None`（手动配置）
4. 设置 **Build command** 为 `NITRO_PRESET=cloudflare-pages npx nuxi build`
5. 设置 **Build output directory** 为 `.output/public`
6. 点击 **Save and Deploy** — **首次构建可能失败**，因为还需要添加环境变量

#### 步骤 4 — 配置环境变量

进入 **Settings** — **Environment variables**，为 **Production**（和 **Preview**，如需要）添加以下变量：

| 变量名 | 值 |
|---|---|
| `KV_REST_API_URL` | 步骤 2 获取的 Upstash REST URL |
| `KV_REST_API_TOKEN` | 步骤 2 获取的 Upstash REST Token |
| `NITRO_PRESET` | `cloudflare-pages` |

#### 步骤 5 — 启用 `nodejs_compat` 兼容标志

1. 进入 **Settings** — **Functions** — **Compatibility flags**
2. 在 **Production** 和 **Preview** 的兼容标志中都添加 `nodejs_compat`
3. 这会启用 Node.js API 兼容（用于旧版密码验证中的 `crypto.scryptSync`）

#### 步骤 6 — 部署

1. 进入 **Deployments** — 点击 **Retry deployment**（或推送新提交触发重新构建）
2. 等待构建完成（约 3-5 分钟）
3. 访问 Pages 地址（如 `https://homenest.pages.dev`）
4. 使用 **Admin / Admin** 登录 — 请立即修改密码

#### 步骤 7 — 验证持久化

1. 在编辑器中添加几个服务并点击 **保存**
2. 触发重新部署 — 配置应该保持不变
3. 查看 Upstash 控制台 — **Data** 标签页，确认存储的 key

> **注意事项**：
> - Cloudflare Pages 不支持长连接，WebSocket 会自动禁用，改用 10 秒版本轮询同步配置。
> - 密码哈希使用 Web Crypto API 的 PBKDF2（<1ms CPU，满足 Workers 10ms 限制）。
> - 已移除 `@network-utils/tcp-ping` — 服务健康检查仅使用 HTTP fetch。

### 环境变量

| 变量 | 用途 | 默认值 |
|---|---|---|
| `HOMENEST_GITHUB_REPO` | GitHub 仓库地址，用于更新通知 | `ThunderLotus/homenest`（禁用） |
| `KV_REST_API_URL` | Vercel KV / Upstash Redis URL | 无 |
| `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis token | 无 |
| `MAFL_STORAGE_DRIVER` | 强制指定存储驱动（`vercel-kv`） | 自动检测 |

### 存储驱动选择

| 环境 | 检测方式 | 驱动 |
|---|---|---|
| 自托管 | 默认 | `FilesystemDriver` → `data/` |
| Vercel | `KV_REST_API_URL` 存在 | `VercelKVDriver` → Upstash Redis |
| 手动指定 | `MAFL_STORAGE_DRIVER=vercel-kv` | `VercelKVDriver` |

## 存储架构

```
┌────────────── API 路由层 (src/server/api/) ────────────────────────┐
├────────────── 专用 Store 层 (src/server/storage/) ──────────────────────┐
│  ConfigStore  UserStore  PreferencesStore  IconStore  │
├────────────── 驱动抽象层 (StorageDriver) ──────────────────────┐
│  FilesystemDriver          VercelKVDriver            │
├────────────── 底层存储 ─────────────────────────────────┐
│  useStorage('data')       @vercel/kv (Upstash Redis)  │
│  + 全局 TTL 缓存 (5s)      + session 密钥缓存          │
└──────────────────────────────────────────────────┘
```

### 数据布局

**自托管**（`data/`）：
```
data/
├── config.yml              # 站点配置 (YAML)
├── users.json              # 用户账户 (JSON)
├── .session-secret         # Session 签名密钥
├── preferences_*.json      # 用户偏好
└── icons/                  # 缓存图标
```

**Vercel / Cloudflare**（Upstash Redis KV）：
```
"config.yml"             — YAML 字符串
"users.json"             — JSON 对象
".session-secret"        — hex 字符串
"__raw:icons/<hash>.png" — base64 编码字节
"__ver:config.yml"       — 时间戳（版本检测）
```

## 使用方式

### 登录

- 默认凭据：**Admin / Admin**（首次登录后请立即修改密码）
- 管理员使用 `config.yml`（默认配置）
- 普通用户使用 `config_<用户名>.yml`（每人独立配置）

### 编辑器

点击左上角 **编辑** 按钮（铅笔图标）进入编辑模式：

1. **添加分组** — 点击"添加分组"创建新的服务分组
2. **添加服务** — 在分组内点击"添加服务"，选择服务类型
3. **拖拽排序** — 拖动分组和服务进行重新排列
4. **属性面板** — 点击任意服务打开侧边面板：
   - 设置标题、描述、链接、图标、标签
   - 配置服务专属选项（如天气服务的坐标）
   - 设置状态监控（启用 + 间隔秒数）
   - 自定义卡片样式（圆角、内边距、颜色…）
5. **全局设置** — 点击齿轮图标编辑页面标题、主题、语言、网格布局
6. **保存** — 点击"保存"将更改持久化到 `config.yml`

### 服务类型

#### Base（基础卡片）
服务卡片，可选健康监控（HTTP HEAD 探测，5 秒超时）。

```yaml
- title: GitHub
  link: https://github.com
  icon:
    name: simple-icons:github
    wrap: true
  status:
    enabled: true
    interval: 30
```

#### IP API（IP 信息）
显示访问者的 IP 地址和地理位置（24 分钟服务端缓存）。

```yaml
- title: IP 信息
  type: ip-api
  options:
    flagIcon: true
```

#### OpenWeatherMap（天气）
显示指定位置的实时天气（24 分钟服务端缓存）。这是 **数据型服务** — 无需填写 `link` 字段。

```yaml
- title: Weather
  type: openweathermap
  options:
    city: Beijing          # 可选：输入城市名后点击"搜索城市"
    lat: 39.9042            # 纬度（必需）
    lon: 116.4074           # 经度（必需）
    units: metric           # metric=°C, imperial=°F, standard=K
  secrets:
    apiKey: 你的密钥        # 从 home.openweathermap.org/api_keys 免费获取
```

**获取坐标**（在编辑器属性面板中）：
- **城市搜索** — 在"城市"栏输入城市名，点击"搜索城市"通过 OpenWeatherMap Geocoding API 自动填入经纬度
- **IP 定位** — 点击"获取坐标"根据当前 IP 自动填入经纬度
- **手动查询** — 在 [LatLong.net](https://www.latlong.net/) 查询坐标

**免费 API Key**：在 [openweathermap.org](https://home.openweathermap.org/api_keys) 注册，免费额度 1000 次/天。`apiKey` 仅存储在服务端，不会发送到前端。

### 图标

- **[Iconify](https://icon-sets.iconify.design/)** — 200,000+ 矢量图标（如 `simple-icons:github`、`lucide:home`）
- **Emoji** — 任意合法 emoji（如 `🏠`）
- **URL** — 直接图片 URL（下载后本地缓存）
- **本地** — `data/icons/` 中的自定义图标

### 用户管理（管理员）

进入 **管理 — 用户**（`/admin/users`）：
- 添加/删除用户
- 重置密码
- 导出用户配置
- 角色：管理员（访问所有配置）/ 普通用户（仅访问自己的配置）

### 语言与主题

- **语言** — 从工具栏下拉菜单切换（en, zh）
- **主题** — 从工具栏切换（system/light/dark/deep/sepia/bluer）
- 设置按用户保存在 `preferences_*.json` 中

### 多语言内容

配置支持页面标题、分组标题、服务标题/描述的国际化：

```yaml
baseLang: en        # 字段值的默认语言
i18n:
  title:
    zh: 我的首页
  groups:
    Home:
      zh: 主页
  services:
    my-service-id:
      zh:
        title: 服务标题
        description: 服务描述
```

## 多语言 UI

| 语言 | 代码 |
|---|---|
| 英语 | `en` |
| 中文 | `zh` |

## 免费额度资源消耗

针对 Vercel Hobby 和 Cloudflare Workers 免费计划优化：

| 资源 | Vercel Hobby | Cloudflare Workers |
|---|---|---|
| 函数调用 | ~1,700/天 | ~1,700/天 |
| Upstash KV 命令 | ~1,600/天（16% of 10K） | ~1,600/天（16% of 10K） |
| 每请求 CPU | <100ms | <1ms (PBKDF2) |
| 带宽 | <1GB/月 | 无限 |

*估算条件：1 个用户、5 个服务卡片、每天活跃 4 小时。完整优化列表见 [NOTICE](NOTICE)。*

## 致谢

本项目是 [Mafl](https://github.com/hywax/mafl)（作者 [Hywax](https://github.com/hywax)）的 fork。原始设计、配置 schema 和服务实现均来自 Mafl 项目。

原始 Mafl 贡献者：
<img src="https://raw.githubusercontent.com/hywax/mafl/main/docs/public/contributors.svg" alt="Mafl Contributors" width="100%"/>

## 许可证与版权声明

- **许可证**：[MIT](LICENSE) — Copyright (c) 2023-PRESENT Hywax (原始 Mafl), Copyright (c) 2026-PRESENT HomeNest contributors
- **Fork 声明**：见 [NOTICE](NOTICE)，包含相对原始 Mafl 的完整修改列表
- **第三方资源**：见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)，包含所有第三方软件、图标、头像库及其许可证
