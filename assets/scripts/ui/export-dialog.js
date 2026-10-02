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
        var overlay = document.getElementById('exportOverlay');
        var subnav = document.getElementById('exportSubnav');
        var body = document.getElementById('exportBody');

        var items = [];
        var activeId = null;
        var previewTimer = null;

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
                    '<div class="export-config" id="exportConfig"></div>' +
                    '<div class="export-preview">' +
                    '<div class="export-preview-head"><span>' +
                    t('exportPreview') +
                    '</span></div>' +
                    '<div class="export-preview-content" id="exportPreviewContent"></div>' +
                    '</div>';
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
        // new controls before the (possibly heavy) preview work starts.
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
                        content.innerHTML =
                            out == null || out === ''
                                ? '<div class="export-preview-empty">' + t('exportNoPreview') + '</div>'
                                : out;
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
        }

        // ---- default registry (v3.3.0: action-only items; later versions
        //      replace them with kind:'form' config + preview entries) ----
        var actions = appCtx.actions;
        register({
            id: 'package',
            group: 'lyrics',
            icon: 'fas fa-archive',
            labelKey: 'exportPackage',
            kind: 'action',
            doExport: function () {
                actions.exportPackage();
            }
        });
        register({
            id: 'lrc',
            group: 'lyrics',
            icon: 'fas fa-file-alt',
            labelKey: 'exportLrc',
            kind: 'action',
            doExport: function () {
                actions.exportLrc();
            }
        });
        register({
            id: 'srt',
            group: 'lyrics',
            icon: 'fas fa-closed-captioning',
            labelKey: 'exportSrt',
            kind: 'action',
            doExport: function () {
                actions.exportSrt();
            }
        });
        register({
            id: 'ass',
            group: 'lyrics',
            icon: 'fas fa-closed-captioning',
            labelKey: 'exportAss',
            kind: 'action',
            doExport: function () {
                actions.exportAss();
            }
        });
        register({
            id: 'video',
            group: 'lyrics',
            icon: 'fas fa-video',
            labelKey: 'exportVideo',
            kind: 'action',
            describe: 'videoHint',
            doExport: function () {
                actions.openVideo();
            }
        });
        register({
            id: 'poster',
            group: 'lyrics',
            icon: 'fas fa-mobile-alt',
            labelKey: 'exportPoster',
            kind: 'action',
            doExport: function () {
                actions.exportPoster();
            }
        });
        register({
            id: 'notes-md',
            group: 'notes',
            icon: 'fas fa-file-code',
            labelKey: 'exportNotesMd',
            kind: 'action',
            doExport: function () {
                actions.exportNotes('md');
            }
        });
        register({
            id: 'notes-html',
            group: 'notes',
            icon: 'fas fa-file-code',
            labelKey: 'exportNotesHtml',
            kind: 'action',
            doExport: function () {
                actions.exportNotes('html');
            }
        });
        register({
            id: 'print',
            group: 'notes',
            icon: 'fas fa-print',
            labelKey: 'printStudy',
            kind: 'action',
            doExport: function () {
                actions.printStudy();
            }
        });

        return { open: open, close: close, bind: bind, register: register };
    };
})(typeof window !== 'undefined' ? window : globalThis);
