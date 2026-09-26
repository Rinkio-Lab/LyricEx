/* LyricEx v1.7.0 – lyrics search (pure; no DOM) */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};
    var esc = (root.__lyricexLib && root.__lyricexLib.esc) ||
        function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        }); };

    // Fields searched, in priority order. Each maps a lyric line to one flat
    // string so a single case-insensitive substring test covers everything.
    var FIELDS = ['text', 'translation', 'note', 'romaji', 'hiragana', 'kanji', 'pos', 'meaning'];

    function join(arr, f) {
        return arr.map(function (x) { return x && x[f] ? String(x[f]) : ''; }).filter(Boolean).join(' ');
    }

    // Build a flat searchable index from the lyrics array.
    u.buildSearchIndex = function (lyrics) {
        if (!Array.isArray(lyrics)) return [];
        return lyrics.map(function (line, i) {
            var a = (line && Array.isArray(line.analysis)) ? line.analysis : [];
            return {
                lineIndex: i,
                text: (line && line.text) || '',
                translation: (line && line.translation) || '',
                note: (line && line.note) || '',
                romaji: join(a, 'romaji'),
                hiragana: join(a, 'hiragana'),
                kanji: join(a, 'kanji'),
                pos: join(a, 'partOfSpeech'),
                meaning: join(a, 'meaning')
            };
        });
    };

    // Return [{ lineIndex, fields: [matched field keys…] }] for a query.
    u.searchLyrics = function (index, query) {
        var q = String(query == null ? '' : query).trim().toLowerCase();
        if (!q) return [];
        var out = [];
        index.forEach(function (entry) {
            var hits = [];
            for (var i = 0; i < FIELDS.length; i++) {
                var f = FIELDS[i];
                if (entry[f] && entry[f].toLowerCase().indexOf(q) !== -1) hits.push(f);
            }
            if (hits.length) out.push({ lineIndex: entry.lineIndex, fields: hits });
        });
        return out;
    };

    // Escape a string and wrap every case-insensitive occurrence of `query` in
    // <mark>. All non-query text is escaped, so this is safe for innerHTML.
    u.highlight = function (text, query) {
        var s = String(text == null ? '' : text);
        var q = String(query == null ? '' : query).trim();
        if (!q) return esc(s);
        var lower = s.toLowerCase(), ql = q.toLowerCase(), out = '', last = 0, i = lower.indexOf(ql);
        while (i !== -1) {
            out += esc(s.slice(last, i)) + '<mark>' + esc(s.slice(i, i + ql.length)) + '</mark>';
            last = i + ql.length;
            i = lower.indexOf(ql, last);
        }
        return out + esc(s.slice(last));
    };
})(typeof window !== 'undefined' ? window : globalThis);
