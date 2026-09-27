# Changelog

## v3.2.1（待发布 · 十项修复与 Prettier）

### Added
- **帮助页跟随全局语言**：进入帮助时正文默认按界面语言显示，右上角手动切换后记住独立选择；设置 → 通用新增「帮助页跟随全局语言」开关可关闭跟随。
- **检查更新弹窗升级**：点击后弹窗立即出现并显示加载圈；发现新版本时左侧更新说明、右侧数据通道与当前版本分栏展示，API 原始返回可折叠查看；控制台写入 `localStorage.lyricex-update-mock`（任意版本号，如 `9.9.9`）即可模拟「本地模拟」新版本，方便开发调试。
- **自动化格式化工具链**：引入 Prettier（`.prettierrc` + `npm run format`），`npm run precommit` 一键 格式化 → lint → 全量测试，提交前无需手工整理。
- **帮助 FAQ 新增「如何测试检查更新」条目**（三语）：给出本地模拟键的用法。

### Fixed
- **侧边栏与设置图标统一**：设置页「侧边栏显示」列表的图标对齐侧边栏真实图标（歌词/学习/混合/编辑/迷你/关于）。
- **主题切换图标反置**：侧边栏主题按钮图标改为指示当前主题（暗色→月亮 / 跟随系统→半圆 / 亮色→太阳），原先方向相反。
- **动画关闭时速度选项未禁用**：关闭「页面动画」后「动画速度」现在变灰且不可选择。
- **库封面缺图占位**：歌曲库封面图片加载失败（如损坏的 blob）自动替换为占位音符图标，不再显示裂图。
- **左上角 Logo 不可选中**：侧边栏 Logo 增加 `user-select:none`，点击或回车可打开关于页。

### Changed
- 版本号由 3.2.0 升至 3.2.1；Service Worker 缓存名同步 bump（`lyricex-v3.2.1`）。

### Test
- 更新检查 e2e 用例适配新弹窗结构（加载圈 → 分栏结果 / 本地模拟流程）。
- 帮助页 e2e 用例补充 FAQ 条目数量断言。

## v3.2.0（待发布 · 检查更新）

### Added
- **检查更新（关于 → 检查更新）**：手动按钮 + 页面启动静默检查（6 小时节流防止频繁请求触发 GitHub API 限流）；双通道检测——先查 GitHub Releases API，无 Release（404）时降级解析 raw CHANGELOG.md 头部版本号；发现新版本弹原生风格确认框，可一键跳转 Release 页面；已是最新版或静默检查失败均不出声。
- **更新检测测试**：单元测试（版本号解析 / 比较 / CHANGELOG 头部解析）+ e2e（模拟 API 返回新版本、确认跳转）。


## v3.1.0（2026-09-27 · 帮助页全面更新）

### Added
- **帮助页演示截图轮播**：演示章节由单张 GIF 改为截图轮播（左右箭头 + 底部圆点），五张主视图截图：歌词 / 学习 / 混合 / 制包 / 歌曲库。
- **常见问题扩充至 16 条（三语）**：制包空白、逐字歌词来源、导出视频、离线使用、纯歌词模式、交替歌词拆分、网易云 JSON 配对、曲库去重、查找、无歌词播放、清空曲库、示例包来源占位、语言与方向切换、更新日志语言、控制台日志、浏览器兼容性。
- **歌曲库章节配图**：歌曲库章节配曲库视图截图；两条 FAQ（制包空白 / 逐字歌词）配对应截图。

### Changed
- 帮助页演示章节由 GIF 演示改为静态截图轮播（GIF 质量低且不可预览，见用户反馈）。

### Removed
- 移除过时的 `assets/images/demo.gif`（约 2MB）。

### Test
- 帮助页 e2e 用例更新：7 章节导航、歌曲库章节断言。


## v3.0.0（2026-09-27 · 歌曲库大改）

> 侧边栏「歌曲库」升级为独立视图：本地导入 zip 歌词包与裸音频（自动读元数据 + 去重），搜索/筛选/排序/聚合浏览，收藏/最近/播放次数，歌单管理与详情页；新增控制台日志系统；版本进入 3.0.0-alpha 预发布。

### Added
- **本地歌曲库独立视图**：IndexedDB 持久化（songs / playlists / meta）；浏览器选文件夹递归导入 zip 歌词包与 mp3 / flac / m4a / ogg / wav 音频
- **自动元数据**：zip 包走 manifest / 旧 song.json / LRC；裸音频解析 ID3v2（歌名/歌手/专辑/流派/年份/曲目/内嵌封面）+ MP3 CBR 时长估算；按「路径+大小」与「歌名+歌手」双重去重
- **浏览与查找**：歌名/歌手/专辑/歌词全文搜索；歌手/专辑/流派/年份/标签 5 筛选；歌名/歌手/时长/添加时间/播放次数排序；滚动加载
- **组织与收藏**：歌单创建/重命名/删除/打开/增删歌；收藏与取消收藏；最近播放；播放次数统计；标签编辑
- **展示**：专辑封面、歌曲详情页（元数据网格 + 歌词预览）、按歌手/专辑聚合 tab
- **曲库播放**：走主播放器，有歌词自动进歌词视图、侧栏状态同步、记录播放次数与最近播放
- **控制台日志系统**（utils/log.js）：debug/info/warn/error 分级、模块前缀 + 时间戳、localStorage `lyricex-log-level` 开关，日志永不抛错

### Fixed
- **影院设置重复渲染**：切换语言后「外观 → 影院」背景效果设置逐次追加（`renderSettingControls` 漏清空 `appearanceCinema`）——补清空，切语言后稳定 8 行
- **设置滑块默认样式**：`input[type=range]` 此前仅 `accent-color`（依赖原生渲染，Firefox/旧内核显示灰滑块）——补全自定义轨道与滑块样式（webkit + moz）
- **编辑弹窗按钮间隙**：`.library-footer` 缺 `gap`，保存/取消按钮紧贴——补 `gap: 10px`（示例包弹窗同修）
- **release-check 预发布后缀**：`v3.0.0-alpha` 匹配失败（`v[\d.]+` 遇 `-` 断）——正则支持 `-suffix`
- **详情返回列表中断**：`renderBody` 对详情视图已替换掉的 `#libStatus` 写 `textContent` 抛空引用——判空保护
- **库视图布局不生效**：CSS 类名 `.view-library` 与 JS 渲染的 `.library-view` 不一致——统一
- **库视图按钮无样式**：全局 `.close-btn` 仅在弹窗 footer 作用域有规则，独立视图裸用无样式——按视图作用域补齐模态按钮外观

### Added
- **示例包来源页**：manifest 歌曲支持 `links: [{ label, url, icon }]`，弹窗内渲染链接行（图标为 Font Awesome class）；示例数据先占位 `#`，维护者自行填写
- **更新日志标题**：弹窗补标题与「仅中文」徽标（更新日志正文保持开发者中文、不 i18n）

### Changed
- **「歌曲库」入口升级**：侧边栏/抽屉从弹窗改为独立视图；示例包弹窗保留在视图内「示例包」按钮（GitHub 源不支持添加，仅查看/试听）
- **关于页全量多语化**：口号 / 构建者 / 使用技术五项 / 许可证 / 免责声明并入三语字典；GitHub 链接移至邮箱下方
- **清空曲库说明**：确认文案写明只删浏览器内曲库记录、不删电脑源文件（IndexedDB，浏览器策略不允许访问源文件）
- **版本号**：3.0.0（预发布 3.0.0-alpha 真机验收通过，转正式）

### Test
- 新增 `tests/library-test.mjs`（metadata 纯函数 32 断言）并入 `run-tests` 聚合器
- e2e 新增库视图用例（fixture 目录导入 / 搜索 / 详情 / 播放），v2.9.3 多源用例适配独立视图；e2e 禁用 Service Worker 保证 manifest stub 可靠

## v2.9.3（待发布 · 歌曲库多源）

> 歌曲库行按钮「来源」错误翻译修正为「打开」（10 语言同步）；manifest 支持多源声明（sources[]），多于一个源时点「打开」弹出来源选择层；示例包三首旧包补全行中文翻译；包文件加载由 force-cache 改 no-store。

### Added
- **歌曲库多源**：manifest 歌曲可声明 `sources: [{ label, file }]` 数组；>1 个源时点「打开」弹出来源选择层，选择后加载对应包（单源仍一键直开）
- **示例包升级**：春日影 / 私の心はチョココロネ / 星座になれたら 三个旧包补全行中文翻译（作词/作曲/编曲与标题行不译），与新包一致

### Fixed
- **「来源」按钮翻译**：歌曲库行按钮实际是「加载打开该示例包」，此前 10 语言全译成「来源/出典/Source/Quelle…」——改动作语义「打开/Open/開く」并全语言同步；新增「选择来源」键供多源弹层
- **歌曲库包文件缓存**：`loadLibrarySong` 走 `force-cache`，示例更新后用户仍拿旧包——改 `no-store`（与 manifest 拉取一致）

## v2.9.2（待发布 · 制包页细节）

> 制包页 AI 逐词分析「导入分析」按钮与输入框间隙修复；原词 / 翻译 / AI 结果三个 textarea 新增一键清空；关于页补 GitHub 仓库链接。

### Added
- **一键清空**：制包页原词 LRC / 翻译 LRC / AI 结果三个 textarea 各新增清空按钮（点击清空文本并重置对应草稿状态）
- **关于页 GitHub 链接**：「开源与声明」节补仓库链接（Rinkio-Lab/LyricEx · 源码与 Release）

### Fixed
- **AI 导入区间距**：「导入分析」按钮与上方粘贴结果 textarea 间隙过小（实测约 5px），补 margin 至 12px
- **歌词框按钮组**：「上传文件 + 清空」两按钮间距为 0（`.ws-lrc-upload` 非 flex，inline-block 按钮且标记中无空白）——改 `display:flex; gap:6px`，垂直对齐；同版本内缓存名 bump 为 `lyricex-v2.9.2.1`
- **提示词预览框字体**：`.ws-prompt-preview` 字体栈只有等宽字体（Consolas 无 CJK 字形），中文提示词落系统默认——补 Noto Sans SC / PingFang SC / Microsoft YaHei fallback；缓存名 bump 为 `lyricex-v2.9.2.2`

## v2.9.1（待发布 · 帮助中心）

> 帮助页从四卡片「半成品」升级为完整 wiki 帮助查看页：左侧目录导航 + 滚动高亮 + 搜索 + 分页 + 返回顶部 + 键盘导航 + 窄屏适配；帮助正文真正多语（zh/ja/en），语言沿 i18n fallback 链解析，不再一律硬回中文。

### Added
- **帮助中心布局**：左侧 200px 目录栏（搜索框 + 5 章节导航，滚动时 IntersectionObserver 自动高亮当前章节）；右侧独立滚动内容区
- **搜索过滤**：按章节标题与正文实时过滤卡片和目录项，空结果提示，Esc 一键清空
- **章节分页**：上一节 / 下一节按钮 + 当前位置（n / m）；内容区聚焦时 ↑ / ↓ 键盘切换章节
- **返回顶部**：内容滚动超过 300px 出现，点击平滑回顶
- **窄屏适配**：≤860px 目录栏变 sticky 横向胶囊条（搜索 + 章节横排）
- **反馈与支持**：原页脚升级为独立章节，GitHub Issues 直达外链
- **帮助正文多语化**：zh / ja / en 三语正文；默认沿 i18n fallback 链解析（ja→日文、pt-br/ar/ko→英文、其余→中文），不再一律硬回中文
- **帮助页独立语言切换**：目录栏顶部 zh / 日本語 / English 胶囊按钮，选择持久化（`lyricex-help-locale`），不影响全局 UI 语言
- **帮助内容模块化**：正文与章节标题迁入独立 `assets/scripts/help-content.js`（每语言一个块，头部注释写明新增语言步骤），新增帮助语言像加语言字典一样简单；原 `help*` 词典键保留不删（避免牵动用户语言字典）
- **提交问题与贡献**：帮助页新增独立章节（zh/ja/en 三语）——报告问题要点（浏览器与版本、控制台报错、复现步骤）、Fork → 分支 → 全量自检 → 单版本单 commit → PR 的贡献流程、本地联调命令；内容复用 README 贡献指南

### Changed
- **代码块字体**：`.help-card code` 字体栈在等宽字体后补中文字体 fallback（Noto Sans SC / PingFang SC / Microsoft YaHei）
- **i18n**：新增 8 键（helpContents / helpSearch / helpNoResults / helpBackToTop / helpPrev / helpNext / helpFeedbackTitle / helpLangLabel），zh/ja/en 三语同步补齐
- **三语发布流程图**：`scripts/render-release-flow.mjs` 正式入库并支持三语输出（`release-flow-en/zh/ja.png`），README 三语各引对应语言图；AGENTS.md 新增 §4.5「可复用构造工具链」规范（会再次用到的构造流程必须入库，命名 `x.x.x-someword`，禁止用完即删）

### Fixed
- **重复 CSS**：移除 views.css 中重复的 `.ws-empty-hint` 块（v2.8.1 遗留）
- **Firefox 滚动条适配**：补 `scrollbar-width` / `scrollbar-color` 标准属性（此前只有 `::-webkit-scrollbar`，Firefox Developer 里滚动条退回系统默认）；同版本内缓存名 bump 为 `lyricex-v2.9.1.1`

### Test
- e2e 新增帮助中心用例（目录点击滚动高亮、搜索过滤与 Esc 恢复、ja 直接正文 / pt-br 回退英文正文）；boot-smoke 增加帮助视图渲染断言

## v2.9.0（待发布 · 导出防溢出与样式提升）

> 竖屏海报 / 分享卡片补齐防溢出（视频导出自 v2.0.1 起已有逐字符换行 + 限行省略）；分享卡/海报 HTML 模板、学习笔记 HTML 导出、打印样式整体提升。

### Fixed
- **分享卡片 / 竖屏海报防溢出**：SVG foreignObject 路径此前固定字号 + `overflow:hidden` 直接裁切长歌词——两个模板加 `-webkit-line-clamp` 行数截断（分享卡：歌词 5 行 / 翻译 3 / 罗马字 2；竖屏海报：歌词 6 / 翻译 3 / 罗马字 2）；2D 兜底渲染器原已有换行省略，未动
- **视频导出复核**：自 v2.0.1 起已有逐字符贪心换行 + 限行省略（歌词 3 行 / 翻译 2），无回归

### Changed
- **学习笔记 HTML 导出**：新增内联样式表（`.wrap` 容器、section 左边框 + 圆角、`time` 灰字、`.notes-table` 表头底色/边框），表格从内联 `border` 属性改为类名；打印友好（`@media print` 分页避让）
- **打印样式**：`responsive.css` 补 `@page{margin:14mm}` 与打印表格行 `page-break-inside:avoid`

## v2.8.4（待发布 · 帮助页 · 逐字歌词 · 提交前流程 · 修复）

> 2.8.x 收尾：新增帮助页（内嵌网易云歌词指南 + 30 秒演示 GIF）；klyric / yrc 逐字歌词导入（逐字卡拉OK高亮）；提交前流程整理并渲染流程图进 README（三语）；统一 CHANGELOG 格式并同步应用内更新日志；修复制包页跟随、精修空置溢出、全局偏移滑杆样式。

### Added
- **帮助页**：侧边栏「系统」组新增「帮助」视图——快速上手 / 网易云歌词 JSON 获取指南（内嵌要点）/ 30 秒演示 GIF / 常见问题；指南全文保留在 `docs/netease-lyrics-guide.md`
- **30 秒演示 GIF**：Playwright 录制 + ffmpeg 调色板压缩（8fps / 560px / 128 色 / 约 2MB），`assets/images/demo.gif`
- **klyric / yrc 逐字歌词导入**：`wordtiming.js` 新增 `parseYrcLines`（`[行起点,行时长]` + `(字起点,字时长,0)文本`，绝对毫秒）；网易云 JSON 的 `klyric.lyric` 自动解析并按 0.1s 容差附加到对应行 `words`（卡拉OK高亮即生效）；编辑器「导入逐字时间」支持 `.yrc` / `.klyric` 文件（与 `.lrc` / `.ass` 并列）
- **提交前流程整理**：README（英/中/日）新增「Before you commit / push」小节 + 渲染流程图（`assets/images/shots/release-flow.png`，9 步 + 全绿判定）
- **文档**：`docs/netease-lyrics-guide.md` 更新（klyric/yrc 已支持 + 帮助页入口 + 排版清理）；CHANGELOG.md 格式统一；`changelog.js` 同步 2.5.0 → 2.8.4（修复重复 2.3.2 条目，2.3.3 归位）

### Fixed
- **制包页出现「跟随」**：build 工作区不是歌词视图——`getLyricsScrollTarget` 在 build tab 返回 null、滚动不暂停精修跟随；切换 tab 时刷新跟随 pill（app.js + editor.js）
- **精修页空置高度溢出**：空状态只渲染提示不再渲染整套工具栏；`.view-editor` 改 flex 列布局，`.editor-pane` 填充不再叠加 tab 行高度（无滚动条）
- **全局偏移滑杆样式**：原生 range 外观统一为自定义轨道 + accent 圆形滑块（与音量滑杆同风格，含 `-moz` 回退）
- **v2.8.1 缺失记录**：回填 v2.8.1 变更记录（弹窗原生统一 23 处、canvas taint 探测、renderWorkspaceMissing、e2e 防回归）

### Changed
- **i18n**：新增 6 键（`help / helpQuickStart / helpNetease / helpDemo / helpFaq / helpFeedback`），zh/ja/en 三语同步补齐
- **CHANGELOG.md 全文件格式统一**：`# Changelog` 移到顶部；版本头统一 `## vX.Y.Z（状态 · 主题词）`；分节统一 Added/Fixed/Changed/Removed/Test/Notes；日期统一为 changelog.js 时间线

### Test
- `utils-test.mjs` 新增 YRC / klyric 单测（行时间、绝对字时间、两字段容差、元数据行跳过、klyric 集成配对、翻译保留）

### Notes
- 帮助页正文为开发者中文（与应用内更新日志同惯例），分节标题三语
- SW CACHE 保持 `lyricex-v2.8.4`（与 CHANGELOG 头部锁步）

## v2.8.3（待发布 · 三行歌词导入修复 · AI 提示词预览 · 网易云歌词指南）

> 三行一句歌词（日文/中文/罗马字同时间戳）导入不再错乱：罗马字存为行的注音字段、歌词视图副行可显示；制包页 AI 提示词增加实时预览；新增网易云歌词 JSON 获取指南（帮助页素材）。

### Fixed
- **三行一句格式导入**：日文+中文+罗马字同时间戳的 LRC（网上下载常见），此前罗马字会顶替日文当主歌词或直接丢失——按时间戳分组后主歌词取日文、翻译取中文、罗马字存入该行 `romaji` 字段；歌词视图副行（自动/罗马音模式）在无逐词分析时回退显示整行罗马字（`lib.splitMixedLrc` + `app.js romajiFromLine`）

### Added
- **AI 提示词预览**：制包页「AI 逐词分析」复制提示词按钮下方新增实时预览窗，解析歌词或修改分段行数后自动更新，所见即所拷（`ui/workspace.js` + `views.css`）
- **文档**：`docs/netease-lyrics-guide.md` 网易云歌词 JSON 获取指南（浏览器抓包 / curl 两法，接口实测，帮助页素材）

### Notes
- SW CACHE 保持 `lyricex-v2.8.3`（与 CHANGELOG 头部版本锁步）

## v2.8.2（待发布 · 弹窗原生统一 · 分享/海报修复 · 制包页空白真修复 · 编辑器 tab 样式对齐 · README 三语）

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
- 部署提醒：部署站 `index.html` 若缺 `utils/netease.js / ai-import.js / ai-prompt.js / lyric-package.js / ui/workspace.js` 仍会导致制包 tab 空白（与本次修复的代码 bug 相互独立，v2.8.2 起缺失时显示 `wsModuleMissing` 明确提示），需重新完整部署全部 assets；浏览器刷新两次（SW cache-first）
- SW CACHE 保持 `lyricex-v2.8.2`：本版本未发布过，用户端持有的仍是旧版本 SW，发布后新 CACHE 名即触发换新，无需再加补丁后缀（与 CHANGELOG 头部版本锁步）

## v2.8.1（待发布 · 首次 Android APK 打包 · 弹窗原生统一前置）

> v2.8.1 与 v2.8.2 同批修复用户反馈；本条目为回填（此前未在 CHANGELOG 记录）。首次 Android 打包链路建立：Nitron 本地出 APK + uber-apk-signer 重签（keystore 仅存本地，不入库）。

### Fixed
- **系统弹窗原生统一（23 处）**：`alert / confirm / prompt` 替换为原生风格对话框（`ui/dialog.js`，Promise 式 API），与设置/关于弹窗同视觉
- **分享卡片 / 竖屏海报 taint 探测**：SVG 路径 canvas 污染时自动回退纯 2D 渲染
- **制包页模块缺失守卫**：`renderWorkspaceMissing` 显示 `wsModuleMissing` 提示而非白屏

### Added
- **Android 打包**：Nitron 本地打包 Release APK（`cn.linko.lyricex.app`），release 签名 v1+v2+v3；keystore 与密码仅存 `android-build/` 且 `.gitignore` 排除
- **e2e 防回归**：分享卡片渲染 + 海报下载用例

### Test
- 全量测试 + lint 0 + e2e 通过后交付真机测试

### Notes
- SW CACHE 保持 `lyricex-v2.8.1`（与 CHANGELOG 头部版本锁步）

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

### Changed
- **工具链**：新增 `package.json`（`test` / `lint` / `test:cov` / `e2e` / `release-check` 脚本）、`.gitignore`、ESLint 9 flat config（`eslint.config.mjs`）；运行时仍零依赖（`vendor/` 本地化不变，node_modules 仅开发期）
- **CI 门禁**：新增 GitHub Actions（`.github/workflows/ci.yml`）——push/PR 时跑 lint、5 套全量自检、c8 覆盖率门槛、Playwright E2E
- **覆盖率**：`npm run test:cov` 用 c8 统计 5 套自检的语句/分支覆盖
- **浏览器真机测试**：新增 `tests/e2e/`（Playwright + Chromium）——真实 HTTP 服务下冒烟（上传示例包、歌词渲染、视图切换、zh/ja/ar 语言切换含 RTL 方向、焦点圈定）与 axe-core 无障碍扫描
- **CSP**：经 file:// 兼容性实测后落地（见该提交的安全说明）
- **发布自检**：新增 `scripts/release-check.mjs`——校验 `sw.js` CACHE 名 ≥ CHANGELOG 最新版本、跑全量测试、输出资源体积报告（vendor 分片数 / JS / CSS / 预估传输量），防止「改了资源忘 bump 缓存」与「版本号脱节」
- **CHANGELOG**：回填 v2.2.0–v2.4.2 条目（日期不详，按代码注释恢复），版本号与 `sw.js` CACHE（`lyricex-v2.5.0`）、`index.html` 页脚一致

### Fixed
- **抽屉开关误关 bug**：点击「更改」等抽屉开关按钮时，若命中按钮内 `<i>/<span>` 子元素，会被文档级 outside-click 监听当作外部点击而立即关闭（topDrawer / moreDrawer / langDrawer / playerDrawer 四处同源）——改为 `contains()` 判定（E2E 探针定位）
- **主题色行 label 缺失**：v2.4.1 图标重构使 `colorRow` 创建的 label 未挂载（主题色/词性色行只有色块无文字）——补回 `row.appendChild(label)`
- **死代码清理**：删除 app.js 遗留状态、settings.js 未用控件引用、其余模块未用变量（lint 全量通过，无风格型规则）

### Added
- **A11y（axe-core 扫描零 critical / serious）**：弹窗可读名（10 个 `role="dialog"` 补 `data-i18n-title`）、图标按钮可读名（影院退出 / 封面查看关闭）、表单标注（动态 select/checkbox/range/文本输入补 `aria-label`）、对比度（`--text-muted` 加深至 `#6e675e` 达 WCAG AA）、标题结构（sr-only `h1` + 关于弹窗 `h4`→`h3`）

## v2.4.2（2026-09-26 · 设置图标运行时修复）

> 设置图标运行时修复（sw.js 缓存名 bump 记录）。

### Fixed
- 设置项图标运行时修复：v2.4.1 新增的设置行图标在特定路径下未随控件重渲染正确应用，修复并 bump 缓存名强制重新拉取

## v2.4.1（2026-09-26 · 设置项图标 · 测试聚合器）

### Added
- **设置项图标**：设置行 / 侧边栏项 / 播放器扩展按钮增加 Font Awesome 前置图标（`SETTING_ICONS` / `SIDEBAR_ICONS` / `EXT_ICONS`），选项一眼可扫
- **测试聚合器**：`run-tests.mjs` 升级为全量自检入口——自身 lib 断言后以子进程依次执行全部兄弟套件（i18n-check / boot-smoke / lang-switch / utils-test），任一失败整体 FAIL

## v2.4.0（2026-09-26 · 启动时序 · 新手引导）

### Fixed
- **启动时序**：首次进入不再显示占位文本——boot 前先按 fallback 链加载 locale 字典再渲染（字典脚本异步加载，同步 init 曾让首屏显示占位文本）；`setLocale` 在字典就绪后重放静态翻译与动态 UI；语言检测按语言注册表匹配，切换语言与首次进入显示一致

### Changed
- **新手引导**：第 2 步补充移动端底部导航说明，第 5 步改为「外观与语言」（亮/暗/跟随系统主题 + 界面语言切换入口）
- **重置确认**：「重置为默认」确认弹窗明确重置范围——重置所有设置，但界面语言与文本方向保留；设置页语言区下方新增提示说明此项不会被重置

### Test
- **i18n-check**：fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效

## v2.3.3（2026-09-26 · 重置保护 · 首访语言切换）

### Changed
- **重置保护**：设置 → 重置为默认 保留 `locale` 与 `directionMode`（语言/文本方向是用户主动选择，不还原；重置确认弹窗明确此范围）
- **首访语言切换**：首次运行指引（欢迎页）左下角新增语言切换地球按钮，新用户无需进设置即可换语言

### Test
- **i18n-check**：fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效

## v2.3.2（2026-09-25 · 语言列表完整显示 · 按需加载）

### Changed
- **语言列表完整显示**：语言按钮渲染注册表全部语言；未加载的字典标 `lang-pending`，点击后按 fallback 链按需加载（`loadLocale`），不再只显示已加载语言；首次进入只加载当前语言及其 fallback 链（+简体中文兜底），不再全量拉取所有语言
- **Service Worker 预缓存**：安装时预缓存全部核心资源（样式/脚本/简体中文），版本更新后刷新一次即加载到新资源，不再需要连续刷新两三次缓存才跟上

### Fixed
- **语言抽屉被设置面板遮罩遮挡**（层级错误），点击「更改」现在可以正常弹出语言列表

## v2.3.1（2026-09-25 · 文本方向 override · 语言二级抽屉）

### Added
- **文本方向 override**：设置 → 通用 新增「文本方向」（自动 / 强制 RTL / 强制 LTR），`i18n.setDirectionOverride` 即时重应用 `dir`（easter-egg / 无障碍辅助）
- **语言二级抽屉**：界面语言改为紧凑二级抽屉（`currentLangLabel` + 更改按钮），语言列表增长后不再占用通用面板

## v2.3.0（2026-09-25 · RTL 支持 · 多语言开放）

### Added
- **多语言体系开放给用户**：新增韩语/法语/西语/德语/巴西葡语/俄语/阿拉伯语七种语言（`languages.js` 注册表 + 逐语言 fallback 链 + 自动加载器；新增语言只需注册表加一行 + 同名字典文件，无需改 index.html）
- **RTL 支持**：阿拉伯语等 RTL 语言设置 `<html dir="rtl">`，chrome（侧栏/顶栏/播放器/设置）随 flexbox/bidi 自动镜像；歌词/学习/编辑内容强制回 LTR（`[dir=rtl]` 规则，CJK 文本与标点保持自然方向）

### Changed
- **语言 code 统一为 BCP 47 全小写标签**（`pt-BR` → `pt-br`），文件名与注册键一致；浏览器语言检测支持完整标签与逐级回退
- **语言显示名称统一**由 `languages.js` 的 native 字段提供，翻译字典不再携带语言名键

### Fixed
- **移动端暗色/高对比主题下顶栏、底栏等 body 级元素不随主题变化**：主题变量同时作用到 `<html>`

## v2.2.0（2026-09-25 · 弹窗焦点圈定 · 高对比主题 · 移动端）

### Added
- **弹窗焦点圈定**：新增 `assets/scripts/ui/focus-trap.js`（通用模态焦点圈，a11y）
- **图标按钮读屏可读**：`data-i18n-title` 同步暴露 `aria-label`
- **高对比主题**：亮 / 暗两套高对比配色（`hc-light` / `hc-dark`，文本对比达 WCAG AA），置于 `[data-color-theme]` 层尾部覆盖常规亮暗
- **移动端触摸优化**：禁 iOS Safari 输入聚焦自动放大（`text-size-adjust`）、交互控件去双击/长按缩放延迟，页面缩放仍可用
- **迷你条显式语言**：迷你条歌词行按包内显式 `lang` 覆盖启发式判别（`mini.js`）
- **移动端三段式布局**：顶栏（LOGO + 滚动歌名 + 歌手 + 封面入口 + 设置/关于抽屉）、底边导航（4 个可配置位 + 「更多」）、功能抽屉收纳上传/歌曲库/影院/迷你模式
- **播放条扩展控制可钉选**（外观 → 布局）：音量/速度/移调/AB 循环/书签/分享任选常驻，未勾选的收进 ⋯ 抽屉，窄屏不再堆叠成三行
- **封面查看**：桌面播放条与移动顶栏均可点击封面按钮查看大图
- **影院背景效果全套**（外观 → 影院）：模糊/亮度/对比度/饱和度/暗化/玻璃/边框，并可切换是否用封面作背景
- **歌曲库**：从 `examples/` 直接加载示例歌词包（清单含版权声明，仅供学习交流）

### Fixed
- **移动端窄屏下播放条功能键不再堆叠成三行**；侧边栏在移动端由底边导航替代
- **移动端收尾修复**：⋯ 抽屉与顶栏抽屉锚定到固定顶栏/底栏（此前会弹出到视口外）；暗色主题下顶栏/底栏次要灰字不再与亮色同色；AB 循环/书签/分享等扩展按钮恢复统一样式；抽屉不整体滚动仅内部列表滚动；主题变量同时作用到 `<html>`（顶栏/底栏/迷你条/影院正确跟随暗色与高对比主题）；设置 → 外观子导航「影院/布局」补齐中英日文案

## v2.1.0（2026-09-25 · 项目结构重组 + 样式拆分）

> 项目结构重组 + 样式拆分：自有资源收进 `assets/`，示例/测试独立目录，第三方依赖与构建脚本保留根目录。

### Changed
- **项目结构重组**：`css/` → `assets/styles/`、`js/` → `assets/scripts/`、`icons/` → `assets/icons/`、`i18n/` → `assets/locales/`，新增 `assets/images/`；`example/` → `examples/`、`test/` → `tests/`；`vendor/`（第三方字体 / Font Awesome / JSZip）与 `scripts/`（构建·部署·工具脚本）保留根目录；HTML 入口仍为根目录 `index.html`，Service Worker 缓存名同步更新
- **CSS 样式拆分**：单一 `styles.css`（84KB）按职责拆为 `base` / `layout` / `views` / `overlays` / `responsive` 五个文件，媒体查询统一收尾最后加载，级联顺序与视觉效果不变

## v2.0.5（2026-09-25 · 试听自动暂停与进度吸附）

> 点击「播放另一版」自动暂停主播放，并可把主播放进度吸附到该句前/后。

### Added
- **试听自动暂停**：点击行内 ♪ 试听另一版时自动暂停主播放（设置 → 通用「点击试听自动暂停主播放」，默认开启，可关闭）
- **试听进度吸附**：试听时主播放进度自动吸附到该句开始（句前）或该句结束（句后）（设置 → 通用「试听时进度吸附」：无 / 句前 / 句后，默认句前）

### Fixed
- **视频导出按钮补样式**：`#videoStartBtn` / `#videoCancelBtn` 原无作用域样式（`.close-btn` 只挂了 about/settings/share 三个 footer），落回浏览器默认外观；补 `.video-footer .close-btn` 规则——「取消」为描边次级按钮，「开始录制/停止录制」为强调色主按钮，录制中禁用态半透明

## v2.0.4（2026-09-25 · 主副音轨切换完善）

> 主副音轨切换完善：音轨按钮升级为切换整首主播放，行内 ♪ 试听另一轨对照练唱。

### Changed
- **主播放音轨切换**：播放条「音轨」按钮由仅切换试听升级为切换主播放音轨（原声 ↔ 伴奏），整首歌换轨播放；进度、速度、音量、移调、循环、书签全部保持（同一 `<audio>` 元素换源，Web Audio 移调图绑定不变）
- **行内 ♪ 试听另一轨**：主播放为原声时 ♪ 试听当前句伴奏（练唱），主播放为伴奏时 ♪ 试听当前句原声（对照），按钮始终补足主播放音轨

### Added
- **音轨按钮文字标签**：显示当前主播放音轨（原声 / 伴奏），不再仅有图标；无伴奏包时按钮自动隐藏

## v2.0.3（2026-09-25 · 试听音轨切换）

> 试听音轨可切换，并让试听跟随音量。

### Added
- **试听音轨切换**：播放条新增「试听音轨」按钮（`♪` 图标），在「伴奏 / 原声」间切换；歌词/学习/混合视图每行的 ♪ 按钮据此试听当前句的伴奏或原声（默认伴奏）

### Fixed
- **试听音量不生效**：点 ♪ 试听创建的第二 Audio 元素原先不设 `volume`，音量条/静音对它无效；现在试听元素创建时即跟随音量与静音，且拖动音量/切静音实时同步

## v2.0.2（2026-09-25 · 逐字 ruby 读音 · 伴奏入口）

> 补齐包格式 v2 的逐字 ruby 读音，并为去人声伴奏补上编辑器入口。

### Added
- **逐字 ruby 读音（格式 v2）**：`analysis` 词条可显式携带 `furigana:[{t,r}…]` 逐汉字注音，覆盖自动整块注音（专为熟字训：時計 → 時(と)計(けい)）；所有 `t` 拼接不等于词面时视为数据不同步、回退到自动拆注、不猜测
- **编辑视图「添加/更换/移除伴奏」**：歌曲信息组内新增去人声伴奏入口（`accept="audio/*"`），与封面入口并列；伴奏随 LyricEx 包导出，歌词/学习视图的「试听本句伴奏」按钮即用此音频

### Changed
- **FORMAT.md**：补齐包格式 v2 规范——`instrumental` / `cover` / 每行 `lang` / `furigana` 字段、`assets/` 分文件夹结构、加载器大小写无关匹配与「不兼容包自动匹配文件并转换」的兜底说明

## v2.0.1（2026-09-25 · 内部拆模块 · 分享卡片 / 视频导出修复）

> 内部拆模块 + 修复用户反馈的分享卡片 / 视频导出 / 编辑器体验问题。

### Changed
- **内部拆模块**：编辑器、分享卡片、歌词视频导出三块 UI 胶水从 `app.js` 抽出到 `js/ui/`（`editor.js` / `share.js` / `video-export.js`），经共享 `ctx`（状态 getter + 辅助函数 + DOM 引用）注入，`app.js` 减负约 790 行；`js/utils/` 保持纯函数、`js/ui/` 承接 DOM 胶水、`js/modules/` 承接平台能力，职责边界清晰

### Fixed
- **分享卡片在部分浏览器空白**：根因是 SVG `<foreignObject>` 栅格化失败且代码注释里承诺的纯文本回退从未实现；补上 canvas-2D 回退渲染器，分享卡片与竖版海报两条路径都接上
- **歌词视频导出横向溢出**：原 `wrapLines` 按空格分词，日文/中文无空格导致超长整行原样画出；改为逐字符贪心换行，歌词/翻译限行省略
- **学习表格「纯文本堆叠」**：原先每个词条值用空格拼接画成一行；改为真网格（词面表头 + 罗马音/平假名/汉字/词性/释义五行、分隔线、列对齐）

### Added
- **视频录制取消按钮**：录制中「关闭」变「取消」，点击放弃录制；录完/报错后文案复位
- **封面/背景图编辑器入口**：歌曲信息组内「添加/更换封面」+「移除」按钮（`accept="image/*"`），封面随 LyricEx 包导出
- **编辑工具栏分类美化**：歌曲信息 / 编辑 / 导出三组（带组标签）；工具栏与提示语吸顶，滚动歌词时不再移出

## v2.0.0-alpha（2026-09-25 · 功能清单分阶段实现）

> 分阶段实现用户选定的功能清单；由用户测试并修复 bug 后升为正式 2.0.0。全部 5 套测试绿。

### Added
- **关于页侧边导航**：关于弹窗改为「左侧子导航 + 右侧可滚动内容」（复用设置弹窗的 `settings-subnav` 样式）
- **应用内更新日志**：`js/changelog.js` 自动加载（每次版本的时间/内容/类型徽章，三语 UI + 开发者中文正文），关于页「更新日志」按钮 + 弹窗
- **变速不变调**（#9）：`preservesPitch = true`（含 moz/webkit 前缀），改速度不再变调
- **移调 / 升降 key**（#10）：Web Audio 实时移调 ±12 半音——tape 式颗粒移调器（双延迟线线性 ramp + 互补 raised-cosine 交叉淡化），0 半音即旁路；`js/utils/pitch.js`（纯算术）+ `js/modules/pitch-shift.js`（DSP）
- **多组循环书签**（#15）：A/B 作「选区」，💾 保存为可开关/删除的书签；播放时最内层活动书签生效（`currentLoopMark` 状态机）
- **去人声双音频**（#13）：包可携带 instrumental（manifest 或文件名 `inst/offvocal/伴奏` 自动识别），歌词/学习视图每行「试听本句伴奏」按钮，用第二个 Audio 元素播放该句段落
- **最近打开 + 多包队列**（#14）：IndexedDB 缓存最近包（`js/modules/recent-store.js`），侧边栏「最近打开」一键重开；多文件拖入首个播放、其余排队，`ended` 自动切下一首（`pendingAutoplay`）
- **学习表格打印 / PDF**（#17）：编辑视图「打印学习表」生成整页逐句表格 + `@media print`
- **学习笔记导出**（#18）：Markdown / HTML（每行原词+翻译+罗马音+备注+逐词表），`js/utils/notes.js`
- **歌词竖版海报**（#19）：1080×1920 手机壁纸（复用 share-card 栅格化管线）
- **分享卡片模板市场**（#20）：模板 = 具名 CSS 预设，JSON 导入/导出，存 localStorage，选择器内联用户模板
- **逐字时间可视化编辑 + 导入自动匹配**（#21/#28）：编辑面板逐词 start/end 输入；导入增强 `.lrc`（内联 `<mm:ss.xx>`）或 `.ass`（`\k` 标签）按时间就近匹配合并——`js/utils/wordtiming.js`
- **封面 / 背景图 + 动态歌词壁纸**（#22）：manifest v2 `cover`（或 zip 内图片）→ 影院模式模糊封面背景
- **包格式 v2**（#27/#31）：`manifest.version=2`，`cover`/`instrumental`/每行 `lang`，导出整理为 `assets/`、`lyrics/` 分文件夹；加载器大小写无关按路径匹配，v1 与 v2 前后兼容，导出即转换
- **PWA 离线安装**（#24）：`manifest.webmanifest` + `icons/icon.svg` + `sw.js`（cache-first）；`ponytail:` SW 只能在 http(s) 注册，`file://` 打不开安装——需本地静态服务（README 有说明）

### Test
- `utils-test.mjs` 新增 pitch 算术 / 书签 / recent 剪枝 / 笔记 / 海报 / 逐字时间解析 单测；`boot-smoke` 覆盖 transpose、instrumental、cover、v2 manifest、lang；`i18n-check` 动态 id 集扩展

## v1.7.0（2026-09-25 · 句循环 · 歌词搜索 · 字幕与视频导出 · 分享卡片）

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

## v1.6.5（2026-09-25 · 弹窗按钮间距 · 阻止浏览器自动翻译）

### Fixed
- **关于/设置弹窗底部按钮间距**：`.about-footer`、`.settings-footer` 均为 `display:flex; justify-content:flex-end` 但缺少 `gap`，「观看指引/恢复默认设置」与「关闭」按钮原本紧贴；补上 `gap: 10px`
- **日↔英切换可能"卡住"**：应用自行管理多语言，但未阻止浏览器自动翻译——Chrome 在 `lang="ja"`/`lang="en"` 时会改写 DOM 文本节点，与应用自身的 `setLocale` 叠加后可表现为"切到英文仍显示日语"。`<html>` 加 `translate="no"` 并加 `<meta name="google" content="notranslate">` 阻断浏览器翻译
- **指引步骤内容语言不同步**：`__onLocaleChange` 原先不重渲染指引正文（仅静态按钮靠 `_apply`），现指引打开时也 `renderGuideStep()`，兑现代码注释里"切换语言会重本地化打开的指引"的承诺
- `test/lang-switch.mjs` 增加 **ja↔en 往返**回归断言（侧边栏标签、设置页签、通用控件、快捷键键帽），杜绝"卡在日语"

## v1.6.4（2026-09-25 · 语言切换残留 · 字重 · 离线资源本地化 · 首次指引）

### Fixed
- **语言切换残留（编辑/模式/快捷键）**：语言选项的选中态原先在模块加载时用写死的 `'zh'` 判定，首次以非中文语言打开时高亮错误；现抽为 `updateLangOptions()`，初始化与语言变更时都按真实 locale 刷新。`__onLocaleChange` 同时补上迷你条重渲染。`test/lang-switch.mjs` 扩为覆盖 侧边栏「编辑/模式」标签、「快捷键」标签、编辑视图工具栏、快捷键键帽 的 zh→ja→zh 往返

### Changed
- **字重下调一档 + 只加载需要的字重**：webfont 由「Noto 仅 500 / M PLUS 400·500·800 / Courier 含斜体」改为三个字体各只加载 **400 + 700**（去掉 500、800 与斜体）。默认渲染从 500 回落到真 400，整体更轻
- **离线资源本地化**：新增 `scripts/fetch-assets.mjs`，把 Google Fonts（woff2 + @font-face CSS，含中日全量 unicode-range 子集）、Font Awesome 5.15.4、JSZip 3.10.1 全部下载进 `vendor/`；`index.html` 改为引用本地文件，运行时不再依赖 cdnjs / Google Fonts CDN（约 10.9 MB，含 357 个 woff2 子集）。重跑脚本即可刷新

### Added
- **「歌词字重」设置**：外观 → 字体 新增 常规(400)/粗体(700)，经 `--lyric-weight` 作用于歌词/混合/影院/学习/编辑/迷你条各歌词行
- **首次访问指引遮罩**：首访弹出 5 步引导（上传/视图/模式/快捷键/个性化，三语、带图标与进度点）；之后不再自动弹出，可在 关于 → 观看指引 随时重开；Esc / 点击遮罩可关闭，关闭即记 `lyricex-guide-seen`
- **关于页丰富**：新增「快速上手」清单 +「观看指引」按钮

## v1.6.3（2026-09-25 · 语言切换重渲染 · 影院滚动条 · 页面动画 · 上传区收缩）

### Fixed
- **语言切换后设置项/侧边栏项回不来**：动态渲染的设置控件（字体/字号/默认首页/侧边栏显示复选框/快捷键键帽等）没有 `data-i18n` 属性，原先只在设置弹窗打开时才重渲染——语言在弹窗关闭时变更（重置/迁移/applySettings 路径）会让它们永远停在旧语言。现改为语言变更时**无条件**重渲染设置与快捷键控件。新增 `test/lang-switch.mjs` 回归测试（带真实结构的 DOM shim）
- **影院模式滚动条位置**：滚动条原先贴在居中的 800px 歌词列右缘，现移到屏幕最右侧（`.cinema-content` 去掉水平内边距、`.cinema-lyrics` 去掉 `max-width`，歌词行仍居中并加 `max-width: min(88%,720px)` 保持可读）

### Added
- **页面动画设置**：新增「页面动画」开关 +「动画速度」（慢/正常/快，缩放 `--transition`）；关闭时通过 `#app[data-motion="off"]` 冻结全部过渡/动画，并遵循系统 `prefers-reduced-motion`；切换视图时加入轻柔淡入（仅显式切视图，学习视图逐行重渲染保持瞬时）；自动跟随滚动动画同样尊重动画开关
- **上传区收缩**：加载歌词包后上传框自动收缩为紧凑横向长条（图标 + 文件名，隐藏提示文字），避免挤压下方歌曲信息
- **侧边栏显示自动分列**：设置 → 通用 的「侧边栏显示」复选框改为 `auto-fill` 网格自动排成 2–3 列（标题整行），缩减纵向空间
- **启动预加载字体**：Google Fonts 由 CSS `@import` 改为 `<head>` 内 preconnect + 合并样式表链接，并在 `init` 用 `document.fonts.load()` 主动拉取 Noto Sans SC / M PLUS Rounded 1c / Courier Prime 全部字重，避免文字后跳

## v1.6.2（2026-09-25 · 中日字体自动判别 · 侧边栏显示开关）

### Added
- **逐行中日字体自动判别**（`lib.isChinese`）：含假名（或 々/〆）判为日语、无假名的汉字判为中文。歌词/混合/影院/学习/编辑器/迷你条六处歌词行据此加 `data-lang="zh"`，CSS 把中文行从日语优先栈 `--font-lyrics` 切换到中文字体栈 `--font-lyrics-sc`（Noto Sans SC）。判别按构造安全：中文必含汉字且无假名、绝不会被误判为日语；两套字体都覆盖全部汉字，误判只退化为「字形风格不同」而非缺字。已知上限：全汉字无假名的日语行（罕见）按中文排版，见 `lib.isChinese` 的 `ponytail:` 注释
- **侧边栏显示开关**：设置 → 通用 新增「侧边栏显示」，可单独显示/隐藏 歌词/学习/混合/编辑/影院模式/迷你模式/暗黑模式/关于 八个入口（设置不可隐藏）；侧边栏整理为 视图 / 模式 / 系统 三组带标签，某组全部隐藏时整组（含标签）折叠
- **Courier Prime 衬线等宽字体**：编辑页时间戳（`mm:ss.cc`）与快捷键键帽（设置→快捷键、关于弹窗快捷键列表）改用 Google Fonts 引入的 Courier Prime（`--font-mono`）

### Fixed
- **影院模式不应用歌词/翻译字体**：影院遮罩层原位于 `#app` 之外，`--font-lyrics`/`--font-translation` 及各字号内联变量无法级联过去（退回界面字体与默认字号）；现移入 `#app`（与关于/设置弹窗一致），主题色、词性颜色、暗色模式变量一并生效。迷你条本就位于 `#app` 内，无需改动

## v1.6.1（2026-09-25 · 逐汉字 ruby 拆注 · 设置弹窗重构）

### Added
- **逐汉字 ruby 拆注**（`lib.furiganaSegments`）：ruby 升级为**假名从不注音、汉字按假名锚点拆注**——書き連ねても → 書(か)き連(つら)ねても、悴んだ → 悴(かじか)んだ；**连续汉字整块注音不拆猜**（時計→時計(とけい)、大人→大人(おとな)，熟字训零错拆）。对齐算法用词内假名锚点（与读法逐字符匹配，即 diff 能做到的全部对齐；jsdiff 的 diffChars 对 書≠か 只会整块替换，无用且未安装，故不引入依赖）；片假名表面按 Unicode 平移折算平假名锚定（メモ帳→メモ帳(ちょう)）。逐字读音升级路径 = 包内 `furigana:[{t,r}…]`（格式 v2）或汉字读音词典，`ponytail:` 注释注明
- **进度条拖动后跟随修复**（回归修复）：松手时原来只跑 `updatePlayState()`，因高亮已在拖动中更新而被跳过 → 视图不重新同步。现在松手 = `enableFollow()` + 即时滚动落地到最终位置；拖动中 rAF 循环只更新高亮不滚动（不再和指针抢滚动）；数字键跳转、迷你进度条点击同样恢复跟随；`scrollLyricToActive` 补上 `followEnabled` 守卫（手动滚动暂停跟随的契约此前只约束了 pill，未约束滚动本身）；切换视图先恢复跟随再渲染。新增测试 API `followOn()`
- **设置弹窗重构**：顶部标签顺序改为 **通用 → 外观 → 歌词 → 快捷键**（打开默认进通用），语言选择并入通用；**外观页支持"标签内的标签"**——左侧竖直子导航（主题色/自定义颜色/字体/字号 四节），右侧内容整体可滚到底，左侧纯导航（点击平滑滚到对应节，滚动时自动高亮当前节）
- **预设按钮修复**：保存/删除预设改为真正的按钮样式（保存 = 主题色实心，删除 = 红色描边、无选中时禁用），改为两行布局（选中+删除 / 名称+保存）
- **歌词字体独立**：歌词默认字体改为**日语优先栈 M PLUS Rounded 1c**（不再回退到 Noto Sans SC 的中文字形）；界面字体保持 Noto Sans SC 优先。设置可单独选择（默认日语 / 跟随界面 / 无衬线 / 衬线 / 等宽 / 自定义）；旧设置 `lyricFont:'default'` 自动迁移为 `'jp'`

### Changed
- `lib.FONT_PRESETS` 新增 `jp`、`inherit`；`SETTINGS_DEFAULTS.lyricFont` = `'jp'`
- 设置外观面板拆分为 4 个 `.settings-section`，schema 增加 `section` 字段（fonts/sizes 分容器渲染）
- 快捷键/迷你条跳转与拖动释放统一走"显式导航 = 恢复跟随"约定

## v1.6.0（2026-09-25 · 汉字 ruby 自动注音 · 主题预设 · 逐字卡拉OK · 包编辑器）

### Added
- **汉字 ruby 自动注音**：歌词行内根据包内 analysis 数据自动给汉字加 `<ruby>` 注音（假名读法悬于汉字上方），歌词/混合/影院/学习/编辑器视图通用；无需 diff 库——贪心游标对齐（逐条在行文本中锚定 `analysis.kanji`）即等价于 diff 对齐；纯假名词条自动跳过，设置可关闭（`showRuby`）
- **默认中日字体**：Google Fonts 引入 Noto Sans SC（中文）+ M PLUS Rounded 1c（日文）作为全局默认字体栈（离线回退到系统字体）
- **主题色自定义 + 词性颜色 + 主题预设（配置组）**：任意取色器自定义主题色（悬停/高亮背景/进度条颜色自动派生）；学习表格罗马音/平假名/汉字/词性/释义五种颜色分别可调；支持把当前配色保存为命名主题预设、一键套用/删除（localStorage）
- **逐字卡拉OK自动禁用**：包内无 `words` 逐字时间戳时不再用估算硬分，自动退化为整行高亮；包格式 v1 新增可选 `words: [{text,start,end}]` 字段（见 `FORMAT.md`），有真实数据时逐字高亮 + 学习表格词列联动
- **分视图字号**：歌词/混合/影院/学习当前行/学习表格/时间标签/编辑器/假名注音 8 种字号分别可调（原歌词/翻译字号保留）
- **设置框固定高度**：设置弹窗固定 600px（小屏 88vh），切换面板不再上下伸缩，内容区滚动
- **学习表标签 i18n**：Romanji/Hiragana/Kanji/POS/Meaning 硬编码改为三语翻译键（并修正拼写 Romaji），随界面语言切换
- **默认首页**：设置 → 通用 可选择启动时默认打开歌词/学习/混合视图
- **页面内完整包编辑**：编辑视图升级为包编辑器——标题/艺术家/专辑直接修改；每行可展开编辑歌词文本/翻译/备注/词条（罗马音、平假名、汉字、词性、释义增删改）；添加行、删除行；已修改状态徽标（导出即保存）；一键重新加载原文件丢弃修改
- `test/i18n-check.mjs`：i18n 三语键完备性 + 使用键存在性 + HTML id 契约校验

### Changed
- `lib.computeWordTimes`（长度加权逐字估算）删除，由 `lib.wordSpans`（真实包数据校验）取代——无数据自动禁用
- 学习表格、注音行颜色改用 `--pos-*` CSS 变量（可被设置覆盖，暗色主题自动适配）

## v1.5.0（2026-09-25 · 快捷键 · 逐字卡拉OK · .lrc 导入 · 时间轴编辑器）

### Added
- ④ **快捷键自定义**：设置 → 快捷键可视化改键（按键捕获、冲突检测、Esc 取消），关于弹窗快捷键列表动态显示；新增 `G` 跟随当前行、`L` 循环、`P/N` 上一句/下一句、`R` 停止、`V` 迷你模式、`0-9` 跳转进度（10% 步进，固定）
- ⑤ **逐字卡拉OK**：当前行按词渐进高亮（无分词数据时按字符权重估算时间窗），与学习表格词列联动高亮；可在设置中关闭
- ⑥ **翻译双行 / 罗马音模式**：歌词/影院视图当前行下方副行显示翻译或罗马音（自动/仅翻译/仅罗马音/关闭），学习视图假名注音行
- ⑦ **频谱可视化**：Web Audio API AnalyserNode 在播放器底部绘制频谱条（影院模式共用），设置中开关
- ⑧ **迷你悬浮模式**：侧栏一键缩成可拖拽悬浮条（当前歌词、播放控制、迷你进度条、点击还原），快捷键 `V`
- ⑨ **.lrc 导入**：直接拖入/选择 `.lrc`（多时间戳、`[offset:]`、`[ti:][ar:]`），无音频进入纯歌词模式，已加载歌曲时拖入即配对校时
- ⑩ **时间轴编辑器**：新「编辑」视图——拖动 `⠿` 校准时间戳（Shift 微调、实时试听）、`mm:ss.cc` 直改、全局偏移滑块实时预览，导出修正后的 LyricEx 包 / .lrc
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

## v1.4.4（2026-09-24 · 自动跟随滚动引擎统一）

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

## v1.4.3（2026-08-08 · 设置面板 · Morandi 主题 · 三语国际化 · 影院模式）

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
