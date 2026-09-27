/* LyricEx v2.0.0 – recent-items / queue helpers (pure; no DOM).
   The IndexedDB I/O lives in js/modules/recent-store.js; this file holds the
   ordering/dedup/trim arithmetic so it can be unit-tested in Node. */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    // list: [{ name, ts, ... }]. Sort newest-first, de-dupe by name, keep cap.
    // Returns a NEW array; never mutates the input.
    u.pruneRecent = function (list, cap) {
        cap = cap > 0 ? cap : 10;
        var seen = {},
            out = [];
        var sorted = (list || []).slice().sort(function (a, b) {
            return (b.ts || 0) - (a.ts || 0);
        });
        for (var i = 0; i < sorted.length; i++) {
            var e = sorted[i];
            var key = String(e && e.name != null ? e.name : '');
            if (!key || seen[key] || out.length >= cap) continue;
            seen[key] = true;
            out.push(e);
        }
        return out;
    };

    // Queue helpers. queue: [{ name, file }]. Pure pop returns the first item
    // (FIFO) without side effects; the caller advances its own array.
    u.queuePeek = function (queue) {
        return queue && queue.length ? queue[0] : null;
    };
})(typeof window !== 'undefined' ? window : globalThis);
