# MoMoZi World v1.0.0 · 封板验收

日期：2026-09-11（Asia/Shanghai）。范围：本地 `momozi-world/` 完整目录与当前正式构建；不代表远程网站已更新，也不升级上游或项目依赖。

## 结论

已重新构建并验收用户确认的最终内容、配色和交互。有效源码在 `site/sources/`，正式网页在 `site/dist/`，启动入口为 `site/server.mjs`。旧备份、旧截图和研究资料保留，但不参与运行。

## 本次检查

- 对封板操作前的 **1,146 个已确认应用文件**（sources、static、server、Vite 配置、本地环境配置）逐一比较 SHA256：没有改动。
- 按现有锁文件执行 `npm ci` 成功，未升级依赖。修复新机器安装复现问题：增加 `.npmrc` 的 `legacy-peer-deps=true`，匹配上游旧插件的 peer 解析模式；初次失败日志保留备查。
- `npm run build:online` 成功，`emptyOutDir` 已清理并重建 dist。
- `npm test`：**14 通过，0 失败，0 跳过**，包含内容、配色、世界状态和 HTTP / WebSocket 服务端测试。
- Chrome 浏览器回归通过：日夜场景、高低画质、棕色树干／自然材质／发光路灯、四个资料标签页、社交复制成功和失败反馈、地图、驾驶与作品区；覆盖桌面及 390px / 320px 移动布局。
- 两组浏览器报告均无页面错误、控制台错误、请求失败或 HTTP 错误；最终截图共 30 张。
- 986 个静态资源与 dist 中对应文件 SHA256 一致。
- 正在运行的本地服务首页与磁盘 dist 首页逐字节一致，健康检查通过；验收记录见 `release/checks/acceptance.json`。
- 文件名与有限文本模式扫描未发现私人简历 PDF、私钥文件或匹配的访问令牌；这不是完整安全审计。

## 仅交付整理，没有重新设计

更新版本号为 1.0.0、同步 package-lock 元数据和环境配置模板、补齐 Node/npm 要求与安装兼容设置；更新根目录和 site 使用说明，增加 research 历史文件标识、独立封板测试输出与 SHA256 校验工具。上游原 README 保留为 `research/upstream-readme.md`；有效许可仍为 `site/license.md`。

## 已知边界

- 构建仍有上游资源路径、`vm-browserify` eval 和大 bundle 警告；本轮未因此加载失败，不为消除警告改变已确认版本。
- 依赖保持原锁文件版本，没有做依赖升级或完整漏洞审计；浏览器覆盖不是所有浏览器 / GPU 设备的兼容承诺。
- `.env`、`node_modules/`、`site/data/`、工具缓存不属于冻结文件快照；世界状态会正常变化，请单独备份。
- 目录目前不是 Git 仓库；本次使用逐文件清单作为本地版本基线，不创建远程提交或进行公网发布。
- 未来构建和修改可能使完整性检查失败；不要随手重写 manifest 来绕过差异。`node site/scripts/release-integrity.mjs --write` 仅用于完成新一轮验收后的显式重新封板。

## 使用

```sh
cd site
npm run verify:release
npm start
```

打开 `http://localhost:5179/`。该端口若已运行本项目，直接打开即可。更完整的部署范围、目录用途与重新构建方法见 `README.md`。
