# MoMoZi World · v2.0.0 冻结版

冻结日期：2026-09-14（Asia/Shanghai）。**当前 `momozi-world/` 的正式应用是 2.0.0，源码、静态资源与生产构建已同步。**

本轮仅重新构建、复验与封板，不增加玩法、不调整设计、不升级依赖。

## 哪些文件是当前版本

| 路径 | 用途 |
| --- | --- |
| `site/sources/` | 当前 2.0 源码、内容与样式 |
| `site/static/` | 当前 2.0 公共资源 |
| `site/dist/` | 从上述源码重新生成的 2.0 正式网页 |
| `site/server.mjs` | 本机 / 自托管启动服务 |
| `site/package.json`、`site/package-lock.json` | 2.0.0 版本信息和依赖锁定 |
| `release/v2/RELEASE.md` | 当前 2.0 交付范围与验收说明 |
| `release/v2/checks/freeze.json` | 本次冻结复验摘要 |
| `release/v2/manifest.sha256.json` | 本次冻结文件的 SHA256 清单 |

**不是每个历史文件都要改写成 2.0。** 根目录 `RELEASE.md`、`release/manifest.sha256.json`、`release/checks/` 是保留的 1.0 原始封板记录；`research/`、原始素材和旧备份是历史资料，不参与当前网站运行。不要用这些旧记录判断当前应用版本。

## 冻结点

- 分支：`feat/v2-small-discoveries`
- 本地 Git 冻结标签：**`v2.0.0`**（注释标签，不移动已有标签）
- 1.0 基线：`fa9104b`；`main` 仍保留在该基线。
- 没有执行远程 push 或公网部署。

查看冻结提交：

```sh
git show --no-patch v2.0.0
git rev-parse 'v2.0.0^{commit}'
```

## 只读检查与运行

```sh
cd site
npm run verify:v2    # 文件完整性与 static / dist 一致性检查
npm test            # 18 项自动测试
npm start           # http://localhost:5179/；已运行则直接刷新
```

`verify:release` 是历史 1.0 校验；当前版本应使用 `verify:v2`。

冻结后不需要再运行构建或重生成验收截图；这些操作可能产生正常的文件差异。不要通过重写清单来掩盖修改。后续需求请从冻结点创建新分支，完成新版本验收后另立新标签和清单。

## 独立恢复，不破坏当前目录

在 `momozi-world/` 下执行（目标目录须不存在）：

```sh
git worktree add --detach ../momozi-world-v2.0.0-restore v2.0.0
cd ../momozi-world-v2.0.0-restore/site
npm ci              # Node >=22.12.0，npm >=10.5.1
npm run verify:v2
STATE_FILE=/tmp/momozi-restored-world.json PORT=5180 npm start
```

源码、构建、验收记录与冻结清单都已纳入 Git；新增构建文件即使被上游 `.gitignore` 忽略，也会显式纳入冻结提交。

## 不冻结的本机数据

- `site/data/world.json`：可变世界状态，本轮不覆盖、不清除、不作为 2.0 代码变更提交。历史 Git 基线已跟踪过此文件，因此恢复旧提交可能含基线状态；使用上面的独立 `STATE_FILE` 可避免混用。
- `site/.env`：本机配置，原样保留；本次不提交任何配置变更。它也已被历史 Git 基线跟踪，恢复时可能带出基线配置；不要把“本轮未改”误解为 Git 历史从未收录。
- `node_modules/`：本机依赖安装目录，按 lockfile 重建。
- 浏览器中的护照、成就和设置：仍保存在各自浏览器，不包含在代码冻结中。
- `.DS_Store`：系统目录元数据，忽略但不删除。

因此工作区若只剩 `site/data/world.json` 的既有修改，不代表源码没有冻结。冻结是代码版本边界，不是清空运行状态或将整个文件夹设为只读。迁移时请单独备份需要保留的运行数据与本机配置，且不要公开它们。
