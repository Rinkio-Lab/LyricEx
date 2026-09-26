/* LyricEx changelog data – auto-loaded by index.html; shown in 关于 → 更新日志.
   Single source of truth for the in-app version history. Keep entries newest-first.
   Entry shape: { version, date, changes: [{ type, text }] }
   type ∈ added | changed | fixed | test | removed | breaking
   Note: the change text below is written in Chinese (the developer's language) and
   is intentionally NOT i18n'd — the surrounding UI (title, type badges, close) is. */
(function (root) {
    'use strict';

    root.__lyricexChangelog = [
        {
            version: '2.4.2',
            date: '2026-09-26',
            changes: [
                { type: 'fixed', text: '修复设置页图标引入的运行时错误：设置行渲染遗留的 label 引用已清理（此前打开设置或切换语言会报错）' },
                { type: 'test', text: '测试聚合器 run-tests 升级为真正全量自检：除自身断言外以子进程执行全部套件（i18n-check / boot-smoke / lang-switch / utils-test），任一失败即整体失败——此前单套件回归可能被漏报' },
            ]
        },
        {
            version: '2.4.1',
            date: '2026-09-26',
            changes: [
                { type: 'added', text: '设置页全部设置项加入图标（字体、字号、歌词、通用、外观、影院、布局、侧边栏显示、主题色等），一眼即可定位；界面语言行与「恢复默认设置」按钮也加上图标' },
            ]
        },
        {
            version: '2.4.0',
            date: '2026-09-26',
            changes: [
                { type: 'fixed', text: '首次进入不再显示占位文本：启动顺序改为先加载当前语言链再渲染界面；语言检测按语言注册表匹配，切换语言与首次进入显示一致' },
                { type: 'changed', text: '更新新手引导：第 2 步补充移动端底部导航说明，第 5 步改为「外观与语言」（亮/暗/跟随系统主题 + 界面语言切换入口）' },
                { type: 'added', text: '首次引导左下角新增语言切换地球按钮，新用户进入即可选择界面语言' },
                { type: 'changed', text: '「重置为默认」确认弹窗明确重置范围：重置所有设置，但界面语言与文本方向保留；设置页语言区下方新增提示说明此项不会被重置' },
                { type: 'test', text: '更新测试基建：i18n-check 的 fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效' },
            ]
        },
        {
            version: '2.3.2',
            date: '2026-09-26',
            changes: [
                { type: 'added', text: '首次引导（欢迎页）左下角新增语言切换地球按钮，新用户进入即可选择界面语言' },
                { type: 'changed', text: '「重置为默认」确认弹窗明确重置范围：重置所有设置，但界面语言与文本方向保留（不会悄悄把语言打回简体中文）；设置页语言区下方新增提示说明此项不会被重置' },
                { type: 'test', text: '更新测试基建：i18n-check 的 fallback 模拟改用虚构语言（xx/yy），不再覆盖真实用户语言字典，用户语言键对齐检查真正生效' },
            ]
        },
        {
            version: '2.3.2',
            date: '2026-09-25',
            changes: [
                { type: 'changed', text: '语言文件按需加载：首次进入只加载当前语言及其 fallback 链（+简体中文兜底），不再全量拉取所有语言；语言抽屉里选择未加载的语言时自动按需加载后再切换' },
                { type: 'fixed', text: '修复语言抽屉被设置面板遮罩遮挡的问题（层级错误），点击「更改」现在可以正常弹出语言列表' },
                { type: 'changed', text: 'Service Worker 安装时预缓存全部核心资源（样式/脚本/简体中文），版本更新后刷新一次即加载到新资源，不再需要连续刷新两三次缓存才跟上' },
            ]
        },
        {
            version: '2.3.1',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '文本方向覆盖（彩蛋/特殊功能）：设置 → 通用 → 文本方向，可在 自动 / 强制从右到左 / 强制从左到右 间切换，对任意语言生效（默认跟随语言自身方向）' },
                { type: 'changed', text: '界面语言改二级抽屉：设置里只保留当前语言 + 「更改」一行，点开紧凑语言抽屉选择，语言再多也不挤占设置面板；抽屉内列表可滚动' },
            ]
        },
        {
            version: '2.3.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '多语言体系开放给用户：新增韩语/法语/西语/德语/巴西葡语/俄语/阿拉伯语七种语言（languages.js 注册表 + 逐语言 fallback 链 + 自动加载器；新增语言只需注册表加一行 + 同名字典文件，无需改 index.html）' },
                { type: 'added', text: '右到左（RTL）支持：阿拉伯语等 RTL 语言自动切换 <html dir="rtl">，界面框架随浏览器镜像；歌词/学习/编辑内容保持从左到右，中日文标点方向不受影响' },
                { type: 'changed', text: '语言 code 统一为 BCP 47 全小写标签（pt-BR → pt-br），文件名与注册键一致；浏览器语言检测支持完整标签与逐级回退（pt-BR → pt-br → pt → 简体中文）' },
                { type: 'changed', text: '语言显示名称统一由 languages.js 的 native 字段提供，翻译字典不再携带语言名键（chinese/japanese/english 移除）' },
                { type: 'fixed', text: '修复移动端暗色/高对比主题下顶栏、底栏等 body 级元素不随主题变化的问题（主题变量同时作用到 <html>）' },
            ]
        },
        {
            version: '2.2.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '无障碍：新增高对比亮 / 暗双主题（设置 → 外观 → 主题色）；移动端不强制禁用页面缩放、不自动放大表单输入' },
                { type: 'added', text: '移动端三段式布局：顶栏（LOGO + 滚动歌名 + 歌手 + 封面入口 + 设置/关于抽屉）、底边导航（4 个可配置位 + 「更多」）、功能抽屉收纳上传/歌曲库/影院/迷你模式' },
                { type: 'added', text: '播放条扩展控制可钉选（外观 → 布局）：音量/速度/移调/AB 循环/书签/分享任选常驻，未勾选的收进 ⋯ 抽屉，窄屏不再堆叠成三行' },
                { type: 'added', text: '封面查看：桌面播放条与移动顶栏均可点击封面按钮查看大图' },
                { type: 'added', text: '影院背景效果全套（外观 → 影院）：模糊/亮度/对比度/饱和度/暗化/玻璃/边框，并可切换是否用封面作背景' },
                { type: 'added', text: '歌曲库：从 examples/ 直接加载示例歌词包（清单含版权声明，仅供学习交流）' },
                { type: 'fixed', text: '移动端窄屏下播放条功能键不再堆叠成三行；侧边栏在移动端由底边导航替代' },
                { type: 'fixed', text: '移动端收尾修复：⋯ 抽屉与顶栏抽屉锚定到固定顶栏/底栏（此前会弹出到视口外）；暗色主题下顶栏、底栏的次要灰字不再与亮色同色；AB 循环/书签/分享等扩展按钮恢复统一样式；抽屉不整体滚动，仅内部列表滚动；主题变量同时作用到 <html>，使顶栏/底栏/迷你条/影院等 body 级元素正确跟随暗色与高对比主题；设置 → 外观子导航「影院/布局」补齐中英日文案' },
            ]
        },
        {
            version: '2.1.0',
            date: '2026-09-25',
            changes: [
                { type: 'changed', text: '项目结构重组：自有资源收进 assets/（styles / scripts / icons / locales / 新增 images），示例与测试隔离为 examples/、tests/，vendor/（第三方字体·Font Awesome·JSZip）与 scripts/ 保留根目录，HTML 入口仍为根目录 index.html' },
                { type: 'changed', text: 'CSS 样式拆分：单一 styles.css（84KB）按职责拆为 base / layout / views / overlays / responsive 五个文件，媒体查询统一收尾最后加载，级联顺序与视觉效果不变' },
            ]
        },
        {
            version: '2.0.5',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '试听自动暂停：点击行内 ♪ 试听另一版时自动暂停主播放（设置→通用可关，默认开）' },
                { type: 'added', text: '试听进度吸附：试听时主播放进度自动吸附到该句前/后（设置→通用可选 无/句前/句后，默认句前）' },
                { type: 'fixed', text: '歌词视频导出弹窗的「开始录制/取消」按钮补上样式（原为浏览器默认外观）' },
            ]
        },
        {
            version: '2.0.4',
            date: '2026-09-25',
            changes: [
                { type: 'changed', text: '主副音轨切换完善：播放条「音轨」按钮由仅切换试听升级为切换主播放音轨（原声/伴奏），整首歌换轨播放，进度/速度/音量/移调/循环保持' },
                { type: 'changed', text: '行内 ♪ 试听改为播放另一轨的当前句：主播放为原声时试听本句伴奏，主播放为伴奏时试听本句原声（对照练唱）' },
                { type: 'added', text: '音轨按钮显示当前音轨文字标签（原声/伴奏），不再仅有图标' },
            ]
        },
        {
            version: '2.0.3',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '试听音轨切换：播放条新增「伴奏/原声」按钮，点歌词旁 ♪ 可在伴奏与原声之间切换试听当前句（默认伴奏）' },
                { type: 'fixed', text: '试听音量跟随音量条 / 静音（原为满音量播放）' },
            ]
        },
        {
            version: '2.0.2',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '逐字 ruby 读音（包格式 v2）：analysis 词条可显式携带 furigana:[{t,r}…] 逐汉字注音，覆盖自动整块注音（熟字训 時計→時(と)計(けい)）' },
                { type: 'added', text: '编辑视图新增「添加/更换/移除伴奏」入口（accept=audio/*），伴奏随 LyricEx 包导出' },
                { type: 'changed', text: 'FORMAT.md 补齐包格式 v2 规范（instrumental / cover / 每行 lang / furigana / 分文件夹 + 自动匹配转换）' },
            ]
        },
        {
            version: '2.0.1',
            date: '2026-09-25',
            changes: [
                { type: 'changed', text: '内部拆模块：全部 UI 胶水从 app.js 抽出到 js/ui/（editor / search / mini / cinema / about / settings / share / video-export），经共享 context 注入；app.js 由 2988 行减至 2283 行' },
                { type: 'fixed', text: '分享卡片在部分浏览器空白：补 canvas-2D 纯文本回退渲染器（foreignObject 栅格化失败自动降级）' },
                { type: 'fixed', text: '歌词视频导出横向溢出：逐字符贪心换行（中英日皆正确），歌词/翻译限行省略；学习表格改为真网格（表头 + 分隔线 + 列对齐）' },
                { type: 'added', text: '视频录制取消按钮：录制中关闭弹窗变为「取消」并放弃录制' },
                { type: 'added', text: '封面/背景图编辑器入口：添加 / 更换 / 移除封面，随 LyricEx 包导出' },
                { type: 'changed', text: '编辑工具栏分类美化（歌曲信息 / 编辑 / 导出三组）+ 工具栏与提示语吸顶不再随滚动移出' },
            ]
        },
        {
            version: '2.0.0-alpha',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '关于页改为「侧边快速导航 + 可滚动内容」结构（与设置弹窗一致），并新增应用内「更新日志」弹窗（按钮 + 自动加载 js/changelog.js）' },
                { type: 'added', text: '变速不变调：播放速度调节默认保持音高不变（preservesPitch）' },
                { type: 'added', text: '移调 / 升降 key：Web Audio 实时变调练唱（±12 半音）' },
                { type: 'added', text: '多组循环书签：不止 A/B 一组，可保存多段循环区间并开关' },
                { type: 'added', text: '去人声版本：包可携带第二段音频（instrumental），点击歌词旁按钮试听当前句的伴奏' },
                { type: 'added', text: '最近打开 + 多包队列连播（IndexedDB 缓存）' },
                { type: 'added', text: '学习表格打印 / PDF 导出、学习笔记 Markdown / HTML 导出、竖版歌词海报、分享卡片模板市场（JSON 导入导出）' },
                { type: 'added', text: '逐字时间可视化编辑 + .ass/.lrc 字级时间戳导入' },
                { type: 'added', text: '封面 / 背景图 + 动态歌词壁纸（包格式 v2）' },
                { type: 'added', text: '多语言歌词三层（原词 + 翻译 + 罗马音，manifest v2）、PWA 离线安装' },
                { type: 'changed', text: '包格式升级 v2（ruby 逐字读音 / lang 标签 / 封面分文件夹），兼容并自动转换 v1' },
            ]
        },
        {
            version: '1.7.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '句循环：循环键三态 无 → 单曲 → 单句（badge 显示 1 / 句）' },
                { type: 'added', text: '歌词搜索：/ 或 Ctrl/Cmd+F 唤起，按文本/翻译/备注/罗马音/假名/汉字/词性/释义多字段过滤，↑↓/Enter/Esc' },
                { type: 'added', text: '主题三态：亮 / 暗 / 跟随系统，系统切换实时跟随' },
                { type: 'added', text: '字幕导出：.srt / .ass（ASS 含逐字 \\k 卡拉OK 与双语样式）' },
                { type: 'added', text: '歌词视频导出：Canvas + MediaRecorder 录制逐句学习表格画面与音频（Chrome/Edge）' },
                { type: 'added', text: '分享卡片：当前句 + 翻译 + 罗马音 + 歌名 + 行号，模板/主题色/显示开关/自定义 CSS，下载 PNG / 复制剪贴板，右下水印' },
                { type: 'changed', text: '代码拆分：新增 js/utils/（theme/loop/search/subtitles/canvas/share-card）与 js/modules/（audio-graph/video）；音频图共享修复频谱与录制建图冲突' },
            ]
        },
        {
            version: '1.6.5',
            date: '2026-09-25',
            changes: [
                { type: 'fixed', text: '关于/设置弹窗底部按钮间距缺失（补 gap: 10px）' },
                { type: 'fixed', text: '日↔英切换可能卡住：阻断浏览器自动翻译（translate=no + notranslate）' },
                { type: 'fixed', text: '指引步骤内容语言不同步：打开指引时也按当前语言重渲染' },
            ]
        },
        {
            version: '1.6.4',
            date: '2026-09-25',
            changes: [
                { type: 'fixed', text: '语言切换残留（编辑/模式/快捷键标签选中态写死 zh）' },
                { type: 'changed', text: '字重下调一档，三个字体只加载 400 + 700 两个字重' },
                { type: 'added', text: '离线资源本地化：scripts/fetch-assets.mjs 把字体/Font Awesome/JSZip 下载进 vendor/，无网络可运行' },
                { type: 'added', text: '歌词字重设置（常规 400 / 粗体 700）' },
                { type: 'added', text: '首次访问指引遮罩（5 步，三语，可关闭；关于页可重开）' },
                { type: 'added', text: '关于页丰富：快速上手清单 + 观看指引按钮' },
            ]
        },
        {
            version: '1.6.3',
            date: '2026-09-25',
            changes: [
                { type: 'fixed', text: '语言切换后设置项/侧边栏项回不来（改为语言变更时无条件重渲染设置与快捷键控件）' },
                { type: 'fixed', text: '影院模式滚动条位置（移到屏幕最右侧）' },
                { type: 'added', text: '页面动画开关 + 动画速度（遵循系统 prefers-reduced-motion）' },
                { type: 'added', text: '上传区收缩（加载后缩为紧凑长条）' },
                { type: 'added', text: '侧边栏显示自动分列 + 启动预加载字体' },
            ]
        },
        {
            version: '1.6.2',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '逐行中日字体自动判别（含假名判日语、无假名汉字判中文）' },
                { type: 'added', text: '侧边栏显示开关（八个入口可单独隐藏）' },
                { type: 'added', text: 'Courier Prime 等宽字体（编辑页时间戳与快捷键键帽）' },
                { type: 'fixed', text: '影院模式不应用歌词/翻译字体（遮罩移入 #app 使 CSS 变量级联）' },
            ]
        },
        {
            version: '1.6.1',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '逐汉字 ruby 拆注（假名从不注音、连续汉字整块注音不拆猜）' },
                { type: 'fixed', text: '进度条拖动后跟随修复（松手 = 恢复跟随 + 即时落地）' },
                { type: 'added', text: '设置弹窗重构：通用/外观/歌词/快捷键页签 + 外观内竖直子导航' },
                { type: 'added', text: '预设按钮修复 + 歌词字体独立（JP 优先栈，不落到 Noto）' },
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
                { type: 'removed', text: '删除长度加权逐字估算（lib.computeWordTimes），由真实包数据取代' },
            ]
        },
        {
            version: '1.5.0',
            date: '2026-09-25',
            changes: [
                { type: 'added', text: '快捷键自定义 + 逐字卡拉OK + 翻译双行/罗马音模式 + 频谱可视化 + 迷你悬浮模式' },
                { type: 'added', text: '.lrc 导入 + 时间轴编辑器 + LyricEx 自有包格式 v1（manifest.json）' },
                { type: 'added', text: '设置全面扩展（字体/字号/行距/主题/音量/速度持久化）' },
                { type: 'fixed', text: '混合视图面板只渲染初始行、学习视图不跟随、XSS 转义、多包加载竞态等' },
            ]
        },
        {
            version: '1.4.4',
            date: '2026-09-24',
            changes: [
                { type: 'fixed', text: '自动跟随滚动失败（统一跟随引擎 + 手动滚动暂停 + 悬浮跟随按钮）' },
                { type: 'changed', text: '影院模式活动行用 transform scale + text-shadow 强调，无布局抖动' },
            ]
        },
        {
            version: '1.4.3',
            date: '2026-08-08',
            changes: [
                { type: 'added', text: '设置面板（页签导航）+ Morandi 六套配色主题 + 自动持久化' },
                { type: 'added', text: '三语国际化（简中/日/英，自动检测浏览器语言）' },
                { type: 'added', text: '影院模式（全屏歌词 + 渐变遮罩 + 极简控制）' },
                { type: 'changed', text: '代码拆分：CSS 抽到 css/、JS 抽到 js/、i18n 抽到 i18n/' },
            ]
        },
    ];
})(typeof window !== 'undefined' ? window : globalThis);
