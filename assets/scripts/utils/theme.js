/* LyricEx v1.7.0 – theme helpers (pure; no DOM) */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};

    // light → dark → system → light …
    u.THEME_CYCLE = ['light', 'dark', 'system'];
    u.nextTheme = function (t) {
        var i = u.THEME_CYCLE.indexOf(t);
        return u.THEME_CYCLE[(i + 1) % u.THEME_CYCLE.length];
    };

    u.systemPrefersDark = function () {
        try { return !!(root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches); }
        catch (_) { return false; }
    };

    // 'system' resolves to the live OS preference; anything else passes through.
    u.resolveTheme = function (t) {
        if (t === 'system') return u.systemPrefersDark() ? 'dark' : 'light';
        return t === 'dark' ? 'dark' : 'light';
    };
})(typeof window !== 'undefined' ? window : globalThis);
