# Research · 过程档案，不是网站源码

本目录保留项目制作过程，**不由正式服务器提供，也不应该整体公开部署**。

## 判断新旧

- **最终封板截图 / 测试报告**：`../release/checks/`。以这个目录及 `../RELEASE.md` 为准。
- `color-check/`、`content-check/` 与根目录 `.png` / `.json`：不同阶段的旧检查结果，保留作追溯；有些截图早于最终内容或配色。
- `color-update-notes.md`、`content-update-notes.md`：对应迭代的说明；记录当时测试数，并非最新总验收结论。
- `content-before/`、`color-before/`：变更前备份，不能覆盖当前 `../site/sources/`。
- `content-sources/`、`*-readme.md`、`github-*.json` 等：当时采集的公开材料快照，不保证外部仓库今天仍与其一致。
- `bruno-LICENSE`、`bruno-readme.md`：最早抓取失败留下的 14 字节 `404: Not Found` 响应，不是有效许可 / 文档。有效上游许可在 `../site/license.md`；完整原 README 另存为 `upstream-readme.md`。

## 不要在封板目录重跑一次性脚本

`customize.py` 是早期批量改写脚本；`download-*`、`retry-*`、`fetch-momo.py`、`localize-fonts.py` 是历史采集 / 处理脚本。执行可能覆盖最终内容与资源。本次不删除、不搬迁这些历史文件，只明确标识用途。

## 浏览器复验脚本

`color-test.cjs` 与 `content-test.cjs` 是本次重新使用的浏览器检查脚本；默认输出位置仍是旧检查目录。请设置 `CHECK_OUTPUT` 指向项目之外的新目录，避免覆盖冻结证据。

需要额外的 Playwright Node 模块与本机 Chrome；不属于网站生产依赖。通过 `PLAYWRIGHT_MODULE` 指定已安装模块目录，或使 `require('playwright')` 可解析。

```sh
# 从 momozi-world 运行；5179 上需已有 npm start
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright \
SITE_URL=http://localhost:5179/ CHECK_OUTPUT=/tmp/momozi-colors-recheck \
node research/color-test.cjs

PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright \
SITE_URL=http://localhost:5179/ CHECK_OUTPUT=/tmp/momozi-content-recheck \
node research/content-test.cjs
```

其他脚本保留当时写法，可能仍含原开发机的绝对路径，不属于封板后的可移植工具承诺。
