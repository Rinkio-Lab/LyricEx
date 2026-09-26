/* LyricEx v2.0.0 – word-level timing import (#28). Pure; no DOM.
   Parses enhanced .lrc (inline <mm:ss.xx> word tags) and .ass karaoke (\k tags)
   into { time, text, words:[{text,start,end}] } lines, plus a matcher that
   merges word timings into an existing lyric set by time proximity. */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};
    var lib = root.__lyricexLib;

    function parseTimePrecise(s) {
        return lib && lib.parseTimePrecise ? lib.parseTimePrecise(s) : NaN;
    }

    // ASS time is H:MM:SS.cc — not covered by parseTimePrecise (m:ss.xx).
    function parseAssTime(s) {
        var m = /^(\d+):(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?$/.exec(String(s || '').trim());
        if (!m) return NaN;
        var h = Number(m[1]), mi = Number(m[2]), se = Number(m[3]);
        var frac = m[4] ? Number(m[4]) / Math.pow(10, m[4].length) : 0;
        return h * 3600 + mi * 60 + se + frac;
    }

    // Enhanced LRC: standard [mm:ss.xx] line tags, with per-word <mm:ss.xx>text
    // inline. Returns { lines, offsetMs } (line times already offset-applied,
    // word times offset-applied too). Words without a following tag borrow the
    // next line's time (or pad 3s) for their end.
    u.parseLrcWordLines = function (text) {
        if (!lib || !lib.parseLRC) return { lines: [], offsetMs: 0 };
        var p = lib.parseLRC(text);
        var offset = (p.offsetMs || 0) / 1000;
        var tagRe = /<(\d{1,2}:\d{2}(?:\.\d{1,3})?)>([^<]*)/g;
        var lines = p.lines.map(function (line) {
            var words = [];
            var m;
            tagRe.lastIndex = 0;
            while ((m = tagRe.exec(line.text))) {
                var start = parseTimePrecise(m[1]) - offset;
                var wtext = m[2];
                if (wtext || start >= 0) words.push({ text: wtext, start: start, end: null });
            }
            // strip inline tags for the clean display text
            var clean = line.text.replace(/<\d{1,2}:\d{2}(?:\.\d{1,3})?>/g, '');
            return { time: line.time, text: clean, words: words };
        });
        // resolve end times
        lines.forEach(function (line, i) {
            if (!line.words.length) return;
            line.words.forEach(function (w, j) {
                if (j + 1 < line.words.length) w.end = line.words[j + 1].start;
                else {
                    var next = (i + 1 < lines.length) ? lines[i + 1].time : null;
                    w.end = (next !== null && next > w.start) ? next : (w.start + 3);
                }
                if (!(w.end > w.start)) w.end = w.start + 0.5;
            });
        });
        return { lines: lines, offsetMs: p.offsetMs || 0 };
    };

    // .ass karaoke: Dialogue lines with {\kNN} (centiseconds) per syllable.
    // Returns lines [{ time, text, words:[{text,start,end}] }] (start = dialogue
    // start, absolute seconds; no offset).
    u.parseAssKaraoke = function (text) {
        var lines = [];
        String(text || '').split(/\r?\n/).forEach(function (raw) {
            if (raw.indexOf('Dialogue:') !== 0) return;
            // fields after "Dialogue:" are comma-separated; the 10th is text.
            var idx = raw.indexOf(':') + 1;
            var fields = raw.slice(idx).split(',');
            if (fields.length < 10) return;
            var start = parseAssTime(fields[1]);
            if (!isFinite(start)) return;
            var body = fields.slice(9).join(',');
            var words = [];
            var re = /\{\\(?:[kK][fo]?)(\d+)\}([^{}]*)/g;
            var m, cursor = start;
            while ((m = re.exec(body))) {
                var dur = Number(m[1]) / 100; // centiseconds → seconds
                var wtext = m[2].replace(/\{[^}]*\}/g, '');
                if (wtext || dur > 0) words.push({ text: wtext, start: cursor, end: cursor + dur });
                cursor += dur;
            }
            if (!words.length) return;
            var clean = body.replace(/\{[^}]*\}/g, '');
            lines.push({ time: start, text: clean, words: words });
        });
        return lines;
    };

    // Merge word timings from a source line set into a target set, matching by
    // closest line time within `tolerance` seconds (greedy, one-to-one).
    u.mergeWordTimings = function (target, source, tolerance) {
        tolerance = (tolerance > 0) ? tolerance : 1;
        var used = {};
        (source || []).forEach(function (src) {
            if (!src.words || !src.words.length) return;
            var best = -1, bestDiff = Infinity;
            for (var i = 0; i < target.length; i++) {
                if (used[i]) continue;
                var d = Math.abs(Number(target[i].time || 0) - Number(src.time || 0));
                if (d < bestDiff) { bestDiff = d; best = i; }
            }
            if (best >= 0 && bestDiff <= tolerance) {
                target[best].words = src.words.map(function (w) {
                    return { text: w.text, start: w.start, end: w.end };
                });
                used[best] = true;
            }
        });
        return target;
    };
})(typeof window !== 'undefined' ? window : globalThis);
