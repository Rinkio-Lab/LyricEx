/* LyricEx changelog data – auto-loaded by index.html; shown in 关于 → 更新日志.
   Single source of truth for the in-app version history. Keep entries newest-first.
   Entry shape: { version, date, changes: [{ type, text }] }
   type ∈ added | changed | fixed | test | removed | breaking
   Note: the change text below is written in Chinese (the developer's language) and
   is intentionally NOT i18n'd — the surrounding UI (title, type badges, close) is.
   Rule: every bumped version MUST have an entry here AND in CHANGELOG.md (same facts). */
(function (root) {
    'use strict';

    root.__lyricexChangelog = [
        {
            version: '3.3.1',
            date: '2026-10-02',
            changes: [
                {
                    type: 'added',
                    text: '字幕导出配置（LRC / SRT / ASS）：三种字幕格式在导出弹窗内可配置并实时预览——LRC 可开关元数据头与翻译行；SRT 可开关翻译、调整结尾空余时长；ASS 可开关翻译与卡拉OK逐字高亮'
                },
                {
                    type: 'added',
                    text: 'LRC 构建器入 utils（buildLrc），配置、预览与导出共用同一生成路径'
                },
                {
                    type: 'changed',
                    text: '导出弹窗 form 条目新增底部「导出」按钮'
                },
                {
                    type: 'test',
                    text: 'utils-test 新增 buildLrc 与 ASS 卡拉OK开关断言'
                }
            ]
        },
        {
            version: '3.3.0',
            date: '2026-10-02',
            changes: [
                {
                    type: 'added',
                    text: '统一导出弹窗：编辑页导出按钮合并为一个「导出」——弹窗左侧分组侧边栏（导出歌词 / 导出学习笔记），右侧配置区 + 实时预览窗；LRC / SRT / ASS / LyricEx 包 / 歌词视频 / 竖版海报 / 学习笔记（MD、HTML）/ 打印学习表全部收进弹窗'
                },
                {
                    type: 'added',
                    text: '预览基础设施：预览渲染 200ms 防抖 + 延迟到下一宏任务执行，配置频繁变化不阻塞主线程，为各格式配置与预览铺路'
                },
                { type: 'changed', text: '版本号 3.2.1 → 3.3.0；Service Worker 缓存名 bump 为 lyricex-v3.3.0' },
                {
                    type: 'test',
                    text: 'i18n-check 动态 id 契约更新（旧导出按钮 id 移除，新增 exportDialogBtn / exportConfig / exportPreviewContent）；e2e 竖版海报用例改为经导出弹窗下载'
                }
            ]
        },
        {
            version: '3.2.1',
            date: '2026-09-27',
            changes: [
                {
                    type: 'added',
                    text: '帮助页跟随全局语言：默认按界面语言显示正文，右上角手动切换后记住独立选择；设置 → 通用新增「帮助页跟随全局语言」开关'
                },
                {
                    type: 'added',
                    text: '检查更新弹窗升级：点击立即显示加载圈；发现新版本左侧更新说明、右侧数据通道与当前版本分栏，API 原始返回可折叠查看；localStorage.lyricex-update-mock 可模拟本地新版本调试'
                },
                {
                    type: 'added',
                    text: '自动化格式化：Prettier 工具链（.prettierrc + npm run format），npm run precommit 一键 格式化 → lint → 全量测试'
                },
                { type: 'added', text: '帮助 FAQ 新增「如何测试检查更新」条目（三语），给出本地模拟键用法' },
                {
                    type: 'fixed',
                    text: '侧边栏与设置图标统一（歌词/学习/混合/编辑/迷你/关于）；主题切换图标反置（改为指示当前主题）；动画关闭时速度选项变灰不可选；库封面图片加载失败自动替换占位音符；侧边栏 Logo 不可选中、点击可开关于'
                },
                { type: 'changed', text: '版本号 3.2.0 → 3.2.1；Service Worker 缓存名 bump 为 lyricex-v3.2.1' }
            ]
        },
        {
            version: '3.2.0',
            date: '2026-09-27',
            changes: [
                {
                    type: 'added',
                    text: '关于 → 检查更新：手动按钮 + 启动静默检查（6 小时节流防限流），双通道检测（GitHub Releases API，404 降级解析 raw CHANGELOG 头部），发现新版本弹原生确认框可跳转 Release 页；无新版 / 静默失败不出声'
                },
                {
                    type: 'test',
                    text: '更新检测单元测试（版本解析 / 比较 / CHANGELOG 头部解析）+ e2e（模拟 API 返回新版本、确认跳转）'
                }
            ]
        },
        {
            version: '3.1.0',
            date: '2026-09-27',
            changes: [
                {
                    type: 'added',
                    text: '帮助页演示章节改为截图轮播：左右箭头 + 底部圆点切换，五张主视图截图（歌词 / 学习 / 混合 / 制包 / 歌曲库）'
                },
                {
                    type: 'added',
                    text: '帮助页常见问题扩充至 16 条（三语）：制包空白、逐字歌词来源、导出视频、离线使用、纯歌词模式、交替歌词拆分、网易云 JSON 配对、曲库去重、查找、无歌词播放、清空曲库、示例包来源占位、语言与方向、更新日志语言、控制台日志、浏览器兼容性'
                },
                { type: 'added', text: '帮助页歌曲库章节配曲库视图截图，两条 FAQ 配制包 / 歌词视图截图' },
                {
                    type: 'changed',
                    text: '移除过时的 assets/images/demo.gif（约 2MB），演示章节由 GIF 改为静态截图轮播'
                },
                { type: 'test', text: '帮助页 e2e 用例更新：7 章节导航、歌曲库章节断言' }
            ]
        },
        {
            version: '3.0.0',
            date: '2026-09-27',
            changes: [
                {
                    type: 'fixed',
                    text: '设置 → 外观 → 影院：切换语言后背景效果设置重复追加（renderSettingControls 从未清空 appearanceCinema，每次切语言多 8 行）——补清空，语言切换后稳定 8 行'
                },
                {
                    type: 'fixed',
                    text: '设置滑块（input range）此前仅 accent-color，Firefox/旧内核显示原生灰滑块——补全自定义轨道与滑块（::-webkit-slider-thumb / ::-moz-range-thumb/track）'
                },
                {
                    type: 'fixed',
                    text: '编辑歌曲信息弹窗按钮无间隙：.library-footer 缺 gap，保存/取消按钮紧贴——补 gap 10px（示例包弹窗同修）'
                },
                {
                    type: 'added',
                    text: '示例包 manifest 歌曲支持 links[]（来源页：label/url/icon 图标），弹窗内渲染链接行；示例数据先占位 #，维护者自行填写'
                },
                {
                    type: 'added',
                    text: '更新日志弹窗补标题与「仅中文」徽标（正文保持开发者中文、不 i18n，标注多语说明）'
                },
                {
                    type: 'changed',
                    text: '关于页全量多语化：口号/构建者/使用技术五项/许可证/免责声明并入三语字典；GitHub 链接移至邮箱下方'
                },
                {
                    type: 'changed',
                    text: '清空曲库确认文案说明只删除浏览器内曲库记录、不删除电脑源文件（数据存 IndexedDB，浏览器策略不允许访问源文件）'
                },
                {
                    type: 'fixed',
                    text: 'release-check 版本比较不支持预发布后缀（v3.0.0-alpha 匹配失败）——正则支持 -suffix，与 CHANGELOG 锁步校验可过'
                },
                {
                    type: 'added',
                    text: '本地歌曲库独立视图（侧边栏「我的曲库」）：IndexedDB 持久化（songs / playlists / meta），浏览器选文件夹递归导入 zip 歌词包与 mp3/flac/m4a/ogg/wav 音频'
                },
                {
                    type: 'added',
                    text: '导入自动读元数据：zip 包走 manifest / 旧 song.json / LRC，裸音频解析 ID3v2 标签（歌名/歌手/专辑/流派/年份/曲目/内嵌封面）+ MP3 CBR 时长估算；按「路径+大小」与「歌名+歌手」双重去重'
                },
                {
                    type: 'added',
                    text: '浏览与查找：歌名/歌手/专辑/歌词全文搜索；歌手/专辑/流派/年份/标签 5 个筛选；歌名/歌手/时长/添加时间/播放次数排序；滚动加载分页'
                },
                {
                    type: 'added',
                    text: '组织与收藏：歌单创建/重命名/删除/打开/增删歌，收藏与取消收藏，最近播放，播放次数统计，标签编辑'
                },
                {
                    type: 'added',
                    text: '展示：专辑封面（zip / ID3 内嵌）、歌曲详情页（元数据网格 + 歌词预览）、按歌手/专辑聚合 tab'
                },
                {
                    type: 'added',
                    text: '曲库播放走主播放器：有歌词自动进歌词视图、侧栏状态同步、记录播放次数与最近播放'
                },
                {
                    type: 'added',
                    text: '控制台日志系统（utils/log.js）：debug/info/warn/error 分级、模块前缀 + 时间戳、localStorage lyricex-log-level 开关，日志永不抛错'
                },
                {
                    type: 'fixed',
                    text: '歌曲库详情返回后列表渲染中断：renderBody 对详情视图已替换掉的 #libStatus 元素写 textContent 抛空引用——判空保护'
                },
                {
                    type: 'fixed',
                    text: '库视图布局不生效：CSS 类名 .view-library 与 JS 渲染的 .library-view 不一致——统一类名'
                },
                {
                    type: 'fixed',
                    text: '库视图按钮全部无样式：全局 .close-btn 仅在弹窗 footer 作用域有样式，独立视图裸用无规则——按视图作用域补齐模态按钮外观'
                },
                {
                    type: 'changed',
                    text: '侧边栏/抽屉「歌曲库」从弹窗升级为独立视图；示例包弹窗保留在视图内「示例包」按钮（GitHub 源不支持添加，仅查看/试听）'
                },
                {
                    type: 'test',
                    text: '新增 tests/library-test.mjs（metadata 纯函数 32 断言）并入 run-tests 聚合器；e2e 新增库视图用例（fixture 目录导入/搜索/详情/播放）并适配 v2.9.3 多源用例；e2e 禁用 Service Worker 保证 manifest stub 可靠'
                },
                { type: 'changed', text: '版本号 3.0.0-alpha（预发布，等待真机验收后再正式 3.0.0）' }
            ]
        },
        {
            version: '2.9.3',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '歌曲库支持多源：manifest songs[].sources 数组可声明多个可加载来源，>1 源时点「打开」弹出来源选择层，选定后加载对应包（单源仍一键直开）'
                },
                {
                    type: 'added',
                    text: '示例包升级：春日影 / 私の心はチョココロネ / 星座になれたら 三个旧包补全行中文翻译（元数据行除外），与 MyGO/キリトリセン 一致'
                },
                {
                    type: 'fixed',
                    text: '歌曲库行按钮「来源」翻译错误（行为是加载打开示例包，却译成出典/Source/Quelle 等）：改动作语义「打开/Open/開く」并修正全部 10 种语言；新增「选择来源」标题键'
                },
                {
                    type: 'fixed',
                    text: '歌曲库加载包文件走 force-cache，示例包更新后用户仍拿旧包——改 no-store（与 manifest 拉取一致）'
                }
            ]
        },
        {
            version: '2.9.2',
            date: '待发布',
            changes: [
                {
                    type: 'fixed',
                    text: '制包页 AI 逐词分析：导入分析按钮与上方粘贴结果 textarea 间隙过小（实测约 5px），补 margin 至 12px'
                },
                {
                    type: 'fixed',
                    text: '制包页原词/翻译框「上传文件 + 清空」按钮组间距为 0（.ws-lrc-upload 非 flex，按钮 inline-block 且标记无空白）——改 flex + gap 6px，垂直对齐'
                },
                {
                    type: 'fixed',
                    text: '提示词预览框中文字体回退：.ws-prompt-preview 字体栈只有等宽（Consolas 无 CJK 字形），中文落系统默认——补 Noto Sans SC / PingFang SC / Microsoft YaHei fallback'
                },
                {
                    type: 'added',
                    text: '制包页三处 textarea（原词 LRC / 翻译 LRC / AI 结果）新增一键清空按钮，清空同步重置对应草稿状态'
                },
                { type: 'added', text: '关于页「开源与声明」补 GitHub 仓库链接（Rinkio-Lab/LyricEx · 源码与 Release）' }
            ]
        },
        {
            version: '2.9.1',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '帮助页新增「提交问题与贡献」章节（三语）：报告问题要点（浏览器与版本 / 控制台报错 / 复现步骤）+ Fork→PR 贡献流程 + 本地联调命令，内容复用 README 贡献指南'
                },
                {
                    type: 'added',
                    text: '帮助页升级为完整帮助中心：左侧目录导航（滚动自动高亮）+ 搜索过滤 + 上一节/下一节分页 + 返回顶部 + ↑/↓ 键盘导航 + 窄屏横向导航条 + 反馈与支持章节（GitHub Issues 直达）'
                },
                {
                    type: 'added',
                    text: '帮助页独立语言切换（zh/ja/en 胶囊按钮，持久化 lyricex-help-locale，不影响全局 UI 语言）；正文与章节标题迁入独立模块 help-content.js（新增帮助语言像加语言字典一样简单）'
                },
                {
                    type: 'added',
                    text: '帮助正文多语化（zh/ja/en）：默认沿 i18n fallback 链解析（pt-br / ar / ko 等回退到 en，再落到 zh），不再一律硬回中文'
                },
                {
                    type: 'changed',
                    text: '提交/推送前流程图渲染工具链正式入库 scripts/render-release-flow.mjs 并支持三语输出（release-flow-en/zh/ja.png，README 三语各引对应语言图）；AGENTS.md 新增 §4.5 可复用构造工具链规范（命名 x.x.x-someword，禁止用完即删）'
                },
                {
                    type: 'changed',
                    text: '帮助页代码块字体栈补中文字体 fallback（等宽字体后接 Noto Sans SC / PingFang SC / Microsoft YaHei）；章节标题移入 help-content.js 后不再引用 help* 词典键（键保留不删）'
                },
                { type: 'fixed', text: '移除 views.css 中重复的 .ws-empty-hint 块（v2.8.1 遗留的重复定义）' },
                {
                    type: 'fixed',
                    text: 'Firefox 滚动条适配：补 scrollbar-width / scrollbar-color 标准属性（此前只有 ::-webkit-scrollbar，Firefox Developer 里滚动条退回系统默认）'
                },
                {
                    type: 'test',
                    text: 'e2e 新增帮助中心用例（目录点击滚动高亮 / 搜索过滤与 Esc 恢复 / 帮助页语言切换与持久化 / ja 直接正文、pt-br 回退英文正文）；boot-smoke 增加帮助视图渲染断言'
                }
            ]
        },
        {
            version: '2.9.0',
            date: '待发布',
            changes: [
                {
                    type: 'fixed',
                    text: '分享卡片 / 竖屏海报防溢出：SVG 路径加 -webkit-line-clamp 行数截断（分享卡歌词 5 行 / 翻译 3 / 罗马字 2；竖屏海报歌词 6 / 翻译 3 / 罗马字 2），2D 兜底渲染器原已有换行省略；视频导出复核无回归（v2.0.1 起已有逐字符换行 + 限行省略）'
                },
                {
                    type: 'changed',
                    text: '学习笔记 HTML 导出加内联样式表（.wrap 容器 / section 边框 / .notes-table 表格样式 / 打印分页避让）；打印样式补 @page 边距与表格行 page-break-inside:avoid'
                }
            ]
        },
        {
            version: '2.8.4',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '帮助页：侧边栏「系统」组新增「帮助」视图——快速上手 / 网易云歌词 JSON 获取指南（内嵌要点）/ 30 秒演示 GIF / 常见问题；指南全文保留在 docs/netease-lyrics-guide.md'
                },
                {
                    type: 'added',
                    text: 'klyric / yrc 逐字歌词导入：网易云 JSON 的 klyric.lyric 自动解析并附加到歌词行 words（逐字卡拉OK高亮即生效）；编辑器「导入逐字时间」支持 .yrc / .klyric 文件（与 .lrc / .ass 并列）'
                },
                {
                    type: 'added',
                    text: '提交前流程整理：README（英/中/日）新增「Before you commit / push」小节 + 渲染流程图（release-flow.png，9 步 + 全绿判定）'
                },
                {
                    type: 'added',
                    text: '30 秒演示 GIF（Playwright 录制 + ffmpeg 压缩，assets/images/demo.gif）；docs/netease-lyrics-guide.md 更新（klyric/yrc 已支持 + 帮助页入口）'
                },
                {
                    type: 'changed',
                    text: 'i18n 新增 6 键（help 系列），zh/ja/en 三语同步补齐；CHANGELOG.md 全文件格式统一（标题归位、版本头/分节/日期统一）并同步 changelog.js 2.5.0 → 2.8.4（修复重复 2.3.2 条目、2.3.3 归位、回填 v2.8.1 缺失记录）'
                },
                {
                    type: 'fixed',
                    text: '制包页出现「跟随」：build 工作区不是歌词视图，滚动不再暂停精修跟随（getLyricsScrollTarget + 切换 tab 刷新跟随 pill）'
                },
                {
                    type: 'fixed',
                    text: '精修页空置高度溢出出现滚动条：空状态只渲染提示；.view-editor 改 flex 列布局根治'
                },
                {
                    type: 'fixed',
                    text: '编辑页「全局偏移(ms)」滑杆样式：原生 range 统一为自定义轨道 + accent 圆形滑块（与音量滑杆同风格）'
                },
                {
                    type: 'test',
                    text: 'utils-test 新增 YRC / klyric 逐字解析单测（行时间/字时间/容差/元数据行/集成配对）'
                }
            ]
        },
        {
            version: '2.8.3',
            date: '待发布',
            changes: [
                {
                    type: 'fixed',
                    text: '三行一句歌词（日文+中文+罗马字同时间戳）导入不再错乱：按时间戳分组后主歌词取日文、翻译取中文、罗马字存入该行 romaji 字段，歌词视图副行（自动/罗马音模式）可显示'
                },
                { type: 'added', text: '制包页 AI 逐词分析复制提示词按钮下方新增实时预览窗（所见即所拷）' },
                {
                    type: 'added',
                    text: 'docs/netease-lyrics-guide.md 网易云歌词 JSON 获取指南（浏览器抓包 / curl 两法，接口实测）'
                }
            ]
        },
        {
            version: '2.8.2',
            date: '待发布',
            changes: [
                {
                    type: 'fixed',
                    text: '系统弹窗原生统一：全部 23 处 alert/confirm/prompt 替换为与设置/关于同风格的对话框（ui/dialog.js，Promise 式 API，焦点圈定接入；破坏性操作确认键红色）'
                },
                {
                    type: 'fixed',
                    text: '分享卡片 / 竖屏海报不可用：SVG foreignObject 路径 canvas 污染（drawImage 成功但 toDataURL 抛 SecurityError）导致预览空白、海报无下载——加 1px getImageData 污染探测，污染即回退纯 2D 渲染'
                },
                {
                    type: 'fixed',
                    text: '制包页空白（真 bug）：v2.7.0 引入 tab 结构时 renderEditorView 多拼了一层 </div>，把 build pane 挤出 .view-editor 被 overflow 裁剪容器裁掉——删除多余闭合标签归位；e2e 增加结构断言防回归'
                },
                {
                    type: 'fixed',
                    text: '部署站缺模块时制包 tab 显示 wsModuleMissing 明确提示而非空白（renderWorkspaceMissing 守卫）'
                },
                {
                    type: 'changed',
                    text: '编辑器 tab 样式对齐设置页（flex:1 等宽 + 激活态 accent 指示条）；README 三语化（EN/中/日 + 四视图截图 + scripts/readme-shots.mjs 截图脚本）；i18n 新增 3 键（dialogOk/dialogCancel/wsModuleMissing）'
                }
            ]
        },
        {
            version: '2.8.1',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '首次 Android APK 打包链路：Nitron 本地打包 Release APK（cn.linko.lyricex.app）+ uber-apk-signer 重签（v1+v2+v3）；keystore 与密码仅存本地 android-build/ 且 .gitignore 排除，绝不上传 GitHub'
                },
                {
                    type: 'fixed',
                    text: '系统弹窗原生统一（23 处 alert/confirm/prompt → 原生风格对话框）、分享卡片/海报 taint 探测自动回退、制包页模块缺失守卫 wsModuleMissing'
                },
                { type: 'test', text: 'e2e 新增分享卡片渲染 + 海报下载用例（防 taint 回归）' }
            ]
        },
        {
            version: '2.8.0',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '设置导出/导入：导出当前全部偏好为 JSON（lyricex-settings-YYYYMMDD.json）；导入经 lib.sanitizeSettings 白名单 + 值类型回退过滤，保留界面语言与文本方向'
                },
                { type: 'changed', text: 'i18n 新增 6 键（设置导出/导入相关），zh/ja/en 三语同步补齐' },
                {
                    type: 'test',
                    text: 'utils-test 新增 8 条 sanitizeSettings 断言（类型回退/嵌套保留/未知键过滤/合法值透传）；e2e 新增设置导出控件与下载用例'
                }
            ]
        },
        {
            version: '2.7.0',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: 'AI 逐词分析工作流：复制提示词 → 任意大模型 → 粘贴结果（纯静态不引 API）；ai-prompt.js 重写提示词（可选手动分段）、ai-import.js 容错解析 + 双键保守匹配（时间×10 取整 + 文本去空格）'
                },
                {
                    type: 'added',
                    text: '交替双语 LRC 自动拆分：lib.splitMixedLrc 按 10ms 时间戳分组 + isChinese 判定，把「一行日文一行中文」的网易云内联 LRC 自动拆为原词 + 翻译'
                },
                {
                    type: 'added',
                    text: 'LRC 文件上传入口（main/trans 双栏各配「上传文件」按钮，.lrc/.txt 回填 textarea）；parseLRC 支持网易云行尾时间戳变体（[t1]正文[t2]）'
                },
                {
                    type: 'changed',
                    text: '空状态可达制包工作区：无歌词时精修页显示引导、制包页可从零开始建包（v2.6.0 设计缺口补全）；i18n 新增 43 键三语补齐'
                },
                {
                    type: 'test',
                    text: 'utils-test 新增网易云内联变体解析与 splitMixedLrc 分组拆分用例；e2e 新增「build tab 交替 LRC 自动拆分」用例'
                }
            ]
        },
        {
            version: '2.6.0',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '编辑视图升级为工作区：精修 / 制包双 tab；制包用 ui/workspace.js（媒体卡片[原声必选+伴奏可选]、LRC 双栏 + 网易云 JSON、AI 分析组、导出组；draft 独立于 ctx.lyrics，resetDraft 清空）'
                },
                {
                    type: 'added',
                    text: '制包格式升级 v2.1：manifest 新增全可选字段（audioFileName/instrumentalFileName/config.analysisModel/config.analysisSource），version 恒为 2 兼容 v2.0 加载器（FORMAT.md v2.1 增量）'
                },
                {
                    type: 'changed',
                    text: 'i18n 新增 42 键（editorTabRefine/editorTabBuild + wsMedia…wsExportFail），zh/ja/en 三语同步补齐'
                }
            ]
        },
        {
            version: '2.5.1',
            date: '待发布',
            changes: [
                {
                    type: 'fixed',
                    text: 'E2E file:// 测试跨平台化（pathToFileURL 运行时推导，修 CI Linux ERR_FILE_NOT_FOUND）；axe color-contrast CI 偶发（--text-muted 加深至 #6a625c + 渲染稳定等待）；关于弹窗 h4→h3 + sr-only h1 移入 main landmark'
                },
                {
                    type: 'changed',
                    text: 'CI 升级：checkout/setup-node@v5、ubuntu-24.04 固定、失败上传 Playwright 报告'
                }
            ]
        },
        {
            version: '2.5.0',
            date: '待发布',
            changes: [
                {
                    type: 'added',
                    text: '工程化补齐：package.json（test/lint/test:cov/e2e/release-check 脚本）、ESLint 9 flat config、GitHub Actions CI 门禁（push/PR 跑 lint + 5 套全量自检 + c8 覆盖率 + Playwright E2E + axe 无障碍）、CSP、release-check 发布自检（sw.js CACHE ≥ CHANGELOG 最新版本 + 体积报告）'
                },
                {
                    type: 'added',
                    text: '浏览器真机测试：tests/e2e/（Playwright + Chromium，真实 HTTP 服务：上传示例包、视图切换、zh/ja/ar 语言切换含 RTL、焦点圈定、axe 扫描）'
                },
                {
                    type: 'fixed',
                    text: '抽屉开关误关（outside-click 监听未排除按钮内子元素，改为 contains 判定）；主题色行 label 缺失补回'
                },
                {
                    type: 'added',
                    text: 'A11y：弹窗可读名 10 处、图标按钮 aria-label、表单标注、对比度 WCAG AA、标题结构；CHANGELOG 回填 v2.2.0–v2.4.2 条目'
                }
            ]
        },
        {
            version: '2.4.2',
            date: '2026-09-26',
            changes: [
                {
                    type: 'fixed',
                    text: '修复设置页图标引入的运行时错误：设置行渲染遗留的 label 引用已清理（此前打开设置或切换语言会报错）'
                },
                {
                    type: 'test',
                    text: '测试聚合器 run-tests 升级为真正全量自检：除自身断言外以子进程执行全部套件（i18n-check / boot-smoke / lang-switch / utils-test），任一失败即整体失败——此前单套件回归可能被漏报'
                }
            ]
        },
        {
            version: '2.4.1',
            date: '2026-09-26',
            changes: [
                {
                    type: 'added',
                    text: '设置页全部设置项加入图标（字体、字号、歌词、通用、外观、影院、布局、侧边栏显示、主题色等），一眼即可定位；界面语言行与「恢复默认设置」按钮也加上图标'
                }
            ]
        },
        {
            version: '2.4.0',
            date: '2026-09-26',
            changes: [
                {
                    type: 'fixed',
                    text: '首次进入不再显示占位文本：启动顺序改为先加载当前语言链再渲染界面；语言检测按语言注册表匹配，切换语言与首次进入显示一致'
                },
                {
                    type: 'changed',
                    text: '更新新手引导：第 2 步补充移动端底部导航说明，第 5 步改为「外观与语言」（亮/暗/跟随系统主题 + 界面语言切换入口）'
                },
                { type: 'added', text: '首次引导左下角新增语言切换地球按钮，新用户进入即可选择界面语言' },
                {
                    type: 'changed',
                    text: '「重置为默认」确认弹窗明确重置范围：重置所有设置，但界面语言与文本方向保留；设置页语言区下方新增提示说明此项不会被重置'
                },
                {
                    type: 'test',
                    text: '更新测试基建：i18n-check 的 fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效'
                }
            ]
        },
        {
            version: '2.3.3',
            date: '2026-09-26',
            changes: [
                { type: 'added', text: '首次引导（欢迎页）左下角新增语言切换地球按钮，新用户进入即可选择界面语言' },
                {
                    type: 'changed',
                    text: '「重置为默认」确认弹窗明确重置范围：重置所有设置，但界面语言与文本方向保留（不会悄悄把语言打回简体中文）；设置页语言区下方新增提示说明此项不会被重置'
                },
                {
                    type: 'test',
                    text: '更新测试基建：i18n-check 的 fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效'
                }
            ]
        },
        {
            version: '2.3.2',
            date: '2026-09-25',
            changes: [
                {
                    type: 'changed',
                    text: '语言列表完整显示：语言按钮渲染注册表全部语言，未加载的字典标 lang-pending；语言文件按需加载——首次进入只加载当前语言及其 fallback 链（+简体中文兜底），不再全量拉取所有语言；选择未加载语言时自动按需加载后再切换'
                },
                {
                    type: 'fixed',
                    text: '修复语言抽屉被设置面板遮罩遮挡的问题（层级错误），点击「更改」现在可以正常弹出语言列表'
                },
                {
                    type: 'changed',
                    text: 'Service Worker 安装时预缓存全部核心资源（样式/脚本/简体中文），版本更新后刷新一次即加载到新资源，不再需要连续刷新两三次缓存才跟上'
                }
            ]
        },
        {
            version: '2.3.1',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '文本方向覆盖（彩蛋/特殊功能）：设置 → 通用 → 文本方向，可在 自动 / 强制从右到左 / 强制从左到右 间切换，对任意语言生效（默认跟随语言自身方向）'
                },
                {
                    type: 'changed',
                    text: '界面语言改二级抽屉：设置里只保留当前语言 + 「更改」一行，点开紧凑语言抽屉选择，语言再多也不挤占设置面板；抽屉内列表可滚动'
                }
            ]
        },
        {
            version: '2.3.0',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '多语言体系开放给用户：新增韩语/法语/西语/德语/巴西葡语/俄语/阿拉伯语七种语言（languages.js 注册表 + 逐语言 fallback 链 + 自动加载器；新增语言只需注册表加一行 + 同名字典文件，无需改 index.html）'
                },
                {
                    type: 'added',
                    text: '右到左（RTL）支持：阿拉伯语等 RTL 语言自动切换 <html dir="rtl">，界面框架随浏览器镜像；歌词/学习/编辑内容保持从左到右，中日文标点方向不受影响'
                },
                {
                    type: 'changed',
                    text: '语言 code 统一为 BCP 47 全小写标签（pt-BR → pt-br），文件名与注册键一致；浏览器语言检测支持完整标签与逐级回退（pt-BR → pt-br → pt → 简体中文）'
                },
                {
                    type: 'changed',
                    text: '语言显示名称统一由 languages.js 的 native 字段提供，翻译字典不再携带语言名键（chinese/japanese/english 移除）'
                },
                {
                    type: 'fixed',
                    text: '修复移动端暗色/高对比主题下顶栏、底栏等 body 级元素不随主题变化的问题（主题变量同时作用到 <html>）'
                }
            ]
        },
        {
            version: '2.2.0',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '无障碍：新增高对比亮 / 暗双主题（设置 → 外观 → 主题色）；移动端不强制禁用页面缩放、不自动放大表单输入；弹窗焦点圈定（focus-trap.js）、图标按钮 aria-label'
                },
                {
                    type: 'added',
                    text: '移动端三段式布局：顶栏（LOGO + 滚动歌名 + 歌手 + 封面入口 + 设置/关于抽屉）、底边导航（4 个可配置位 + 「更多」）、功能抽屉收纳上传/歌曲库/影院/迷你模式'
                },
                {
                    type: 'added',
                    text: '播放条扩展控制可钉选（外观 → 布局）：音量/速度/移调/AB 循环/书签/分享任选常驻，未勾选的收进 ⋯ 抽屉，窄屏不再堆叠成三行；封面查看大图；影院背景效果全套；歌曲库从 examples/ 加载示例包'
                },
                {
                    type: 'fixed',
                    text: '移动端窄屏下播放条功能键不再堆叠成三行；侧边栏在移动端由底边导航替代；⋯ 抽屉/顶栏抽屉锚定修正；暗色主题下顶栏/底栏次要灰字不再与亮色同色；扩展按钮统一样式；主题变量同时作用到 <html>（顶栏/底栏/迷你条/影院正确跟随暗色与高对比主题）'
                }
            ]
        },
        {
            version: '2.1.0',
            date: '2026-09-25',
            changes: [
                {
                    type: 'changed',
                    text: '项目结构重组：自有资源收进 assets/（styles / scripts / icons / locales / 新增 images），示例与测试隔离为 examples/、tests/，vendor/（第三方字体·Font Awesome·JSZip）与 scripts/ 保留根目录，HTML 入口仍为根目录 index.html'
                },
                {
                    type: 'changed',
                    text: 'CSS 样式拆分：单一 styles.css（84KB）按职责拆为 base / layout / views / overlays / responsive 五个文件，媒体查询统一收尾最后加载，级联顺序与视觉效果不变'
                }
            ]
        },
        {
            version: '2.0.5',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '试听自动暂停：点击行内 ♪ 试听另一版时自动暂停主播放（设置→通用可关，默认开）' },
                {
                    type: 'added',
                    text: '试听进度吸附：试听时主播放进度自动吸附到该句前/后（设置→通用可选 无/句前/句后，默认句前）'
                },
                { type: 'fixed', text: '歌词视频导出弹窗的「开始录制/取消」按钮补上样式（原为浏览器默认外观）' }
            ]
        },
        {
            version: '2.0.4',
            date: '2026-09-25',
            changes: [
                {
                    type: 'changed',
                    text: '主副音轨切换完善：播放条「音轨」按钮由仅切换试听升级为切换主播放音轨（原声/伴奏），整首歌换轨播放，进度/速度/音量/移调/循环保持'
                },
                {
                    type: 'changed',
                    text: '行内 ♪ 试听改为播放另一轨的当前句：主播放为原声时试听本句伴奏，主播放为伴奏时试听本句原声（对照练唱）'
                },
                { type: 'added', text: '音轨按钮显示当前音轨文字标签（原声/伴奏），不再仅有图标' }
            ]
        },
        {
            version: '2.0.3',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '试听音轨切换：播放条新增「伴奏/原声」按钮，点歌词旁 ♪ 可在伴奏与原声之间切换试听当前句（默认伴奏）'
                },
                { type: 'fixed', text: '试听音量跟随音量条 / 静音（原为满音量播放）' }
            ]
        },
        {
            version: '2.0.2',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '逐字 ruby 读音（包格式 v2）：analysis 词条可显式携带 furigana:[{t,r}…] 逐汉字注音，覆盖自动整块注音（熟字训 時計→時(と)計(けい)）'
                },
                {
                    type: 'added',
                    text: '编辑视图新增「添加/更换/移除伴奏」入口（accept=audio/*），伴奏随 LyricEx 包导出'
                },
                {
                    type: 'changed',
                    text: 'FORMAT.md 补齐包格式 v2 规范（instrumental / cover / 每行 lang / furigana / 分文件夹 + 自动匹配转换）'
                }
            ]
        },
        {
            version: '2.0.1',
            date: '2026-09-25',
            changes: [
                {
                    type: 'changed',
                    text: '内部拆模块：全部 UI 胶水从 app.js 抽出到 js/ui/（editor / search / mini / cinema / about / settings / share / video-export），经共享 context 注入；app.js 由 2988 行减至 2283 行'
                },
                {
                    type: 'fixed',
                    text: '分享卡片在部分浏览器空白：补 canvas-2D 纯文本回退渲染器（foreignObject 栅格化失败自动降级）'
                },
                {
                    type: 'fixed',
                    text: '歌词视频导出横向溢出：逐字符贪心换行（中英日皆正确），歌词/翻译限行省略；学习表格改为真网格（表头 + 分隔线 + 列对齐）'
                },
                { type: 'added', text: '视频录制取消按钮：录制中关闭弹窗变为「取消」并放弃录制' },
                { type: 'added', text: '封面/背景图编辑器入口：添加 / 更换 / 移除封面，随 LyricEx 包导出' },
                {
                    type: 'changed',
                    text: '编辑工具栏分类美化（歌曲信息 / 编辑 / 导出三组）+ 工具栏与提示语吸顶不再随滚动移出'
                }
            ]
        },
        {
            version: '2.0.0-alpha',
            date: '2026-09-25',
            changes: [
                {
                    type: 'added',
                    text: '关于页改为「侧边快速导航 + 可滚动内容」结构（与设置弹窗一致），并新增应用内「更新日志」弹窗（按钮 + 自动加载 js/changelog.js）'
                },
                { type: 'added', text: '变速不变调：播放速度调节默认保持音高不变（preservesPitch）' },
                { type: 'added', text: '移调 / 升降 key：Web Audio 实时变调练唱（±12 半音）' },
                { type: 'added', text: '多组循环书签：不止 A/B 一组，可保存多段循环区间并开关' },
                {
                    type: 'added',
                    text: '去人声版本：包可携带第二段音频（instrumental），点击歌词旁按钮试听当前句的伴奏'
                },
                { type: 'added', text: '最近打开 + 多包队列连播（IndexedDB 缓存）' },
                {
                    type: 'added',
                    text: '学习表格打印 / PDF 导出、学习笔记 Markdown / HTML 导出、竖版歌词海报、分享卡片模板市场（JSON 导入导出）'
                },
                { type: 'added', text: '逐字时间可视化编辑 + .ass/.lrc 字级时间戳导入' },
                { type: 'added', text: '封面 / 背景图 + 动态歌词壁纸（包格式 v2）' },
                { type: 'added', text: '多语言歌词三层（原词 + 翻译 + 罗马音，manifest v2）、PWA 离线安装' },
                {
                    type: 'changed',
                    text: '包格式升级 v2（ruby 逐字读音 / lang 标签 / 封面分文件夹），兼容并自动转换 v1'
                }
            ]
        },
        {
            version: '1.7.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '句循环：循环键三态 无 → 单曲 → 单句（badge 显示 1 / 句）' },
                {
                    type: 'added',
                    text: '歌词搜索：/ 或 Ctrl/Cmd+F 唤起，按文本/翻译/备注/罗马音/假名/汉字/词性/释义多字段过滤，↑↓/Enter/Esc'
                },
                { type: 'added', text: '主题三态：亮 / 暗 / 跟随系统，系统切换实时跟随' },
                { type: 'added', text: '字幕导出：.srt / .ass（ASS 含逐字 \\k 卡拉OK 与双语样式）' },
                {
                    type: 'added',
                    text: '歌词视频导出：Canvas + MediaRecorder 录制逐句学习表格画面与音频（Chrome/Edge）'
                },
                {
                    type: 'added',
                    text: '分享卡片：当前句 + 翻译 + 罗马音 + 歌名 + 行号，模板/主题色/显示开关/自定义 CSS，下载 PNG / 复制剪贴板，右下水印'
                },
                {
                    type: 'changed',
                    text: '代码拆分：新增 js/utils/（theme/loop/search/subtitles/canvas/share-card）与 js/modules/（audio-graph/video）；音频图共享修复频谱与录制建图冲突'
                }
            ]
        },
        {
            version: '1.6.5',
            date: '2026-09-25',
            changes: [
                { type: 'fixed', text: '关于/设置弹窗底部按钮间距缺失（补 gap: 10px）' },
                { type: 'fixed', text: '日↔英切换可能卡住：阻断浏览器自动翻译（translate=no + notranslate）' },
                { type: 'fixed', text: '指引步骤内容语言不同步：打开指引时也按当前语言重渲染' }
            ]
        },
        {
            version: '1.6.4',
            date: '2026-09-25',
            changes: [
                { type: 'fixed', text: '语言切换残留（编辑/模式/快捷键标签选中态写死 zh）' },
                { type: 'changed', text: '字重下调一档，三个字体只加载 400 + 700 两个字重' },
                {
                    type: 'added',
                    text: '离线资源本地化：scripts/fetch-assets.mjs 把字体/Font Awesome/JSZip 下载进 vendor/，无网络可运行'
                },
                { type: 'added', text: '歌词字重设置（常规 400 / 粗体 700）' },
                { type: 'added', text: '首次访问指引遮罩（5 步，三语，可关闭；关于页可重开）' },
                { type: 'added', text: '关于页丰富：快速上手清单 + 观看指引按钮' }
            ]
        },
        {
            version: '1.6.3',
            date: '2026-09-25',
            changes: [
                {
                    type: 'fixed',
                    text: '语言切换后设置项/侧边栏项回不来（改为语言变更时无条件重渲染设置与快捷键控件）'
                },
                { type: 'fixed', text: '影院模式滚动条位置（移到屏幕最右侧）' },
                { type: 'added', text: '页面动画开关 + 动画速度（遵循系统 prefers-reduced-motion）' },
                { type: 'added', text: '上传区收缩（加载后缩为紧凑长条）' },
                { type: 'added', text: '侧边栏显示自动分列 + 启动预加载字体' }
            ]
        },
        {
            version: '1.6.2',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '逐行中日字体自动判别（含假名判日语、无假名汉字判中文）' },
                { type: 'added', text: '侧边栏显示开关（八个入口可单独隐藏）' },
                { type: 'added', text: 'Courier Prime 等宽字体（编辑页时间戳与快捷键键帽）' },
                { type: 'fixed', text: '影院模式不应用歌词/翻译字体（遮罩移入 #app 使 CSS 变量级联）' }
            ]
        },
        {
            version: '1.6.1',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '逐汉字 ruby 拆注（假名从不注音、连续汉字整块注音不拆猜）' },
                { type: 'fixed', text: '进度条拖动后跟随修复（松手 = 恢复跟随 + 即时落地）' },
                { type: 'added', text: '设置弹窗重构：通用/外观/歌词/快捷键页签 + 外观内竖直子导航' },
                { type: 'added', text: '预设按钮修复 + 歌词字体独立（JP 优先栈，不落到 Noto）' }
            ]
        },
        {
            version: '1.6.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '汉字 ruby 自动注音 + 默认中日字体 + 主题色自定义 + 词性颜色 + 主题预设' },
                { type: 'added', text: '逐字卡拉OK（真实 words 数据驱动，无数据自动禁用）' },
                { type: 'added', text: '分视图字号 + 设置框固定高度 + 学习表标签 i18n + 默认首页' },
                { type: 'added', text: '页面内完整包编辑（改词/翻译/词条/元数据、增删行、导出保存）' },
                { type: 'removed', text: '删除长度加权逐字估算（lib.computeWordTimes），由真实包数据取代' }
            ]
        },
        {
            version: '1.5.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '快捷键自定义 + 逐字卡拉OK + 翻译双行/罗马音模式 + 频谱可视化 + 迷你悬浮模式' },
                { type: 'added', text: '.lrc 导入 + 时间轴编辑器 + LyricEx 自有包格式 v1（manifest.json）' },
                { type: 'added', text: '设置全面扩展（字体/字号/行距/主题/音量/速度持久化）' },
                { type: 'fixed', text: '混合视图面板只渲染初始行、学习视图不跟随、XSS 转义、多包加载竞态等' }
            ]
        },
        {
            version: '1.4.4',
            date: '2026-09-24',
            changes: [
                { type: 'fixed', text: '自动跟随滚动失败（统一跟随引擎 + 手动滚动暂停 + 悬浮跟随按钮）' },
                { type: 'changed', text: '影院模式活动行用 transform scale + text-shadow 强调，无布局抖动' }
            ]
        },
        {
            version: '1.4.3',
            date: '2026-08-08',
            changes: [
                { type: 'added', text: '设置面板（页签导航）+ Morandi 六套配色主题 + 自动持久化' },
                { type: 'added', text: '三语国际化（简中/日/英，自动检测浏览器语言）' },
                { type: 'added', text: '影院模式（全屏歌词 + 渐变遮罩 + 极简控制）' },
                { type: 'changed', text: '代码拆分：CSS 抽到 css/、JS 抽到 js/、i18n 抽到 i18n/' }
            ]
        }
    ];
})(typeof window !== 'undefined' ? window : globalThis);
