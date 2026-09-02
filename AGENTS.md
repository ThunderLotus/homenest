# AGENTS.md

> Guidance for AI agents working on this repository. Read this first.

## Project

HomeNest — self-hosted homepage & dashboard. Nuxt 4 + Nitro, YAML config, multi-driver storage (filesystem / Vercel KV). Fork of Mafl.

## Key Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (port 13008) |
| `npm run build` | Production build → `.output/` |
| `npm run typecheck` | Type check (`nuxi typecheck`) |
| `npm run lint` | ESLint with auto-fix |
| `npm run release:tag` | Tag + push from `package.json` version → triggers Docker CI |

## Project Structure

```
src/                  Nuxt app (pages, components, plugins, server)
  server/             Nitro server (API, storage, utils, tasks)
    storage/          Storage drivers (filesystem, vercel-kv) + stores
    utils/config.ts   Config load/save, getInitialConfig, app version
config.sample.yml     Default config template (shown on first deploy)
nuxt.config.ts        Nuxt config — nitro.virtual injects sample + app version
scripts/release-tag.mjs  Release tagging script
.github/workflows/release.yml  Docker publish CI (on tag v*.*.*)
```

## Release Flow

**This is the canonical release procedure. Follow it exactly.**

1. **Bump version** in `package.json` — semver three-segment (e.g. `1.0.2` → `1.0.3`). This is the single source of truth for the app version.
2. **Commit and push** the version bump:
   ```shell
   git add package.json
   git commit -m "chore: bump version to 1.0.3"
   git push
   ```
3. **Tag and push** — reads version from `package.json` automatically:
   ```shell
   npm run release:tag
   ```
   This creates `v1.0.3` tag and pushes it. The script refuses if the tag already exists.
4. **CI auto-builds** — `.github/workflows/release.yml` triggers on `v*.*.*` tags:
   - Builds multi-arch images (linux/amd64 + linux/arm64)
   - Pushes to Docker Hub + GitHub Container Registry
   - Tags produced: `v1.0.3`, `latest`, `v1` (major)
5. **Verify** — GitHub → Actions → "Release Docker Image" (~5-10 min). Then:
   ```shell
   docker pull <DOCKERHUB_USERNAME>/homenest:latest
   ```

### Required GitHub Secrets (one-time setup)

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not password) |

Add at: repo → Settings → Secrets and variables → Actions → New repository secret.

### Release Rules

- Tag **must** be `v*.*.*` (three-segment semver) to trigger CI and produce `latest`. Two-segment like `v1.0` won't trigger.
- Prerelease tags (e.g. `v2.0.0-alpha.1`) only produce the exact tag, not `latest`.
- App version shown in the UI comes from `package.json` (injected at build time via `nitro.virtual #app-version`). **Do not** put version in `config.sample.yml`.
- `npm run release` (changelogen) does the full flow interactively (lint + typecheck + build + bump + changelog + tag + push). Use `npm run release:tag` when version is already bumped and you only need to tag.

## Storage

| Environment | Detection | Driver |
|---|---|---|
| Self-hosted (Docker/VPS) | Default | `FilesystemDriver` — `data/` dir |
| Vercel / Cloudflare | `KV_REST_API_URL` set | `VercelKVDriver` — Upstash Redis |

Override with `MAFL_STORAGE_DRIVER=filesystem|vercel-kv`.

## Conventions

- **Conventional commits** (`feat:`, `fix:`, `chore:`, `refactor:`) — changelogen generates CHANGELOG from these.
- **Config**: `config.sample.yml` is the template shown on first deploy (empty KV/fs). Existing configs are never overwritten.
- **Version**: single source is `package.json`. Injected via `nitro.virtual` at build time. Displayed as `v<version>` next to the page title.
- **Type check before commit**: `npm run typecheck` (pre-existing i18n locale errors in `app.vue`/`login.vue` are known and unrelated to most changes).