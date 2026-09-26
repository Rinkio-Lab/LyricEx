/* LyricEx console logging system — assets/scripts/utils/log.js
   Introduced at v3.0.0. Levels: debug < info < warn < error < off.
   Every call is prefixed [LyricEx:<tag>:<level>] with a timestamp and goes
   through the real console method of the same name; level is stored under
   localStorage 'lyricex-log-level' so users/reporters can turn noise down
   without touching code. Logging never throws and never blocks the app. */
(function (root) {
    'use strict';

    var LEVELS = { debug: 0, info: 1, warn: 2, error: 3, off: 4 };
    var current = LEVELS.debug;
    try {
        var stored = root.localStorage && root.localStorage.getItem('lyricex-log-level');
        if (stored && stored in LEVELS) current = LEVELS[stored];
    } catch (_) { /* storage may be blocked (private mode) — stay at debug */ }

    function ts() {
        try { return new Date().toISOString().slice(11, 23); } catch (_) { return ''; }
    }

    function emit(level, tag, args) {
        if (LEVELS[level] < current) return;
        var tagStr = tag ? ':' + tag : '';
        var prefix = '[LyricEx' + tagStr + ':' + level + '] ' + ts();
        try {
            var fn = root.console && (root.console[level] || root.console.log);
            if (!fn) return;
            fn.apply(root.console, [prefix].concat(Array.prototype.slice.call(args)));
        } catch (_) { /* a broken console must never take the app down */ }
    }

    function setLevel(level) {
        if (!(level in LEVELS)) return;
        current = LEVELS[level];
        try { root.localStorage && root.localStorage.setItem('lyricex-log-level', level); } catch (_) { /* ignore */ }
    }

    function getLevel() {
        var name = 'debug';
        Object.keys(LEVELS).forEach(function (k) { if (LEVELS[k] === current) name = k; });
        return name;
    }

    root.__lyricexLog = {
        debug: function (tag) { emit('debug', tag, Array.prototype.slice.call(arguments, 1)); },
        info: function (tag) { emit('info', tag, Array.prototype.slice.call(arguments, 1)); },
        warn: function (tag) { emit('warn', tag, Array.prototype.slice.call(arguments, 1)); },
        error: function (tag) { emit('error', tag, Array.prototype.slice.call(arguments, 1)); },
        setLevel: setLevel,
        getLevel: getLevel
    };
})(typeof window !== 'undefined' ? window : globalThis);
