/* LyricEx v2.0.0 – share card UI controller.
   Owns the "分享卡片" overlay: template select, accent, toggles, custom CSS,
   the JSON template market (import/export), and PNG download/copy. Renders via
   js/utils/share-card.js; owns shareBlob/shareRenderTimer/shareTemplates.
   Data flow: app.js instantiates the factory with a context (state accessors +
   helpers + DOM refs) and calls bind() once; cardLyricHtml()/cardRomaji() are
   read by app.js's poster exporter. Open reads ctx.settings.customAccent.
   Test entry: exercised manually via the player 分享卡片 button (no DOM shim
   covers ClipboardItem/canvas rasterization in the smoke tests). */
(function (root) {
    'use strict';

    root.__lyricexShare = function (ctx) {
        var t = ctx.t;
        var shareOverlay = ctx.shareOverlay,
            sharePreview = ctx.sharePreview,
            shareTemplate = ctx.shareTemplate,
            shareAccent = ctx.shareAccent,
            shareTranslation = ctx.shareTranslation,
            shareRomaji = ctx.shareRomaji,
            shareCss = ctx.shareCss,
            shareTplExportBtn = ctx.shareTplExportBtn,
            shareTplImportBtn = ctx.shareTplImportBtn,
            shareTplFile = ctx.shareTplFile,
            shareCopyBtn = ctx.shareCopyBtn,
            shareDownloadBtn = ctx.shareDownloadBtn,
            shareCloseBtn = ctx.shareCloseBtn,
            shareCardBtn = ctx.shareCardBtn;

        var shareBlob = null;
        var shareRenderTimer = null;
        var shareTemplates = []; // user-imported share templates [{ name, css }]

        function shareCardLyricHtml() {
            if (ctx.activeLineIndex < 0 || ctx.activeLineIndex >= ctx.lyrics.length) return '';
            return ctx.lineRubyHTML(ctx.lyrics[ctx.activeLineIndex]);
        }

        function shareCardRomaji() {
            if (ctx.activeLineIndex < 0 || ctx.activeLineIndex >= ctx.lyrics.length) return '';
            return ctx.romajiFromLine(ctx.lyrics[ctx.activeLineIndex]);
        }

        // share template market: named CSS presets persisted in localStorage,
        // exported/imported as .lxtpl.json (the whole CSS text is the payload).
        function loadShareTemplates() {
            try {
                const raw = localStorage.getItem('lyricex-share-templates');
                shareTemplates = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(shareTemplates)) shareTemplates = [];
            } catch (_) {
                shareTemplates = [];
            }
        }

        function persistShareTemplates() {
            try {
                localStorage.setItem('lyricex-share-templates', JSON.stringify(shareTemplates));
            } catch (_) {
                /* quota */
            }
        }

        function refreshShareTemplateOptions() {
            shareTemplate.querySelectorAll('option.tpl-option').forEach(function (o) {
                o.remove();
            });
            shareTemplates.forEach(function (tpl, i) {
                const o = document.createElement('option');
                o.className = 'tpl-option';
                o.value = 'tpl:' + i;
                o.textContent = tpl.name || 'template ' + (i + 1);
                shareTemplate.appendChild(o);
            });
        }

        async function exportShareTemplate() {
            const name = await window.__lyricexDialog.prompt(t('tplExportName') || '模板名称', ctx.safePackageName());
            if (!name) return;
            const tpl = { name: String(name).slice(0, 60), css: shareCss.value || '' };
            ctx.downloadBlob(
                new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json;charset=utf-8' }),
                String(name).replace(/[\\/:*?"<>|]/g, '_') + '.lxtpl.json'
            );
        }

        function importShareTemplate(file) {
            if (!file) return;
            file.text()
                .then(function (text) {
                    let tpl;
                    try {
                        tpl = JSON.parse(text);
                    } catch (_) {
                        window.__lyricexDialog.alert(t('tplImportBad'));
                        return;
                    }
                    if (!tpl || typeof tpl.name !== 'string' || typeof tpl.css !== 'string') {
                        window.__lyricexDialog.alert(t('tplImportBad'));
                        return;
                    }
                    shareTemplates.push({ name: tpl.name.slice(0, 60), css: tpl.css });
                    persistShareTemplates();
                    refreshShareTemplateOptions();
                })
                .catch(function () {});
        }

        function openShare() {
            if (!ctx.lyrics.length || ctx.activeLineIndex < 0) {
                window.__lyricexDialog.alert(t('pleaseUpload'));
                return;
            }
            shareOverlay.classList.add('open');
            shareAccent.value = ctx.settings.customAccent || '#8a7a6a';
            loadShareTemplates();
            refreshShareTemplateOptions();
            renderSharePreview();
        }

        function closeShare() {
            shareOverlay.classList.remove('open');
        }

        function shareCardOpts() {
            return {
                title: ctx.songData ? ctx.songData.title : '',
                artist: ctx.songData ? ctx.songData.artist : '',
                lyricHtml: shareCardLyricHtml(),
                lyricText: ctx.lyrics[ctx.activeLineIndex] ? ctx.lyrics[ctx.activeLineIndex].text : '',
                translation: ctx.lyrics[ctx.activeLineIndex] ? ctx.lyrics[ctx.activeLineIndex].translation : '',
                romaji: shareCardRomaji(),
                index: ctx.activeLineIndex + 1,
                total: ctx.lyrics.length,
                accent: shareAccent.value,
                template: shareTemplate.value.indexOf('tpl:') === 0 ? 'card' : shareTemplate.value,
                showTranslation: shareTranslation.checked,
                showRomaji: shareRomaji.checked,
                customCss: shareCss.value
            };
        }

        function renderSharePreview() {
            window.__lyricexUtils
                .renderShareCard(shareCardOpts())
                .then(function (canvas) {
                    sharePreview.src = canvas.toDataURL('image/png');
                    window.__lyricexUtils
                        .canvasToPngBlob(canvas)
                        .then(function (blob) {
                            shareBlob = blob;
                        })
                        .catch(function () {
                            shareBlob = null;
                        });
                })
                .catch(function (e) {
                    sharePreview.removeAttribute('src');
                    shareBlob = null;
                    console.error('share render failed', e);
                });
        }

        function scheduleSharePreview() {
            if (shareRenderTimer) clearTimeout(shareRenderTimer);
            shareRenderTimer = setTimeout(function () {
                renderSharePreview();
                shareRenderTimer = null;
            }, 300);
        }

        function renderShareAnd(cb) {
            window.__lyricexUtils
                .renderShareCard(shareCardOpts())
                .then(function (canvas) {
                    window.__lyricexUtils
                        .canvasToPngBlob(canvas)
                        .then(cb)
                        .catch(function () {});
                })
                .catch(function () {});
        }

        function downloadShare() {
            if (shareBlob) ctx.downloadBlob(shareBlob, ctx.safePackageName() + '-share.png');
            else
                renderShareAnd(function (blob) {
                    ctx.downloadBlob(blob, ctx.safePackageName() + '-share.png');
                });
        }

        function copyShare() {
            function doCopy(blob) {
                if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
                    navigator.clipboard
                        .write([new window.ClipboardItem({ 'image/png': blob })])
                        .then(function () {
                            shareCopyBtn.textContent = t('shareCopied');
                            setTimeout(function () {
                                shareCopyBtn.textContent = t('shareCopy');
                            }, 1500);
                        })
                        .catch(function () {
                            shareCopyBtn.textContent = t('shareCopyFailed');
                        });
                } else {
                    shareCopyBtn.textContent = t('shareCopyFailed');
                }
            }
            if (shareBlob) doCopy(shareBlob);
            else renderShareAnd(doCopy);
        }

        function bind() {
            shareCardBtn.addEventListener('click', openShare);
            shareCloseBtn.addEventListener('click', closeShare);
            shareOverlay.addEventListener('click', function (e) {
                if (e.target === shareOverlay) closeShare();
            });
            shareDownloadBtn.addEventListener('click', downloadShare);
            shareCopyBtn.addEventListener('click', copyShare);
            shareAccent.addEventListener('input', scheduleSharePreview);
            shareTemplate.addEventListener('change', function () {
                const v = shareTemplate.value;
                if (v.indexOf('tpl:') === 0) {
                    const tpl = shareTemplates[parseInt(v.slice(4), 10)];
                    if (tpl) shareCss.value = tpl.css;
                }
                scheduleSharePreview();
            });
            shareTranslation.addEventListener('change', scheduleSharePreview);
            shareRomaji.addEventListener('change', scheduleSharePreview);
            shareCss.addEventListener('input', scheduleSharePreview);
            shareTplExportBtn.addEventListener('click', exportShareTemplate);
            shareTplImportBtn.addEventListener('click', function () {
                shareTplFile.click();
            });
            shareTplFile.addEventListener('change', function (e) {
                importShareTemplate(e.target.files && e.target.files[0]);
                e.target.value = '';
            });
        }

        return {
            open: openShare,
            close: closeShare,
            bind: bind,
            cardLyricHtml: shareCardLyricHtml,
            cardRomaji: shareCardRomaji
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
