/* LyricEx v1.7.0 – subtitle export builders (pure; no DOM) */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    function clamp(v) {
        return isFinite(v) && v > 0 ? v : 0;
    }

    // HH:MM:SS,mmm for SRT.
    u.formatSrtTime = function (seconds) {
        var t = clamp(seconds);
        var h = Math.floor(t / 3600),
            m = Math.floor((t % 3600) / 60),
            s = Math.floor(t % 60);
        var ms = Math.round((t - Math.floor(t)) * 1000);
        if (ms >= 1000) {
            ms = 0;
            s++;
        }
        function p(n, w) {
            return String(n).padStart(w, '0');
        }
        return p(h, 2) + ':' + p(m, 2) + ':' + p(s, 2) + ',' + p(ms, 3);
    };

    // H:MM:SS.cc for ASS (centiseconds).
    u.formatAssTime = function (seconds) {
        var t = clamp(seconds);
        var h = Math.floor(t / 3600),
            m = Math.floor((t % 3600) / 60),
            s = Math.floor(t % 60);
        var cs = Math.round((t - Math.floor(t)) * 100);
        if (cs >= 100) {
            cs = 0;
            s++;
        }
        function p(n, w) {
            return String(n).padStart(w, '0');
        }
        return h + ':' + p(m, 2) + ':' + p(s, 2) + '.' + p(cs, 2);
    };

    // Per-line [start, end] in raw seconds (offset baked out). End = next
    // line's start (or start + pad for the last line).
    function spans(lyrics, offset, opts) {
        var pad = (opts && opts.endPad) || 3;
        return lyrics.map(function (l, i) {
            var start = clamp(Number(l.time) - offset);
            var end = i + 1 < lyrics.length ? clamp(Number(lyrics[i + 1].time) - offset) : start + pad;
            if (end <= start) end = start + pad;
            return { start: start, end: end, line: l };
        });
    }

    function lineText(l) {
        return l && l.text ? String(l.text) : '';
    }
    function lineTranslation(l) {
        return l && l.translation ? String(l.translation) : '';
    }

    // WebVTT-style escaping isn't needed for SRT/ASS, but strip control chars
    // and blank-out empty text so players don't choke.
    function clean(s) {
        return String(s == null ? '' : s)
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // [mm:ss.xx] LRC-style timestamp tag for a seconds value
    function fmtLrcTime(t) {
        var m = Math.floor(t / 60);
        var s = (t % 60).toFixed(2);
        return '[' + String(m).padStart(2, '0') + ':' + String(s).padStart(5, '0') + ']';
    }

    // Build a plain LRC (.lrc) document. opts: { title, artist, meta,
    // includeTranslation } — meta emits [ti:]/[ar:] headers unless meta===false;
    // includeTranslation emits the translation as a second line sharing the
    // same timestamp (common bilingual-LRC convention; players show both).
    u.buildLrc = function (lyrics, offset, opts) {
        opts = opts || {};
        var out = [];
        if (opts.meta !== false) {
            if (opts.title) out.push('[ti:' + clean(String(opts.title)) + ']');
            if (opts.artist) out.push('[ar:' + clean(String(opts.artist)) + ']');
        }
        lyrics.forEach(function (l) {
            var t = Math.max(0, Number(l.time) - (Number(offset) || 0));
            var tag = fmtLrcTime(t);
            var text = clean(lineText(l));
            if (text) out.push(tag + text);
            if (opts.includeTranslation) {
                var tr = clean(lineTranslation(l));
                if (tr) out.push(tag + tr);
            }
        });
        return out.join('\n') + '\n';
    };

    // Plain-text lyrics (.txt) builder. mode: 'plain' (bare text) |
    // 'withTranslation' (text + indented translation) | 'timed' (timestamped) |
    // 'timedTranslation' (timestamped text + indented translation).
    u.buildLyricsTxt = function (lyrics, offset, mode) {
        var out = [];
        lyrics.forEach(function (l) {
            var text = clean(lineText(l));
            var tr = clean(lineTranslation(l));
            var head = mode === 'timed' || mode === 'timedTranslation'
                ? fmtLrcTime(Math.max(0, Number(l.time) - (Number(offset) || 0))) + ' '
                : '';
            if (text) out.push(head + text);
            if ((mode === 'withTranslation' || mode === 'timedTranslation') && tr)
                out.push('    ' + tr);
        });
        return out.join('\n') + '\n';
    };

    // Build a SubRip (.srt) document. opts.includeTranslation appends the
    // translation on a second line when present.
    u.buildSrt = function (lyrics, offset, opts) {
        var out = [];
        spans(lyrics, offset, opts).forEach(function (sp, i) {
            var text = clean(lineText(sp.line));
            var tr = opts && opts.includeTranslation ? clean(lineTranslation(sp.line)) : '';
            out.push(String(i + 1));
            out.push(u.formatSrtTime(sp.start) + ' --> ' + u.formatSrtTime(sp.end));
            out.push(tr ? text + '\n' + tr : text || '♪');
            out.push('');
        });
        return out.join('\n').replace(/\n+$/, '') + '\n';
    };

    // Build an Advanced SubStation Alpha (.ass) document with a lyric style and
    // (when includeTranslation) a secondary translation style. Karaoke \k tags
    // are emitted only when the package carries per-word timings.
    u.buildAss = function (lyrics, offset, opts) {
        var incTr = opts && opts.includeTranslation;
        var header = [
            '[Script Info]',
            '; Generated by LyricEx',
            'ScriptType: v4.00+',
            'PlayResX: 1280',
            'PlayResY: 720',
            'WrapStyle: 0',
            'ScaledBorderAndShadow: yes',
            '',
            '[V4+ Styles]',
            'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
            'Style: Lyric,MPLUS Rounded 1c,54,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,60,60,60,1',
            'Style: Translation,Noto Sans SC,34,&H00D0D0D0,&H000000FF,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,60,60,40,1',
            '',
            '[Events]',
            'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
        ].join('\n');

        var events = spans(lyrics, offset, opts).map(function (sp) {
            var text = karaokeText(sp.line, opts);
            var rows = [
                'Dialogue: 0,' + u.formatAssTime(sp.start) + ',' + u.formatAssTime(sp.end) + ',Lyric,,0,0,0,,' + text
            ];
            if (incTr) {
                var tr = clean(lineTranslation(sp.line));
                if (tr)
                    rows.push(
                        'Dialogue: 0,' +
                            u.formatAssTime(sp.start) +
                            ',' +
                            u.formatAssTime(sp.end) +
                            ',Translation,,0,0,0,,' +
                            tr
                    );
            }
            return rows.join('\n');
        });
        return header + '\n' + events.join('\n') + '\n';
    };

    // Per-word \k karaoke tags when real word timings exist and are enabled
    // (opts.karaoke !== false); otherwise plain text. ASS \k uses centiseconds
    // of the line's local time.
    function karaokeText(line, opts) {
        var words = u.wordSpansForAss(line);
        if (!words || (opts && opts.karaoke === false)) return clean(lineText(line)) || '♪';
        var parts = words.map(function (w) {
            var dur = Math.max(1, Math.round((w.end - w.start) * 100));
            return '{\\k' + dur + '}' + clean(w.text);
        });
        return parts.join('');
    }

    // Minimal per-word extraction (mirrors lib.wordSpans semantics) so the ASS
    // builder doesn't need the full lib.
    u.wordSpansForAss = function (line) {
        if (!line || !Array.isArray(line.words) || line.words.length < 2) return null;
        var out = [];
        line.words.forEach(function (w) {
            if (!w || typeof w.text !== 'string' || !w.text) return;
            var s = Number(w.start),
                e = Number(w.end);
            if (!isFinite(s) || !isFinite(e) || e <= s) return;
            out.push({ text: w.text, start: s, end: e });
        });
        return out.length >= 2
            ? out.sort(function (a, b) {
                  return a.start - b.start;
              })
            : null;
    };

    // ---- Markdown / HTML lyrics exports (v3.3.3) ----
    function escHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    // <ruby> segments from lib.annotateRuby; falls back to escaped text when the
    // line has no analysis or annotateRuby is unavailable.
    function rubySegments(line, escFn) {
        var lib = root.__lyricexLib;
        if (!lib || typeof lib.annotateRuby !== 'function') return null;
        var segs = lib.annotateRuby(line.text, line.analysis);
        if (!segs) return null;
        return segs
            .map(function (s) {
                if (s.type === 'text') return escFn(s.text);
                if (s.type === 'furigana')
                    return s.segs
                        .map(function (g) {
                            return g.r ? '<ruby>' + escFn(g.t) + '<rt>' + escFn(g.r) + '</rt></ruby>' : escFn(g.t);
                        })
                        .join('');
                return '<ruby>' + escFn(s.text) + '<rt>' + escFn(s.reading) + '</rt></ruby>';
            })
            .join('');
    }

    // Markdown lyrics document. opts: { title, includeTranslation, ruby, timed } —
    // ruby emits inline <ruby> HTML (GitHub-flavored Markdown renders it), timed
    // prefixes each line with an `[mm:ss]` code span.
    u.buildLyricsMarkdown = function (lyrics, offset, opts) {
        opts = opts || {};
        var out = [];
        if (opts.title) out.push('# ' + clean(String(opts.title)), '');
        lyrics.forEach(function (l) {
            var ruby = opts.ruby ? rubySegments(l, escHtml) : null;
            var line = ruby !== null ? ruby : clean(lineText(l));
            if (opts.timed)
                line = '`' + fmtLrcTime(Math.max(0, Number(l.time) - (Number(offset) || 0))) + '` ' + line;
            if (line) out.push(line);
            if (opts.includeTranslation) {
                var tr = clean(lineTranslation(l));
                if (tr) out.push('> ' + tr);
            }
            out.push('');
        });
        return out.join('\n');
    };

    // Standalone HTML lyrics document. opts: { title, includeTranslation, ruby,
    // theme: 'light'|'dark' } — ships its own inline CSS, printable as-is.
    u.buildLyricsHtml = function (lyrics, offset, opts) {
        opts = opts || {};
        var dark = opts.theme === 'dark';
        var css =
            ':root{--bg:' +
            (dark ? '#16171a' : '#f7f7f5') +
            ';--fg:' +
            (dark ? '#e8e6e3' : '#26241f') +
            ';--muted:' +
            (dark ? '#9a968f' : '#6b675f') +
            ';--accent:' +
            (dark ? '#e0a05a' : '#8a5a2b') +
            '}*{box-sizing:border-box}body{margin:0;padding:32px 20px;background:var(--bg);color:var(--fg);font-family:-apple-system,"Segoe UI","Noto Sans SC","M PLUS Rounded 1c",sans-serif}.wrap{max-width:640px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}h2{font-size:14px;font-weight:400;color:var(--muted);margin:0 0 28px}.line{margin-bottom:22px}.jp{font-size:19px;line-height:1.9;margin:0;font-family:"M PLUS Rounded 1c","Noto Sans SC",sans-serif}.tr{font-size:13.5px;color:var(--muted);margin:6px 0 0}ruby{font-size:19px;line-height:1.9}rt{font-size:9px}';
        var title = opts.title ? '<h1>' + escHtml(clean(String(opts.title))) + '</h1>' : '';
        var rows = lyrics
            .map(function (l) {
                var ruby = opts.ruby ? rubySegments(l, escHtml) : null;
                var jp = ruby !== null ? ruby : escHtml(clean(lineText(l)));
                var tr = opts.includeTranslation ? clean(lineTranslation(l)) : '';
                return (
                    '<div class="line"><p class="jp">' +
                    jp +
                    '</p>' +
                    (tr ? '<p class="tr">' + escHtml(tr) + '</p>' : '') +
                    '</div>'
                );
            })
            .join('\n');
        var artist = opts.artist ? '<h2>' + escHtml(clean(String(opts.artist))) + '</h2>' : '';
        return (
            '<!DOCTYPE html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' +
            escHtml(clean(opts.title || '')) +
            '</title>\n<style>' +
            css +
            '</style>\n</head>\n<body>\n<div class="wrap">' +
            title +
            artist +
            rows +
            '</div>\n</body>\n</html>\n'
        );
    };
})(typeof window !== 'undefined' ? window : globalThis);
