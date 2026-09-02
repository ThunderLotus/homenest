<h1 align="center">HomeNest</h1>
<p align="center">
  <i>Self-hosted homepage & service dashboard. YAML config, drag-and-drop editor, health monitoring, multi-theme, i18n, PWA. Nuxt 4 + Vue 3. Docker / Vercel / Cloudflare.</i>
  <br/>
  <i>自托管主页与服务仪表板。YAML 配置、拖拽编辑、健康监控、多主题、国际化、PWA。Nuxt 4 + Vue 3，支持 Docker / Vercel / Cloudflare 部署。</i>
  <br/><br/>
  <b><a href="#getting-started--快速开始">Getting Started</a></b> | <b><a href="#deployment--部署">Deployment</a></b> | <b><a href="#usage--使用方式">Usage</a></b>
  <br/><br/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-609966?logo=opensourceinitiative&logoColor=fff" alt="License MIT"/></a>
  <a href="NOTICE"><img src="https://img.shields.io/badge/Forked%20from-Mafl-609966?logo=github&logoColor=fff" alt="Forked from Mafl"/></a>
  <img src="https://img.shields.io/badge/Nuxt-4-609966?logo=nuxtdotjs&logoColor=fff" alt="Nuxt 4"/>
  <img src="https://img.shields.io/badge/TypeScript-5-609966?logo=typescript&logoColor=fff" alt="TypeScript 5"/>
</p>

---

## About / 关于

**HomeNest** is a fork of [Mafl](https://github.com/hywax/mafl) by Hywax, modernized and extended for multi-platform serverless deployment. It preserves the original's minimalistic design and YAML-based configuration while adding a storage abstraction layer, Nuxt 4 migration, and Cloudflare/Vercel free-tier optimizations.

> **HomeNest** 是 [Mafl](https://github.com/hywax/mafl)（作者 Hywax）的 fork，针对多平台 Serverless 部署进行了现代化改造和扩展。保留了原项目的极简设计和 YAML 配置方式，同时增加了存储抽象层、Nuxt 4 迁移、Cloudflare/Vercel 免费额度优化。

<p align="center">
  <img src="docs/public/HomeNest.png" alt="HomeNest Dashboard" width="100%"/>
</p>

> **Attribution**: This project is derived from [Mafl](https://github.com/hywax/mafl) (MIT License, Copyright (c) 2023-PRESENT Hywax). The original copyright notice and license are preserved in [LICENSE](LICENSE) and [NOTICE](NOTICE).
>
> **致谢**：本项目衍生自 [Mafl](https://github.com/hywax/mafl)（MIT 许可证，Copyright (c) 2023-PRESENT Hywax）。原始版权声明和许可证保留在 [LICENSE](LICENSE) 和 [NOTICE](NOTICE) 中。

## Tech Stack / 技术栈

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3 + Nitro server engine) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) via `@nuxtjs/tailwindcss` |
| Validation | [Zod](https://zod.dev) schemas (`h3-zod`) |
| i18n | `@nuxtjs/i18n` — 2 languages (en, zh), no-prefix strategy |
| Themes | `@nuxtjs/color-mode` —system/light/dark/deep/sepia/bluer |
| PWA | `@vite-pwa/nuxt` —installable web app |
| Icons | `@nuxt/icon` (Iconify) + custom URL/local icons |
| Avatars | [DiceBear](https://dicebear.com) —25+ styles |
| Storage | `FilesystemDriver` (self-hosted) / `VercelKVDriver` (serverless) |
| Config | YAML parsing via `yaml` package |
| Editor | Drag-and-drop via `vue-draggable-plus` |
| Build | Vite 8, ESLint (@antfu/eslint-config), Husky + lint-staged |

> | 层级 | 技术 |
> |---|---|
> | 框架 | [Nuxt 4](https://nuxt.com)（Vue 3 + Nitro 服务引擎） |
> | 语言 | TypeScript 5 |
> | 样式 | [Tailwind CSS](https://tailwindcss.com)，通过 `@nuxtjs/tailwindcss` |
> | 校验 | [Zod](https://zod.dev) schema（`h3-zod`） |
> | 国际化 | `@nuxtjs/i18n` — 2 种语言（en, zh），无前缀策略 |
> | 主题 | `@nuxtjs/color-mode` — system/light/dark/deep/sepia/bluer |
> | PWA | `@vite-pwa/nuxt` — 可安装为渐进式 Web 应用 |
> | 图标 | `@nuxt/icon`（Iconify）+ 自定义 URL/本地图标 |
> | 头像 | [DiceBear](https://dicebear.com) — 25+ 种风格 |
> | 存储 | `FilesystemDriver`（自托管）/ `VercelKVDriver`（Serverless） |
> | 配置 | YAML 解析（`yaml` 包） |
> | 编辑器 | 拖拽排序（`vue-draggable-plus`） |
> | 构建 | Vite 8、ESLint（@antfu/eslint-config）、Husky + lint-staged |

## Project Structure / 项目结构

```
src/
├── components/          # Vue components / Vue 组件
│   ├── editor/          # Editor UI (PropertyPanel, StyleFields, IconPicker…)
│   └── service/         # Service card components (Base, IpApi, OpenWeatherMap)
├── composables/         # Vue composables (useEditor, useServiceData, useContentI18n…)
├── locales/             # i18n translation files (en-US.js, zh-CN.js, …)
├── plugins/             # Nuxt plugins (settings, auth)
├── server/
│   ├── api/             # API routes (config, auth, services, geo, update)
│   ├── storage/         # Storage drivers & stores (Config, User, Preferences)
│   ├── utils/           # Server utilities (auth, config, services, favicon)
│   └── validations/     # Zod schemas (config, service)
├── types/               # TypeScript type definitions
└── utils/               # Shared utilities (registry, style)
data/                    # Runtime data (config.yml, users.json, icons/)
```

## Getting Started / 快速开始

### Development / 开发环境

```shell
git clone https://github.com/ThunderLotus/homenest.git
cd homenest
npm install --legacy-peer-deps
npm run dev          # → http://localhost:13008
```

Default login: **Admin / Admin**
> 默认登录：**Admin / Admin**

### Production (Node) / 生产环境（Node）

```shell
npm run build
node .output/server/index.mjs    # → http://localhost:3000
```

### Production (Docker) / 生产环境（Docker）

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

## Deployment / 部署

### Self-hosted (Docker / VPS) / 自托管（Docker / VPS）

Default mode —uses `FilesystemDriver` with the `data/` directory. No extra configuration needed.
> 默认模式 — 使用 `FilesystemDriver` 与 `data/` 目录，无需额外配置。

### Vercel

**Prerequisites**: A [Vercel](https://vercel.com) account and a [GitHub](https://github.com) account.
> **前置条件**：拥有 [Vercel](https://vercel.com) 账号和 [GitHub](https://github.com) 账号。

#### Step 1 — Fork the repository / 步骤 1 — Fork 仓库

1. Go to `https://github.com/ThunderLotus/homenest` (your fork)
2. Click **Fork** to create your own copy

> 1. 访问 `https://github.com/ThunderLotus/homenest`（你的 fork）
> 2. 点击 **Fork** 创建你自己的副本

#### Step 2 — Create an Upstash Redis database / 步骤 2 — 创建 Upstash Redis 数据库

1. Go to [Upstash Console](https://console.upstash.com) → **Redis** — **Create Database**
2. Name it `homenest-kv`, choose a region close to your Vercel deployment region
3. Click **Create**
4. Copy the **REST URL** (`https://....upstash.io`) and **REST Token** —you'll need these in Step 4

> 1. 进入 [Upstash 控制台](https://console.upstash.com) → **Redis** — **Create Database**
> 2. 命名为 `homenest-kv`，选择与 Vercel 部署区域较近的区域
> 3. 点击 **Create**
> 4. 复制 **REST URL**（`https://....upstash.io`）和 **REST Token** — 步骤 4 会用到

#### Step 3 — Import to Vercel / 步骤 3 — 导入 Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** — **Project**
2. Import your forked `homenest` repository
3. Vercel auto-detects Nuxt → keep the default build settings
4. **Don't deploy yet** —click **Environment Variables** first

> 1. 进入 [Vercel 仪表板](https://vercel.com/dashboard) → **Add New** — **Project**
> 2. 导入你 fork 的 `homenest` 仓库
> 3. Vercel 会自动识别 Nuxt — 保持默认构建设置
> 4. **先不要部署** — 先点击 **Environment Variables** 配置环境变量

#### Step 4 — Configure environment variables / 步骤 4 — 配置环境变量

In the Vercel project settings → **Environment Variables**, add:
> 在 Vercel 项目设置 → **Environment Variables** 中添加：

| Name | Value | Environments |
|---|---|---|
| `KV_REST_API_URL` | Your Upstash REST URL from Step 2 | Production, Preview, Development |
| `KV_REST_API_TOKEN` | Your Upstash REST Token from Step 2 | Production, Preview, Development |

> | 名称 | 值 | 环境 |
> |---|---|---|
> | `KV_REST_API_URL` | 步骤 2 获取的 Upstash REST URL | Production, Preview, Development |
> | `KV_REST_API_TOKEN` | 步骤 2 获取的 Upstash REST Token | Production, Preview, Development |

> **Alternative**: Instead of manual env vars, you can link a Vercel KV store (Storage → KV — Create — Connect to Project). Vercel auto-injects the same variables. Either approach works.
>
> **替代方案**：也可以不手动设置环境变量，而是关联 Vercel KV 存储（Storage → KV — Create — Connect to Project），Vercel 会自动注入相同的变量。两种方式均可。

#### Step 5 — Deploy / 步骤 5 — 部署

1. Click **Deploy**
2. Wait for the build to complete (~2-3 min)
3. Visit your deployment URL (e.g. `https://homenest-xxx.vercel.app`)
4. Log in with **Admin / Admin** —change the password immediately

> 1. 点击 **Deploy**
> 2. 等待构建完成（约 2-3 分钟）
> 3. 访问部署地址（如 `https://homenest-xxx.vercel.app`）
> 4. 使用 **Admin / Admin** 登录 — 请立即修改密码

#### Step 6 — Verify persistence / 步骤 6 — 验证持久化

1. Add a few services in the editor and click **Save**
2. Redeploy the project (or push a new commit) —your config should persist
3. Check Upstash console — **Data** tab to see stored keys (`config.yml`, `users.json`, etc.)

> 1. 在编辑器中添加几个服务并点击 **保存**
> 2. 重新部署项目（或推送新提交）— 配置应该保持不变
> 3. 查看 Upstash 控制台 — **Data** 标签页，确认存储的 key（`config.yml`、`users.json` 等）

> **Note**: WebSocket is auto-disabled on Vercel (serverless doesn't support long connections). Config sync uses 10-second version polling instead.
>
> **注意**：Vercel Serverless 不支持长连接，WebSocket 会自动禁用，改用 10 秒版本轮询同步配置。

#### Step 7 — Hide Vercel deployment info from GitHub (optional) / 步骤 7 — 在 GitHub 上隐藏 Vercel 部署信息（可选）

By default, Vercel exposes your app URL on your fork's GitHub repo in two places: the **Deployments** sidebar and the **About** section (homepage URL). To prevent this, **disable at the source** in Vercel:
> 默认情况下，Vercel 会在 fork 仓库的 GitHub 页面暴露你的 App URL，出现在两处：**Deployments** 侧边栏和 **About** 区域（Homepage URL）。要阻止这种情况，**在 Vercel 端从源头关闭**：

1. Vercel Dashboard → your project → **Settings** → **Git** → **Connected Git Repository**
2. Turn off **Pull Request Comments** —stops Vercel bot from commenting on PRs
3. Turn off **deployment_status Events** —stops Vercel from creating deployment records on GitHub

> 1. Vercel 仪表板 → 你的项目 → **Settings** → **Git** → **Connected Git Repository**
> 2. 关闭 **Pull Request Comments** —阻止 Vercel bot 在 PR 上评论
> 3. 关闭 **deployment_status Events** —阻止 Vercel 在 GitHub 上创建部署记录

Then clean up pre-existing records (one-time):
> 然后一次性清理已有记录：

4. Fork repo → **Actions** → **Cleanup All Deployments** → **Run workflow** —deletes all old deployment records, environments, and clears the homepage URL
5. Fork repo → **Settings** → **General** → **Homepage URL** → clear → **Save** (if still set)

> 4. Fork 仓库 → **Actions** → **Cleanup All Deployments** → **Run workflow** —删除所有旧的部署记录、环境，并清除 Homepage URL
> 5. Fork 仓库 → **Settings** → **General** → **Homepage URL** → 清空 → **Save**（如果仍被设置）

After this, GitHub won't show any Vercel deployment info on future deploys.
> 之后，GitHub 不会再显示任何 Vercel 部署信息。

> **Note**: Vercel may still auto-set the repo **Homepage URL** (Website field in About) after production deploys —there's no Vercel-side toggle for this. The included `clear-homepage-url.yml` workflow auto-clears it on each deploy via `repository_dispatch` event. To set a custom URL instead of clearing, edit `HOMEPAGE_URL` in that workflow.
>
> **注意**：Vercel 仍可能在生产部署后自动设置仓库 **Homepage URL**（About 区域的 Website 字段）—Vercel 端无开关。项目内置的 `clear-homepage-url.yml` workflow 会通过 `repository_dispatch` 事件在每次部署后自动清除。想设置自定义 URL 而非清除，编辑该 workflow 中的 `HOMEPAGE_URL`。

---

### Cloudflare Pages

**Prerequisites**: A [Cloudflare](https://cloudflare.com) account and a [GitHub](https://github.com) account.
> **前置条件**：拥有 [Cloudflare](https://cloudflare.com) 账号和 [GitHub](https://github.com) 账号。

#### Step 1 — Fork the repository / 步骤 1 — Fork 仓库

Same as Vercel Step 1 —fork `ThunderLotus/homenest` to your GitHub account.
> 与 Vercel 步骤 1 相同 — 将 `ThunderLotus/homenest` fork 到你的 GitHub 账号。

#### Step 2 — Create an Upstash Redis database / 步骤 2 — 创建 Upstash Redis 数据库

Same as Vercel Step 2 —create an Upstash Redis instance and copy the REST URL and Token.
> 与 Vercel 步骤 2 相同 — 创建 Upstash Redis 实例并复制 REST URL 和 Token。

> **Why Upstash instead of Cloudflare KV?** HomeNest uses `@vercel/kv` SDK which talks to Upstash Redis REST API. Cloudflare KV has a different API and is not currently supported. Upstash free tier (10K commands/day) is sufficient for personal use.
>
> **为什么用 Upstash 而不用 Cloudflare KV？** HomeNest 使用 `@vercel/kv` SDK，它通过 REST API 连接 Upstash Redis。Cloudflare KV 的 API 不同，目前不兼容。Upstash 免费额度（每天 10K 命令）对个人使用足够。

#### Step 3 — Create a Cloudflare Pages project / 步骤 3 — 创建 Cloudflare Pages 项目

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** — **Create** — **Pages** — **Connect to Git**
2. Select your forked `homenest` repository
3. Set the **Framework preset** to `None` (we'll configure manually)
4. Set **Build command** to `NITRO_PRESET=cloudflare-pages npx nuxi build`
5. Set **Build output directory** to `.output/public`
6. Click **Save and Deploy** —but **don't worry if the first build fails**, you still need to add environment variables

> 1. 进入 [Cloudflare 仪表板](https://dash.cloudflare.com) → **Workers & Pages** — **Create** — **Pages** — **Connect to Git**
> 2. 选择你 fork 的 `homenest` 仓库
> 3. 将 **Framework preset** 设为 `None`（手动配置）
> 4. 设置 **Build command** 为 `NITRO_PRESET=cloudflare-pages npx nuxi build`
> 5. 设置 **Build output directory** 为 `.output/public`
> 6. 点击 **Save and Deploy** — **首次构建可能失败**，因为还需要添加环境变量

#### Step 4 — Configure environment variables / 步骤 4 — 配置环境变量

Go to **Settings** — **Environment variables** —add the following for **Production** (and **Preview** if needed):
> 进入 **Settings** — **Environment variables**，为 **Production**（和 **Preview**，如需要）添加以下变量：

| Variable name | Value |
|---|---|
| `KV_REST_API_URL` | Your Upstash REST URL from Step 2 |
| `KV_REST_API_TOKEN` | Your Upstash REST Token from Step 2 |
| `NITRO_PRESET` | `cloudflare-pages` |

> | 变量名 | 值 |
> |---|---|
> | `KV_REST_API_URL` | 步骤 2 获取的 Upstash REST URL |
> | `KV_REST_API_TOKEN` | 步骤 2 获取的 Upstash REST Token |
> | `NITRO_PRESET` | `cloudflare-pages` |

#### Step 5 — Enable `nodejs_compat` flag / 步骤 5 — 启用 `nodejs_compat` 兼容标志

1. Go to **Settings** — **Functions** — **Compatibility flags**
2. Add `nodejs_compat` to both **Production** and **Preview** compatibility flags
3. This enables Node.js APIs (needed for `crypto.scryptSync` used in legacy password verification)

> 1. 进入 **Settings** — **Functions** — **Compatibility flags**
> 2. 在 **Production** 和 **Preview** 的兼容标志中都添加 `nodejs_compat`
> 3. 这会启用 Node.js API 兼容（用于旧版密码验证中的 `crypto.scryptSync`）

#### Step 6 — Deploy / 步骤 6 — 部署

1. Go to **Deployments** —click **Retry deployment** (or push a new commit to trigger a rebuild)
2. Wait for the build to complete (~3-5 min)
3. Visit your Pages URL (e.g. `https://homenest.pages.dev`)
4. Log in with **Admin / Admin** —change the password immediately

> 1. 进入 **Deployments** — 点击 **Retry deployment**（或推送新提交触发重新构建）
> 2. 等待构建完成（约 3-5 分钟）
> 3. 访问 Pages 地址（如 `https://homenest.pages.dev`）
> 4. 使用 **Admin / Admin** 登录 — 请立即修改密码

#### Step 7 — Verify persistence / 步骤 7 — 验证持久化

1. Add a few services in the editor and click **Save**
2. Trigger a redeploy —your config should persist
3. Check Upstash console — **Data** tab to verify stored keys

> 1. 在编辑器中添加几个服务并点击 **保存**
> 2. 触发重新部署 — 配置应该保持不变
> 3. 查看 Upstash 控制台 — **Data** 标签页，确认存储的 key

> **Notes**:
> - WebSocket is auto-disabled on Cloudflare Pages. Config sync uses 10-second version polling.
> - Password hashing uses PBKDF2 via Web Crypto API (<1ms CPU, well within Workers' 10ms limit).
> - `@network-utils/tcp-ping` is removed —service health checks use HTTP fetch only.
>
> **注意事项**：
> - Cloudflare Pages 不支持长连接，WebSocket 会自动禁用，改用 10 秒版本轮询同步配置。
> - 密码哈希使用 Web Crypto API 的 PBKDF2（<1ms CPU，满足 Workers 10ms 限制）。
> - 已移除 `@network-utils/tcp-ping` — 服务健康检查仅使用 HTTP fetch。

### Releasing a New Version / 发布新版本

Docker images are published automatically via GitHub Actions (`.github/workflows/release.yml`). Pushing a `v*.*.*` git tag triggers a multi-arch build (linux/amd64 + linux/arm64) pushed to Docker Hub and GitHub Container Registry.
> Docker 镜像通过 GitHub Actions（`.github/workflows/release.yml`）自动发布。推送 `v*.*.*` git tag 会触发多架构构建（linux/amd64 + linux/arm64），推送到 Docker Hub 和 GitHub Container Registry。

#### One-time setup — GitHub Secrets / 一次性设置 — GitHub Secrets

1. Create a Docker Hub access token: [hub.docker.com](https://hub.docker.com) → Account Settings → Security → New Access Token
2. Add repository secrets in your fork → Settings → Secrets and variables → Actions:

> 1. 创建 Docker Hub 访问令牌：[hub.docker.com](https://hub.docker.com) → Account Settings → Security → New Access Token
> 2. 在你的 fork → Settings → Secrets and variables → Actions 中添加仓库密钥：

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | The access token from step 1 |

> | 密钥 | 值 |
> |---|---|
> | `DOCKERHUB_USERNAME` | 你的 Docker Hub 用户名 |
> | `DOCKERHUB_TOKEN` | 步骤 1 创建的访问令牌 |

#### Release flow / 发布流程

1. Bump `version` in `package.json` (e.g. `1.0.2`), or run `npm run release` which uses `changelogen` to bump + generate CHANGELOG + tag automatically
2. Push the tag:
> 1. 修改 `package.json` 中的 `version`（如 `1.0.2`），或运行 `npm run release`，使用 `changelogen` 自动 bump + 生成 CHANGELOG + 打 tag
> 2. 推送 tag：

```shell
git tag v1.0.2
git push origin v1.0.2
```

3. Watch the build: GitHub → Actions → "Release Docker Image" (~5-10 min for multi-arch)
> 3. 查看构建：GitHub → Actions → "Release Docker Image"（多架构约 5-10 分钟）

#### Resulting images / 产物镜像

For tag `v1.0.2`, the workflow pushes:
> 对于 tag `v1.0.2`，workflow 会推送：

| Registry | Tags |
|---|---|
| Docker Hub | `<DOCKERHUB_USERNAME>/homenest:v1.0.2`, `:latest`, `:v1` |
| GHCR | `ghcr.io/<DOCKERHUB_USERNAME>/homenest:v1.0.2`, `:latest`, `:v1` |

> | 注册表 | Tags |
> |---|---|
> | Docker Hub | `<DOCKERHUB_USERNAME>/homenest:v1.0.2`, `:latest`, `:v1` |
> | GHCR | `ghcr.io/<DOCKERHUB_USERNAME>/homenest:v1.0.2`, `:latest`, `:v1` |

> **Note**: The tag must match `v*.*.*` (three-segment semver) to trigger the workflow and produce the `latest` + `v<major>` tags. Prerelease tags like `v2.0.0-alpha.1` only produce the exact tag. The version shown in the UI comes from `package.json`'s `version` field, injected at build time — no need to touch `config.sample.yml`.
>
> **注意**：tag 必须匹配 `v*.*.*`（三段式 semver）才能触发 workflow 并生成 `latest` + `v<major>` tag。预发布 tag 如 `v2.0.0-alpha.1` 只生成精确 tag。UI 中显示的版本来自 `package.json` 的 `version` 字段，构建时注入 — 无需修改 `config.sample.yml`。

### Environment Variables / 环境变量

| Variable | Purpose | Default |
|---|---|---|
| `HOMENEST_GITHUB_REPO` | GitHub repo for update notifications | `ThunderLotus/homenest` (disabled) |
| `KV_REST_API_URL` | Vercel KV / Upstash Redis URL | —|
| `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis token | —|
| `MAFL_STORAGE_DRIVER` | Force storage driver (`vercel-kv`) | auto-detect |

> | 变量 | 用途 | 默认值 |
> |---|---|---|
> | `HOMENEST_GITHUB_REPO` | GitHub 仓库地址，用于更新通知 | `ThunderLotus/homenest`（禁用） |
> | `KV_REST_API_URL` | Vercel KV / Upstash Redis URL | 无 |
> | `KV_REST_API_TOKEN` | Vercel KV / Upstash Redis token | 无 |
> | `MAFL_STORAGE_DRIVER` | 强制指定存储驱动（`vercel-kv`） | 自动检测 |

### Storage Driver Selection / 存储驱动选择

| Environment | Detection | Driver |
|---|---|---|
| Self-hosted | Default | `FilesystemDriver` —`data/` |
| Vercel | `KV_REST_API_URL` present | `VercelKVDriver` —Upstash Redis |
| Manual | `MAFL_STORAGE_DRIVER=vercel-kv` | `VercelKVDriver` |

> | 环境 | 检测方式 | 驱动 |
> |---|---|---|
> | 自托管 | 默认 | `FilesystemDriver` → `data/` |
> | Vercel | `KV_REST_API_URL` 存在 | `VercelKVDriver` → Upstash Redis |
> | 手动指定 | `MAFL_STORAGE_DRIVER=vercel-kv` | `VercelKVDriver` |

## Storage Architecture / 存储架构

```
┌────────────── API Routes (src/server/api/) ─────────────────────────┐
├────────────── Dedicated Stores (src/server/storage/) ────────────────────────┐
│  ConfigStore  UserStore  PreferencesStore  IconStore │
├────────────── StorageDriver Abstraction ─────────────────────────┐
│  FilesystemDriver          VercelKVDriver           │
├────────────── Backing Storage ─────────────────────────────────┐
│  useStorage('data')       @vercel/kv (Upstash Redis) │
│  + global TTL cache (5s)  + session secret cache     │
└──────────────────────────────────────────────────┘
```

### Data Layout / 数据布局

**Self-hosted** (`data/`):
> **自托管**（`data/`）：

```
data/
├── config.yml              # Site config (YAML) / 站点配置
├── users.json              # User accounts (JSON) / 用户账户
├── .session-secret         # Session signing secret / Session 签名密钥
├── preferences_*.json      # User preferences / 用户偏好
└── icons/                  # Cached icons / 缓存图标
```

**Vercel / Cloudflare** (Upstash Redis KV):
> **Vercel / Cloudflare**（Upstash Redis KV）：

```
"config.yml"             — YAML string / YAML 字符串
"users.json"             — JSON object / JSON 对象
".session-secret"        — hex string / hex 字符串
"__raw:icons/<hash>.png" — base64-encoded bytes / base64 编码字节
"__ver:config.yml"       — timestamp (version detection) / 时间戳（版本检测）
```

## Usage / 使用方式

### Login / 登录

- Default credentials: **Admin / Admin** (change immediately after first login)
- Admin uses `config.yml` (default config)
- Regular users get `config_<username>.yml` (per-user config)

> - 默认凭据：**Admin / Admin**（首次登录后请立即修改密码）
> - 管理员使用 `config.yml`（默认配置）
> - 普通用户使用 `config_<用户名>.yml`（每人独立配置）

### Editor / 编辑器

Click the **Edit** button (top-left pencil icon) to enter edit mode:
> 点击左上角 **编辑** 按钮（铅笔图标）进入编辑模式：

1. **Add group** —Click "Add group" to create a new service group
2. **Add service** —Click "Add service" within a group, choose service type
3. **Drag & drop** —Reorder groups and services by dragging
4. **Property panel** —Click any service to open the side panel:
   - Set title, description, link, icon, tags
   - Configure service-specific options (e.g. coordinates for Weather)
   - Set status monitoring (enable + interval)
   - Customize card style (border radius, padding, colors—
5. **Global settings** —Click the gear icon to edit page title, theme, language, grid layout
6. **Save** —Click "Save" to persist changes to `config.yml`

> 1. **添加分组** — 点击"添加分组"创建新的服务分组
> 2. **添加服务** — 在分组内点击"添加服务"，选择服务类型
> 3. **拖拽排序** — 拖动分组和服务进行重新排列
> 4. **属性面板** — 点击任意服务打开侧边面板：
>    - 设置标题、描述、链接、图标、标签
>    - 配置服务专属选项（如天气服务的坐标）
>    - 设置状态监控（启用 + 间隔秒数）
>    - 自定义卡片样式（圆角、内边距、颜色…）
> 5. **全局设置** — 点击齿轮图标编辑页面标题、主题、语言、网格布局
> 6. **保存** — 点击"保存"将更改持久化到 `config.yml`

### Service Types / 服务类型

#### Base / 基础卡片

Service card with optional health monitoring (HTTP HEAD probe, 5s timeout).
> 服务卡片，可选健康监控（HTTP HEAD 探测，5 秒超时）。

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

#### IP API / IP 信息

Displays visitor's IP address and geographic location (24min server cache).
> 显示访问者的 IP 地址和地理位置（24 分钟服务端缓存）。

```yaml
- title: IP Info
  type: ip-api
  options:
    flagIcon: true
```

#### OpenWeatherMap / 天气

Displays current weather for a location (24min server cache). This is a **data service** —no `link` field needed.
> 显示指定位置的实时天气（24 分钟服务端缓存）。这是 **数据型服务** — 无需填写 `link` 字段。

```yaml
- title: Weather
  type: openweathermap
  options:
    city: Beijing          # Optional: enter city name, then click "Search city"
    lat: 39.9042            # Latitude (required)
    lon: 116.4074           # Longitude (required)
    units: metric           # metric=°C, imperial=°F, standard=K
  secrets:
    apiKey: your-key        # Free key from home.openweathermap.org/api_keys
```

**Getting coordinates** (in editor property panel):
> **获取坐标**（在编辑器属性面板中）：

- **City search** —Enter a city name in the "City" field, click "Search city" to auto-fill lat/lon via OpenWeatherMap Geocoding API
- **IP detection** —Click "Detect coordinates" to auto-fill lat/lon from your current IP
- **Manual** —Look up coordinates at [LatLong.net](https://www.latlong.net/)

> - **城市搜索** — 在"城市"栏输入城市名，点击"搜索城市"通过 OpenWeatherMap Geocoding API 自动填入经纬度
> - **IP 定位** — 点击"获取坐标"根据当前 IP 自动填入经纬度
> - **手动查询** — 在 [LatLong.net](https://www.latlong.net/) 查询坐标

**Free API key**: Register at [openweathermap.org](https://home.openweathermap.org/api_keys) —1,000 calls/day for free. The `apiKey` is stored server-side only and never sent to the frontend.
> **免费 API Key**：在 [openweathermap.org](https://home.openweathermap.org/api_keys) 注册，免费额度 1000 次/天。`apiKey` 仅存储在服务端，不会发送到前端。

### Icons / 图标

- **[Iconify](https://icon-sets.iconify.design/)** —200,000+ vector icons (e.g. `simple-icons:github`, `lucide:home`)
- **Emoji** —Any valid emoji (e.g. `🏠`)
- **URL** —Direct image URL (downloaded & cached locally)
- **Local** —Custom images in `data/icons/`

> - **[Iconify](https://icon-sets.iconify.design/)** — 200,000+ 矢量图标（如 `simple-icons:github`、`lucide:home`）
> - **Emoji** — 任意合法 emoji（如 `🏠`）
> - **URL** — 直接图片 URL（下载后本地缓存）
> - **本地** — `data/icons/` 中的自定义图标

### User Management (Admin) / 用户管理（管理员）

Navigate to **Admin — Users** (`/admin/users`):
> 进入 **管理 — 用户**（`/admin/users`）：

- Add/remove users
- Reset passwords
- Export user configs
- Roles: Admin (access all configs) / User (access own config only)

> - 添加/删除用户
> - 重置密码
> - 导出用户配置
> - 角色：管理员（访问所有配置）/ 普通用户（仅访问自己的配置）

### Language & Theme / 语言与主题

- **Language** — Switch from the toolbar dropdown (en, zh)
- **Theme** —Switch from the toolbar (system/light/dark/deep/sepia/bluer)
- Settings persist per-user in `preferences_*.json`

> - **语言** — 从工具栏下拉菜单切换（en, zh）
> - **主题** — 从工具栏切换（system/light/dark/deep/sepia/bluer）
> - 设置按用户保存在 `preferences_*.json` 中

### Multi-language Content / 多语言内容

Config supports i18n for page title, group titles, and service titles/descriptions:
> 配置支持页面标题、分组标题、服务标题/描述的国际化：

```yaml
baseLang: en        # Default language of field values
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

## Multi-language UI / 多语言 UI

| Language | Code |
|---|---|
| English | `en` |
| Chinese | `zh` |

> | 语言 | 代码 |
> |---|---|
> | 英语 | `en` |
> | 中文 | `zh` |

## Free-tier Resource Usage / 免费额度资源消耗

Optimized for Vercel Hobby and Cloudflare Workers free plans:
> 针对 Vercel Hobby 和 Cloudflare Workers 免费计划优化：

| Resource | Vercel Hobby | Cloudflare Workers |
|---|---|---|
| Function calls | ~1,700/day | ~1,700/day |
| Upstash KV commands | ~1,600/day (16% of 10K) | ~1,600/day (16% of 10K) |
| CPU per request | <100ms | <1ms (PBKDF2) |
| Bandwidth | <1GB/month | unlimited |

> | 资源 | Vercel Hobby | Cloudflare Workers |
> |---|---|---|
> | 函数调用 | ~1,700/天 | ~1,700/天 |
> | Upstash KV 命令 | ~1,600/天（16% of 10K） | ~1,600/天（16% of 10K） |
> | 每请求 CPU | <100ms | <1ms (PBKDF2) |
> | 带宽 | <1GB/月 | 无限 |

*Estimates: 1 user, 5 service cards, 4h/day active. See [NOTICE](NOTICE) for full optimization list.*
> *估算条件：1 个用户、5 个服务卡片、每天活跃 4 小时。完整优化列表见 [NOTICE](NOTICE)。*

## Credits / 致谢

This project is a fork of [Mafl](https://github.com/hywax/mafl) by [Hywax](https://github.com/hywax). All original design, configuration schema, and service implementations originate from the Mafl project.
> 本项目是 [Mafl](https://github.com/hywax/mafl)（作者 [Hywax](https://github.com/hywax)）的 fork。原始设计、配置 schema 和服务实现均来自 Mafl 项目。

Original Mafl contributors:
> 原始 Mafl 贡献者：

<img src="https://raw.githubusercontent.com/hywax/mafl/main/docs/public/contributors.svg" alt="Mafl Contributors" width="100%"/>

## License & Attribution / 许可证与版权声明

- **License**: [MIT](LICENSE) —Copyright (c) 2023-PRESENT Hywax (original Mafl), Copyright (c) 2026-PRESENT HomeNest contributors
- **Fork notice**: See [NOTICE](NOTICE) for the full list of modifications from the original Mafl
- **Third-party**: See [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES) for all third-party software, icons, avatars, and their licenses

> - **许可证**：[MIT](LICENSE) — Copyright (c) 2023-PRESENT Hywax (原始 Mafl), Copyright (c) 2026-PRESENT HomeNest contributors
> - **Fork 声明**：见 [NOTICE](NOTICE)，包含相对原始 Mafl 的完整修改列表
> - **第三方资源**：见 [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES)，包含所有第三方软件、图标、头像库及其许可证
