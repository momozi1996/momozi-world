# MoMoZi World v2.0.0 · 内容与小惊喜

验收日期：2026-09-14（Asia/Shanghai）。**本地实现与验收完成；没有提交远程仓库或部署公网。**

本次按《momozi-world-后续迭代建议》选择内容与轻探索部分实现，不是将建议书全部候选项一次上线。地图骨架、自然配色、原有模型、驾驶物理、赛车与保龄球规则保持原样，依赖版本不升级。

## 冻结状态

2026-09-14 按用户要求再次重新构建、执行自动测试和生产浏览器 / 日夜画质回归后冻结为本地 Git 标签 **`v2.0.0`**。本轮没有修改应用源码或公共资源；`site/dist/` 与重新构建前逐文件一致。开发版浏览器记录沿用同日、同一应用源码的已通过结果；生产版和日夜回归已重新执行。完整冻结边界与恢复方法见 [`../../FREEZE.md`](../../FREEZE.md)，本轮复验摘要见 [checks/freeze.json](checks/freeze.json)。

## 实际交付

| 原有地点 | 新增内容 | 入口 |
| --- | --- | --- |
| 出生点 | 路边信箱、「给路过的你」便签 | 靠近互动 / 护照读便签 |
| 经历区 | 书签小桌、「一条来时路」 | 公开职业主线 → 原经历页 |
| 作品工坊 | 翻开的 Skills 书页 | 预设概念任务卡 → 既有作品卡 |
| AI 实验室 | 三色导演圆桌 | 叙事 / 影像 / 制作三种立场及选择理由 |
| 兔子广场 | 小岛邮局 | 三种固定风景 → 本机生成 PNG 明信片 |

- 5 处小物件仅为装饰，**不增加物理障碍**；复用现有交互提示，只在靠近时显示。快捷到达不会自动弹出内容或打卡。
- 小岛护照有 3 枚可选内容章和 5 处现场章，不限顺序、不计时、不锁资料或作品。读便签不要求到场；现场章需要靠近并主动点击。
- 复用原 `achievements` 本机存档，新增两个无奖励项的 Set 分组。**原 38 项成就及车漆门槛不变**；“只重玩护照”不清除旧成就。没有账号同步。
- 从用户提供的两个来源，手工选择 6 篇公开文章 / 知识笔记，挂到既有角落、作品卡、个人介绍与护照。不是自动资讯流。
- MOMO CODE 补入一个根据作者公开手记整理的小案例：问题、角色、输入、过程、输出、上游归属、真实终端截图与能力边界。
- 明信片有出生点、兔子广场夜景、作品工坊三款，1200 × 900 PNG，带当日日期。素材是开发阶段在本机离线世界拍摄的固定场景，**不是实时截图、不是邮件，不发送到服务器、不含其他访客留言**。图片失败时禁用保存并提示手动截图；手机提供长按预览图的替代方式。
- 移动端经历 / 作品 / 账号页压缩重复头像区域，修正原滚动容器宽度造成的文字裁切。地图标签改为中文，布局不变。
- 菜单与新增内容弹层互相切换时保留正确的输入状态，避免阅读过程中误触驾驶。

## 内容真实性与来源

来源由用户提供：

- [知 AI · MoMoZi 知识库](https://momozi.vip/)
- [awesome-ai-knowledge / docs](https://github.com/momozi1996/awesome-ai-knowledge/tree/main/docs)

书架包含 Agent 学习导读、Harness 工程、Agent 评测，以及 MOMO CODE、DirectorAgents、永乐大典 Skill 三篇开发者手记。GitHub 原文链接固定到 `ebae457a826130ce8a26f94d5edd0c1902921ec7`；文章采用真实发表日期，无日期文档注明核对日期。短标题与摘要明确是编辑导读，不冒充原文逐字引用。

- 原始标题、URL、正文 SHA256、图片来源与转换说明：[content-sources.json](checks/content-sources.json)。
- MOMO CODE 默认 Priors 更新 **不等于 LoRA 权重微调**；原截图 Tactics / Promoted 为 0，不作为效果提升的证据。本次没有运行该项目或复现效果指标。
- Skills 任务卡是小岛编写的概念例子，不是 Persona Skills 实测输出；导演圆桌是预写互动，不调用模型，不冒充真实导演发言或背书。
- 不新增虚构个人爱好、经历指标、收录徽章或“全球首个”等宣传结论。当前雇主继续匿名；保留已有上游署名与 MIT 许可。

## 验收结果

| 检查 | 结果 / 证据 |
| --- | --- |
| Node 自动测试 | **18 通过，0 失败**；包含原 14 项回归与 4 项新增数据 / 内容约束测试。[日志](checks/unit-tests.txt) |
| 生产构建 | `npm run build:online` 成功。[日志](checks/build.txt) |
| 开发版浏览器 | 5 组检查通过。[报告](checks/browser-report.json) |
| **生产构建浏览器** | 同套检查通过，使用独立 5193 服务与临时世界状态文件。[报告](checks/production/browser-report.json) |
| 昼夜 / 画质回归 | 复用原 `research/color-test.cjs`；自然树干、水面、暖灯、默认与低画质、390px 布局、地图、驾驶通过。[报告](checks/colors/report.json) |
| 本地服务 | `http://localhost:5179/` 返回的首页与 dist 一致，`/api/health` 正常。[汇总](checks/acceptance.json) |
| 静态资源 | static 与 dist 对应文件逐一 SHA256 一致；2.0 独立清单见 `manifest.sha256.json` |

浏览器验收为本机 Chrome / WebGPU 与触屏视口模拟（桌面 1440 × 1000，移动 390 / 320 × 844），**不是所有真机兼容承诺**。覆盖实际 3D 标记的 Enter / 点击入口、五处到场章、三枚内容章、刷新续玩、保留旧喇叭成就、仅重置护照、真实 PNG 下载、面板输入隔离、Escape 恢复驾驶、焦点循环和来源入口。

开发与生产内容报告均没有运行时异常、HTTP 错误或非预期控制台错误。故意阻断明信片图片的测试产生一个预期 `net::ERR_FAILED`，单独记录，不算正常加载失败。日夜回归无页面 / 控制台 / 请求 / HTTP 错误。

### 预览截图

- [生产版小岛](checks/production/desktop-world-v2.png) · [小岛护照](checks/production/desktop-passport.png)
- [六篇小书架](checks/production/desktop-reading-shelf.png) · [导演圆桌](checks/production/desktop-roundtable.png)
- [MOMO CODE 公开案例](checks/production/desktop-code-case.png) · [实际下载的明信片](checks/production/postcard-export.png)
- [390px 作品首屏](checks/production/mobile-390-projects.png) · [320px 作品首屏](checks/production/mobile-320-projects.png)
- [兔子广场夜景](checks/colors/social-night.png)

仅保留最终生产截图与昼夜回归截图；开发中间截图不放入发布证据。

## 已知边界与本次不做

- 没有实时 AI NPC、自由摄影模式、任务经济系统、新小游戏或地图重做。没有扩展公共留言的能力 / 使用范围。
- 明信片是固定图而非用户当前车位；不需要操作或恢复游戏镜头。手机长按图片保存仍受浏览器行为影响。
- 外部文章与仓库后续可能变更或不可访问；公众号链接可能要求微信客户端，页面提供知 AI 博客入口。
- 沿用上游字体 / SVG 路径、`vm-browserify` eval 与大 bundle 构建警告，本轮未出现相关运行错误。没有依赖升级或完整安全审计。
- 未做同设备 v1/v2 的正式 FPS 对比，不能以本次浏览器回归宣称性能完全无回退。新增道具不带粒子、物理碰撞或实时服务；4 张新增 WebP 共约 624 KB，明信片与文章截图按访问加载。
- 成就存档新增了 JSON 读取容错与保存失败反馈；这不等于整个上游游戏在禁用全部浏览器存储时都兼容。

## 使用、复验与回退

```sh
cd site
npm start                 # http://localhost:5179/；已经运行时刷新即可
npm test
npm run verify:v2         # 只读验证本版独立快照
```

浏览器测试需本机 Chrome 与 Playwright，建议另起临时状态服务，避免接触日常世界数据：

```sh
cd site
PORT=5193 HOST=127.0.0.1 STATE_FILE=/tmp/momo-v2-acceptance-world.json npm start
# 另一个终端，在 site/ 下：
PLAYWRIGHT_MODULE=/path/to/playwright SITE_URL=http://127.0.0.1:5193/ \
  CHECK_OUTPUT=../release/v2/checks/production npm run test:island
```

重新构建 / 测试会使快照发生正常差异。只有完成新一轮正式验收后，才显式运行 `node scripts/release-v2-integrity.mjs --write` 建立新快照；它要求开发、生产与色彩检查报告通过、版本号一致、static 与 dist 对应一致，**不覆盖 v1 清单**。

本版位于 `feat/v2-small-discoveries`，v1 Git 基线 `fa9104b`，`main` 没有移动。根目录 `RELEASE.md`、`release/manifest.sha256.json`、`release/checks/` 均保持原样；`verify:release` 仍验证 v1，在 v2 上产生差异是预期结果。

如需回看 v1，请在另一个 worktree / 副本检出基线，不要在当前目录硬重置而丢失工作。`site/data/world.json` 的既有变更不属于此次代码补丁，运行状态不纳入静态清单，升级前应另行备份。`.env`、研究资料与原始素材不公开；服务仍仅公开 `site/dist/`。
