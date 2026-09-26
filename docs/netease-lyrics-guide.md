# 网易云歌词 JSON 获取指南（LyricEx 帮助页素材）

> 目标：拿到 LyricEx 制包页可直接粘贴的网易云歌词 JSON。
> 格式：`{"lrc":{"lyric":"原文 LRC"},"tlyric":{"lyric":"翻译 LRC"}}`
> 更新时间：v2.8.3 · 接口与命令均已实测

## 原理

网易云音乐网页版所有歌词都来自同一个接口 `song/lyric`，返回 JSON。拿到一首歌的
**歌曲 ID** 后，用浏览器或命令行请求这个接口，复制返回的 JSON，粘贴进
LyricEx 制包页的「网易云歌词 JSON」输入框即可。

歌曲 ID 从网址里来：打开歌曲页 `https://music.163.com/#/song?id=123456`，
`id=` 后面的数字就是。分享链接（`https://music.163.com/song?id=123456&...`）同理。

## 方法 A：浏览器抓包（零安装）

1. 浏览器打开歌曲页并播放（触发歌词请求）
2. 按 F12 打开开发者工具 → 「网络 / Network」面板
3. 过滤框输入 `lyric`，刷新页面或拖动播放进度条
4. 找到名为 `song/lyric` 的请求，点击后在「响应 / Response」标签页看到 JSON
5. 右键复制整个 JSON（或切到「预览」复制 `lrc` / `tlyric` 字段内容）

注意：接口要求浏览器环境标识（User-Agent + Referer），直接复制浏览器里的请求
是带齐这些头的，所以抓包法最稳。

## 方法 B：命令行（Windows 自带 curl.exe）

```bash
curl "https://music.163.com/api/song/lyric?id=歌曲ID&lv=-1&kv=-1&tv=-1" ^
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" ^
  -H "Referer: https://music.163.com/"
```

实测示例（歌曲 ID 1824020871）：

```bash
curl "https://music.163.com/api/song/lyric?id=1824020871&lv=-1&kv=-1&tv=-1" ^
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" ^
  -H "Referer: https://music.163.com/" -o lyric.json
```

PowerShell 写法：

```powershell
$h = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120'; 'Referer' = 'https://music.163.com/' }
$r = Invoke-RestMethod -Uri 'https://music.163.com/api/song/lyric?id=1824020871&lv=-1&kv=-1&tv=-1' -Headers $h
$r | ConvertTo-Json -Depth 5 | Out-File lyric.json -Encoding utf8
```

拿到 `lyric.json` 后，把**整个文件内容**（或其中的 `lrc` / `tlyric` 部分）复制到
LyricEx 制包页的「网易云歌词 JSON」输入框，点「解析」。

## 返回字段说明

| 字段 | 含义 | LyricEx 是否使用 |
|---|---|---|
| `lrc.lyric` | 原文歌词（标准 LRC；部分歌曲是增强内联格式 `[ts]原文[ts]`） | 是（主歌词） |
| `tlyric.lyric` | 中文/翻译歌词 | 是（翻译） |
| `klyric.lyric` | 逐字歌词（卡拉OK 逐字） | 否（暂未导入） |
| `yrc.lyric` | 逐字歌词（新接口，部分歌曲才有） | 否（暂未导入） |
| `code` | 200 表示成功 | — |

## 常见问题

- **返回 `{"code":400,"msg":"wrong params"}`**：多半是请求没带浏览器头（UA / Referer），
  或歌曲 ID 无效。用方法 A 抓包可绕开。
- **返回 `code` 非 200 / 歌词为空**：该歌曲无版权歌词或歌词库缺失，换一首试试。
- **三行一句的歌词（日文 + 中文 + 罗马字同时间戳）**：LyricEx v2.8.3 起自动按时间戳
  分组——主歌词取日文、翻译取中文、罗马字存入该行注音，歌词视图副行（自动/罗马音
  模式）可直接显示，无需手动删行。
- **`.lrc` 文件导入**：同样支持，上传文件即可；增强内联格式与交替中日的 LRC 都会自动处理。

## 待办（帮助页上线后）

- 帮助页内嵌本指南 + 一段 30 秒演示 GIF
- 后续版本计划支持 `klyric` / `yrc` 逐字歌词导入（逐字卡拉OK 高亮）
