# MoMoZi World · v2.0.0

这里是已冻结的 **v2.0.0** 正式应用目录。本地 Git 标签为 `v2.0.0`，冻结与恢复说明见上一级 `FREEZE.md`。完整变更与回退说明见上一级 `README.md`，本版验收见 `../release/v2/RELEASE.md`。

```sh
npm ci                    # 仅换机器时需要；Node >=22.12.0，npm >=10.5.1
npm start                 # http://localhost:5179/，仅公开 dist
npm test
npm run build:online      # 从源码构建同源 HTTP / WebSocket 在线版
npm run verify:v2         # 只读校验 2.0 独立快照
npm run dev -- --port 5192 # 开发预览
```

`verify:release` 仍校验历史 1.0；不要重写旧封板清单消除 2.0 差异。`data/` 和 `.env` 保持本机运行状态，不作为发布资源；已有配置不要覆盖。服务器配置使用 shell 的 `HOST` / `PORT` / `STATE_FILE`。

浏览器验收（需可用 Chrome 和 Playwright）：

```sh
PLAYWRIGHT_MODULE=/path/to/playwright SITE_URL=http://localhost:5179/ npm run test:island
```

这会在独立浏览器上下文中检查护照、真实场景互动点、下载、旧存档兼容、移动端、输入隔离和失败反馈，输出到 `../release/v2/checks/`。重新生成证据后，快照会有正常差异；仅在新一轮正式验收完成后显式建立新快照。

本版没有接入实时 AI、扩展公共留言或增加新的物理障碍。固定明信片取景素材的开发生成脚本是 `scripts/capture-island-postcards.cjs`，不是用户端摄影功能。
