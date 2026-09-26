/* LyricEx v2.6.0 – NetEase lyrics JSON parser. Pure; no DOM.
   Accepts the shape exported by NetEase Music (and most "歌词JSON" paste
   sources): { lrc: { lyric }, tlyric: { lyric }, romalrc?: { lyric } }.
   The LRC-ish string payloads are delegated to lib.parseLRC so timestamp
   quirks ([mm:ss.xx], [offset:]) are handled exactly once. Translations are
   matched to their originals by time proximity (the two tracks are produced
   in lockstep, so a tiny tolerance is enough; no text matching needed).
   Returns { title?, artist?, lines:[{time,text,translation?}] } or throws
   NeteaseParseError on structurally invalid input — never silently returns
   garbage. */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};
    var lib = root.__lyricexLib;

    function NeteaseParseError(message) {
        var e = new Error(message);
        e.name = 'NeteaseParseError';
        return e;
    }

    // tolerance (s) for pairing tlyric to lrc — NetEase emits identical
    // timestamps for both tracks, so ±50ms absorbs float/parse rounding.
    var TRANSLATION_TOLERANCE = 0.05;

    function lyricText(obj, key) {
        return (obj && obj[key] && typeof obj[key].lyric === 'string') ? obj[key].lyric : '';
    }

    u.parseNeteaseLyrics = function (data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw NeteaseParseError('网易云歌词 JSON 必须是对象');
        }
        var lrc = lyricText(data, 'lrc');
        if (!lrc.trim()) throw NeteaseParseError('缺少 lrc.lyric 歌词内容');
        var parsed = lib.parseLRC(lrc);
        if (!parsed.lines.length) throw NeteaseParseError('未解析到有效歌词行');

        var out = { title: data.title || parsed.title || '', artist: data.artist || parsed.artist || '', lines: [] };
        // tlyric is optional; when present, pair each original with its
        // translation by nearest-time lookup (index-advancing, both sorted).
        var tlrc = lyricText(data, 'tlyric');
        var tlines = tlrc.trim() ? lib.parseLRC(tlrc).lines : [];
        var ti = 0;
        parsed.lines.forEach(function (l) {
            var line = { time: l.time, text: l.text };
            if (tlines.length) {
                while (ti < tlines.length && tlines[ti].time < l.time - TRANSLATION_TOLERANCE) ti++;
                var cand = tlines[ti];
                if (cand && Math.abs(cand.time - l.time) <= TRANSLATION_TOLERANCE) {
                    line.translation = cand.text;
                }
            }
            out.lines.push(line);
        });
        return out;
    };
})(typeof window !== 'undefined' ? window : globalThis);
