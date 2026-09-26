# LyricEx · 歌词鉴赏

纯前端歌词鉴赏工具：上传歌词包（`.zip` / `.lrc`），在歌词 / 学习 / 混合 / 编辑四种视图里跟唱、逐字卡拉OK、汉字注音、逐词解析、时间轴校准与导出。

**零依赖运行**：所有第三方资源（字体 / Font Awesome / JSZip）都已在 `vendor/` 内，直接打开 `index.html` 即可，无需网络。

## 运行

- 直接双击打开 `index.html`（`file://` 协议即可）。
- 或任意静态服务器：`npx serve .` / `python -m http.server` / `node scripts/serve.mjs`（零依赖、跨平台）。
- **PWA 离线安装**（v2.0.0）仅在 http(s) 下可用：`file://` 无法注册 Service Worker。本地静态服务访问一次后即可「添加到主屏幕」并离线使用。

## 测试

一键全量自检（lib 断言 + 全部兄弟套件，任一失败整体 FAIL）：

```bash
npm test                # node tests/run-tests.mjs（聚合器，跑全部 5 套）
npm run lint            # ESLint 9（flat config）
npm run test:cov        # c8 覆盖率统计
npm run e2e             # Playwright 真实浏览器冒烟 + axe 无障碍（首次先 npm run e2e:install）
npm run release-check   # 发布自检：CACHE/changelog 一致性 + 体积报告 + 全量测试
```

各套件也可单独运行：

```bash
node tests/run-tests.mjs     # lib.js 纯逻辑单测
node tests/utils-test.mjs    # assets/scripts/utils 纯逻辑单测（主题/句循环/搜索/字幕）
node tests/boot-smoke.mjs    # app.js 启动冒烟（DOM shim）
node tests/i18n-check.mjs    # 三语键完备 + HTML id 契约
node tests/lang-switch.mjs   # 语言切换回归
```

### 工具链说明（v2.5.0 起）

- **lint**：`eslint.config.mjs` 只开安全规则（recommended + 安全网），不设风格规则——风格契约仍是 `FORMAT.md`。`catch (_)`、`== null`、`_` 前缀等本项目惯用法已豁免。
- **覆盖率**：`c8 node tests/run-tests.mjs` 统计 5 套自检的语句/分支覆盖，CI 设有门槛。
- **浏览器 E2E**：`tests/e2e/` 用 Playwright 驱动真实 Chromium（webServer 是零依赖的 `scripts/serve.mjs`），覆盖：启动空态、上传示例包渲染、视图切换、zh/ja/ar 语言切换（含 RTL 方向）、弹窗焦点圈定、axe-core 无障碍扫描、控制台无报错。本地浏览器缓存落在 `.pw-browsers/`（已 gitignore；CI 用系统默认位置）。
- **发布自检**：`scripts/release-check.mjs` 校验 `sw.js` CACHE 名与 CHANGELOG 最新版本一致、跑全量测试、输出资源体积报告——每次发布前跑一次。

### 安全（CSP，v2.5.0 起）

项目无远程依赖（`vendor/` 本地化），XSS 主防线是「包内内容一律 `lib.esc()`」。作为纵深防御，部署端应附加 CSP 响应头（见 `docs/` 或 `sw.js` 中的策略）：`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`。`file://` 直开不受影响（无 CSP 头 + 无 SW）。

## 刷新离线资源（可选）

`vendor/` 已提交全部资源。若想升级第三方版本，重跑：

```bash
node scripts/fetch-assets.mjs
```

## 目录结构

```
index.html            页面骨架（侧边栏 / 视图容器 / 播放器 / 各弹窗遮罩）—— 唯一 HTML 入口
assets/styles/        样式（base 基础变量 / layout 外壳 / views 视图 / overlays 弹窗 /
                      responsive 响应式收尾，最后加载）
assets/scripts/       应用 JS：lib.js 纯逻辑库（LRC 解析 / ruby / 字体栈 / 设置默认值，无 DOM）
                      changelog.js 更新日志数据 / utils/ 纯函数模块 / modules/ 平台能力 /
                      ui/ 界面胶水控制器 / app.js 应用核心（ctx 装配）
assets/icons/         应用图标（favicon.io 全套）
assets/locales/       i18n：index.js 核心 + zh / ja / en 三个字典
assets/images/        图片资源（预留）
examples/             示例歌词包（.zip，LyricEx 包格式）
scripts/               工具脚本：fetch-assets.mjs（离线资源下载）/ serve.mjs（零依赖静态
                        服务器，跨平台，E2E 用）/ release-check.mjs（发布自检）
vendor/               第三方资源（字体 woff2 + CSS、Font Awesome、JSZip）
sw.js                 Service Worker（PWA 离线缓存 + 部署端 CSP 响应头，需 http 服务）
manifest.webmanifest  PWA 清单
tests/                run-tests.mjs 全量聚合器 + 四个兄弟套件 + e2e/（Playwright 冒烟）
package.json           开发期脚本入口（test / lint / test:cov / e2e / release-check）
eslint.config.mjs      ESLint 9 flat config（安全规则，风格契约见 FORMAT.md）
playwright.config.mjs  E2E 配置（webServer = scripts/serve.mjs，零 Python 依赖）
.github/workflows/ci.yml  GitHub Actions：lint + 全量测试 + 覆盖率 + 浏览器 E2E
FORMAT.md             LyricEx 包格式说明（v1 + v2）
ROADMAP.md            路线图
```

## 代码约定（便于阅读/修改）

- **`assets/scripts/lib.js` 是纯函数库**：不碰 DOM，所有解析/判定/默认值都在这，Node 可直接 `import` 测试。新增算法先在这里加，再用 `tests/run-tests.mjs` 断言。
- **`assets/scripts/app.js` 一个 IIFE**：顶部集中声明 DOM 引用与状态；设置的「状态 + 生效」留在这里（`applySettings`/`setSetting`），设置 UI 的 `SETTING_DEFS` schema 在 `assets/scripts/ui/settings.js`（增设置项通常只加一条 def + 三个 i18n 键）。
- **`assets/scripts/ui/` 承接 UI 胶水**：编辑器 / 搜索 / 迷你条 / 影院 / 关于 / 设置 UI / 分享卡片 / 歌词视频导出等强耦合 DOM 与共享状态的功能放这里，由 `app.js` 用 `ctx`（状态 getter + 辅助函数 + DOM 引用 + 跨模块 late-bound 闭包）注入；`assets/scripts/utils/` 保持纯函数、`assets/scripts/modules/` 保持平台能力。
- **i18n 是单一事实来源**：静态文案用 `data-i18n` 属性（由 `__i18n._apply()` 翻译），动态文案用 `t('key')`；新增文案要在 `assets/locales/zh.js`、`ja.js`、`en.js` 三处同加。
- **信任边界**：包内一切内容（歌词/翻译/分析/文件名）经 `lib.esc()` 转义后才 `innerHTML`，`data-time` 强制数值化。
- **已知取舍带 `ponytail:` 注释**：注明该简化的上限与升级路径（如逐行中日判别、逐字读音拆分）。

## 快捷操作

`空格` 播放/暂停 · `←/→` 快退快进 · `↑/↓` 音量 · `F` 影院 · `V` 迷你 · `G` 跟随 · `L` 循环（无→单曲→单句） · `P/N` 上一句/下一句 · `/` 歌词搜索 · `0-9` 跳转进度 · `Esc` 关闭弹窗/影院

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源（Copyright (c) 2026 Rinkio-Lab）。
