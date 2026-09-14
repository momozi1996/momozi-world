# MoMoZi World · v2.0.0 内容探索版

> **当前版本已冻结：v2.0.0（2026-09-14）**。源码、静态资源、生产构建和验收清单已同步。冻结标签、目录边界和恢复方法见 [`FREEZE.md`](FREEZE.md)。根目录 `RELEASE.md` 是保留的 1.0 历史记录；当前验收在 `release/v2/RELEASE.md`。

保留 1.0 的粉紫小岛、自然色树木与水面、兔耳小车、地图、驾驶和小游戏。这次只在既有区域增加内容、小物件与可选的打卡纪念。

## 打开小岛

```sh
cd site
npm start
```

打开 **http://localhost:5179/**。如果该端口已经运行本项目，刷新页面即可。必须使用 HTTP 服务，不能双击 `dist/index.html`。

**推荐先看**：底部「小岛护照」→ 随便读一张便签 → 「去这里」现场打卡。也可以完全忽略护照，继续自由开车。

## 2.0 新增了什么

| 原有区域 | 新的小惊喜 |
| --- | --- |
| 出生点 | 小信箱与「给路过的你」欢迎便签 |
| 经历区 | 书签小桌，把六段公开经历串成一条来时路 |
| 作品工坊 | 翻开的 Skills 书页，以及输入 → 步骤 → 解释的概念任务卡 |
| AI 实验室 | 三色导演圆桌，为同一个短片题目选择叙事 / 影像 / 制作立场 |
| 兔子广场 | 小岛邮局，制作并保存一张带日期的风景明信片 |

- **三枚护照章 + 五处现场打卡**：不限制顺序，不锁内容，不自动弹窗、不计时。读取内容不要求到场；现场章需要靠近地点。
- **原存档兼容**：护照复用 `achievements` 本机存档，不新增奖励门槛，不影响旧成就总数和车漆。可以只重玩护照。
- **三款明信片**：出生点、兔子广场夜景、作品工坊的固定实景图，1200 × 900 PNG；不含访客留言，不传服务器。不是实时截图或真实邮件。
- **真实小书架**：从你提供的 momozi.vip 与 awesome-ai-knowledge 精选 6 篇真实内容，挂到现有角落；附导读、适读人群、发表 / 更新 / 核对日期和原文链接。MOMO CODE 另补作者手记、原文终端截图、流程与能力边界。
- **内容入口**：五个原有作品都可打开作品卡；移动端的经历 / 作品 / 账号页采用紧凑头部。
- **诚实标注**：Skills 卡与圆桌是预写概念演示，不是实时 AI，也不是仓库实测结果。没有新增虚构文章、私人爱好或项目成果。

## 文件与验证

- 正式源码：`site/sources/`；公共资源：`site/static/`；生产网页：`site/dist/`。
- 内容数据：`site/sources/data/discoveries.js`、`readingShelf.js`；出处核对：`release/v2/checks/content-sources.json`。
- 互动与点位：`site/sources/Game/MomoDiscoveries.js`。
- 2.0 验收记录：[`release/v2/RELEASE.md`](release/v2/RELEASE.md)。

```sh
cd site
npm test
npm run build:online
npm run verify:v2
# 开发（默认 .env 为本机离线世界）
npm run dev -- --port 5192
```

换机器时先安装 Node.js >=22.12.0 / npm >=10.5.1，再 `npm ci`；依赖版本没有升级。不要覆盖已有 `.env`。生产环境使用同源 HTTP + WebSocket `/world`，不能只上传 dist 获得完整多人功能。

## 1.0 回退与安全边界

2.0 在 **`feat/v2-small-discoveries`** 分支开发；1.0 Git 基线是 **`fa9104b`**，`main` 未移动。可以在另一个 worktree / 副本中检出该提交，不要在当前目录硬重置而丢失工作。

原始 [`RELEASE.md`](RELEASE.md)、`release/manifest.sha256.json` 和 `release/checks/` 保持原样。`npm run verify:release` **仍是 1.0 校验**，在 2.0 上显示差异是预期行为；2.0 使用独立的 `verify:v2`，不重写旧清单。

`site/data/` 是可变运行状态，不属于静态快照；当前已有的世界数据变更不属于这次代码补丁。升级前另行备份。`research/`、`.env`、原始素材和运行状态不能作为静态目录公开；服务器仅公开 `site/dist/`。当前雇主继续匿名。

基于 Bruno Simon folio-2025，保留 `site/license.md` 的 MIT 许可与已有署名。上游版本锚点 `41046b57eeed8d156d9c3fd7fa259900baef7816`。
