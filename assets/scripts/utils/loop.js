/* LyricEx v1.7.0 – loop helpers (pure; no DOM) */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    // loopMode: none → single (整曲) → line (当前句) → none …
    u.nextLoopMode = function (mode) {
        return mode === 'none' ? 'single' : mode === 'single' ? 'line' : 'none';
    };

    // Raw-audio-time bounds (seconds, offset NOT applied) for looping one line:
    // start = line.time - offset; end = next line's time (or duration; last
    // line pads 3s when duration is unknown). Returns null when not computable.
    u.lineLoopBounds = function (lyrics, offset, idx, duration) {
        if (!lyrics || !lyrics.length || idx < 0 || idx >= lyrics.length) return null;
        var start = Math.max(0, Number(lyrics[idx].time) - offset);
        var end;
        if (idx + 1 < lyrics.length) end = Number(lyrics[idx + 1].time) - offset;
        else end = duration > 0 ? duration : start + 3;
        if (!isFinite(end) || end <= start) end = start + 3;
        return { start: start, end: end };
    };

    // v2.0.0: multi-bookmark loop. marks: [{ start, end, active }].
    // Returns the innermost ACTIVE bookmark whose [start,end) contains t, or null.
    // The caller keeps a "current loop mark" in state: once inside a mark it
    // keeps looping that mark until the seek exits it, so overlapping marks stay
    // deterministic (the innermost wins on entry).
    u.activeBookmark = function (marks, t) {
        if (!marks || !marks.length) return null;
        var best = null;
        for (var i = 0; i < marks.length; i++) {
            var m = marks[i];
            if (!m || !m.active) continue;
            var s = Number(m.start),
                e = Number(m.end);
            if (!isFinite(s) || !isFinite(e) || e <= s) continue;
            if (t >= s && t < e) {
                if (!best || e - s < best.end - best.start) best = m;
            }
        }
        return best;
    };
})(typeof window !== 'undefined' ? window : globalThis);
