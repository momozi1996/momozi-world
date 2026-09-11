# MoMoZi World · v1.0.0

封板日期：2026-09-11。这里是**正式应用目录**，内容和配色已按最终确认版本保留。

完整目录说明见上一级 `README.md`；验收记录见上一级 `RELEASE.md`。

## 使用已构建的版本

```sh
# 换机器：先安装 Node.js >=22.12.0 / npm >=10.5.1，再 npm ci
npm start
```

打开 `http://localhost:5179/`。服务器只公开 `dist/`，并提供 `/world` WebSocket 与 `/api/health`。不要双击 HTML，也不要把项目根目录作为静态公开目录。

## 维护

```sh
npm run verify:release              # 检查是否仍与封板快照一致，不修改文件
npm test                           # 自动化测试；需要已有 dist
npm run dev -- --port 5178          # 开发预览，不代表 production dist 已更新
npm run build:online                # 正式在线构建；会清空并重建 dist
npm start
```

新机器没有 `.env` 时，复制 `.env.example`，不要覆盖已有本地配置。冻结依赖使用 `npm ci`，不要沿用上游 `npm install --force` 指令。

- `sources/`：当前源码；`static/`：公共资源；`dist/`：正式网页。
- `resources/`：原始创作素材；不是线上资源目录。
- `data/`：可变世界状态，请单独备份，不用于判断应用版本。
- `npm run build` 不等同于正式在线构建；本地默认配置会生成离线版。
- 上游技术参考在 `../research/upstream-readme.md`，MIT 许可保留于 `license.md`。
