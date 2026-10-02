/* LyricEx v1.6.5 – pure helpers & defaults (no DOM; unit-testable in Node) */
(function (root) {
    'use strict';

    var lib = {};

    // =========================== ESCAPING ===========================
    // Trust boundary: everything inside a package (text / translation / analysis
    // / file names) is untrusted and must be escaped before innerHTML.
    lib.esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    // =========================== TIME ===========================
    lib.formatTime = function (seconds) {
        if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + String(s).padStart(2, '0');
    };

    // mm:ss.cc used by the timeline editor inputs
    lib.formatTimePrecise = function (seconds) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        var m = Math.floor(seconds / 60);
        var s = (seconds % 60).toFixed(2).padStart(5, '0');
        return m + ':' + s;
    };

    lib.parseTimePrecise = function (str) {
        var m = /^(\d{1,3}):([0-5]?\d(?:\.\d{1,2})?)$/.exec(String(str || '').trim());
        if (!m) return NaN;
        return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
    };

    // =========================== LRC PARSING ===========================
    // Supports multiple timestamps per line, [offset:±ms], [ti:]/[ar:]/[al:] tags.
    // [offset:+] shifts lyrics earlier: effective time = raw - offset/1000.
    lib.parseLRC = function (text) {
        var title = '',
            artist = '',
            offsetMs = 0,
            lines = [];
        String(text || '')
            .split(/\r?\n/)
            .forEach(function (raw) {
                var meta = /^\[(ti|ar|al|offset):(.+?)\]$/i.exec(raw.trim());
                if (meta) {
                    var tag = meta[1].toLowerCase(),
                        val = meta[2].trim();
                    if (tag === 'ti') title = val;
                    else if (tag === 'ar') artist = val;
                    else if (tag === 'offset') {
                        var n = parseFloat(val);
                        if (!isNaN(n)) offsetMs = n;
                    }
                    return;
                }
                var tags = [];
                var re = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g,
                    m,
                    last = 0,
                    matched = false;
                while ((m = re.exec(raw)) !== null) {
                    matched = true;
                    tags.push(
                        parseInt(m[1], 10) * 60 +
                            parseInt(m[2], 10) +
                            (m[3] ? parseInt(String(m[3]).padEnd(3, '0'), 10) / 1000 : 0)
                    );
                    // re.lastIndex resets to 0 when exec returns null, so remember it here
                    last = re.lastIndex;
                }
                if (!matched) return;
                var body = raw.slice(last).trim();
                if (!body) {
                    // v2.7.0: NetEase inline variant - "[t1]text[t2]" where t2 is
                    // the NEXT line's start (row ends with a timestamp). Standard
                    // LRC semantics (body after the LAST timestamp) yield empty
                    // here, so such lines were silently dropped. Take t1 as the
                    // row time and the text between the timestamps as the body.
                    if (tags.length > 1) {
                        var stripped = raw
                            .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]\s*$/, '') // trailing ts
                            .replace(/^\[[^\]]*\]\s*/, '')
                            .trim(); // leading ts
                        if (stripped) lines.push({ time: tags[0], text: stripped });
                    }
                    return; // timing-only line
                }
                tags.forEach(function (tm) {
                    lines.push({ time: tm, text: body });
                });
            });
        var off = offsetMs / 1000;
        if (off)
            lines.forEach(function (l) {
                l.time -= off;
            });
        lines.sort(function (a, b) {
            return a.time - b.time;
        });
        return { title: title, artist: artist, offsetMs: offsetMs, lines: lines };
    };

    // =========================== WORD-BY-WORD TIMING ===========================
    // v1.6.0: per-word karaoke renders ONLY from real per-word timing carried in
    // the package (line.words, absolute seconds like line.time). Length-weighted
    // estimation was dropped: on packages without word timings it looked like a
    // hard split that lagged the vocal, so such lines now auto-disable and fall
    // back to whole-line highlighting.
    lib.wordSpans = function (line) {
        if (!line || !Array.isArray(line.words) || line.words.length < 2) return null;
        var out = [];
        line.words.forEach(function (w) {
            if (!w || typeof w.text !== 'string' || !w.text) return;
            var start = Number(w.start),
                end = Number(w.end);
            if (!isFinite(start) || !isFinite(end) || end <= start) return;
            out.push({ text: w.text, start: start, end: end });
        });
        if (out.length < 2) return null;
        out.sort(function (a, b) {
            return a.start - b.start;
        });
        return out;
    };

    // =========================== RUBY ANNOTATION ===========================
    // Segments a lyric line so each analysis entry's kanji can be wrapped in
    // <ruby>kanji<rt>reading</rt></ruby>. Strategy: greedy cursor-scan — find
    // each analysis.kanji at or after the cursor inside the line text and
    // advance the cursor past the match. Kana-only entries (no CJK ideographs)
    // and entries whose reading equals the surface are skipped: ruby over pure
    // kana is noise, not reading help. Each matched entry is split per-kanji
    // via furiganaSegments (e.g. 書き連ねても → 書(か)き連(つら)ねても) so ruby
    // sits on the individual kanji instead of the whole word block.
    // Returns null when nothing needs annotating.
    lib.annotateRuby = function (text, analysis) {
        if (!Array.isArray(analysis) || analysis.length === 0) return null;
        var s = String(text == null ? '' : text);
        var out = [],
            cursor = 0,
            used = false;
        for (var i = 0; i < analysis.length; i++) {
            var item = analysis[i];
            var kanji = item && item.kanji != null ? String(item.kanji) : '';
            var reading = item && item.hiragana != null ? String(item.hiragana) : '';
            if (!kanji) continue;
            if (!/[\u3400-\u4dbf\u4e00-\u9fff]/.test(kanji)) continue; // no ideographs
            // v2.0.0: an explicit per-char furigana array carries its own readings
            // (hiragana may be absent), so it wins; the anchor split still needs a
            // whole-word reading to fall back to.
            var split = lib.furiganaFromArray(kanji, item.furigana);
            if (!split && (!reading || kanji === reading)) continue;
            var idx = s.indexOf(kanji, cursor);
            if (idx < 0) continue; // data out of sync with text: skip, never guess
            if (idx > cursor) out.push({ type: 'text', text: s.slice(cursor, idx) });
            if (!split) split = lib.furiganaSegments(kanji, reading);
            if (split) out.push({ type: 'furigana', segs: split });
            else out.push({ type: 'ruby', text: kanji, reading: reading });
            cursor = idx + kanji.length;
            used = true;
        }
        if (!used) return null;
        if (cursor < s.length) out.push({ type: 'text', text: s.slice(cursor) });
        return out;
    };

    // ===================== REVERSE RUBY (v3.3.10) =====================
    // Learner mode: 汉字假名混排 → 纯假名，汉字以 <rt> 标在假名上方（与
    // annotateRuby 方向相反）。Same greedy cursor-scan: each analysis entry whose
    // kanji appears in the text is replaced by its hiragana reading wrapped as
    // <ruby>kana<rt>kanji</rt></ruby>. Entries lacking a reading, kana-only
    // entries and unmatched kanji are skipped (text passes through untouched);
    // returns null when nothing could be annotated.
    lib.annotateReverseRuby = function (text, analysis) {
        if (!Array.isArray(analysis) || analysis.length === 0) return null;
        var s = String(text == null ? '' : text);
        var out = [],
            cursor = 0,
            used = false;
        for (var i = 0; i < analysis.length; i++) {
            var item = analysis[i];
            var kanji = item && item.kanji != null ? String(item.kanji) : '';
            var reading = item && item.hiragana != null ? String(item.hiragana) : '';
            if (!kanji || !reading) continue;
            if (!/[\u3400-\u4dbf\u4e00-\u9fff]/.test(kanji)) continue; // no ideographs
            if (kanji === reading) continue; // same surface: nothing to swap
            var idx = s.indexOf(kanji, cursor);
            if (idx < 0) continue; // data out of sync with text: skip, never guess
            if (idx > cursor) out.push({ type: 'text', text: s.slice(cursor, idx) });
            out.push({ type: 'ruby', text: reading, reading: kanji });
            cursor = idx + kanji.length;
            used = true;
        }
        if (!used) return null;
        if (cursor < s.length) out.push({ type: 'text', text: s.slice(cursor) });
        return out;
    };

    // Katakana → hiragana fold (Unicode blocks are parallel at 0x60 offset) so
    // a katakana surface can anchor against a hiragana reading (メモ帳/めもちょう).
    lib.foldKana = function (s) {
        var out = '';
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            out += c >= 0x30a1 && c <= 0x30f6 ? String.fromCharCode(c - 0x60) : s[i];
        }
        return out;
    };

    // ==================== PER-KANJI FURIGANA SPLIT (v1.6.1) ====================
    // Splits a word + reading pair into segments so ruby attaches to kanji and
    // NEVER to kana: 書き連ねても / かきつらねても →
    //   [{t:'書',r:'か'},{t:'き'},{t:'連',r:'つら'},{t:'ねても'}]
    // Consecutive kanji with no kana in between share ONE ruby block — no
    // per-kanji guessing, so jukujikun can never mis-split
    // (時計/とけい → {t:'時計',r:'とけい'}, 大人/おとな → {t:'大人',r:'おとな'}).
    // Returns null when the pair cannot be split reliably (caller falls back
    // to whole-word ruby).
    //
    // Why not a diff library: diffing the two strings character-by-character is
    // meaningless here — 書 vs か never match, so diffChars returns one big
    // replace block. What IS alignable is the kana: every kana run in the word
    // must appear verbatim (hiragana-folded) in the reading. Those runs are the
    // anchors; each kanji run absorbs the reading run between two anchors. A
    // two-pointer walk over the anchors is the same alignment a DP diff of the
    // kana-run sequences would produce, in O(n) and zero dependencies.
    //
    // ponytail: per-kanji readings for contiguous runs would need a kanji
    // dictionary or package-carried data — format v2 optional
    // furigana:[{t,r}…] per analysis entry would slot in here and override
    // the shared block.
    lib.furiganaSegments = function (word, reading) {
        var w = String(word == null ? '' : word);
        var r = String(reading == null ? '' : reading);
        if (!w || !r) return null;
        if (!/[\u3400-\u4dbf\u4e00-\u9fff]/.test(w)) return null; // no kanji: nothing to split
        if (/[\u3400-\u4dbf\u4e00-\u9fff]/.test(r)) return null; // reading isn't kana
        var wf = lib.foldKana(w),
            rf = lib.foldKana(r);
        if (wf === rf) return null; // surface already equals reading (kana-only)

        // Classify word chars into runs: kanji / kana / other (digits, spaces…
        // plain text that consumes no reading).
        var runs = [];
        function kindOf(i) {
            var c = wf.charCodeAt(i);
            if ((c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf) || c === 0x3005) return 'kanji';
            if (
                (c >= 0x3041 && c <= 0x3096) ||
                (c >= 0x309d && c <= 0x309e) ||
                (c >= 0x30a1 && c <= 0x30f6) ||
                c === 0x30fc
            )
                return 'kana';
            return 'other';
        }
        for (var i = 0; i < w.length; i++) {
            var k = kindOf(i);
            if (!runs.length || runs[runs.length - 1].k !== k) runs.push({ k: k, chars: [] });
            runs[runs.length - 1].chars.push(w[i]);
        }

        var ri = 0,
            out = [];
        for (var s = 0; s < runs.length; s++) {
            var run = runs[s];
            if (run.k === 'other') {
                out.push({ t: run.chars.join('') });
                continue;
            }
            if (run.k === 'kana') {
                var ktext = run.chars.join('');
                var kfold = lib.foldKana(ktext);
                if (rf.slice(ri, ri + kfold.length) !== kfold) return null; // anchors out of sync
                out.push({ t: ktext });
                ri += kfold.length;
                continue;
            }
            // kanji run: absorb the reading up to the next kana anchor (or end).
            // Consecutive kanji share one ruby block — kana is never annotated.
            var end = rf.length,
                s2;
            for (s2 = s + 1; s2 < runs.length; s2++) {
                if (runs[s2].k === 'kana') {
                    end = rf.indexOf(lib.foldKana(runs[s2].chars.join('')), ri);
                    if (end < 0) return null;
                    break;
                }
            }
            if (end <= ri) return null; // no reading left for this kanji run
            out.push({ t: run.chars.join(''), r: r.slice(ri, end) });
            ri = end;
        }
        if (ri !== rf.length) return null; // reading not fully consumed
        return out;
    };

    // ==================== EXPLICIT PER-CHAR FURIGANA (v2.0.0) ====================
    // Package format v2 may carry analysis[].furigana = [{ t: surface, r: reading },
    // …] — explicit per-kanji ruby that overrides the whole-reading split. This is
    // the upgrade path for jukujikun (時計/とけい) where furiganaSegments correctly
    // refuses to split contiguous kanji. Validation is strict: every segment needs a
    // non-empty `t`, and the concatenation of all `t` must equal the surface word —
    // anything else means the data is out of sync and we return null (the caller
    // falls back to the anchor split, never guesses). A segment whose reading equals
    // its surface (kana) carries no ruby, matching furiganaSegments' "kana never
    // annotated" rule.
    lib.furiganaFromArray = function (word, arr) {
        if (!Array.isArray(arr) || arr.length === 0) return null;
        var segs = [],
            surface = '';
        for (var i = 0; i < arr.length; i++) {
            var it = arr[i];
            if (!it || typeof it.t !== 'string' || !it.t) return null;
            var seg = { t: it.t };
            if (typeof it.r === 'string' && it.r && it.r !== it.t) seg.r = it.r;
            segs.push(seg);
            surface += it.t;
        }
        if (surface !== String(word)) return null; // out of sync: fall back, never guess
        return segs;
    };

    // =========================== COLOR HELPERS ===========================
    lib.hexToRgb = function (hex) {
        if (typeof hex !== 'string') return null;
        var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim()) || /^#?([0-9a-f]{3})$/i.exec(hex.trim());
        if (!m) return null;
        var h = m[1];
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };

    lib.darken = function (hex, amt) {
        var rgb = lib.hexToRgb(hex);
        if (!rgb) return hex;
        var f = Math.max(0, Math.min(1, 1 - amt));
        function ch(v) {
            return Math.round(v * f)
                .toString(16)
                .padStart(2, '0');
        }
        return '#' + ch(rgb[0]) + ch(rgb[1]) + ch(rgb[2]);
    };

    lib.hexToRgba = function (hex, alpha) {
        var rgb = lib.hexToRgb(hex);
        if (!rgb) return hex;
        return 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + Math.max(0, Math.min(1, alpha)) + ')';
    };

    // =========================== FONTS ===========================
    // v1.6.0: default CJK font stacks are defined in assets/styles/base.css;
    // local system fonts listed first still win when the CDN is unreachable.
    // v1.6.1: 'jp' is the lyric default — a Japanese-first stack that does NOT
    // fall through to Noto Sans SC (Chinese glyph shapes on Japanese lyrics);
    // 'sc' is the translation default — a Chinese-first stack that does NOT fall
    // through to M PLUS (Japanese glyph shapes on Chinese translations).
    // The UI default 'default' stays Noto Sans SC-first. 'inherit' = follow UI.
    lib.FONT_PRESETS = {
        default: 'var(--font)',
        jp: "'M PLUS Rounded 1c', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Yu Gothic UI', 'Meiryo', sans-serif",
        sc: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', 'Hiragino Sans GB', sans-serif",
        inherit: 'var(--font)',
        sans: "'M PLUS Rounded 1c', 'Noto Sans SC', 'Segoe UI', 'Hiragino Sans', 'PingFang SC', 'Yu Gothic', sans-serif",
        serif: "Georgia, 'Noto Serif JP', 'Source Han Serif SC', 'Songti SC', 'SimSun', serif",
        mono: "'Cascadia Mono', 'JetBrains Mono', Consolas, 'Courier New', monospace"
    };

    lib.fontStack = function (preset, custom) {
        return custom && String(custom).trim() ? String(custom).trim() : lib.FONT_PRESETS[preset] || 'var(--font)';
    };

    // ==================== PER-LINE SCRIPT DETECTION (v1.6.2) ====================
    // A Chinese lyric line has CJK ideographs but no kana; a Japanese line almost
    // always carries hiragana/katakana (or the iteration marks 々/〆). This is the
    // JP-vs-CN discriminator for the lyric font: kana ⇒ Japanese, ideographs with
    // no kana ⇒ Chinese, anything else (latin/romaji/symbols) ⇒ neither.
    // Safe by construction: it can never label a Chinese line Japanese (Chinese
    // has no kana), and both fonts cover the full ideograph range, so a wrong pick
    // degrades to "same glyphs, different style" rather than tofu. The one ceiling:
    // a kana-less all-kanji Japanese line (rare) is styled Chinese — still renders,
    // but Japanese kokuji in such a line could fall through to a missing glyph.
    // ponytail: full disambiguation needs a dictionary or a package lang tag
    // (format v2 optional 'lang'), not worth it for this ceiling.
    lib.isChinese = function (text) {
        var s = String(text == null ? '' : text);
        if (/[\u3040-\u30ff\u31f0-\u31ff\u3005\u3006]/.test(s)) return false; // kana / 々 〆 → Japanese
        return /[\u3400-\u4dbf\u4e00-\u9fff]/.test(s); // ideographs, no kana → Chinese
    };

    // v2.7.0: split an alternating JP+CN LRC (one line Japanese, next line
    // Chinese, same timestamps — the NetEase inline layout) into two tracks:
    // main (original) and translation. Grouping is by timestamp so paired
    // lines stay aligned; language is decided per-line with isChinese. A line
    // with no kana and no ideographs (romaji/latin) is treated as original —
    // it cannot be a translation of a Japanese song. Pure-Chinese songs (no
    // Japanese line at all) stay entirely in main: a translation track with no
    // original would be worse than no split. Returns { main, trans, split }.
    // v2.8.3: three-line sheets (JP + CN + full-line romaji sharing one
    // timestamp) — when a group holds both a Japanese line and a romaji line,
    // the romaji is kept on the main line as line.romaji instead of being
    // dropped (or worse, displacing the Japanese original).
    lib.splitMixedLrc = function (lines) {
        var main = [],
            trans = [],
            split = false;
        // group by timestamp, rounded to 10ms so NetEase pairs (identical ts)
        // always land in one group while adjacent lines stay separate
        var groups = {};
        (lines || []).forEach(function (l) {
            var key = Math.round((Number(l.time) || 0) * 100);
            (groups[key] = groups[key] || []).push(l);
        });
        Object.keys(groups)
            .sort(function (a, b) {
                return Number(a) - Number(b);
            })
            .forEach(function (key) {
                var g = groups[key];
                var ja = g.filter(function (l) {
                    return !lib.isChinese(l.text) && /[\u3040-\u30ff\u31f0-\u31ff\u3005\u3006]/.test(l.text);
                });
                var cn = g.filter(function (l) {
                    return lib.isChinese(l.text);
                });
                var other = g.filter(function (l) {
                    return !lib.isChinese(l.text) && !/[\u3040-\u30ff\u31f0-\u31ff\u3005\u3006]/.test(l.text);
                });
                // pick one original and one translation per group (first wins)
                var orig = ja.length ? ja[0] : other.length ? other[0] : null;
                var tr = cn.length ? cn[0] : null;
                if (orig && tr) split = true;
                if (orig) {
                    var m = Object.assign({}, orig);
                    if (orig === ja[0] && other.length && !m.romaji) m.romaji = other[0].text;
                    main.push(m);
                }
                if (tr) trans.push(Object.assign({}, tr));
            });
        // pure-Chinese input: no split (all lines are originals)
        if (!main.length) return { main: (lines || []).slice(), trans: [], split: false };
        return { main: main, trans: trans, split: split };
    };

    // =========================== SETTINGS ===========================
    lib.SETTINGS_DEFAULTS = {
        version: 1,
        theme: 'light',
        colorTheme: 'default', // default | preset id | custom
        customAccent: '#8a7a6a',
        // per-POS study-table colors; '' = follow the theme default
        posColors: { romaji: '', hiragana: '', kanji: '', pos: '', meaning: '' },
        locale: 'zh',
        // v2.3.1: text-direction override — 'auto' (language's rtl flag) | 'rtl' | 'ltr'
        directionMode: 'auto',
        defaultView: 'lyrics', // home view: lyrics | study | mixed
        // v1.6.3: motion — animations toggle + speed (scales --transition)
        animations: true,
        animationSpeed: 'normal', // slow | normal | fast
        // v3.2.1: help center follows the global UI language unless disabled
        helpFollowLocale: true,
        // sidebar entry visibility (Settings is always shown, so it isn't listed)
        sidebar: {
            lyrics: true,
            study: true,
            mixed: true,
            editor: true,
            cinema: true,
            mini: true,
            theme: true,
            about: true
        },
        // typography
        lyricFont: 'jp',
        lyricFontCustom: '', // v1.6.1: JP-first lyric font, NOT the UI font
        translationFont: 'sc',
        translationFontCustom: '', // SC-first translation font, NOT the UI font
        uiFont: 'default',
        uiFontCustom: '',
        // v1.6.4: lyric text weight — regular (400, default; one notch lighter
        // than before, which rendered the 500-only Noto face) or bold (700).
        lyricWeight: 'regular', // regular | bold
        lyricSize: 26,
        lyricLineHeight: 1.9,
        translationSize: 14,
        translationLineHeight: 1.5,
        // v1.6.0: per-view / per-element font sizes
        mixedLyricSize: 20,
        cinemaLyricSize: 32,
        studyLineSize: 22,
        studyTableSize: 14,
        timeTagSize: 13,
        editorTextSize: 15,
        furiganaSize: 15,
        // features
        subLine: 'auto', // off | auto | translation | romaji
        showFurigana: true,
        showRuby: true, // v1.6.0: kanji ruby in lyric text
        reverseRuby: false, // v3.3.10: learner mode — pure kana with kanji above
        wordKaraoke: true, // master toggle; needs per-word timing in package
        spectrum: false,
        // v2.1.1: cinema backdrop effects (设置 → 外观 → 影院)
        cinemaUseCover: true, // use the package cover as wallpaper (else theme color)
        cinemaBlur: 0, // px backdrop blur
        cinemaBrightness: 100, // % brightness
        cinemaContrast: 100, // % contrast
        cinemaSaturate: 100, // % saturation
        cinemaDarken: 0, // % extra darkening overlay (0 = off)
        cinemaBorder: 0, // px border around the backdrop
        cinemaGlass: 0, // % glass translucency of the backdrop overlay
        // v2.1.1: mobile bottom nav — entries pinned outside the "更多" drawer
        // (each slot picks from lyrics/study/mixed/editor/cinema/mini; settings)
        bottomNav: ['lyrics', 'study', 'mixed', 'editor'],
        // v2.1.1: player-bar extension controls pinned outside the "⋯" drawer
        // (vol/speed/transpose/ab/marks/share). Desktops default to all pinned
        // (status quo); narrow screens start collapsed (see app.js first-run).
        playerExt: ['vol', 'speed', 'transpose', 'ab', 'marks', 'share'],
        // v2.0.5: per-line audition behavior — auto-pause the main
        // playback and snap its progress to the sentence start/end on ♪ click
        auditionAutoPause: true, // pause the main playback on audition
        auditionSnap: 'start', // none | start | end — where the main progress snaps
        // playback
        volume: 80,
        speed: '1.0',
        // key bindings (normalized keys; ' ' = space, single letters lowercase)
        shortcuts: {
            playPause: ' ',
            seekBack: 'ArrowLeft',
            seekForward: 'ArrowRight',
            volumeUp: 'ArrowUp',
            volumeDown: 'ArrowDown',
            mute: 'm',
            cinema: 'f',
            follow: 'g',
            loop: 'l',
            prevLine: 'p',
            nextLine: 'n',
            reset: 'r',
            mini: 'v'
        }
    };

    lib.normalizeKey = function (key) {
        if (typeof key !== 'string' || !key) return '';
        if (key.length === 1) return key.toLowerCase();
        return key;
    };

    // shallow-merge stored values over defaults (nested for shortcuts/posColors)
    lib.mergeSettings = function (stored, defaults) {
        var out = {};
        Object.keys(defaults).forEach(function (k) {
            var d = defaults[k];
            if (d && typeof d === 'object' && !Array.isArray(d)) {
                var s = stored && typeof stored[k] === 'object' && !Array.isArray(stored[k]) ? stored[k] : {};
                var sub = {};
                Object.keys(d).forEach(function (sk) {
                    sub[sk] = s[sk] !== undefined ? s[sk] : d[sk];
                });
                out[k] = sub;
            } else {
                out[k] = stored && stored[k] !== undefined ? stored[k] : d;
            }
        });
        return out;
    };

    lib.settingsChanged = function (settings, defaults) {
        return JSON.stringify(settings) !== JSON.stringify(defaults);
    };

    // v2.8.0: import-time settings sanitizer. mergeSettings already whitelists
    // keys, but NOT value types — a hand-edited or hostile JSON could smuggle
    // a string into `lyricSize` and corrupt the CSS. Walk the merged result
    // against defaults and revert any scalar whose typeof differs.
    lib.sanitizeSettings = function (stored, defaults) {
        var merged = lib.mergeSettings(stored, defaults);
        Object.keys(defaults).forEach(function (k) {
            var d = defaults[k];
            if (d && typeof d === 'object' && !Array.isArray(d)) {
                Object.keys(d).forEach(function (sk) {
                    if (merged[k][sk] === undefined || typeof merged[k][sk] !== typeof d[sk]) {
                        merged[k][sk] = d[sk];
                    }
                });
            } else {
                if (merged[k] === undefined || typeof merged[k] !== typeof d) {
                    merged[k] = d;
                }
            }
        });
        return merged;
    };

    // =========================== PACKAGE MANIFEST ===========================
    // LyricEx package format v1/v2: zip with manifest.json + lyrics.json + audio.
    // v2 adds optional `cover`, `instrumental`, and per-line `lang` (folder paths
    // are resolved case-insensitively by the loader).
    lib.validateManifest = function (manifest) {
        return !!(
            manifest &&
            manifest.format === 'lyricex-package' &&
            (manifest.version === 1 || manifest.version === 2) &&
            typeof manifest.title === 'string' &&
            typeof manifest.lyricsFile === 'string'
        );
    };

    // =========================== CHANGELOG FILTER ===========================
    // v3.5.2: in-app changelog version filter. The query is normalized (trim,
    // lowercase, drop a leading 'v') and matched as a substring, so '3.5' hits
    // every 3.5.x, '3.5.1' one exact version, and 'alpha' the pre-releases
    // (e.g. 2.0.0-alpha). Empty query matches everything.
    lib.changelogMatch = function (query, version) {
        var q = String(query || '')
            .trim()
            .toLowerCase()
            .replace(/^v/, '');
        if (!q) return true;
        return (
            String(version || '')
                .toLowerCase()
                .indexOf(q) >= 0
        );
    };

    root.__lyricexLib = lib;
})(typeof window !== 'undefined' ? window : globalThis);
