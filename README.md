# MoMoZi World · 封板版 v1.0.0

**封板日期：2026-09-11（Asia/Shanghai）。最终项目是本目录下的 `site/`，正式网页产物是 `site/dist/`。**

这一版保留已确认的个人背景、开源作品和社交账号，以及粉紫色主视觉、棕色树干、绿／黄绿色树叶、蓝色水面与暖色发光灯。封板检查不改变已确认的页面、3D 场景和玩法，也不升级依赖版本。

## 直接打开已封板版本

在 `momozi-world/site/` 下运行：

```sh
# 本机依赖已安装；换机器时才需要执行 npm ci
npm start
```

浏览器打开 `http://localhost:5179/`。健康检查：`http://localhost:5179/api/health`。

- 若 5179 已被本项目占用，直接打开页面，不必重复启动；其他应用占用时可以 `PORT=5181 npm start`。
- 必须使用 HTTP 服务，不能双击 `dist/index.html`。建议先用本次实测的 Chrome 打开。
- 默认只监听本机。需要对外服务时设置 `HOST=0.0.0.0`，并配置 HTTPS、WebSocket `/world` 反向代理和运行状态持久化。
- 完整在线版不是只上传 `dist/` 即可：还需要 `server.mjs`、`sources/shared/WorldState.js`、package 文件和已安装依赖；最稳妥是以 `site/` 为部署工作目录。
- **不要把 `momozi-world/` 整体当作静态网站公开。** HTTP 公开目录只能是 `site/dist/`；`research/`、`.env`、状态文件和原始工程素材都不是网页公开目录。

## 目录导航：哪个才是最新版？

| 目录 / 文件 | 定位 | 是否参与网站运行 |
| --- | --- | --- |
| `site/sources/` | 唯一有效的应用源码，含最终内容和配色 | 构建输入；服务端还使用 `shared/WorldState.js` |
| `site/static/` | 模型、纹理、字体、声音等公共资源 | 构建时原样复制到 dist |
| `site/dist/` | 本次从最新源码重新构建并验收的正式产物 | **生产服务器实际对外提供的网页** |
| `site/server.mjs` | HTTP + WebSocket 同源服务器 | 在线版必须运行 |
| `site/data/` | 访客互动 / 世界状态 | 可变运行数据，不属于冻结快照；升级前单独备份 |
| `site/resources/` | Blender、PSD 等原始创作素材 | 不直接加载；保留供后续编辑 |
| `site/node_modules/` | 按 lockfile 安装的依赖 | 可用 `npm ci` 重建；不是源代码 |
| `site/tests/` | 内容、配色、状态与服务端自动化测试 | 仅验证 |
| `research/` | 过程研究、旧截图、原始资料、历史备份和测试脚本 | **不被网站加载，不是另一套正式版本** |
| `release/checks/` | 本次封板构建、测试报告与最终浏览器截图 | 仅验收证据 |
| `release/manifest.sha256.json` | 逐文件 SHA256 快照、目录统计、构建环境和封板时间 | 仅完整性校验 |
| `RELEASE.md` | 验收范围、注意事项和复验命令 | 交付说明 |

`research/content-before/`、`research/color-before/` 都是修改前备份。旧截图与历史说明保留原样；**最终截图请看 `release/checks/colors/` 与 `release/checks/content/`**。不要在封板目录上重跑 `research/customize.py` 或历史下载脚本，它们可能覆盖当前文件。

## 验证文件仍是封板版本

```sh
cd site
npm run verify:release
```

校验源码、静态资源、dist、配置模板、依赖锁文件、原始素材、历史文件、文档和验收证据，报告修改、缺失或新增文件；同时检查每个静态资源与 dist 的内容一致。`.env`、`node_modules/`、`data/` 和工具缓存不纳入文件冻结，完整排除列表写在 manifest 中。依赖复现使用 `package-lock.json` + `npm ci`。项目 `.npmrc` 固定了已有依赖树所需的 `legacy-peer-deps=true`：上游未启用的 `vite-plugin-restart@0.4.1` 声明的 Vite peer 范围较旧，避免新机器安装报 ERESOLVE；未升级或替换依赖。

这是**本地版本一致性检查**，不是数字签名、漏洞清零证明或远程线上部署校验。不要为了让检查变绿随意重写清单；未来修改需要重新构建、验收并建立新版本。

## 维护与重新构建（会改变封板产物）

依赖要求：Node.js **>=22.12.0**、npm **>=10.5.1**；本次实际环境及完整版本写在验收报告中。

```sh
cd site
npm ci                             # 严格按 package-lock.json 安装，不使用 --force / npm update
# 新机器且不存在 .env 时：cp .env.example .env
npm run build:online                # 正式在线版：同源 ws/wss /world；会清空并重建 dist
npm test
npm start
```

`.env.example` 已同步最终视觉默认值，无私密凭证。`VITE_*` 都会进入浏览器，不能放密钥；`HOST` / `PORT` / `STATE_FILE` 是服务端 shell 环境变量，不能仅写在 `.env` 中指望服务器读取。

开发：`npm run dev -- --port 5178`。离线静态版可用 `VITE_SERVER_URL= npm run build`，但会覆盖当前在线 `dist/`，并改用浏览器本地状态；请在**项目副本**中构建，不要当成封板产物直接覆盖。离线与在线的多人共享状态不是同一种运行模式。

## 内容与配色维护入口

- 个人资料、经历、账号、项目分类：`site/sources/data/profile.js`
- 3D 项目 / 社交信息：`site/sources/data/projects.js`、`social.js`
- 配色令牌：`site/sources/data/worldPalette.js`
- 自然材质分离：`site/sources/Game/MomoNature.js`
- 个人资料交互：`site/sources/Game/MomoProfile.js`

当前雇主保持匿名；私人简历 PDF 未放入网站。历史调查材料不应整体公开发布。

## 来源与许可

基于 Bruno Simon 的 folio-2025，保留 `site/license.md` 的 MIT 许可与网站中已有署名；上游版本锚点为 `41046b57eeed8d156d9c3fd7fa259900baef7816`。原 README 的游戏循环 / Blender 导出说明另存于 `research/upstream-readme.md`，仅作技术参考，其中旧启动命令不适用于此交付版。依赖、字体等第三方资源仍应遵循各自许可。
