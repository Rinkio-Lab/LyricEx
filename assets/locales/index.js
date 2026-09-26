/* i18n core – LyricEx
   Language list + per-language fallback chains come from languages.js
   (window.__lyricexLanguages). t() resolution: current dict → configured
   fallback chain (recursive, cycle-guarded) → zh (terminal) → the key itself. */
window.__i18n = window.__i18n || {};

(function (i18n) {
    i18n._dicts = {};
    i18n._config = {};   // code -> { code, native, maintainedBy, fallback }
    i18n._current = 'zh';
    i18n._dirOverride = null;  // v2.3.1: 'auto' | 'rtl' | 'ltr' force-override

    /** register a dictionary for a locale */
    i18n.register = function (locale, dict) {
        i18n._dicts[locale] = dict;
    };

    /** register the language configuration list (from languages.js) */
    i18n.registerConfig = function (list) {
        i18n._config = {};
        (list || []).forEach(function (c) { i18n._config[c.code] = c; });
    };

    /** resolve the fallback locale for a given one; chain-safe against cycles */
    i18n._resolveFallback = function (locale, seen) {
        if (seen[locale]) return null;              // cycle guard
        seen[locale] = true;
        const cfg = i18n._config[locale] || {};
        if (!cfg.fallback) return null;
        if (i18n._dicts[cfg.fallback]) return cfg.fallback;
        return i18n._resolveFallback(cfg.fallback, seen);
    };

    /** effective text direction for a locale: override wins, else the
        language's own rtl flag (ar etc.). */
    i18n._dirFor = function (locale) {
        if (i18n._dirOverride === 'rtl' || i18n._dirOverride === 'ltr') return i18n._dirOverride;
        return (i18n._config[locale] || {}).rtl ? 'rtl' : 'ltr';
    };

    /** v2.3.1: force text direction regardless of language ('auto' = use the
        language's rtl flag). Re-applies dir immediately. */
    i18n.setDirectionOverride = function (mode) {
        i18n._dirOverride = mode === 'rtl' || mode === 'ltr' ? mode : null;
        if (document.documentElement) document.documentElement.dir = i18n._dirFor(i18n._current);
    };

    /** set active locale and re-render UI */
    i18n.setLocale = function (locale) {
        if (!i18n._dicts[locale]) return;
        i18n._current = locale;
        const cfg = i18n._config[locale] || {};
        if (document.documentElement) {
            document.documentElement.lang = locale;          // BCP 47 tag as-is
            document.documentElement.dir = i18n._dirFor(locale);
        }
        try { localStorage.setItem('lyricex-locale', locale); } catch (_) { /* noop */ }
        i18n._apply();
        if (typeof window.__onLocaleChange === 'function') window.__onLocaleChange(locale);
    };

    /** translate a key; current → fallback chain → zh → key itself */
    i18n.t = function (key) {
        const seen = {};
        let loc = i18n._current;
        while (loc) {
            const dict = i18n._dicts[loc];
            if (dict && dict[key] !== undefined) return dict[key];
            if (loc === 'zh') break;                // zh is the terminal fallback
            loc = i18n._resolveFallback(loc, seen) || 'zh';
        }
        const zh = i18n._dicts['zh'];
        if (zh && zh[key] !== undefined) return zh[key];
        return key;
    };

    /** scan DOM for [data-i18n] attributes and update them */
    i18n._apply = function () {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            // if element only contains text, replace it; otherwise it's a label wrapper
            if (el.children.length === 0) {
                el.textContent = i18n.t(key);
            } else {
                // try to find a .label child
                const label = el.querySelector('.label');
                if (label && label.children.length === 0) {
                    label.textContent = i18n.t(key);
                }
            }
        });
        // update title attributes (v2.2.0: same label is exposed as aria-label
        // so icon-only buttons are announced to screen readers)
        // v3.0.0: keys containing HTML (links, <br>) render via innerHTML —
        // the plain data-i18n path uses textContent and would strip them
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            const htmlKey = el.getAttribute('data-i18n-html');
            if (htmlKey) el.innerHTML = i18n.t(htmlKey);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            const label = i18n.t(el.getAttribute('data-i18n-title'));
            el.title = label;
            el.setAttribute('aria-label', label);
        });
        // update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = i18n.t(el.getAttribute('data-i18n-placeholder'));
        });
    };

    /** get stored or browser locale — matched against the REGISTRY (_config),
        not loaded dicts: boot loads the locale chain asynchronously, so the
        dict for a stored choice is not registered yet when init() runs. */
    i18n._detect = function () {
        try {
            const stored = localStorage.getItem('lyricex-locale');
            if (stored && i18n._config[stored]) return stored;
        } catch (_) { /* noop */ }
        // BCP 47: try the full tag, then lowercase, then progressively shorter
        // prefixes (pt-BR → pt-br → pt → …) before giving up on zh.
        let tag = navigator.language || 'zh';
        while (tag) {
            if (i18n._config[tag]) return tag;
            if (i18n._config[tag.toLowerCase()]) return tag.toLowerCase();
            const idx = tag.lastIndexOf('-');
            if (idx < 0) break;
            tag = tag.slice(0, idx);
        }
        return 'zh';
    };

    /** init: register the language list, load stored locale after dicts are in */
    i18n.init = function () {
        i18n.registerConfig(window.__lyricexLanguages);
        i18n._current = i18n._detect();
        if (document.documentElement) {
            document.documentElement.lang = i18n._current;  // BCP 47 tag as-is
            document.documentElement.dir = i18n._dirFor(i18n._current);
        }
        i18n._apply();
    };
})(window.__i18n);
