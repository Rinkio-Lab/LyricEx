## v2.8.1（待发布 · 弹窗原生统一 · 分享/海报修复 · 编辑器 tab 样式对齐 · README 三语）

> 收口 v2.8.0 之后的三个用户反馈 bug：系统弹窗统一为原生对话框、分享卡片/竖屏海报不可用、制包页空白；并保留编辑器 tab 样式对齐与 README 三语改动。

### Fixed
- **系统弹窗原生统一**：全部 23 处 `alert / confirm / prompt` 替换为与设置/关于同风格的对话框——新建 `ui/dialog.js`（Promise 式 `alert/confirm/prompt`，单复用 overlay，`.open` 显隐 + focus-trap 接入）；重置设置、删除歌词行等破坏性操作确认键为红色；此前快捷键冲突、导入失败、上传提示等均为浏览器原生弹窗，风格突兀
- **分享卡片 / 竖屏海报不可用**：SVG `<foreignObject>` 渲染路径在 Chrome 下可能 resolve 出「被污染」canvas（`drawImage` 成功但 `toDataURL/toBlob` 抛 SecurityError），既有 2D 兜底只在 SVG 路径报错时触发，导致预览空白、海报无下载——`renderHtmlToCanvas` 增加 1px `getImageData` 污染探测，污染即 reject → 自动回退纯 2D 渲染（`utils/canvas.js`）
- **制包页空白（真 bug，非部署问题）**：v2.7.0 引入 tab 结构时，`renderEditorView` 多拼接了一层 `</div>`——refine pane 关闭后把 `.view-editor` 提前闭合，build pane 被追加到 `.view-editor` **之外**，被 viewContent 的 overflow 裁剪容器完全裁掉 → 制包 tab 视觉空白。Playwright 可见性判定只查 bounding box 不查裁剪，e2e 漏网，用户实测抓出。修复：删除多余闭合标签，build pane 归位 `.view-editor` 内（`ui/editor.js`）；e2e 增加结构断言（build pane 必须在 `.view-editor` 内 + `.ws-wrap` 可见）防回归
- **制包页模块缺失守卫**：部署站缺 `utils/*` 或 `ui/workspace.js`、或模块渲染异常时，`renderWorkspaceTab` 显示明确提示（`wsModuleMissing`）而非空白（app.js `renderWorkspaceMissing`）
- **e2e 新增**：「分享卡片 PNG 预览 + 竖屏海报下载」用例（防 taint 回归）

### Changed
- **编辑器 tab 样式**：`.editor-tabs/.editor-tab` 由「描边圆角按钮」改为与设置页 `.settings-tabs` 同款——`flex:1` 等宽、hover 底色、激活态 accent 色 + 2px 底部指示条（`views.css`）
- **README 三语**：默认英文 `README.md` + `README.zh-CN.md` + `README.ja.md`；开篇命令示例、四视图截图（`assets/images/shots/`）、功能清单、制包指引、开发命令、精简目录树；徽章（CI / MIT / 零依赖）
- **截图脚本**：新增 `scripts/readme-shots.mjs`——Playwright 起本地服务、载示例包、逐视图截图（含 build tab），输出 1280x800 高清图到 `assets/images/shots/`
- **i18n**：新增 3 键（`dialogOk / dialogCancel / wsModuleMissing`），zh/ja/en 三语同步补齐

### Notes
- 部署提醒：部署站 `index.html` 若缺 `utils/netease.js / ai-import.js / ai-prompt.js / lyric-package.js / ui/workspace.js` 仍会导致制包 tab 空白（与本次修复的代码 bug 相互独立，v2.8.1 起缺失时显示 `wsModuleMissing` 明确提示），需重新完整部署全部 assets；浏览器刷新两次（SW cache-first）
- SW CACHE 保持 `lyricex-v2.8.1`：本版本未发布过，用户端持有的仍是旧版本 SW，发布后新 CACHE 名即触发换新，无需再加补丁后缀（与 CHANGELOG 头部版本锁步）

# Changelog

## v2.8.0（待发布 · 设置导出/导入）

> 补全与群友工具的最后一项功能差距：设置备份。导出当前全部偏好为 JSON，导入时白名单过滤 + 值类型回退，保留界面语言与文本方向。

### Added
- **设置导出**：设置面板 footer 新增「导出设置」——把当前 `settings` 全部偏好下载为 `lyricex-settings-YYYYMMDD.json`（备份 / 换浏览器迁移）
- **设置导入**：「导入设置」读取 JSON 文件 → `lib.sanitizeSettings` 白名单合并（未知键丢弃、标量类型不符自动回退默认值，防手工编辑/恶意 JSON 污染 CSS）→ **保留当前界面语言与文本方向**（与重置逻辑一致，AGENTS.md 规范）→ 应用并刷新渲染
- **防御**：`lib.sanitizeSettings(parsed, defaults)`——mergeSettings 只挡键、不挡类型，故新增值类型校验层，可独立单测

### Changed
- **i18n**：新增 6 个键（`settingsExport / settingsImport / settingsImportOk / settingsImportFail / settingsImportBad`），zh/ja/en 三语同步补齐
- **测试**：`utils-test.mjs` 新增 8 条 sanitizeSettings 断言（类型回退/嵌套保留/未知键过滤/合法值透传）；e2e 新增「设置导出/导入控件存在 + 导出下载 JSON」用例

### Notes
- 至此与群友工具功能差距清零：制包主链路（输入→AI 分析→编辑→导出）全覆盖且多数环节更优，偏好备份补齐
- 用户语言键值清单（ko/fr/es/de/pt-br/ru/ar）：本次 +6 键，累计 49 键待用户手动维护

## v2.7.0（待发布 · AI 分析 · 交替 LRC）

> AI 逐词分析走「复制提示词 → 任意大模型 → 粘贴结果」手动流（纯静态，不引 API）；交替双语 LRC（网易云内联格式）自动拆分；LRC 支持直接上传文件（与粘贴并存）；逐字歌词链路确认无需引第三方库。

### Added
- **AI 逐词分析工作流**：`utils/ai-prompt.js`（重写提示词：角色/输出格式/分析规则/3 条示例/歌词正文，可选手动分段 `{n}` 标注段落）、`utils/ai-import.js`（`parseAiResult` 容错解析：剥代码块/找首个 `{...}`、逐条严格校验；`matchAnalysisToLyrics` 按「时间×10 取整 + 文本去空格」双键保守匹配，未匹配不猜测）
- **交替 LRC 自动拆分**：`lib.splitMixedLrc`——按 10ms 时间戳分组、复用 `lib.isChinese` 判定，把「一行日文一行中文」的网易云内联 LRC 自动拆为原词 + 翻译（纯中文/纯日文输入不误拆，全部保留为原词）
- **parseLRC 修复**：网易云行尾时间戳变体（`[t1]正文[t2]`，t2 为下句开始）此前整行丢弃，现取 t1 为行时间、两时间戳之间为正文
- **LRC 文件上传**：main/trans 双栏各配「上传文件」按钮，读取 `.lrc/.txt` 回填 textarea（粘贴流程保留）；上传交替 LRC 自动触发拆分
- **逐字歌词链路确认**：增强 LRC（`<mm:ss.xx>` 内联）与 ASS karaoke（`\k`）解析、时间邻近合并、卡拉OK渲染、编辑器「导入逐字时间」入口均已有（v1.6.0 起），不引第三方库——逐字时间戳生成属 ASR/强制对齐领域，任何 LRC 库均不提供，正确工作流是外部生成 → 导入 → 进包

### Changed
- **空状态可达制包工作区**：`renderEditorView` 在无歌词时不再短路为 empty 视图——渲染 tab 结构，精修页显示引导提示，制包页可直接从零开始建包（v2.6.0 起的设计缺口补全）
- **i18n**：新增 43 个键（v2.6.0 的 42 个 + `editorEmptyHint`），zh/ja/en 三语同步补齐
- **测试**：`utils-test.mjs` 新增网易云内联变体解析与 `splitMixedLrc` 分组拆分用例（交替拆/纯中文/纯日文）；boot-smoke、lang-switch 补 import 新模块；e2e 新增「build tab 交替 LRC 自动拆分」用例（空状态 → 进制包 → 粘贴 → 拆分回填）

### Notes
- 其他语言（ko/fr/es/de/pt-br/ru/ar）由用户手动维护：43 个新键已交付清单，含 `{n}` 占位符须保留，`wsNeteasePlaceholder` 用 `&quot;` 转义

## v2.6.0（待发布 · 制包工作区）

> 编辑器视图升级为「工作区」：精修 / 制包双 tab。制包用现有包逻辑升级为 v2.1（version 仍为 2，加载器零改动，字段全可选）。

### Added
- **工作区 tab 化**：编辑视图包 `.editor-tabs` 双 tab——「精修」保留原编辑全部功能，「制包」为新建 `ui/workspace.js`（媒体卡片[原声必选+伴奏可选含拖拽]、LRC 双栏 + 网易云 JSON、AI 分析组、导出组；draft 状态独立于 ctx.lyrics，`resetDraft` 清空）
- **制包 v2.1**：`utils/lyric-package.js` 的 `buildManifest` 新增全可选字段 `audioFileName / instrumentalFileName / config.analysisModel / config.analysisSource`；`version` 恒为 2，兼容 v2.0 加载器（见 FORMAT.md v2.1 增量）
- **纯函数层**：`utils/netease.js`（parseNeteaseLyrics，tlyric 配对容差 0.05s）、`utils/ai-prompt.js`、`utils/ai-import.js`、`utils/lyric-package.js`（sanitizeMediaName / mediaExt / bakeLyricTimes / buildManifest / buildLyricsPayload）

### Changed
- **编辑器返回值**：`ui/editor.js` 现返回 `getTab / switchTab`，供 app.js 晚绑定工作区
- **ctx 新接口**：`renderWorkspaceTab`（晚绑定 → `workspaceApi.render()`）、`loadWorkspaceDraft`（draft → 当前包）、`downloadBlob`（已有）
- **i18n**：新增 42 个键（`editorTabRefine / editorTabBuild` + `wsMedia…wsExportFail`），zh/ja/en 三语同步补齐

## v2.5.1（待发布）

> CI 稳定性与无障碍 buffer 补丁：E2E file:// 路径跨平台化、axe 渲染稳定等待、muted 对比度 buffer、h1 移入 landmark；Actions 升级（checkout/setup-node v5、ubuntu-24.04 固定、失败上传 Playwright 报告）。

### Fixed
- **E2E file:// 测试跨平台**：硬编码的 `file:///E:/...`（开发机路径）改为 `pathToFileURL(join(ROOT,'index.html'))` 运行时推导——首次 CI 在 Linux 上 `ERR_FILE_NOT_FOUND` 即此根因
- **axe color-contrast CI 偶发**：常规亮色主题 `--text-muted` 在侧栏背景仅 ≈4.52:1（buffer 0.02，渲染抖动即掉线），加深至 `#6a625c`（≈4.9–6.0:1）；axe 测试扫描前等 `document.fonts.ready` 与渲染稳定（不再扫中间态）
- **heading-order / region**：关于弹窗 `developer` 标题 `h4` → `h3`（此前一次编辑未落盘）；sr-only `h1` 移入 `<main>` landmark 内

### Changed
- **CI**：`actions/checkout@v5`、`actions/setup-node@v5`（消除 Node 20 deprecation warning）、`runs-on: ubuntu-24.04`（固定，避免 runner 镜像迁移改变行为）、失败时 `upload-artifact@v4` 上传 `test-results/` 与 `playwright-report/`（7 天保留）
- 版本锚点同步至 `lyricex-v2.5.1`（sw.js CACHE / package.json / package-lock / index.html）

## v2.5.0（待发布 · 首次 GitHub 公开）

> 工程化补齐：工具链 / CI / 覆盖率 / 浏览器 E2E / 无障碍检查 / 安全策略 / 发布自检；并回填 v2.2.0–v2.4.2 的变更记录空档。

### 工程化（本次）
- **工具链**：新增 `package.json`（`test` / `lint` / `test:cov` / `e2e` / `release-check` 脚本）、`.gitignore`、ESLint 9 flat config（`eslint.config.mjs`）；运行时仍零依赖（`vendor/` 本地化不变，node_modules 仅开发期）
- **CI 门禁**：新增 GitHub Actions（`.github/workflows/ci.yml`）——push/PR 时跑 lint、5 套全量自检、c8 覆盖率门槛、Playwright E2E
- **覆盖率**：`npm run test:cov` 用 c8 统计 5 套自检的语句/分支覆盖
- **浏览器真机测试**：新增 `tests/e2e/`（Playwright + Chromium）——真实 HTTP 服务下冒烟（上传示例包、歌词渲染、视图切换、zh/ja/ar 语言切换含 RTL 方向、焦点圈定）与 axe-core 无障碍扫描
- **CSP**：经 file:// 兼容性实测后落地（见该提交的安全说明）
- **发布自检**：新增 `scripts/release-check.mjs` —— 校验 `sw.js` CACHE 名 ≥ CHANGELOG 最新版本、跑全量测试、输出资源体积报告（vendor 分片数 / JS / CSS / 预估传输量），防止「改了资源忘 bump 缓存」与「版本号脱节」
- **CHANGELOG**：回填 v2.2.0–v2.4.2 条目（日期不详，按代码注释恢复），版本号与 `sw.js` CACHE（`lyricex-v2.5.0`）、`index.html` 页脚一致

### Fixed（lint / E2E / axe 驱动）
- **抽屉开关误关 bug**：点击「更改」等抽屉开关按钮时，若命中按钮内 `<i>/<span>` 子元素，会被文档级 outside-click 监听当作外部点击而立即关闭（topDrawer / moreDrawer / langDrawer / playerDrawer 四处同源）——改为 `contains()` 判定（E2E 探针定位）
- **主题色行 label 缺失**：v2.4.1 图标重构使 `colorRow` 创建的 label 未挂载（主题色/词性色行只有色块无文字）——补回 `row.appendChild(label)`
- **死代码清理**：删除 app.js 遗留状态、settings.js 未用控件引用、其余模块未用变量（lint 全量通过，无风格型规则）

### A11y（axe-core 扫描零 critical / serious）
- **弹窗可读名**：10 个 `role="dialog"` 弹窗/抽屉补 `data-i18n-title`（随语言切换的 `aria-label`）
- **图标按钮可读名**：影院退出 / 封面查看关闭按钮补可读文本（`data-i18n-title`）
- **表单标注**：设置面板动态渲染的 select / checkbox / range / 文本输入补 `aria-label`；分享面板静态控件补 `data-i18n-title`
- **对比度**：常规亮色主题 `--text-muted` 由 `#8a827a` 加深至 `#6e675e`（约 3.1:1 → 4.5–5.5:1，达 WCAG AA）
- **标题结构**：页面补视觉隐藏 h1（`.sr-only`）；关于弹窗 `h4` → `h3` 消除跳级

## v2.4.2（日期不详）

> 设置图标运行时修复（sw.js 缓存名 bump 记录）。

### Fixed
- 设置项图标运行时修复：v2.4.1 新增的设置行图标在特定路径下未随控件重渲染正确应用，修复并 bump 缓存名强制重新拉取

## v2.4.1（日期不详）

### Added
- **设置项图标**：设置行 / 侧边栏项 / 播放器扩展按钮增加 Font Awesome 前置图标（`SETTING_ICONS` / `SIDEBAR_ICONS` / `EXT_ICONS`），选项一眼可扫
- **测试聚合器**：`run-tests.mjs` 升级为全量自检入口——自身 lib 断言后以子进程依次执行全部兄弟套件（i18n-check / boot-smoke / lang-switch / utils-test），任一失败整体 FAIL

## v2.4.0（日期不详）

### Fixed
- **启动时序**：boot 前先按 fallback 链加载 locale 字典再渲染（字典脚本异步加载，同步 init 曾让首屏显示占位文本）；`setLocale` 在字典就绪后重放静态翻译与动态 UI

## v2.3.3（日期不详）

### Changed
- **重置保护**：设置 → 重置为默认 保留 `locale` 与 `directionMode`（语言/文本方向是用户主动选择，不还原）
- **首访语言切换**：首次运行指引左下角新增语言切换入口（guide globe），新用户无需进设置即可换语言

## v2.3.2（日期不详）

### Changed
- **语言列表完整显示**：语言按钮渲染注册表全部语言；未加载的字典标 `lang-pending`，点击后按 fallback 链按需加载（`loadLocale`），不再只显示已加载语言

## v2.3.1（日期不详）

### Added
- **文本方向 override**：设置 → 通用 新增「文本方向」（自动 / 强制 RTL / 强制 LTR），`i18n.setDirectionOverride` 即时重应用 `dir`（easter-egg / 无障碍辅助）
- **语言二级抽屉**：界面语言改为紧凑二级抽屉（`currentLangLabel` + 更改按钮），语言列表增长后不再占用通用面板

## v2.3.0（日期不详）

### Added
- **RTL 支持**：阿拉伯语等 RTL 语言设置 `<html dir="rtl">`，chrome（侧栏/顶栏/播放器/设置）随 flexbox/bidi 自动镜像；歌词/学习/编辑内容强制回 LTR（`[dir=rtl]` 规则，CJK 文本与标点保持自然方向）

## v2.2.0（日期不详）

### Added
- **弹窗焦点圈定**：新增 `assets/scripts/ui/focus-trap.js`（通用模态焦点圈，a11y）
- **图标按钮读屏可读**：`data-i18n-title` 同步暴露 `aria-label`
- **高对比主题**：亮 / 暗两套高对比配色（`hc-light` / `hc-dark`，文本对比达 WCAG AA），置于 `[data-color-theme]` 层尾部覆盖常规亮暗
- **移动端触摸优化**：禁 iOS Safari 输入聚焦自动放大（`text-size-adjust`）、交互控件去双击/长按缩放延迟，页面缩放仍可用
- **迷你条显式语言**：迷你条歌词行按包内显式 `lang` 覆盖启发式判别（`mini.js`）

## v2.1.0 (2026-10-06)

> 项目结构重组 + 样式拆分：自有资源收进 `assets/`，示例/测试独立目录，第三方依赖与构建脚本保留根目录。

### Changed
- **项目结构重组**：`css/` → `assets/styles/`、`js/` → `assets/scripts/`、`icons/` → `assets/icons/`、`i18n/` → `assets/locales/`，新增 `assets/images/`；`example/` → `examples/`、`test/` → `tests/`；`vendor/`（第三方字体 / Font Awesome / JSZip）与 `scripts/`（构建·部署·工具脚本）保留根目录；HTML 入口仍为根目录 `index.html`，Service Worker 缓存名同步更新
- **CSS 样式拆分**：单一 `styles.css`（84KB）按职责拆为 `base` / `layout` / `views` / `overlays` / `responsive` 五个文件，媒体查询统一收尾最后加载，级联顺序与视觉效果不变

## v2.0.5 (2026-10-05)

> 点击「播放另一版」自动暂停主播放，并可把主播放进度吸附到该句前/后。

### Added
- **试听自动暂停**：点击行内 ♪ 试听另一版时自动暂停主播放（设置 → 通用「点击试听自动暂停主播放」，默认开启，可关闭）
- **试听进度吸附**：试听时主播放进度自动吸附到该句开始（句前）或该句结束（句后）（设置 → 通用「试听时进度吸附」：无 / 句前 / 句后，默认句前）

### Fixed
- **视频导出按钮补样式**：`#videoStartBtn` / `#videoCancelBtn` 原无作用域样式（`.close-btn` 只挂了 about/settings/share 三个 footer），落回浏览器默认外观；补 `.video-footer .close-btn` 规则 —— 「取消」为描边次级按钮，「开始录制/停止录制」为强调色主按钮，录制中禁用态半透明

## v2.0.4 (2026-10-04)

> 主副音轨切换完善：音轨按钮升级为切换整首主播放，行内 ♪ 试听另一轨对照练唱。

### Changed
- **主播放音轨切换**：播放条「音轨」按钮由仅切换试听升级为切换主播放音轨（原声 ↔ 伴奏），整首歌换轨播放；进度、速度、音量、移调、循环、书签全部保持（同一 `<audio>` 元素换源，Web Audio 移调图绑定不变）
- **行内 ♪ 试听另一轨**：主播放为原声时 ♪ 试听当前句伴奏（练唱），主播放为伴奏时 ♪ 试听当前句原声（对照），按钮始终补足主播放音轨

### Added
- **音轨按钮文字标签**：显示当前主播放音轨（原声 / 伴奏），不再仅有图标；无伴奏包时按钮自动隐藏

## v2.0.3 (2026-10-03)

> 试听音轨可切换，并让试听跟随音量。

### Added
- **试听音轨切换**：播放条新增「试听音轨」按钮（`♪` 图标），在「伴奏 / 原声」间切换；歌词/学习/混合视图每行的 ♪ 按钮据此试听当前句的伴奏或原声（默认伴奏）

### Fixed
- **试听音量不生效**：点 ♪ 试听创建的第二 Audio 元素原先不设 `volume`，音量条/静音对它无效；现在试听元素创建时即跟随音量与静音，且拖动音量/切静音实时同步

## v2.0.2 (2026-10-03)

> 补齐包格式 v2 的逐字 ruby 读音，并为去人声伴奏补上编辑器入口。

### Added
- **逐字 ruby 读音（格式 v2）**：`analysis` 词条可显式携带 `furigana:[{t,r}…]` 逐汉字注音，覆盖自动整块注音（专为熟字训：時計 → 時(と)計(けい)）；所有 `t` 拼接不等于词面时视为数据不同步、回退到自动拆注、不猜测
- **编辑视图「添加/更换/移除伴奏」**：歌曲信息组内新增去人声伴奏入口（`accept="audio/*"`），与封面入口并列；伴奏随 LyricEx 包导出，歌词/学习视图的「试听本句伴奏」按钮即用此音频

### Changed
- **FORMAT.md**：补齐包格式 v2 规范 —— `instrumental` / `cover` / 每行 `lang` / `furigana` 字段、`assets/` 分文件夹结构、加载器大小写无关匹配与「不兼容包自动匹配文件并转换」的兜底说明

## v2.0.1 (2026-10-03)

> 内部拆模块 + 修复用户反馈的分享卡片 / 视频导出 / 编辑器体验问题。

### 重构
- **内部拆模块**：编辑器、分享卡片、歌词视频导出三块 UI 胶水从 `app.js` 抽出到 `js/ui/`（`editor.js` / `share.js` / `video-export.js`），经共享 `ctx`（状态 getter + 辅助函数 + DOM 引用）注入，`app.js` 减负约 790 行；`js/utils/` 保持纯函数、`js/ui/` 承接 DOM 胶水、`js/modules/` 承接平台能力，职责边界清晰

### Fixed
- **分享卡片在部分浏览器空白**：根因是 SVG `<foreignObject>` 栅格化失败且代码注释里承诺的纯文本回退从未实现；补上 canvas-2D 回退渲染器，分享卡片与竖版海报两条路径都接上
- **歌词视频导出横向溢出**：原 `wrapLines` 按空格分词，日文/中文无空格导致超长整行原样画出；改为逐字符贪心换行，歌词/翻译限行省略
- **学习表格「纯文本堆叠」**：原先每个词条值用空格拼接画成一行；改为真网格（词面表头 + 罗马音/平假名/汉字/词性/释义五行、分隔线、列对齐）

### Added
- **视频录制取消按钮**：录制中「关闭」变「取消」，点击放弃录制；录完/报错后文案复位
- **封面/背景图编辑器入口**：歌曲信息组内「添加/更换封面」+「移除」按钮（`accept="image/*"`），封面随 LyricEx 包导出
- **编辑工具栏分类美化**：歌曲信息 / 编辑 / 导出三组（带组标签）；工具栏与提示语吸顶，滚动歌词时不再移出

## v2.0.0-alpha (2026-10-02)

> 分阶段实现用户选定的功能清单；由用户测试并修复 bug 后升为正式 2.0.0。全部 5 套测试绿。

### 基础设施
- **关于页侧边导航**：关于弹窗改为「左侧子导航 + 右侧可滚动内容」（复用设置弹窗的 `settings-subnav` 样式）
- **应用内更新日志**：`js/changelog.js` 自动加载（每次版本的时间/内容/类型徽章，三语 UI + 开发者中文正文），关于页「更新日志」按钮 + 弹窗

### 播放 / 练唱
- **变速不变调**（#9）：`preservesPitch = true`（含 moz/webkit 前缀），改速度不再变调
- **移调 / 升降 key**（#10）：Web Audio 实时移调 ±12 半音——tape 式颗粒移调器（双延迟线线性 ramp + 互补 raised-cosine 交叉淡化），0 半音即旁路；`js/utils/pitch.js`（纯算术）+ `js/modules/pitch-shift.js`（DSP）
- **多组循环书签**（#15）：A/B 作「选区」，💾 保存为可开关/删除的书签；播放时最内层活动书签生效（`currentLoopMark` 状态机）
- **去人声双音频**（#13）：包可携带 instrumental（manifest 或文件名 `inst/offvocal/伴奏` 自动识别），歌词/学习视图每行「试听本句伴奏」按钮，用第二个 Audio 元素播放该句段落
- **最近打开 + 多包队列**（#14）：IndexedDB 缓存最近包（`js/modules/recent-store.js`），侧边栏「最近打开」一键重开；多文件拖入首个播放、其余排队，`ended` 自动切下一首（`pendingAutoplay`）

### 导出 / 分享
- **学习表格打印 / PDF**（#17）：编辑视图「打印学习表」生成整页逐句表格 + `@media print`
- **学习笔记导出**（#18）：Markdown / HTML（每行原词+翻译+罗马音+备注+逐词表），`js/utils/notes.js`
- **歌词竖版海报**（#19）：1080×1920 手机壁纸（复用 share-card 栅格化管线）
- **分享卡片模板市场**（#20）：模板 = 具名 CSS 预设，JSON 导入/导出，存 localStorage，选择器内联用户模板

### UI / 体验 + 数据格式
- **逐字时间可视化编辑 + 导入自动匹配**（#21/#28）：编辑面板逐词 start/end 输入；导入增强 `.lrc`（内联 `<mm:ss.xx>`）或 `.ass`（`\k` 标签）按时间就近匹配合并——`js/utils/wordtiming.js`
- **封面 / 背景图 + 动态歌词壁纸**（#22）：manifest v2 `cover`（或 zip 内图片）→ 影院模式模糊封面背景
- **包格式 v2**（#27/#31）：`manifest.version=2`，`cover`/`instrumental`/每行 `lang`，导出整理为 `assets/`、`lyrics/` 分文件夹；加载器大小写无关按路径匹配，v1 与 v2 前后兼容，导出即转换
- **PWA 离线安装**（#24）：`manifest.webmanifest` + `icons/icon.svg` + `sw.js`（cache-first）；`ponytail:` SW 只能在 http(s) 注册，`file://` 打不开安装——需本地静态服务（README 有说明）

### Test
- `utils-test.mjs` 新增 pitch 算术 / 书签 / recent 剪枝 / 笔记 / 海报 / 逐字时间解析 单测；`boot-smoke` 覆盖 transpose、instrumental、cover、v2 manifest、lang；`i18n-check` 动态 id 集扩展

## v1.7.0 (2026-10-01)

### Added
- **句循环**：循环键扩为三态 `无 → 单曲 → 单句`（badge 显示 `1`/`句`）；单句模式在 `updatePlayState` 按下一句时间回跳当前句，最后一句用音频时长（未知则 +3s）并在 `ended` 时回跳，实现逐句练唱
- **歌词搜索**：`/` 或 `Ctrl/Cmd+F` 唤起搜索浮层，按 文本 / 翻译 / 备注 / 罗马音 / 假名 / 汉字 / 词性 / 释义 实时多字段过滤，命中高亮，`↑↓` 选择、`Enter` 跳转并 seek、`Esc` 关闭
- **跟随系统深色**：主题三态 `亮 / 暗 / 跟随系统`（按钮月亮/太阳/自动图标循环），`system` 态经 `matchMedia('(prefers-color-scheme: dark)')` 解析并监听系统切换实时跟随
- **字幕导出**：编辑视图新增 `导出 .srt` / `导出 .ass`（ASS 含逐字 `\k` 卡拉OK标签与双语样式，仅当包内带 `words` 时间戳）
- **歌词视频导出**：`导出歌词视频` 用 Canvas.captureStream + MediaRecorder 录制逐句学习表格画面与音频（需完整播放一遍，仅 Chrome/Edge；音频经共享 Web Audio 图拍点）
- **分享卡片**：播放器分享按钮生成当前句+翻译+罗马音+歌名+行号卡片（右下水印 `Powered by LyricEx`），内置 卡片/渐变 模板、主题色、显示开关 + 可选自定义 CSS 文本域，可下载 PNG / 复制剪贴板

### Changed
- **代码拆分**：新增 `js/utils/`（theme/loop/search/subtitles/canvas/share-card 纯函数模块）与 `js/modules/`（audio-graph 共享音频图、video 录制器）；`app.js` 的频谱逻辑改为委托 `audio-graph`，导出字符串构建移入 `subtitles`，新功能全部走 utils，`app.js` 不再无节制膨胀
- **音频图共享**：频谱与视频录制共用同一个 `AudioContext` 与 `MediaElementSource`（Web Audio 规定每元素只能一个源），修复了频谱与录制各自建图时的潜在冲突

### Test
- 新增 `test/utils-test.mjs`（主题/句循环/搜索/字幕纯逻辑单测）；`boot-smoke`/`lang-switch` 补齐新模块加载顺序与三态主题断言；`i18n-check` 改为扫描 `js/**/*.js` 并加入新动态按钮 id

## v1.6.5 (2026-09-30)

### Fixed
- **关于/设置弹窗底部按钮间距**：`.about-footer`、`.settings-footer` 均为 `display:flex; justify-content:flex-end` 但缺少 `gap`，「观看指引/恢复默认设置」与「关闭」按钮原本紧贴；补上 `gap: 10px`
- **日↔英切换可能"卡住"**：应用自行管理多语言，但未阻止浏览器自动翻译——Chrome 在 `lang="ja"`/`lang="en"` 时会改写 DOM 文本节点，与应用自身的 `setLocale` 叠加后可表现为"切到英文仍显示日语"。`<html>` 加 `translate="no"` 并加 `<meta name="google" content="notranslate">` 阻断浏览器翻译
- **指引步骤内容语言不同步**：`__onLocaleChange` 原先不重渲染指引正文（仅静态按钮靠 `_apply`），现指引打开时也 `renderGuideStep()`，兑现代码注释里"切换语言会重本地化打开的指引"的承诺
- `test/lang-switch.mjs` 增加 **ja↔en 往返**回归断言（侧边栏标签、设置页签、通用控件、快捷键键帽），杜绝"卡在日语"

## v1.6.4 (2026-09-29)

### Fixed
- **语言切换残留（编辑/模式/快捷键）**：语言选项的选中态原先在模块加载时用写死的 `'zh'` 判定，首次以非中文语言打开时高亮错误；现抽为 `updateLangOptions()`，初始化与语言变更时都按真实 locale 刷新。`__onLocaleChange` 同时补上迷你条重渲染。`test/lang-switch.mjs` 扩为覆盖 侧边栏「编辑/模式」标签、「快捷键」标签、编辑视图工具栏、快捷键键帽 的 zh→ja→zh 往返

### Changed
- **字重下调一档 + 只加载需要的字重**：webfont 由「Noto 仅 500 / M PLUS 400·500·800 / Courier 含斜体」改为三个字体各只加载 **400 + 700**（去掉 500、800 与斜体）。默认渲染从 500 回落到真 400，整体更轻
- **离线资源本地化**：新增 `scripts/fetch-assets.mjs`，把 Google Fonts（woff2 + @font-face CSS，含中日全量 unicode-range 子集）、Font Awesome 5.15.4、JSZip 3.10.1 全部下载进 `vendor/`；`index.html` 改为引用本地文件，运行时不再依赖 cdnjs / Google Fonts CDN（约 10.9 MB，含 357 个 woff2 子集）。重跑脚本即可刷新

### Added
- **「歌词字重」设置**：外观 → 字体 新增 常规(400)/粗体(700)，经 `--lyric-weight` 作用于歌词/混合/影院/学习/编辑/迷你条各歌词行
- **首次访问指引遮罩**：首访弹出 5 步引导（上传/视图/模式/快捷键/个性化，三语、带图标与进度点）；之后不再自动弹出，可在 关于 → 观看指引 随时重开；Esc / 点击遮罩可关闭，关闭即记 `lyricex-guide-seen`
- **关于页丰富**：新增「快速上手」清单 +「观看指引」按钮

## v1.6.3 (2026-09-28)

### Fixed
- **语言切换后设置项/侧边栏项回不来**：动态渲染的设置控件（字体/字号/默认首页/侧边栏显示复选框/快捷键键帽等）没有 `data-i18n` 属性，原先只在设置弹窗打开时才重渲染 —— 语言在弹窗关闭时变更（重置/迁移/applySettings 路径）会让它们永远停在旧语言。现改为语言变更时**无条件**重渲染设置与快捷键控件。新增 `test/lang-switch.mjs` 回归测试（带真实结构的 DOM shim）
- **影院模式滚动条位置**：滚动条原先贴在居中的 800px 歌词列右缘，现移到屏幕最右侧（`.cinema-content` 去掉水平内边距、`.cinema-lyrics` 去掉 `max-width`，歌词行仍居中并加 `max-width: min(88%,720px)` 保持可读）

### Added
- **页面动画设置**：新增「页面动画」开关 +「动画速度」（慢/正常/快，缩放 `--transition`）；关闭时通过 `#app[data-motion="off"]` 冻结全部过渡/动画，并遵循系统 `prefers-reduced-motion`；切换视图时加入轻柔淡入（仅显式切视图，学习视图逐行重渲染保持瞬时）；自动跟随滚动动画同样尊重动画开关
- **上传区收缩**：加载歌词包后上传框自动收缩为紧凑横向长条（图标 + 文件名，隐藏提示文字），避免挤压下方歌曲信息
- **侧边栏显示自动分列**：设置 → 通用 的「侧边栏显示」复选框改为 `auto-fill` 网格自动排成 2–3 列（标题整行），缩减纵向空间
- **启动预加载字体**：Google Fonts 由 CSS `@import` 改为 `<head>` 内 preconnect + 合并样式表链接，并在 `init` 用 `document.fonts.load()` 主动拉取 Noto Sans SC / M PLUS Rounded 1c / Courier Prime 全部字重，避免文字后跳

## v1.6.2 (2026-09-27)

### Added
- **逐行中日字体自动判别**（`lib.isChinese`）：含假名（或 々/〆）判为日语、无假名的汉字判为中文。歌词/混合/影院/学习/编辑器/迷你条六处歌词行据此加 `data-lang="zh"`，CSS 把中文行从日语优先栈 `--font-lyrics` 切换到中文字体栈 `--font-lyrics-sc`（Noto Sans SC）。判别按构造安全：中文必含汉字且无假名、绝不会被误判为日语；两套字体都覆盖全部汉字，误判只退化为「字形风格不同」而非缺字。已知上限：全汉字无假名的日语行（罕见）按中文排版，见 `lib.isChinese` 的 `ponytail:` 注释
- **侧边栏显示开关**：设置 → 通用 新增「侧边栏显示」，可单独显示/隐藏 歌词/学习/混合/编辑/影院模式/迷你模式/暗黑模式/关于 八个入口（设置不可隐藏）；侧边栏整理为 视图 / 模式 / 系统 三组带标签，某组全部隐藏时整组（含标签）折叠
- **Courier Prime 衬线等宽字体**：编辑页时间戳（`mm:ss.cc`）与快捷键键帽（设置→快捷键、关于弹窗快捷键列表）改用 Google Fonts 引入的 Courier Prime（`--font-mono`）

### Fixed
- **影院模式不应用歌词/翻译字体**：影院遮罩层原位于 `#app` 之外，`--font-lyrics`/`--font-translation` 及各字号内联变量无法级联过去（退回界面字体与默认字号）；现移入 `#app`（与关于/设置弹窗一致），主题色、词性颜色、暗色模式变量一并生效。迷你条本就位于 `#app` 内，无需改动

## v1.6.1 (2026-09-27)

### Added
- **逐汉字 ruby 拆注**（`lib.furiganaSegments`）：ruby 升级为**假名从不注音、汉字按假名锚点拆注** —— 書き連ねても → 書(か)き連(つら)ねても、悴んだ → 悴(かじか)んだ；**连续汉字整块注音不拆猜**（時計→時計(とけい)、大人→大人(おとな)，熟字训零错拆）。对齐算法用词内假名锚点（与读法逐字符匹配，即 diff 能做到的全部对齐；jsdiff 的 diffChars 对 書≠か 只会整块替换，无用且未安装，故不引入依赖）；片假名表面按 Unicode 平移折算平假名锚定（メモ帳→メモ帳(ちょう)）。逐字读音升级路径 = 包内 `furigana:[{t,r}…]`（格式 v2）或汉字读音词典，`ponytail:` 注释注明
- **进度条拖动后跟随修复**（回归修复）：松手时原来只跑 `updatePlayState()`，因高亮已在拖动中更新而被跳过 → 视图不重新同步。现在松手 = `enableFollow()` + 即时滚动落地到最终位置；拖动中 rAF 循环只更新高亮不滚动（不再和指针抢滚动）；数字键跳转、迷你进度条点击同样恢复跟随；`scrollLyricToActive` 补上 `followEnabled` 守卫（手动滚动暂停跟随的契约此前只约束了 pill，未约束滚动本身）；切换视图先恢复跟随再渲染。新增测试 API `followOn()`
- **设置弹窗重构**：顶部标签顺序改为 **通用 → 外观 → 歌词 → 快捷键**（打开默认进通用），语言选择并入通用；**外观页支持"标签内的标签"** —— 左侧竖直子导航（主题色/自定义颜色/字体/字号 四节），右侧内容整体可滚到底，左侧纯导航（点击平滑滚到对应节，滚动时自动高亮当前节）
- **预设按钮修复**：保存/删除预设改为真正的按钮样式（保存 = 主题色实心，删除 = 红色描边、无选中时禁用），改为两行布局（选中+删除 / 名称+保存）
- **歌词字体独立**：歌词默认字体改为**日语优先栈 M PLUS Rounded 1c**（不再回退到 Noto Sans SC 的中文字形）；界面字体保持 Noto Sans SC 优先。设置可单独选择（默认日语 / 跟随界面 / 无衬线 / 衬线 / 等宽 / 自定义）；旧设置 `lyricFont:'default'` 自动迁移为 `'jp'`

### Changed
- `lib.FONT_PRESETS` 新增 `jp`、`inherit`；`SETTINGS_DEFAULTS.lyricFont` = `'jp'`
- 设置外观面板拆分为 4 个 `.settings-section`，schema 增加 `section` 字段（fonts/sizes 分容器渲染）
- 快捷键/迷你条跳转与拖动释放统一走"显式导航 = 恢复跟随"约定

## v1.6.0 (2026-09-26)

### Added
- **汉字 ruby 自动注音**：歌词行内根据包内 analysis 数据自动给汉字加 `<ruby>` 注音（假名读法悬于汉字上方），歌词/混合/影院/学习/编辑器视图通用；无需 diff 库 —— 贪心游标对齐（逐条在行文本中锚定 `analysis.kanji`）即等价于 diff 对齐；纯假名词条自动跳过，设置可关闭（`showRuby`）
- **默认中日字体**：Google Fonts 引入 Noto Sans SC（中文）+ M PLUS Rounded 1c（日文）作为全局默认字体栈（离线回退到系统字体）
- **主题色自定义 + 词性颜色 + 主题预设（配置组）**：任意取色器自定义主题色（悬停/高亮背景/进度条颜色自动派生）；学习表格罗马音/平假名/汉字/词性/释义五种颜色分别可调；支持把当前配色保存为命名主题预设、一键套用/删除（localStorage）
- **逐字卡拉OK自动禁用**：包内无 `words` 逐字时间戳时不再用估算硬分，自动退化为整行高亮；包格式 v1 新增可选 `words: [{text,start,end}]` 字段（见 `FORMAT.md`），有真实数据时逐字高亮 + 学习表格词列联动
- **分视图字号**：歌词/混合/影院/学习当前行/学习表格/时间标签/编辑器/假名注音 8 种字号分别可调（原歌词/翻译字号保留）
- **设置框固定高度**：设置弹窗固定 600px（小屏 88vh），切换面板不再上下伸缩，内容区滚动
- **学习表标签 i18n**：Romanji/Hiragana/Kanji/POS/Meaning 硬编码改为三语翻译键（并修正拼写 Romaji），随界面语言切换
- **默认首页**：设置 → 通用 可选择启动时默认打开歌词/学习/混合视图
- **页面内完整包编辑**：编辑视图升级为包编辑器 —— 标题/艺术家/专辑直接修改；每行可展开编辑歌词文本/翻译/备注/词条（罗马音、平假名、汉字、词性、释义增删改）；添加行、删除行；已修改状态徽标（导出即保存）；一键重新加载原文件丢弃修改
- `test/i18n-check.mjs`：i18n 三语键完备性 + 使用键存在性 + HTML id 契约校验

### Changed
- `lib.computeWordTimes`（长度加权逐字估算）删除，由 `lib.wordSpans`（真实包数据校验）取代 —— 无数据自动禁用
- 学习表格、注音行颜色改用 `--pos-*` CSS 变量（可被设置覆盖，暗色主题自动适配）

## v1.5.0 (2026-09-25)

### Added
- ④ **快捷键自定义**：设置 → 快捷键可视化改键（按键捕获、冲突检测、Esc 取消），关于弹窗快捷键列表动态显示；新增 `G` 跟随当前行、`L` 循环、`P/N` 上一句/下一句、`R` 停止、`V` 迷你模式、`0-9` 跳转进度（10% 步进，固定）
- ⑤ **逐字卡拉OK**：当前行按词渐进高亮（无分词数据时按字符权重估算时间窗），与学习表格词列联动高亮；可在设置中关闭
- ⑥ **翻译双行 / 罗马音模式**：歌词/影院视图当前行下方副行显示翻译或罗马音（自动/仅翻译/仅罗马音/关闭），学习视图假名注音行
- ⑦ **频谱可视化**：Web Audio API AnalyserNode 在播放器底部绘制频谱条（影院模式共用），设置中开关
- ⑧ **迷你悬浮模式**：侧栏一键缩成可拖拽悬浮条（当前歌词、播放控制、迷你进度条、点击还原），快捷键 `V`
- ⑨ **.lrc 导入**：直接拖入/选择 `.lrc`（多时间戳、`[offset:]`、`[ti:][ar:]`），无音频进入纯歌词模式，已加载歌曲时拖入即配对校时
- ⑩ **时间轴编辑器**：新「编辑」视图 —— 拖动 `⠿` 校准时间戳（Shift 微调、实时试听）、`mm:ss.cc` 直改、全局偏移滑块实时预览，导出修正后的 LyricEx 包 / .lrc
- **LyricEx 自有包格式 v1**：`manifest.json` + `lyrics.json` + 音频，校验格式版本；同时兼容群友包（song.json）与包内 .lrc；「编辑」视图一键完成 群友包 → LyricEx 包 转换（见 `FORMAT.md`）
- **设置全面扩展**：歌词/翻译/界面自定义字体（预设+自定义字体名）、字号、行距等全部可配置，一键恢复默认设置；主题、音量、速度持久化
- `js/lib.js` 纯逻辑库（LRC 解析、逐字时间估算、设置合并、转义等）+ `test/run-tests.mjs` 单元自检（35 项）+ `test/boot-smoke.mjs` DOM 冒烟自检（28 项）

### Fixed
- 混合视图学习面板只渲染在初始活动行、播放中面板消失（现改为全部渲染 + 显隐切换）
- 学习视图播放中不跟随更新（现活动行变化即重渲染并保留滚动位置）
- **XSS**：歌词/翻译/分析/文件名等包内内容全部经 `esc()` 转义后再插入 DOM；`data-time` 属性强制数值化
- 设置/关于弹窗打开时快捷键仍会触发放歌；Esc 现在正确关闭最上层弹窗/影院
- 连续快速加载多个包时 `setTimeout` 竞态（loadToken 作废旧流程）
- `navigator.mediaSession.metadata` 在不支持环境抛异常
- 无效速值导致 `playbackRate=NaN`（归一化到可选档位）

## v1.4.4 (2026-09-24)

### Fixed
- Auto-follow scrolling sometimes failing: main views (lyrics/mixed) never scrolled during playback — only cinema did; in cinema, `justify-content: center` made the first lines unreachable once content overflowed (browsers cannot scroll to negative offsets), the active line's `font-size` transition moved the scroll target mid-animation, and repeated `scrollIntoView` smooth scrolls cancelled each other while also scrolling the wrong ancestor containers
- `#viewContent` had no height constraint, so `.view-lyrics` / `.view-mixed` were not the actual scroll containers (scrolling silently happened on the `overflow:hidden` `.view-container`)
- `setActiveLine(-1)` left the previous line highlighted and the mixed-view study panel expanded

### Changed
- Unified auto-follow scroll engine: measures the active line's offset on the real scroll container, clamps to scroll bounds, animates with ease-out; instant landing for seeks / clicks / view switches, smooth following during playback
- Manual wheel / touch scrolling pauses auto-follow and cancels the in-flight animation; a floating "follow" pill resumes it (main views + cinema mode); scrolling back near the active line resumes following automatically
- Cinema active line now emphasized with `transform: scale` + `text-shadow` instead of `font-size` (no layout shift); `justify-content: flex-start` + symmetric vertical padding keeps the centered look while staying fully scrollable
- Simplified `findLyricIndex`; live line highlight while dragging the progress bar; `prefers-reduced-motion` respected
- `overscroll-behavior: contain` on all lyric scrollers

### Added
- i18n key `followLyrics` (zh / ja / en)

## v1.4.3 (2026-08-08)

### Added
- Settings panel: new "Settings" entry in sidebar (above "About"), with Tab navigation
- Morandi color themes: 6 preset light color schemes (Dusty Rose / Misty Blue / Sage Green / Warm Taupe / Lavender Gray / Warm Apricot), auto-persisted
- i18n internationalization: Simplified Chinese, Japanese, English; separate dictionary files per language; auto-detects browser language
- Cinema mode: full-screen lyric display (Spotify-style), centered large text, gradient mask, minimal controls; `F` to enter / `Esc` to exit

### Changed
- Code split: CSS extracted to `css/styles.css`, JS to `js/app.js`; HTML slimmed from 2202 to 302 lines
- Directory structure: added `css/`, `js/`, `i18n/` subdirectories

### Fixed
- i18n script load order: `index.js` moved before dictionary files so `register` is available
- View re-renders on language switch to prevent stale translations in dynamic content
