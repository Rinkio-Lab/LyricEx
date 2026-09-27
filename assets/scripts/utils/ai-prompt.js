/* LyricEx v2.7.0 – AI analysis prompt builder. Pure; no DOM.
   Generates the prompt handed to an LLM for per-word morphological analysis of
   Japanese lyrics, and parses nothing — utils/ai-import.js does the parsing.
   Rewritten from the friend tool's prompt with these changes:
   1. Fewer, better few-shot examples (3 lines instead of 9): the old prompt
      spent most of its context on examples that taught more noise than format.
   2. Code fences are explicitly ALLOWED (the old "绝对严禁 ```json" never
      held; models wrap output anyway) — the importer strips them robustly.
   3. Analysis granularity rules stay strict (word-level, no merging, verb
      base form + conjugation, particle function) — that's the part that makes
      the study table useful, and it's a format contract, not model nagging.
   4. Optional chunking: pass chunkSize to split a long lyric into N sub-prompts
      the user can run in parallel rounds. Default = no chunking (GLM-class
      models handle full songs fine; chunking is for models with short ctx).
   Output shape (stable contract with ai-import.js):
     {"results":[{"time":15.3,"text":"…","analysis":"romaji,hiragana,kanji,POS,meaning|…"}]} */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    var SYSTEM =
        '# 角色\n' +
        '你是日语形态素分析引擎，把歌词拆成最细粒度的单词并输出结构化 JSON。\n' +
        '你只做分析，不做任何解释。\n\n' +
        '# 输出格式（严格）\n' +
        '输出一个 JSON 对象（可以用 ```json 代码块包裹，但不能有其它文字）：\n' +
        '{"results":[{"time":秒数,"text":"原歌词","analysis":"罗马音,平假名,汉字,词性,中文释义|…"}]}\n' +
        'analysis 字段内多个单词用半角竖线 | 分隔，每个单词恰好 5 个逗号分隔字段。\n\n' +
        '# 分析规则（严格遵守）\n' +
        '- 分析单位是单词：不得逐字切分，也不得合并不同词（无论词性是否相同）\n' +
        '- 每个单词必须给出：罗马音（Revised Hepburn，音节间留空格）、平假名、汉字（无汉字则平假名）、词性、中文释义\n' +
        '- 动词必须标注原形和活用形，如：動詞「見る」て形、動詞「泣く」ない形\n' +
        '- 助词单独列出并标明语法功能（宾语 / 修饰 / 表原因 / 表疑问等）\n' +
        '- 语法结构标注完整，如：Vて+いる、~のでしょうか\n' +
        '- 括号内歌词同样要分析；歌词注音的情况不保留注音\n' +
        '- 符号（括号、问号等）不作为单词切分\n' +
        '- 片假名英语借词：パズル→pa zu ru；英语读法用方括号，如 [make you]；日语读法标注原词，如 ギルティ (guilty)\n' +
        '- 输出必须覆盖全部歌词行，不得缺漏、不得返回片段\n\n' +
        '# 示例\n' +
        '输入：\n' +
        '[00:15.3] 重大な問題抱えて眠る\n' +
        '[00:24.7] 愛されたほうが確かに無双的だけれど\n\n' +
        '输出：\n' +
        '{"results":[\n' +
        '  {"time":15.3,"text":"重大な問題抱えて眠る","analysis":"juu dai na,じゅうだいな,重大な,形容動詞,重大的|mondai,もんだい,問題,名詞,问题|kaka e te,かかえて,抱えて,動詞「抱える」て形,抱着|ne mu ru,ねむる,眠る,動詞基本形,睡觉"},\n' +
        '  {"time":24.7,"text":"愛されたほうが確かに無双的だけれど","analysis":"a i sa re ta,あいされた,愛された,動詞「愛する」た形,被爱|hou,ほう,方,名詞,方面|ga,が,が,助詞,主语|tashika ni,たしかに,確かに,副詞,确实|mu sou teki,むそうてき,無双的,形容動詞,无敌的|da ke re do,だけれど,だけれど,接続詞,但是"}\n' +
        ']}\n\n' +
        '# 输出要求\n' +
        '只输出 JSON，不要任何解释、问候或 Markdown 列表；若用代码块，只能是 ```json。\n\n' +
        '# 歌词\n' +
        '以下是完整歌词（每行：时间戳 + 日语原文，可选附中文翻译行）：\n';

    // Format a lyric chunk as the input text: [mm:ss.x] line (+ translation line)
    function formatLines(lines) {
        return lines
            .map(function (l) {
                var t = '[' + u.formatPromptTime(l.time) + '] ' + l.text;
                return l.translation ? t + '\n[' + u.formatPromptTime(l.time) + '] ' + l.translation : t;
            })
            .join('\n');
    }

    u.formatPromptTime = function (t) {
        t = Number(t) || 0;
        var m = Math.floor(t / 60);
        var s = (t % 60).toFixed(1);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    };

    // Build the full prompt for one chunk of lyric lines.
    // opts: { chunkIndex?, chunkCount?, analysisModel? (not inserted — reserved) }
    u.buildAnalysisPrompt = function (lines, opts) {
        opts = opts || {};
        var body = SYSTEM + formatLines(lines);
        if (opts.chunkCount && opts.chunkCount > 1) {
            body +=
                '\n\n（注意：这是第 ' +
                (opts.chunkIndex + 1) +
                ' / ' +
                opts.chunkCount +
                ' 段，只分析本段给出的歌词行，输出完整 JSON。）';
        }
        return body;
    };

    // Split lyrics into chunks of at most chunkSize lines (non-empty).
    // Returns array of line arrays. chunkSize <= 0 or >= lines.length → [lines].
    u.chunkLyrics = function (lyrics, chunkSize) {
        if (!Array.isArray(lyrics) || !lyrics.length) return [];
        chunkSize = Math.floor(Number(chunkSize) || 0);
        if (chunkSize <= 0 || chunkSize >= lyrics.length) return [lyrics];
        var out = [];
        for (var i = 0; i < lyrics.length; i += chunkSize) {
            out.push(lyrics.slice(i, i + chunkSize));
        }
        return out;
    };

    // Convenience: build one prompt per chunk.
    // opts: { chunkSize? } — returns [{lines, prompt, chunkIndex, chunkCount}]
    u.buildAnalysisPrompts = function (lyrics, opts) {
        opts = opts || {};
        var chunks = u.chunkLyrics(lyrics, opts.chunkSize);
        return chunks.map(function (lines, i) {
            return {
                lines: lines,
                chunkIndex: i,
                chunkCount: chunks.length,
                prompt: u.buildAnalysisPrompt(lines, { chunkIndex: i, chunkCount: chunks.length })
            };
        });
    };
})(typeof window !== 'undefined' ? window : globalThis);
