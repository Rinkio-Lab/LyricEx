# LyricEx 歌词包格式规范 / Package Formats

LyricEx 支持三种输入，导出两种。所有格式的**时间单位都是秒**（浮点），
歌词行按时间**升序**排列。

## 1. LyricEx 包格式 v2（自有格式，当前；推荐）

Zip 包（建议扩展名 `.lxp.zip`，但任何 `.zip` 均可）。**导出即 v2**：媒体与
封面分文件夹整理，加载器大小写无关按路径匹配，v1 与 v2 前后兼容 —— 旧 v1
包（媒体平铺在根目录）可直接加载，导出即自动转换为 v2。

```
manifest.json            # 元数据清单（必需）
lyrics.json              # 歌词数据（文件名由 manifest.lyricsFile 指定）
assets/audio.mp3         # 原唱音频（manifest.audio，可选）
assets/instrumental.mp3  # 去人声/伴奏音频（manifest.instrumental，可选）
assets/cover.jpg         # 封面（manifest.cover，可选）
```

### manifest.json

```json
{
  "format": "lyricex-package",
  "version": 2,
  "title": "歌曲标题",
  "artist": "艺术家",
  "album": "专辑（可选）",
  "audio": "assets/audio.mp3",
  "instrumental": "assets/instrumental.mp3",
  "cover": "assets/cover.jpg",
  "lyricsFile": "lyrics.json",
  "config": { "lyricOffset": 0 },
  "convertedFrom": "legacy"
}
```

| 字段 | 版本 | 必需 | 说明 |
|---|---|---|---|
| `format` | 1/2 | ✅ | 固定为 `"lyricex-package"` |
| `version` | 1/2 | ✅ | 当前为 `2`；加载器只接受 1 或 2，未来版本号递增 |
| `title` | 1/2 | ✅ | 歌曲标题 |
| `lyricsFile` | 1/2 | ✅ | 包内歌词 JSON 的文件名（可含子文件夹路径） |
| `artist` / `album` | 1/2 | ❌ | 补充元数据 |
| `audio` | 1/2 | ❌ | 原唱音频文件名；缺失且包内无 `.mp3` 时为纯歌词包 |
| `instrumental` | 2 | ❌ | 去人声/伴奏音频文件名；歌词旁按钮试听本句伴奏 |
| `cover` | 2 | ❌ | 封面图文件名；影院模式作背景壁纸 |
| `config.lyricOffset` | 1/2 | ❌ | 全局时间偏移（秒），与播放器语义一致 |
| `convertedFrom` | 1/2 | ❌ | 来源格式标记（`legacy` / `lrc`），仅作记录 |

加载器校验 `format` 与 `version`，失败即拒绝并报错 —— 不猜测、不回退到
内容探测，保证格式演进时行为可预测。媒体/封面文件名按**大小写无关**匹配。

> **自动匹配文件**：即使 manifest 缺 `audio`/`instrumental`/`cover`（或这些
> 字段指向的文件名对不上），加载器也会兜底 —— 文件名含
> `inst` / `off vocal` / `karaoke` / `伴奏` 等关键字的 `.mp3` 自动识别为伴奏，
> 其余 `.mp3` 识别为原唱，任意 `.jpg/.jpeg/.png/.webp` 识别为封面。因此
> 群友包 / v1 包等“不兼容”的旧包也能直接打开，导出即转为 v2。

### lyrics.json

```json
{
  "lyrics": [
    {
      "time": 15.045,
      "text": "悴んだ心 ふるえる眼差し",
      "lang": "ja",
      "analysis": [
        { "romaji": "kaji kan da", "hiragana": "かじかんだ", "kanji": "悴んだ",
          "partOfSpeech": "動詞「悴む」た形", "meaning": "冻僵了",
          "furigana": [ { "t": "悴", "r": "かじか" }, { "t": "んだ" } ] }
      ],
      "words": [
        { "text": "悴んだ", "start": 15.045, "end": 16.2 },
        { "text": "心", "start": 16.2, "end": 17.1 }
      ],
      "translation": "内心满是憔悴 眼神游动不止",
      "note": "kaji kan da ..."
    }
  ]
}
```

`analysis` / `words` / `translation` / `note` 均可选；没有 `analysis` 时学习视图降级显示
"暂无解析"（如 .lrc 导入的歌词）。

- `lang`（v2）：每行可选 `"zh"` / `"ja"` / `"en"`，显式指定该行语言；缺省时按
  字符自动判别（含假名判日语、无假名的汉字判中文）。

### 逐字时间 `words`（v1.6.0）

- 可选数组；存在且**有效词条 ≥ 2** 时该行启用逐字卡拉OK高亮 + 学习表格词列联动
- 每项：`text`（该词表面文本）、`start` / `end`（**绝对秒**，与 `time` 同一时间轴，不必落在行区间内）
- 没有 `words` 或数据无效的包**自动禁用**逐字高亮，退化为整行高亮 —— 不再做任何估算切分

### 逐字 ruby 读音 `furigana`（v2）

- `analysis` 每词条可选 `furigana: [{ t, r }…]`：**显式逐汉字 ruby**，覆盖由
  `kanji` + `hiragana` 自动拆注的整块 ruby
- 每项 `t` = 该段表面文本（汉字或假名），`r` = 读音（假名段可省略 `r`）
- 所有 `t` 拼接必须等于该词条 `kanji`，否则视为数据不同步、回退到自动拆注
  （不猜测）
- 专为**熟字训**设计（時計/とけい、大人/おとな）：自动拆注对连续汉字整块
  注音不拆猜，只有显式 `furigana` 能给出 `時(と)計(けい)` 的逐字读音
- 无 `furigana` 时维持 v1.6.1 行为：汉字按词内假名锚点拆注（書き連ねても →
  書(か)き連(つら)ねても）、连续汉字整块注音不拆猜（時計→時計(とけい)）、
  假名从不注音

## 2. 群友包格式（legacy，仅输入）

```
song.json + 一个 .mp3
```

`song.json` 结构与上节 `lyrics.json` 相同，但根对象直接是：

```json
{ "title": "...", "lyrics": [...], "config": { "lyricOffset": -0.3 }, "exportedAt": "..." }
```

> 该格式没有 artist / album 字段。LyricEx 加载后标记 `sourceFormat: "legacy"`。
> 若包内还有第二个 `.mp3`（文件名含 `inst` / `伴奏` 等关键字），同样会被识别
> 为伴奏。

## 3. LRC（仅输入）

- 支持一行多个时间戳 `[mm:ss.xx][mm:ss.xx]歌词`
- 支持 `[offset:±ms]`（正值 = 歌词提前）
- 支持 `[ti:]` `[ar:]` `[al:]` 元数据
- 直接拖入 `.lrc`：无音频则进入纯歌词模式；已加载歌曲时拖入 .lrc 会把
  新歌词与该音频配对（校时工作流）
- 无 `analysis` 数据，学习视图显示"暂无解析"

## 4. 转换（内置在「编辑」视图）

- 加载任意格式（群友包 / .lrc / LyricEx 包）→ 侧栏「编辑」视图
- 拖动 `⠿` 调整行时间戳（Shift 微调）、输入框直改 `mm:ss.cc`、
  全局偏移滑块实时预览
- 歌曲信息组内可**添加 / 更换 / 移除封面**与**伴奏**（`accept="audio/*"`）
- **导出 LyricEx 包**：生成 `manifest.json`（version 2）+ `lyrics.json` +
  `assets/audio.mp3` + `assets/instrumental.mp3` + `assets/cover.jpg`，
  偏移已烘焙进时间戳（`config.lyricOffset` 写 0，避免二次应用）
- **导出 .lrc**：直接生成标准 LRC 文件
- 即：群友包 → LyricEx 包 的转换 = 打开包 + （可选加伴奏/封面）+ 点一次导出
