/* LyricEx v2.7.0 – AI analysis result import. Pure; no DOM.
   Parses and validates the JSON an LLM returns for the analysis prompt
   (see utils/ai-prompt.js), then matches entries back onto lyric lines.
   Design goals, learned from the friend tool's brittle single-shot import:
   1. Tolerant parsing — strip ```json fences / code blocks and surrounding
      prose before JSON.parse; the model WILL wrap output despite being told
      not to.
   2. Strict validation with per-entry error details — a malformed entry is
      reported as "第 N 条: ..." instead of a vague "parse failed".
   3. Conservative matching — entries pair to lines by (time, text) both;
      anything ambiguous is left unmatched rather than guessed, so a wrong
      analysis can never silently attach to the wrong line.
   Entry format (matches LyricEx analysis entries 1:1):
     "romaji,hiragana,kanji,partOfSpeech,meaning|romaji2,..."   */

(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    function AiImportError(message, details) {
        var e = new Error(message);
        e.name = 'AiImportError';
        e.details = details || [];
        return e;
    }

    // ---- parsing helpers ----
    // Strip one ```json … ``` (or ``` … ```) fence and any surrounding prose
    // lines, keeping only the first balanced JSON object. LLMs reliably emit
    // the object somewhere in the reply; finding it beats failing on noise.
    function extractJson(text) {
        var s = String(text == null ? '' : text).trim();
        // drop fenced blocks first
        s = s.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1').trim();
        var start = s.indexOf('{');
        if (start < 0) return null;
        // balance braces so a trailing "好的" or notes after `}` are ignored
        var depth = 0,
            inStr = false,
            esc = false;
        for (var i = start; i < s.length; i++) {
            var ch = s[i];
            if (inStr) {
                if (esc) esc = false;
                else if (ch === '\\') esc = true;
                else if (ch === '"') inStr = false;
                continue;
            }
            if (ch === '"') inStr = true;
            else if (ch === '{') depth++;
            else if (ch === '}') {
                depth--;
                if (depth === 0) return s.slice(start, i + 1);
            }
        }
        return null;
    }

    // time field: number (seconds) or "mm:ss(.xx)" string
    function parseEntryTime(v) {
        if (typeof v === 'number') return isFinite(v) && v >= 0 ? v : null;
        if (typeof v === 'string') {
            var m = /^(\d{1,3}):([0-5]?\d(?:\.\d{1,2})?)$/.exec(v.trim());
            if (m) return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
            var n = parseFloat(v);
            if (isFinite(n) && n >= 0) return n;
        }
        return null;
    }

    // "a,b,c,d,e|f,g,h,i,j" → [{romaji,hiragana,kanji,partOfSpeech,meaning}…]
    // Each entry MUST carry exactly 5 non-empty fields; the | separator must
    // exist for multi-word lines. Validation is strict on purpose: feeding a
    // partial analysis into the study table silently is worse than rejecting.
    function parseAnalysis(str, label) {
        if (typeof str !== 'string' || !str.trim()) {
            throw AiImportError(label + '的 analysis 必须是非空字符串', [label + '的 analysis 必须是非空字符串']);
        }
        var out = [];
        str.split('|').forEach(function (raw, i) {
            var parts = raw.split(',');
            if (
                parts.length !== 5 ||
                parts.some(function (p) {
                    return !String(p).trim();
                })
            ) {
                throw AiImportError(
                    label + '的第 ' + (i + 1) + ' 个词条必须包含 5 个非空字段（罗马音,假名,汉字,词性,释义）',
                    [label + '的第 ' + (i + 1) + ' 个词条格式错误']
                );
            }
            out.push({
                romaji: parts[0].trim(),
                hiragana: parts[1].trim(),
                kanji: parts[2].trim(),
                partOfSpeech: parts[3].trim(),
                meaning: parts[4].trim()
            });
        });
        return out;
    }

    // ---- public API ----

    // Parse + validate an LLM reply into { results: [{time,text,translation?,analysis?}…] }
    u.parseAiResult = function (text) {
        var json = extractJson(text);
        if (!json) throw AiImportError('未找到 JSON 对象，请确认粘贴的是 AI 返回的分析结果', ['未找到 JSON 对象']);
        var data;
        try {
            data = JSON.parse(json);
        } catch (e) {
            throw AiImportError('JSON 解析失败：' + e.message, ['JSON 语法错误']);
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw AiImportError('返回内容必须是 JSON 对象', ['返回内容必须是 JSON 对象']);
        }
        if (!Array.isArray(data.results)) throw AiImportError('缺少 results 数组', ['缺少 results 数组']);
        if (data.results.length === 0) throw AiImportError('results 数组不能为空', ['results 数组不能为空']);
        var results = data.results.map(function (o, i) {
            var label = '第 ' + (i + 1) + ' 条结果';
            if (!o || typeof o !== 'object' || Array.isArray(o)) {
                throw AiImportError(label + ' 必须是对象', [label + ' 必须是对象']);
            }
            var time = parseEntryTime(o.time);
            if (time === null)
                throw AiImportError(label + '的 time 字段无效（需要秒数或 mm:ss）', [label + '的 time 无效']);
            if (typeof o.text !== 'string' || !o.text.trim()) {
                throw AiImportError(label + '的 text 字段必须是非空字符串', [label + '的 text 为空']);
            }
            var entry = { time: time, text: o.text };
            if (o.translation !== undefined) {
                if (typeof o.translation !== 'string') {
                    throw AiImportError(label + '的 translation 字段必须是字符串', [
                        label + '的 translation 必须是字符串'
                    ]);
                }
                entry.translation = o.translation;
            }
            if (o.analysis !== undefined) entry.analysis = parseAnalysis(o.analysis, label);
            return entry;
        });
        return { results: results };
    };

    // Match AI results back onto lyric lines by (time, text) both.
    // Returns { lyrics, unmatched: [lyricIndex…] } — never mutates input.
    // Strategy: exact (time-round, text-normalized) first, then a 0.1s-tolerance
    // text match on unused results. Lines without a confident match are left
    // WITHOUT analysis and listed in unmatched for the UI to surface.
    var TIME_TOLERANCE = 0.1;
    function normText(s) {
        return String(s == null ? '' : s)
            .replace(/\s+/g, '')
            .trim();
    }
    u.matchAnalysisToLyrics = function (lyrics, results) {
        var byTime = {},
            used = {};
        results.forEach(function (r, i) {
            var key = Math.round(r.time * 10);
            (byTime[key] = byTime[key] || []).push({ r: r, i: i });
        });
        var unmatched = [];
        var out = lyrics.map(function (line, idx) {
            var key = Math.round(line.time * 10);
            var pool = byTime[key] || [];
            var pick = null;
            for (var j = 0; j < pool.length; j++) {
                if (used[pool[j].i]) continue;
                if (normText(pool[j].r.text) === normText(line.text)) {
                    pick = pool[j];
                    break;
                }
            }
            if (!pick) {
                // tolerance pass: same text within ±0.1s of this line
                for (var k = key - 1; k <= key + 1; k++) {
                    var p2 = byTime[k] || [];
                    for (var m = 0; m < p2.length; m++) {
                        if (used[p2[m].i]) continue;
                        if (
                            Math.abs(p2[m].r.time - line.time) <= TIME_TOLERANCE &&
                            normText(p2[m].r.text) === normText(line.text)
                        ) {
                            pick = p2[m];
                            break;
                        }
                    }
                    if (pick) break;
                }
            }
            if (!pick) {
                unmatched.push(idx);
                return Object.assign({}, line);
            }
            used[pick.i] = true;
            var copy = Object.assign({}, line);
            // analysis may already be parsed (parseAiResult) or a raw string
            // from hand-built results — normalize defensively.
            var analysis = pick.r.analysis;
            if (typeof analysis === 'string') analysis = parseAnalysis(analysis, '第 ' + (pick.i + 1) + ' 条结果');
            if (Array.isArray(analysis) && analysis.length)
                copy.analysis = analysis.map(function (a) {
                    return Object.assign({}, a);
                });
            if (pick.r.translation !== undefined) copy.translation = pick.r.translation;
            copy.analysisSource = 'ai';
            return copy;
        });
        return { lyrics: out, unmatched: unmatched };
    };
})(typeof window !== 'undefined' ? window : globalThis);
