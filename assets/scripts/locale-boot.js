/* LyricEx locale auto-loader (v2.5.0: extracted from the inline <script> so the
   strict CSP `script-src 'self'` needs no 'unsafe-inline'). Runs after
   locales/languages.js, before app.js. Loads ONLY the current locale's
   fallback chain (+ zh terminal) — bootstrapping every language was wasteful
   as the list grows. Other languages are fetched on demand when picked in the
   language drawer (app.js loadLocale). Adding a language still needs NO edit
   here: registry line + dict file only. */
(function () {
    var langs = window.__lyricexLanguages || [];
    var byCode = {};
    langs.forEach(function (l) {
        byCode[l.code] = l;
    });
    function load(code) {
        var s = document.createElement('script');
        s.async = false; // keep dict registration ordered before app.js init
        s.src = 'assets/locales/' + code + '.js';
        s.onerror = function () {};
        document.head.appendChild(s);
    }
    // current locale: stored choice first, else browser language via the
    // same BCP 47 walk (full tag → lowercase → shorter prefixes) as _detect
    var cur = null;
    try {
        cur = localStorage.getItem('lyricex-locale');
    } catch (_) {
        /* storage unavailable */
    }
    if (!cur || !byCode[cur]) {
        var tag = navigator.language || 'zh';
        while (tag) {
            if (byCode[tag]) {
                cur = tag;
                break;
            }
            if (byCode[tag.toLowerCase()]) {
                cur = tag.toLowerCase();
                break;
            }
            var i = tag.lastIndexOf('-');
            if (i < 0) break;
            tag = tag.slice(0, i);
        }
        cur = cur || 'zh';
    }
    // walk the fallback chain (ends at zh by construction)
    var node = byCode[cur] || byCode['zh'];
    var seen = {};
    while (node && !seen[node.code]) {
        load(node.code);
        seen[node.code] = true;
        node = node.fallback ? byCode[node.fallback] : null;
    }
    if (!seen['zh']) load('zh');
})();
