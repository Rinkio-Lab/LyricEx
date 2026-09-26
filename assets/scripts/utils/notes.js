/* LyricEx v2.0.0 – study-notes export (Markdown / HTML). Pure; no DOM.
   The app passes i18n labels in opts.labels; sensible Chinese fallbacks are used
   when absent. */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};
    var esc = (root.__lyricexLib && root.__lyricexLib.esc) ||
        function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        }); };

    function fmtTime(t) {
        t = Number(t) || 0;
        var m = Math.floor(t / 60), s = t - m * 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s.toFixed(2);
    }

    function analysisTable(line, labels, html) {
        if (!line.analysis || !line.analysis.length) return '';
        var cols = ['romaji', 'hiragana', 'kanji', 'partOfSpeech', 'meaning'];
        var heads = cols.map(function (k) { return labels[k] || k; });
        var rows = [];
        for (var i = 0; i < line.analysis.length; i++) {
            var a = line.analysis[i];
            rows.push(cols.map(function (k) { return esc(a[k] || ''); }));
        }
        if (html) {
            var h = '<table class="notes-table"><thead><tr>' +
                heads.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') +
                '</tr></thead><tbody>' +
                rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
                '</tbody></table>';
            return h;
        }
        var md = '| ' + heads.join(' | ') + ' |\n' +
            '| ' + heads.map(function () { return '---'; }).join(' | ') + ' |\n' +
            rows.map(function (r) { return '| ' + r.join(' | ') + ' |'; }).join('\n');
        return md;
    }

    // Build a full study-notes document. opts: { title, artist, format('md'|'html'), labels }
    u.buildStudyNotes = function (lyrics, opts) {
        opts = opts || {};
        var html = opts.format === 'html';
        var labels = opts.labels || {};
        var title = opts.title || '', artist = opts.artist || '';
        var head = title + (artist ? ' · ' + artist : '');
        var parts = [];

        if (html) {
            parts.push('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(head) + '</title>' +
            '<style>' + "body{margin:0;padding:32px 24px;font-family:\"Noto Sans SC\",\"PingFang SC\",\"Microsoft YaHei\",sans-serif;color:#1e1a16;line-height:1.6;background:#fff;}\n.wrap{max-width:860px;margin:0 auto;}\nh1{font-size:26px;margin:0 0 24px;padding-bottom:12px;border-bottom:2px solid #8a7a6a;}\nsection{margin:0 0 22px;padding:14px 18px;border-left:4px solid #8a7a6a;background:#faf8f4;border-radius:6px;}\nsection h2{margin:0 0 8px;font-size:17px;}\nsection h2 time{color:#8a827a;font-size:13px;font-weight:400;margin-right:8px;}\nul{margin:0 0 10px;padding-left:20px;color:#5a524a;}\n.notes-table{border-collapse:collapse;width:100%;margin:6px 0;font-size:13px;}\n.notes-table th{background:#efe9e0;color:#1e1a16;text-align:left;padding:6px 8px;border:1px solid #d8d2c8;}\n.notes-table td{padding:5px 8px;border:1px solid #d8d2c8;color:#3a342e;}\n@media print{body{padding:0;}section{page-break-inside:avoid;background:#fff;border-left-color:#8a7a6a;}h1{page-break-after:avoid;}}" + '</style></head><body><div class="wrap">');
            if (head) parts.push('<h1>' + esc(head) + '</h1>');
            lyrics.forEach(function (line, _i) {
                parts.push('<section><h2><time>' + fmtTime(line.time) + '</time> ' + esc(line.text || '') + '</h2>');
                var meta = [];
                if (line.translation) meta.push('<li>' + esc(labels.translation || '翻译') + '：' + esc(line.translation) + '</li>');
                if (line.romaji) meta.push('<li>' + esc(labels.romaji || '罗马音') + '：' + esc(line.romaji) + '</li>');
                if (line.note) meta.push('<li>' + esc(labels.note || '备注') + '：' + esc(line.note) + '</li>');
                if (meta.length) parts.push('<ul>' + meta.join('') + '</ul>');
                var table = analysisTable(line, labels, true);
                if (table) parts.push(table);
                parts.push('</section>');
            });
            parts.push('</div></body></html>');
        } else {
            if (head) parts.push('# ' + head + '\n');
            lyrics.forEach(function (line) {
                parts.push('## [' + fmtTime(line.time) + '] ' + (line.text || '') + '\n');
                if (line.translation) parts.push('- ' + (labels.translation || '翻译') + '：' + line.translation + '\n');
                if (line.romaji) parts.push('- ' + (labels.romaji || '罗马音') + '：' + line.romaji + '\n');
                if (line.note) parts.push('- ' + (labels.note || '备注') + '：' + line.note + '\n');
                var table = analysisTable(line, labels, false);
                if (table) parts.push('\n' + table + '\n');
            });
        }
        return parts.join('\n');
    };
})(typeof window !== 'undefined' ? window : globalThis);
