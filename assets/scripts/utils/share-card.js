/* LyricEx v1.7.0 – share card builder (HTML template + canvas rasterize) */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});
    var esc =
        (root.__lyricexLib && root.__lyricexLib.esc) ||
        function (s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        };

    u.SHARE_WIDTH = 1200;
    u.SHARE_HEIGHT = 630;
    // v2.0.0 #19: vertical phone-wallpaper poster
    u.SHARE_POSTER_WIDTH = 1080;
    u.SHARE_POSTER_HEIGHT = 1920;

    // Only #rgb / #rrggbb pass through — anything else falls back, so the
    // accent value can never inject CSS into the rasterized card.
    function safeColor(c, fallback) {
        var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c || '').trim());
        return m ? m[0] : fallback;
    }

    function templateStyle(template, accent) {
        if (template === 'gradient') {
            return (
                '.card{background:linear-gradient(135deg,#f7f5f1 0%,' +
                accent +
                '26 55%,#f7f5f1 100%);}' +
                '.accent-bar{background:linear-gradient(90deg,' +
                accent +
                ',' +
                accent +
                '88);}'
            );
        }
        return '.card{background:#ffffff;}' + '.accent-bar{background:' + accent + ';}';
    }

    // Build the card's inner HTML (a <style> + the card markup). `lyricHtml`
    // is trusted/escaped HTML produced by the app (ruby or plain escaped text);
    // every other field is escaped here.
    u.buildShareCardHTML = function (opts) {
        opts = opts || {};
        var accent = safeColor(opts.accent, '#8a7a6a');
        var title = esc(opts.title || '');
        var artist = esc(opts.artist || '');
        var lyricHtml = opts.lyricHtml || '';
        var translation = esc(opts.translation || '');
        var romaji = esc(opts.romaji || '');
        var index = Number(opts.index) || 0;
        var total = Number(opts.total) || 0;
        var showTranslation = opts.showTranslation !== false && !!translation;
        var showRomaji = opts.showRomaji !== false && !!romaji;
        var counter = index && total ? index + ' / ' + total : '';

        var css = [
            '*{margin:0;padding:0;box-sizing:border-box;}',
            '.card{width:' +
                u.SHARE_WIDTH +
                'px;height:' +
                u.SHARE_HEIGHT +
                'px;position:relative;overflow:hidden;' +
                'color:#1e1a16;font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;' +
                'display:flex;flex-direction:column;padding:52px 72px 60px;}',
            '.accent-bar{position:absolute;top:0;left:0;right:0;height:8px;}',
            '.meta{font-size:24px;color:#8a827a;margin-top:8px;}',
            '.song{font-size:32px;font-weight:700;letter-spacing:0.5px;}',
            '.lyric{margin-top:56px;font-size:60px;font-weight:700;line-height:1.4;' +
                'font-family:"M PLUS Rounded 1c","Noto Sans SC","PingFang SC",sans-serif;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:5;overflow:hidden;}',
            '.lyric rt{font-size:22px;color:#8a827a;font-weight:400;}',
            '.translation{margin-top:28px;font-size:30px;color:#5a524a;line-height:1.5;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;}',
            '.romaji{margin-top:12px;font-size:24px;color:#8a827a;font-style:italic;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;}',
            '.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:24px;}',
            '.counter{font-size:22px;color:#8a827a;}',
            '.powered{font-size:16px;color:#b0a898;letter-spacing:0.5px;}',
            templateStyle(opts.template, accent),
            opts.customCss || ''
        ].join('\n');

        var metaLine = [title, artist].filter(Boolean).join('  ·  ');
        var html =
            '<style>' +
            css +
            '</style>' +
            '<div class="card"><div class="accent-bar"></div>' +
            (metaLine ? '<div class="meta">' + metaLine + '</div>' : '') +
            '<div class="lyric">' +
            lyricHtml +
            '</div>' +
            (showTranslation ? '<div class="translation">' + translation + '</div>' : '') +
            (showRomaji ? '<div class="romaji">' + romaji + '</div>' : '') +
            '<div class="footer">' +
            (counter ? '<div class="counter">' + counter + '</div>' : '<div></div>') +
            '<div class="powered">Powered by LyricEx</div></div>' +
            '</div>';
        return html;
    };

    // Render the card to a canvas (Promise). The SVG <foreignObject> path is
    // fast but fragile in some browsers (blank / onerror), so it falls back to
    // a plain canvas-2D card that always works.
    function stripHtml(s) {
        return String(s || '').replace(/<[^>]*>/g, '');
    }

    function wrapText(ctx, text, maxWidth, maxLines) {
        const s = String(text || '');
        if (!s) return [];
        let lines = [];
        let cur = '';
        for (let i = 0; i < s.length; i++) {
            const test = cur + s[i];
            if (cur && ctx.measureText(test).width > maxWidth) {
                lines.push(cur);
                cur = s[i];
            } else cur = test;
        }
        if (cur) lines.push(cur);
        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '\u2026';
        }
        return lines;
    }

    u.renderFallbackCard = function (opts, portrait) {
        return new Promise(function (resolve) {
            opts = opts || {};
            const W = portrait ? u.SHARE_POSTER_WIDTH : u.SHARE_WIDTH;
            const H = portrait ? u.SHARE_POSTER_HEIGHT : u.SHARE_HEIGHT;
            const accent = safeColor(opts.accent, '#8a7a6a');
            const pad = portrait ? 90 : 72;
            const canvas = root.document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            const lyric = opts.lyricText || stripHtml(opts.lyricHtml) || '';

            ctx.fillStyle = opts.template === 'gradient' ? '#f7f5f1' : '#ffffff';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = accent;
            ctx.fillRect(0, 0, W, portrait ? 12 : 8);

            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const meta = [opts.title || '', opts.artist || ''].filter(Boolean).join('  \u00b7  ');
            ctx.fillStyle = '#8a827a';
            ctx.font = (portrait ? 40 : 24) + 'px "Noto Sans SC", "PingFang SC", sans-serif';
            if (meta) ctx.fillText(meta, pad, portrait ? 120 : 60);

            ctx.fillStyle = '#1e1a16';
            ctx.font = (portrait ? 104 : 60) + 'px "M PLUS Rounded 1c", "Noto Sans SC", sans-serif';
            const maxW = W - pad * 2;
            let ly = portrait ? 210 : 150;
            wrapText(ctx, lyric, maxW, portrait ? 4 : 5).forEach(function (l) {
                ctx.fillText(l, pad, ly);
                ly += portrait ? 150 : 84;
            });

            if (opts.showTranslation !== false && opts.translation) {
                ctx.fillStyle = '#5a524a';
                ctx.font = (portrait ? 48 : 30) + 'px "Noto Sans SC", "PingFang SC", sans-serif';
                wrapText(ctx, opts.translation, maxW, 2).forEach(function (l) {
                    ctx.fillText(l, pad, ly + 10);
                    ly += portrait ? 66 : 42;
                });
            }
            if (opts.showRomaji !== false && opts.romaji) {
                ctx.fillStyle = '#8a827a';
                ctx.font = 'italic ' + (portrait ? 36 : 24) + 'px "Noto Sans SC", sans-serif';
                wrapText(ctx, opts.romaji, maxW, 2).forEach(function (l) {
                    ctx.fillText(l, pad, ly + 8);
                    ly += portrait ? 52 : 34;
                });
            }

            ctx.fillStyle = '#b0a898';
            ctx.font = (portrait ? 26 : 16) + 'px "Noto Sans SC", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Powered by LyricEx', W - pad, H - (portrait ? 64 : 40));
            if (!portrait && opts.index && opts.total) {
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8a827a';
                ctx.font = '22px "Noto Sans SC", sans-serif';
                ctx.fillText(opts.index + ' / ' + opts.total, pad, H - 60);
            }
            resolve(canvas);
        });
    };

    u.renderShareCard = function (opts) {
        return u.renderHtmlToCanvas(u.buildShareCardHTML(opts), u.SHARE_WIDTH, u.SHARE_HEIGHT).catch(function () {
            return u.renderFallbackCard(opts, false);
        });
    };

    // v2.0.0 #19: vertical poster (phone wallpaper) — same data, portrait layout.
    u.buildPosterHTML = function (opts) {
        opts = opts || {};
        var accent = safeColor(opts.accent, '#8a7a6a');
        var title = esc(opts.title || '');
        var artist = esc(opts.artist || '');
        var lyricHtml = opts.lyricHtml || '';
        var translation = esc(opts.translation || '');
        var romaji = esc(opts.romaji || '');
        var showTranslation = opts.showTranslation !== false && !!translation;
        var showRomaji = opts.showRomaji !== false && !!romaji;
        var metaLine = [title, artist].filter(Boolean).join('  ·  ');

        var css = [
            '*{margin:0;padding:0;box-sizing:border-box;}',
            '.card{width:' +
                u.SHARE_POSTER_WIDTH +
                'px;height:' +
                u.SHARE_POSTER_HEIGHT +
                'px;position:relative;overflow:hidden;' +
                'color:#1e1a16;font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;' +
                'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'padding:140px 90px 200px;text-align:center;}',
            '.accent-bar{position:absolute;top:0;left:0;right:0;height:12px;}',
            '.meta{font-size:40px;color:#8a827a;margin-bottom:48px;}',
            '.lyric{font-size:104px;font-weight:700;line-height:1.5;' +
                'font-family:"M PLUS Rounded 1c","Noto Sans SC","PingFang SC",sans-serif;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:6;overflow:hidden;}',
            '.lyric rt{font-size:36px;color:#8a827a;font-weight:400;}',
            '.translation{margin-top:44px;font-size:48px;color:#5a524a;line-height:1.6;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;}',
            '.romaji{margin-top:20px;font-size:36px;color:#8a827a;font-style:italic;' +
                'display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;}',
            '.footer{position:absolute;bottom:64px;left:0;right:0;text-align:center;}',
            '.powered{font-size:26px;color:#b0a898;letter-spacing:1px;}',
            templateStyle(opts.template, accent),
            opts.customCss || ''
        ].join('\n');

        return (
            '<style>' +
            css +
            '</style>' +
            '<div class="card"><div class="accent-bar"></div>' +
            (metaLine ? '<div class="meta">' + metaLine + '</div>' : '') +
            '<div class="lyric">' +
            lyricHtml +
            '</div>' +
            (showTranslation ? '<div class="translation">' + translation + '</div>' : '') +
            (showRomaji ? '<div class="romaji">' + romaji + '</div>' : '') +
            '<div class="footer"><div class="powered">Powered by LyricEx</div></div>' +
            '</div>'
        );
    };

    u.renderPoster = function (opts) {
        return u
            .renderHtmlToCanvas(u.buildPosterHTML(opts), u.SHARE_POSTER_WIDTH, u.SHARE_POSTER_HEIGHT)
            .catch(function () {
                return u.renderFallbackCard(opts, true);
            });
    };

    // canvas → PNG blob (Promise).
    u.canvasToPngBlob = function (canvas) {
        return new Promise(function (resolve, reject) {
            if (!canvas || !canvas.toBlob) {
                reject(new Error('no toBlob'));
                return;
            }
            canvas.toBlob(function (blob) {
                blob ? resolve(blob) : reject(new Error('toBlob empty'));
            }, 'image/png');
        });
    };
})(typeof window !== 'undefined' ? window : globalThis);
