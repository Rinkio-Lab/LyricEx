/* LyricEx v3.3.0 – unified export dialog.
   Owns the single "导出" overlay: left group nav (导出歌词 / 导出学习笔记), right
   config + live preview pane. Format items register via register():
   { id, group: 'lyrics'|'notes', icon, labelKey, kind: 'action'|'form',
     describe (optional hint key), doExport(),
     renderForm(container) / renderPreview() for 'form' items (added later) }.
   Preview is debounced + deferred to the next macrotask so large lyrics never
   stall the main thread on config changes (see schedulePreview).
   Data flow: app.js instantiates the factory with appCtx (t, lyrics accessors,
   actions) and calls bind() once; the editor toolbar opens it via
   bind(actions).openExport.
   Test entry: manual (DOM overlay); unit hooks exposed for boot-smoke. */
(function (root) {
    'use strict';

    root.__lyricexExportDialog = function (appCtx) {
        var t = appCtx.t;
        var u = root.__lyricexUtils || {};
        var esc =
            (root.__lyricexLib && root.__lyricexLib.esc) ||
            function (s) {
                return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
                });
            };
        var overlay = document.getElementById('exportOverlay');
        var subnav = document.getElementById('exportSubnav');
        var body = document.getElementById('exportBody');

        var items = [];
        var activeId = null;
        var previewTimer = null;
        var optsStore = {}; // per-item export options (form items), in-memory

        // group order defines the subnav layout (lyrics first, notes second)
        var groups = [
            { key: 'lyrics', labelKey: 'exportLyricsGroup' },
            { key: 'notes', labelKey: 'exportNotesGroup' }
        ];

        function register(item) {
            items.push(item);
            if (!activeId) activeId = item.id;
        }

        function currentItem() {
            for (var i = 0; i < items.length; i++)
                if (items[i].id === activeId) return items[i];
            return items[0] || null;
        }

        // ---- form helpers (config controls + text preview) ----
        function cfgCheckbox(id, labelKey, checked) {
            return (
                '<label class="export-cfg-row"><input type="checkbox" data-cfg="' +
                id +
                '"' +
                (checked ? ' checked' : '') +
                '> <span>' +
                t(labelKey) +
                '</span></label>'
            );
        }
        function cfgNumber(id, labelKey, value, min, max, step) {
            return (
                '<label class="export-cfg-row"><span>' +
                t(labelKey) +
                '</span><input type="number" data-cfg="' +
                id +
                '" value="' +
                value +
                '" min="' +
                min +
                '" max="' +
                max +
                '" step="' +
                (step || 1) +
                '" style="width:64px"></label>'
            );
        }
        function cfgSelect(id, labelKey, options, value) {
            var optsHtml = options
                .map(function (o) {
                    return (
                        '<option value="' + o.v + '"' + (o.v === value ? ' selected' : '') + '>' + t(o.k) + '</option>'
                    );
                })
                .join('');
            return (
                '<label class="export-cfg-row"><span>' +
                t(labelKey) +
                '</span><select data-cfg="' +
                id +
                '">' +
                optsHtml +
                '</select></label>'
            );
        }
        // first N lines of generated text; big lyrics never flood the preview
        function textPreview(text, maxLines) {
            var lines = String(text || '').split('\n');
            var slice = lines.slice(0, maxLines || 40);
            var more = lines.length > slice.length ? '\n…（' + (lines.length - slice.length) + ' 行已省略）' : '';
            return '<pre class="export-text-preview">' + esc(slice.join('\n')) + esc(more) + '</pre>';
        }
        // rendered preview for full documents (PDF print view): the generated
        // HTML is fed into a sandboxed iframe via srcdoc — no popup, no leak
        function htmlPreview(html) {
            return '<iframe class="export-html-preview" title="preview" srcdoc="' + esc(html) + '"></iframe>';
        }
        // PDF export relies on the browser's own print dialog: render the
        // document into a hidden iframe and call print() on it, so the current
        // page never changes. Mobile browsers may block or mangle iframe
        // printing — surfaced to the user via pdfPrintHint.
        function printHtml(html) {
            var f = document.createElement('iframe');
            f.setAttribute('aria-hidden', 'true');
            f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
            f.srcdoc = html;
            document.body.appendChild(f);
            f.onload = function () {
                try {
                    f.contentWindow.focus();
                    f.contentWindow.print();
                } catch (_) {
                    /* some mobile browsers block iframe printing */
                }
                setTimeout(function () {
                    f.remove();
                }, 60000);
            };
        }

        // ---- subnav ----
        function renderNav() {
            var html = '';
            groups.forEach(function (g) {
                var gItems = items.filter(function (i) {
                    return i.group === g.key;
                });
                if (!gItems.length) return;
                html += '<div class="export-nav-group">' + t(g.labelKey) + '</div>';
                gItems.forEach(function (i) {
                    html +=
                        '<button class="export-subnav-item' +
                        (i.id === activeId ? ' active' : '') +
                        '" data-export-item="' +
                        i.id +
                        '"><i class="' +
                        i.icon +
                        '"></i><span>' +
                        t(i.labelKey) +
                        '</span></button>';
                });
            });
            subnav.innerHTML = html;
        }

        // ---- right panel ----
        function renderPanel() {
            var item = currentItem();
            if (!item) {
                body.innerHTML = '<div class="export-empty">' + t('exportEmpty') + '</div>';
                return;
            }
            if (item.kind === 'form') {
                var html =
                    (item.describe ? '<p class="export-action-desc"><i class="' + item.icon + '"></i> ' + t(item.describe) + '</p>' : '') +
                    '<div class="export-config" id="exportConfig"></div>' +
                    '<div class="export-preview">' +
                    '<div class="export-preview-head"><span>' +
                    t('exportPreview') +
                    '</span></div>' +
                    '<div class="export-preview-content" id="exportPreviewContent"></div>' +
                    '</div>' +
                    '<div class="export-form-foot"><button class="close-btn export-run-btn" data-export-run="' +
                    item.id +
                    '"><i class="fas fa-download"></i> ' +
                    t('exportRun') +
                    '</button></div>';
                body.innerHTML = html;
                if (item.renderForm) item.renderForm(document.getElementById('exportConfig'));
                schedulePreview();
            } else {
                body.innerHTML =
                    '<div class="export-action-panel">' +
                    '<div class="export-action-icon"><i class="' +
                    item.icon +
                    '"></i></div>' +
                    '<h5>' +
                    t(item.labelKey) +
                    '</h5>' +
                    (item.describe ? '<p class="export-action-desc">' + t(item.describe) + '</p>' : '') +
                    '<button class="close-btn export-run-btn" data-export-run="' +
                    item.id +
                    '"><i class="fas fa-download"></i> ' +
                    t('exportRun') +
                    '</button>' +
                    '</div>';
            }
        }

        // Debounced + deferred preview: config changes call schedulePreview();
        // the render is pushed to a later macrotask so the browser can paint the
        // new controls before the (possibly heavy) preview work starts. Items may
        // return a string synchronously (text docs) or a Promise<string> (canvas
        // renders like cards/posters/videos) — both are awaited the same way.
        function schedulePreview() {
            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(function () {
                previewTimer = null;
                var item = currentItem();
                var content = document.getElementById('exportPreviewContent');
                if (!item || !item.renderPreview || !content) return;
                content.classList.add('export-preview-loading');
                setTimeout(function () {
                    try {
                        var out = item.renderPreview();
                        var apply = function (html) {
                            content.innerHTML =
                                html == null || html === ''
                                    ? '<div class="export-preview-empty">' + t('exportNoPreview') + '</div>'
                                    : html;
                        };
                        if (out && typeof out.then === 'function') out.then(apply).catch(function () {
                            content.innerHTML = '<div class="export-preview-empty">' + t('exportNoPreview') + '</div>';
                        });
                        else apply(out);
                    } finally {
                        content.classList.remove('export-preview-loading');
                    }
                }, 0);
            }, 200);
        }

        function open() {
            if (!overlay) return;
            if (!appCtx.lyrics || !appCtx.lyrics.length) {
                window.__lyricexDialog.alert(t('exportNoLyrics'));
                return;
            }
            renderNav();
            renderPanel();
            overlay.classList.add('open');
        }

        function close() {
            if (overlay) overlay.classList.remove('open');
        }

        function bind() {
            var closeBtn = document.getElementById('exportCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', close);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) close();
            });
            subnav.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-export-item]');
                if (!btn) return;
                activeId = btn.dataset.exportItem;
                renderNav();
                renderPanel();
            });
            body.addEventListener('click', function (e) {
                var run = e.target.closest('[data-export-run]');
                if (!run) return;
                var item = currentItem();
                if (item && item.doExport) item.doExport();
            });
            // v3.3.1: config controls — keep the per-item options store in sync
            // and re-render the preview (debounced) without touching other state.
            body.addEventListener('change', function (e) {
                var el = e.target;
                if (!el || !el.dataset || !el.dataset.cfg) return;
                var item = currentItem();
                if (!item) return;
                var store = optsStore[item.id] || (optsStore[item.id] = {});
                if (el.type === 'checkbox') store[el.dataset.cfg] = el.checked;
                else if (el.type === 'number') store[el.dataset.cfg] = Number(el.value);
                else store[el.dataset.cfg] = el.value;
                schedulePreview();
            });
        }

        // ---- default registry (v3.3.0: action-only items; later versions
        //      replace them with kind:'form' config + preview entries) ----
        var actions = appCtx.actions;
        register({
            id: 'package',
            group: 'lyrics',
            icon: 'fas fa-archive',
            labelKey: 'exportPackage',
            kind: 'form',
            describe: 'pkgHint',
            defaults: { includeAudio: true, includeInstrumental: true, includeCover: true },
            renderForm: function (container) {
                var d = optsStore.package || (optsStore.package = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeAudio', 'pkgIncludeAudio', d.includeAudio) +
                    cfgCheckbox('includeInstrumental', 'pkgIncludeInstrumental', d.includeInstrumental) +
                    cfgCheckbox('includeCover', 'pkgIncludeCover', d.includeCover);
            },
            renderPreview: function () {
                var d = optsStore.package || {};
                var sd = appCtx.songData || {};
                var lines = ['# ' + (sd.title || '')];
                if (sd.artist) lines.push('artist: ' + sd.artist);
                lines.push('format: lyricex-package · version 2', '', '包含：', '- manifest.json', '- lyrics.json（' + appCtx.lyrics.length + ' 行）');
                if (d.includeAudio && appCtx.audioUrl) lines.push('- assets/audio.mp3');
                if (d.includeInstrumental && appCtx.instrumentalUrl) lines.push('- assets/instrumental.mp3');
                if (d.includeCover && appCtx.coverUrl) lines.push('- assets/cover.jpg');
                return textPreview(lines.join('\n'));
            },
            doExport: function () {
                var d = optsStore.package || {};
                actions.exportPackage(d);
            }
        });
        register({
            id: 'lrc',
            group: 'lyrics',
            icon: 'fas fa-file-alt',
            labelKey: 'exportLrc',
            kind: 'form',
            defaults: { meta: true, includeTranslation: false },
            renderForm: function (container) {
                var d = optsStore.lrc || (optsStore.lrc = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('meta', 'lrcMeta', d.meta) + cfgCheckbox('includeTranslation', 'lrcTranslation', d.includeTranslation);
            },
            renderPreview: function () {
                var d = optsStore.lrc || {};
                return textPreview(
                    u.buildLrc(appCtx.lyrics, appCtx.offset, {
                        title: appCtx.songData && appCtx.songData.title,
                        artist: appCtx.songData && appCtx.songData.artist,
                        meta: d.meta,
                        includeTranslation: d.includeTranslation
                    })
                );
            },
            doExport: function () {
                var d = optsStore.lrc || {};
                var text = u.buildLrc(appCtx.lyrics, appCtx.offset, {
                    title: appCtx.songData && appCtx.songData.title,
                    artist: appCtx.songData && appCtx.songData.artist,
                    meta: d.meta,
                    includeTranslation: d.includeTranslation
                });
                appCtx.downloadBlob(
                    new Blob([text], { type: 'text/plain;charset=utf-8' }),
                    appCtx.safePackageName() + '.lrc'
                );
            }
        });
        register({
            id: 'txt',
            group: 'lyrics',
            icon: 'fas fa-file-alt',
            labelKey: 'exportTxt',
            kind: 'form',
            defaults: { mode: 'plain' },
            renderForm: function (container) {
                var d = optsStore.txt || (optsStore.txt = Object.assign({}, this.defaults));
                container.innerHTML = cfgSelect(
                    'mode',
                    'txtMode',
                    [
                        { v: 'plain', k: 'txtModePlain' },
                        { v: 'withTranslation', k: 'txtModeWithTr' },
                        { v: 'timed', k: 'txtModeTimed' },
                        { v: 'timedTranslation', k: 'txtModeTimedTr' }
                    ],
                    d.mode
                );
            },
            renderPreview: function () {
                var d = optsStore.txt || {};
                return textPreview(u.buildLyricsTxt(appCtx.lyrics, appCtx.offset, d.mode));
            },
            doExport: function () {
                var d = optsStore.txt || {};
                appCtx.downloadBlob(
                    new Blob([u.buildLyricsTxt(appCtx.lyrics, appCtx.offset, d.mode)], {
                        type: 'text/plain;charset=utf-8'
                    }),
                    appCtx.safePackageName() + '.txt'
                );
            }
        });
        register({
            id: 'md',
            group: 'lyrics',
            icon: 'fas fa-file-code',
            labelKey: 'exportMd',
            kind: 'form',
            defaults: { includeTranslation: true, ruby: true, timed: false },
            renderForm: function (container) {
                var d = optsStore.md || (optsStore.md = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeTranslation', 'mdInTr', d.includeTranslation) +
                    cfgCheckbox('ruby', 'mdRuby', d.ruby) +
                    cfgCheckbox('timed', 'mdTimed', d.timed);
            },
            renderPreview: function () {
                var d = optsStore.md || {};
                return textPreview(
                    u.buildLyricsMarkdown(appCtx.lyrics, appCtx.offset, {
                        title: appCtx.songData && appCtx.songData.title,
                        includeTranslation: d.includeTranslation,
                        ruby: d.ruby,
                        timed: d.timed
                    })
                );
            },
            doExport: function () {
                var d = optsStore.md || {};
                appCtx.downloadBlob(
                    new Blob(
                        [
                            u.buildLyricsMarkdown(appCtx.lyrics, appCtx.offset, {
                                title: appCtx.songData && appCtx.songData.title,
                                includeTranslation: d.includeTranslation,
                                ruby: d.ruby,
                                timed: d.timed
                            })
                        ],
                        { type: 'text/markdown;charset=utf-8' }
                    ),
                    appCtx.safePackageName() + '.md'
                );
            }
        });
        register({
            id: 'html',
            group: 'lyrics',
            icon: 'fas fa-file-code',
            labelKey: 'exportHtml',
            kind: 'form',
            defaults: { includeTranslation: true, ruby: true, theme: 'light' },
            renderForm: function (container) {
                var d = optsStore.html || (optsStore.html = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeTranslation', 'mdInTr', d.includeTranslation) +
                    cfgCheckbox('ruby', 'mdRuby', d.ruby) +
                    cfgSelect(
                        'theme',
                        'htmlTheme',
                        [
                            { v: 'light', k: 'htmlThemeLight' },
                            { v: 'dark', k: 'htmlThemeDark' }
                        ],
                        d.theme
                    );
            },
            renderPreview: function () {
                var d = optsStore.html || {};
                return textPreview(
                    u.buildLyricsHtml(appCtx.lyrics, appCtx.offset, {
                        title: appCtx.songData && appCtx.songData.title,
                        artist: appCtx.songData && appCtx.songData.artist,
                        includeTranslation: d.includeTranslation,
                        ruby: d.ruby,
                        theme: d.theme
                    })
                );
            },
            doExport: function () {
                var d = optsStore.html || {};
                appCtx.downloadBlob(
                    new Blob(
                        [
                            u.buildLyricsHtml(appCtx.lyrics, appCtx.offset, {
                                title: appCtx.songData && appCtx.songData.title,
                                artist: appCtx.songData && appCtx.songData.artist,
                                includeTranslation: d.includeTranslation,
                                ruby: d.ruby,
                                theme: d.theme
                            })
                        ],
                        { type: 'text/html;charset=utf-8' }
                    ),
                    appCtx.safePackageName() + '.html'
                );
            }
        });
        register({
            id: 'pdf',
            group: 'lyrics',
            icon: 'fas fa-print',
            labelKey: 'exportPdf',
            kind: 'form',
            describe: 'pdfPrintHint',
            defaults: { includeTranslation: true, ruby: true, theme: 'light' },
            renderForm: function (container) {
                var d = optsStore.pdf || (optsStore.pdf = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeTranslation', 'mdInTr', d.includeTranslation) +
                    cfgCheckbox('ruby', 'mdRuby', d.ruby) +
                    cfgSelect(
                        'theme',
                        'htmlTheme',
                        [
                            { v: 'light', k: 'htmlThemeLight' },
                            { v: 'dark', k: 'htmlThemeDark' }
                        ],
                        d.theme
                    );
            },
            renderPreview: function () {
                var d = optsStore.pdf || {};
                return htmlPreview(
                    u.buildLyricsHtml(appCtx.lyrics, appCtx.offset, {
                        title: appCtx.songData && appCtx.songData.title,
                        artist: appCtx.songData && appCtx.songData.artist,
                        includeTranslation: d.includeTranslation,
                        ruby: d.ruby,
                        theme: d.theme
                    })
                );
            },
            doExport: function () {
                var d = optsStore.pdf || {};
                printHtml(
                    u.buildLyricsHtml(appCtx.lyrics, appCtx.offset, {
                        title: appCtx.songData && appCtx.songData.title,
                        artist: appCtx.songData && appCtx.songData.artist,
                        includeTranslation: d.includeTranslation,
                        ruby: d.ruby,
                        theme: d.theme
                    })
                );
            }
        });
        register({
            id: 'srt',
            group: 'lyrics',
            icon: 'fas fa-closed-captioning',
            labelKey: 'exportSrt',
            kind: 'form',
            defaults: { includeTranslation: true, endPad: 3 },
            renderForm: function (container) {
                var d = optsStore.srt || (optsStore.srt = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeTranslation', 'subTranslation', d.includeTranslation) +
                    cfgNumber('endPad', 'srtEndPad', d.endPad, 0, 10, 0.5);
            },
            renderPreview: function () {
                var d = optsStore.srt || {};
                return textPreview(u.buildSrt(appCtx.lyrics, appCtx.offset, d));
            },
            doExport: function () {
                var d = optsStore.srt || {};
                appCtx.downloadBlob(
                    new Blob([u.buildSrt(appCtx.lyrics, appCtx.offset, d)], { type: 'text/plain;charset=utf-8' }),
                    appCtx.safePackageName() + '.srt'
                );
            }
        });
        register({
            id: 'ass',
            group: 'lyrics',
            icon: 'fas fa-closed-captioning',
            labelKey: 'exportAss',
            kind: 'form',
            defaults: { includeTranslation: true, karaoke: true },
            renderForm: function (container) {
                var d = optsStore.ass || (optsStore.ass = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgCheckbox('includeTranslation', 'subTranslation', d.includeTranslation) +
                    cfgCheckbox('karaoke', 'assKaraoke', d.karaoke);
            },
            renderPreview: function () {
                var d = optsStore.ass || {};
                return textPreview(u.buildAss(appCtx.lyrics, appCtx.offset, d));
            },
            doExport: function () {
                var d = optsStore.ass || {};
                appCtx.downloadBlob(
                    new Blob([u.buildAss(appCtx.lyrics, appCtx.offset, d)], { type: 'text/plain;charset=utf-8' }),
                    appCtx.safePackageName() + '.ass'
                );
            }
        });
        register({
            id: 'video',
            group: 'lyrics',
            icon: 'fas fa-video',
            labelKey: 'exportVideo',
            kind: 'form',
            describe: 'videoHint',
            defaults: { template: 'karaoke', includeTranslation: true },
            renderForm: function (container) {
                var d = optsStore.video || (optsStore.video = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgSelect(
                        'template',
                        'videoTemplate',
                        [
                            { v: 'karaoke', k: 'videoTplKaraoke' },
                            { v: 'simple', k: 'videoTplSimple' }
                        ],
                        d.template
                    ) + cfgCheckbox('includeTranslation', 'videoInTr', d.includeTranslation);
            },
            renderPreview: function () {
                var d = optsStore.video || {};
                var c = document.createElement('canvas');
                c.className = 'export-video-preview';
                c.width = 480;
                c.height = 270;
                if (actions.renderVideoPreview) actions.renderVideoPreview(c, d.template, d.includeTranslation);
                return c.outerHTML;
            },
            doExport: function () {
                var d = optsStore.video || {};
                actions.openVideo({ template: d.template, includeTranslation: d.includeTranslation });
            }
        });
        // Shared card/poster options: current line, song meta, export-config
        // overrides. accent follows the theme's --accent so exported art matches
        // what the user sees.
        function cardOpts(d) {
            var sd = appCtx.songData || {};
            var line = appCtx.lyrics[appCtx.activeLineIndex] || {};
            var accent =
                getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8a7a6a';
            return {
                title: sd.title || '',
                artist: sd.artist || '',
                lyricHtml: actions.cardLyricHtml ? actions.cardLyricHtml() : esc(line.text || ''),
                lyricText: line.text || '',
                translation: line.translation || '',
                romaji: actions.cardRomaji ? actions.cardRomaji() : '',
                index: appCtx.activeLineIndex + 1,
                total: appCtx.lyrics.length,
                accent: accent,
                template: d.template,
                showTranslation: d.showTranslation,
                showRomaji: d.showRomaji
            };
        }
        function cardPreviewHTML(renderer, d) {
            return renderer(cardOpts(d))
                .then(function (canvas) {
                    var img = document.createElement('img');
                    img.className = 'export-card-preview';
                    img.alt = '';
                    img.src = canvas.toDataURL('image/png');
                    return img.outerHTML;
                })
                .catch(function () {
                    return '<div class="export-preview-empty">' + t('exportNoPreview') + '</div>';
                });
        }
        register({
            id: 'share-card',
            group: 'lyrics',
            icon: 'fas fa-share-alt',
            labelKey: 'shareCard',
            kind: 'form',
            describe: 'shareCardHint',
            defaults: { template: 'minimal', showTranslation: true, showRomaji: true },
            renderForm: function (container) {
                var d = optsStore['share-card'] || (optsStore['share-card'] = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgSelect(
                        'template',
                        'cardTemplate',
                        [
                            { v: 'minimal', k: 'cardTplMinimal' },
                            { v: 'gradient', k: 'cardTplGradient' }
                        ],
                        d.template
                    ) +
                    cfgCheckbox('showTranslation', 'cardTranslation', d.showTranslation) +
                    cfgCheckbox('showRomaji', 'cardRomaji', d.showRomaji);
            },
            renderPreview: function () {
                var d = optsStore['share-card'] || {};
                return cardPreviewHTML(u.renderShareCard, d);
            },
            doExport: function () {
                var d = optsStore['share-card'] || {};
                u.renderShareCard(cardOpts(d))
                    .then(function (canvas) {
                        return u.canvasToPngBlob(canvas);
                    })
                    .then(function (blob) {
                        appCtx.downloadBlob(blob, appCtx.safePackageName() + '-card.png');
                    })
                    .catch(function () {});
            }
        });
        register({
            id: 'poster',
            group: 'lyrics',
            icon: 'fas fa-mobile-alt',
            labelKey: 'exportPoster',
            kind: 'form',
            describe: 'posterHint',
            defaults: { template: 'gradient', showTranslation: true, showRomaji: true },
            renderForm: function (container) {
                var d = optsStore.poster || (optsStore.poster = Object.assign({}, this.defaults));
                container.innerHTML =
                    cfgSelect(
                        'template',
                        'cardTemplate',
                        [
                            { v: 'minimal', k: 'cardTplMinimal' },
                            { v: 'gradient', k: 'cardTplGradient' }
                        ],
                        d.template
                    ) +
                    cfgCheckbox('showTranslation', 'cardTranslation', d.showTranslation) +
                    cfgCheckbox('showRomaji', 'cardRomaji', d.showRomaji);
            },
            renderPreview: function () {
                var d = optsStore.poster || {};
                return cardPreviewHTML(u.renderPoster, d);
            },
            doExport: function () {
                var d = optsStore.poster || {};
                u.renderPoster(cardOpts(d))
                    .then(function (canvas) {
                        return u.canvasToPngBlob(canvas);
                    })
                    .then(function (blob) {
                        appCtx.downloadBlob(blob, appCtx.safePackageName() + '-poster.png');
                    })
                    .catch(function () {});
            }
        });
        function notesCfgRows(itemId) {
            var d =
                optsStore[itemId] ||
                (optsStore[itemId] = {
                    includeTranslation: true,
                    includeRomaji: true,
                    includeNote: true,
                    includeTable: true
                });
            return (
                cfgCheckbox('includeTranslation', 'notesInTr', d.includeTranslation) +
                cfgCheckbox('includeRomaji', 'notesInRomaji', d.includeRomaji) +
                cfgCheckbox('includeNote', 'notesInNote', d.includeNote) +
                cfgCheckbox('includeTable', 'notesInTable', d.includeTable)
            );
        }
        function notesOpts(itemId) {
            var d = optsStore[itemId] || {};
            return {
                includeTranslation: d.includeTranslation,
                includeRomaji: d.includeRomaji,
                includeNote: d.includeNote,
                includeTable: d.includeTable
            };
        }
        function notesBuild(format, itemId) {
            var o = notesOpts(itemId);
            return u.buildStudyNotes(appCtx.lyrics, {
                title: appCtx.songData && appCtx.songData.title,
                artist: appCtx.songData && appCtx.songData.artist,
                format: format,
                labels: appCtx.labels || {},
                includeTranslation: o.includeTranslation,
                includeRomaji: o.includeRomaji,
                includeNote: o.includeNote,
                includeTable: o.includeTable
            });
        }
        register({
            id: 'notes-txt',
            group: 'notes',
            icon: 'fas fa-file-alt',
            labelKey: 'exportNotesTxt',
            kind: 'form',
            defaults: { includeTranslation: true, includeRomaji: true, includeNote: true, includeTable: true },
            renderForm: function (container) {
                container.innerHTML = notesCfgRows('notes-txt');
            },
            renderPreview: function () {
                return textPreview(notesBuild('txt', 'notes-txt'));
            },
            doExport: function () {
                actions.exportNotes('txt', notesOpts('notes-txt'));
            }
        });
        register({
            id: 'notes-md',
            group: 'notes',
            icon: 'fas fa-file-code',
            labelKey: 'exportNotesMd',
            kind: 'form',
            defaults: { includeTranslation: true, includeRomaji: true, includeNote: true, includeTable: true },
            renderForm: function (container) {
                container.innerHTML = notesCfgRows('notes-md');
            },
            renderPreview: function () {
                return textPreview(notesBuild('md', 'notes-md'));
            },
            doExport: function () {
                actions.exportNotes('md', notesOpts('notes-md'));
            }
        });
        register({
            id: 'notes-html',
            group: 'notes',
            icon: 'fas fa-file-code',
            labelKey: 'exportNotesHtml',
            kind: 'form',
            defaults: { includeTranslation: true, includeRomaji: true, includeNote: true, includeTable: true },
            renderForm: function (container) {
                container.innerHTML = notesCfgRows('notes-html');
            },
            renderPreview: function () {
                return htmlPreview(notesBuild('html', 'notes-html'));
            },
            doExport: function () {
                actions.exportNotes('html', notesOpts('notes-html'));
            }
        });
        register({
            id: 'notes-pdf',
            group: 'notes',
            icon: 'fas fa-print',
            labelKey: 'exportNotesPdf',
            kind: 'form',
            describe: 'pdfPrintHint',
            defaults: { includeTranslation: true, includeRomaji: true, includeNote: true, includeTable: true },
            renderForm: function (container) {
                container.innerHTML = notesCfgRows('notes-pdf');
            },
            renderPreview: function () {
                return htmlPreview(notesBuild('html', 'notes-pdf'));
            },
            doExport: function () {
                actions.printStudy();
            }
        });
        register({
            id: 'study-video',
            group: 'notes',
            icon: 'fas fa-video',
            labelKey: 'studyVideo',
            kind: 'form',
            describe: 'studyVideoHint',
            defaults: { includeTranslation: true },
            renderForm: function (container) {
                var d = optsStore['study-video'] || (optsStore['study-video'] = Object.assign({}, this.defaults));
                container.innerHTML = cfgCheckbox('includeTranslation', 'videoInTr', d.includeTranslation);
            },
            renderPreview: function () {
                var d = optsStore['study-video'] || {};
                var c = document.createElement('canvas');
                c.className = 'export-video-preview';
                c.width = 480;
                c.height = 270;
                if (actions.renderVideoPreview) actions.renderVideoPreview(c, 'study', d.includeTranslation);
                return c.outerHTML;
            },
            doExport: function () {
                var d = optsStore['study-video'] || {};
                actions.openVideo({ template: 'study', includeTranslation: d.includeTranslation });
            }
        });

        return { open: open, close: close, bind: bind, register: register };
    };
})(typeof window !== 'undefined' ? window : globalThis);
