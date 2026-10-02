/* LyricEx v2.0.0 – editor view controller.
   Owns the "编辑" view: per-line timestamps, metadata, cover + instrumental,
   per-word timing import, and the per-line analysis/word edit panel. UI glue (DOM +
   shared app state), so it lives in js/ui/ — js/utils/ stays pure.
   Data flow: app.js instantiates this factory with a context (state accessors,
   app helpers, DOM refs) and calls render()/bind()/setDirty(). Edits mutate
   lyrics/songData in place through ctx accessors; the export actions are
   injected via bind(actions) so this module never imports export code.
   Invariant: line timestamps stay sorted (clampTime clamps between neighbours).
   Test entry: tests/boot-smoke.mjs (switchView('editor')) + lang-switch.mjs. */
(function (root) {
    'use strict';

    root.__lyricexEditor = function (ctx) {
        var t = ctx.t,
            esc = ctx.esc,
            L = ctx.L;
        var viewContent = ctx.viewContent,
            fileInput = ctx.fileInput;
        var editorDirtyFlag = false;
        // v2.6.0: workspace tabs — 'refine' (timeline/export, the historical
        // editor) and 'build' (pack builder, owned by ui/workspace.js).
        var editorTab = 'refine';

        function switchEditorTab(tab) {
            if (tab !== 'refine' && tab !== 'build') return;
            editorTab = tab;
            viewContent.querySelectorAll('.editor-tab').forEach(function (b) {
                b.classList.toggle('active', b.dataset.editorTab === tab);
            });
            viewContent.querySelectorAll('.editor-pane').forEach(function (p) {
                p.classList.toggle('hidden', p.dataset.editorPane !== tab);
            });
            if (tab === 'build' && ctx.renderWorkspaceTab) ctx.renderWorkspaceTab();
            // v2.8.4: build pane is not a lyric view — hide/refresh the follow pill
            if (ctx.updateFollowPill) ctx.updateFollowPill();
        }

        function markEditorDirty() {
            editorDirtyFlag = true;
            const hint = viewContent.querySelector('.editor-hint');
            if (hint && !hint.querySelector('.dirty-chip')) {
                const chip = document.createElement('span');
                chip.className = 'dirty-chip';
                chip.textContent = t('editorDirty');
                hint.appendChild(chip);
            }
        }

        // Import word-level timings (.ass karaoke or enhanced .lrc) and match
        // them onto the current lyrics by time proximity.
        function importWordTimings(file) {
            if (!file) return;
            file.text()
                .then(function (text) {
                    const isAss = /\.ass$/i.test(file.name);
                    const isYrc = /\.(yrc|klyric)$/i.test(file.name);
                    const parsed = isAss
                        ? { lines: window.__lyricexUtils.parseAssKaraoke(text) }
                        : isYrc
                          ? { lines: window.__lyricexUtils.parseYrcLines(text) }
                          : window.__lyricexUtils.parseLrcWordLines(text);
                    if (!parsed.lines.length) {
                        window.__lyricexDialog.alert(t('importWordTimingEmpty'));
                        return;
                    }
                    const matched = window.__lyricexUtils.mergeWordTimings(ctx.lyrics, parsed.lines, 1.5);
                    const count = matched.filter(function (l) {
                        return l.words && l.words.length;
                    }).length;
                    ctx.lyrics.forEach(function (l) {
                        delete l._words;
                    });
                    markEditorDirty();
                    if (ctx.currentView === 'editor') renderEditorView();
                    else ctx.renderView();
                    ctx.updateSidebarStatus();
                    if (count === 0) window.__lyricexDialog.alert(t('importWordTimingEmpty'));
                })
                .catch(function () {
                    window.__lyricexDialog.alert(t('importWordTimingEmpty'));
                });
        }

        function editorEditPanelHTML(line) {
            let h =
                '<div class="ee-grid">' +
                '<label>' +
                t('editorText') +
                '<input type="text" class="ee-text" value="' +
                esc(line.text || '') +
                '"></label>' +
                '<label>' +
                t('translation') +
                '<input type="text" class="ee-translation" value="' +
                esc(line.translation || '') +
                '"></label>' +
                '<label>' +
                t('editorNote') +
                '<input type="text" class="ee-note" value="' +
                esc(line.note || '') +
                '"></label>' +
                '</div>';
            h +=
                '<table class="ee-analysis"><thead><tr><th>' +
                t('romaji') +
                '</th><th>' +
                t('hiragana') +
                '</th><th>' +
                t('kanji') +
                '</th><th>' +
                t('pos') +
                '</th><th>' +
                t('meaning') +
                '</th><th></th></tr></thead><tbody>';
            if (line.analysis && line.analysis.length) {
                line.analysis.forEach(function (a, ai) {
                    h +=
                        '<tr>' +
                        '<td><input type="text" class="ee-a" data-ai="' +
                        ai +
                        '" data-f="romaji" value="' +
                        esc(a.romaji || '') +
                        '"></td>' +
                        '<td><input type="text" class="ee-a" data-ai="' +
                        ai +
                        '" data-f="hiragana" value="' +
                        esc(a.hiragana || '') +
                        '"></td>' +
                        '<td><input type="text" class="ee-a" data-ai="' +
                        ai +
                        '" data-f="kanji" value="' +
                        esc(a.kanji || '') +
                        '"></td>' +
                        '<td><input type="text" class="ee-a" data-ai="' +
                        ai +
                        '" data-f="partOfSpeech" value="' +
                        esc(a.partOfSpeech || '') +
                        '"></td>' +
                        '<td><input type="text" class="ee-a" data-ai="' +
                        ai +
                        '" data-f="meaning" value="' +
                        esc(a.meaning || '') +
                        '"></td>' +
                        '<td><button class="ee-del-word" data-ai="' +
                        ai +
                        '" title="' +
                        t('editorRemoveWord') +
                        '"><i class="fas fa-times"></i></button></td>' +
                        '</tr>';
                });
            }
            h += '</tbody></table>';
            h +=
                '<div class="ee-footer"><button class="ee-add-word editor-btn"><i class="fas fa-plus"></i> ' +
                t('editorAddWord') +
                '</button></div>';
            if (line.words && line.words.length) {
                h +=
                    '<div class="ee-words"><div class="ee-words-title">' +
                    t('wordTiming') +
                    ' <span class="ee-words-hint">' +
                    t('wordTimingHint') +
                    '</span></div>';
                line.words.forEach(function (w, wi) {
                    h +=
                        '<div class="ee-word-row">' +
                        '<span class="ee-word-text">' +
                        esc(w.text || '') +
                        '</span>' +
                        '<input type="text" class="ee-w" data-wi="' +
                        wi +
                        '" data-f="start" value="' +
                        (w.start != null ? L.formatTimePrecise(w.start) : '') +
                        '" placeholder="start">' +
                        '<span class="ee-w-dash">\u2013</span>' +
                        '<input type="text" class="ee-w" data-wi="' +
                        wi +
                        '" data-f="end" value="' +
                        (w.end != null ? L.formatTimePrecise(w.end) : '') +
                        '" placeholder="end">' +
                        '</div>';
                });
                h += '</div>';
            }
            return h;
        }

        function renderEditorView() {
            // v2.7.0: the build workspace is reachable from the empty state —
            // making a pack from scratch is its core use. With no lyrics the
            // refine pane shows a prompt instead of the timeline editor.
            const hasLyrics = ctx.lyrics.length > 0;
            // v2.6.0: workspace tabs wrap the historical timeline editor. The
            // build pane is a placeholder filled by ui/workspace.js via
            // ctx.renderWorkspaceTab when the tab is active.
            const activeTab = editorTab || 'refine';
            let html =
                '<div class="view-editor"><div class="editor-tabs">' +
                '<button class="editor-tab' +
                (activeTab === 'refine' ? ' active' : '') +
                '" data-editor-tab="refine">' +
                t('editorTabRefine') +
                '</button>' +
                '<button class="editor-tab' +
                (activeTab === 'build' ? ' active' : '') +
                '" data-editor-tab="build">' +
                t('editorTabBuild') +
                '</button>' +
                '</div>';
            html +=
                '<div class="editor-pane' + (activeTab === 'refine' ? '' : ' hidden') + '" data-editor-pane="refine">';
            if (!hasLyrics) {
                html +=
                    '<div class="editor-empty-hint"><i class="fas fa-tools"></i> ' + t('editorEmptyHint') + '</div>';
            }
            if (hasLyrics) {
                html += '<div class="editor-head"><div class="editor-toolbar">';
                // ---- group: 歌曲信息 (metadata + cover + offset) ----
                html +=
                    '<div class="editor-group">' +
                    '<div class="editor-group-label">' +
                    t('editorMeta') +
                    '</div>' +
                    '<div class="editor-group-body">' +
                    '<div class="editor-meta">' +
                    '<label>' +
                    t('metaTitle') +
                    '<input type="text" id="metaTitle" value="' +
                    esc((ctx.songData && ctx.songData.title) || '') +
                    '"></label>' +
                    '<label>' +
                    t('metaArtist') +
                    '<input type="text" id="metaArtist" value="' +
                    esc((ctx.songData && ctx.songData.artist) || '') +
                    '"></label>' +
                    '<label>' +
                    t('metaAlbum') +
                    '<input type="text" id="metaAlbum" value="' +
                    esc((ctx.songData && ctx.songData.album) || '') +
                    '"></label>' +
                    '</div>' +
                    '<div class="editor-cover">' +
                    '<span class="editor-cover-thumb" id="editorCoverThumb">' +
                    (ctx.coverUrl ? '<img src="' + ctx.coverUrl + '" alt="">' : '<i class="fas fa-image"></i>') +
                    '</span>' +
                    '<button class="editor-btn" id="editorCoverBtn"><i class="fas fa-upload"></i> ' +
                    (ctx.coverUrl ? t('editorCoverChange') : t('editorCoverAdd')) +
                    '</button>' +
                    (ctx.coverUrl
                        ? '<button class="editor-btn" id="editorCoverRemoveBtn"><i class="fas fa-trash-alt"></i> ' +
                          t('editorCoverRemove') +
                          '</button>'
                        : '') +
                    '<input type="file" id="editorCoverFile" accept="image/*" style="display:none">' +
                    '</div>' +
                    // v2.0.0 #13: off-vocal (instrumental) track — add / change / remove,
                    // mirroring the cover entry; audition buttons reuse ctx.instrumentalUrl.
                    '<div class="editor-cover">' +
                    '<span class="editor-cover-thumb" id="editorInstThumb"' +
                    (ctx.instrumentalUrl ? ' style="color:var(--accent)"' : '') +
                    '><i class="fas fa-music"></i></span>' +
                    '<button class="editor-btn" id="editorInstBtn"><i class="fas fa-upload"></i> ' +
                    (ctx.instrumentalUrl ? t('editorInstChange') : t('editorInstAdd')) +
                    '</button>' +
                    (ctx.instrumentalUrl
                        ? '<button class="editor-btn" id="editorInstRemoveBtn"><i class="fas fa-trash-alt"></i> ' +
                          t('editorInstRemove') +
                          '</button>'
                        : '') +
                    '<input type="file" id="editorInstFile" accept="audio/*" style="display:none">' +
                    '</div>' +
                    '<div class="editor-offset">' +
                    '<label data-i18n="editorOffset">' +
                    t('editorOffset') +
                    '</label>' +
                    '<input type="range" id="editorOffsetRange" min="-2000" max="2000" step="10" value="' +
                    Math.round(ctx.offset * 1000) +
                    '">' +
                    '<span class="offset-value" id="editorOffsetValue">' +
                    Math.round(ctx.offset * 1000) +
                    ' ms</span>' +
                    '</div>' +
                    '</div></div>';
                // ---- group: 编辑 ----
                html +=
                    '<div class="editor-group">' +
                    '<div class="editor-group-label">' +
                    t('editorGroupEdit') +
                    '</div>' +
                    '<div class="editor-group-body">' +
                    '<button class="editor-btn" id="editorAddLineBtn"><i class="fas fa-plus"></i> ' +
                    t('editorAddLine') +
                    '</button>' +
                    '<button class="editor-btn" id="editorReloadBtn"><i class="fas fa-undo-alt"></i> ' +
                    t('editorReload') +
                    '</button>' +
                    '<button class="editor-btn" id="importWordsBtn"><i class="fas fa-clock"></i> ' +
                    t('importWordTiming') +
                    '</button>' +
                    '<input type="file" id="importWordsFile" accept=".lrc,.ass,.yrc,.klyric" style="display:none">' +
                    '<button class="editor-btn" id="editorSeekStartBtn"><i class="fas fa-undo"></i> ' +
                    t('backToStart') +
                    '</button>' +
                    '</div></div>';
                // ---- group: 导出 ----
                // v3.3.0: all export formats merged behind one button; the
                // unified export dialog (ui/export-dialog.js) owns the per-
                // format options + preview.
                html +=
                    '<div class="editor-group">' +
                    '<div class="editor-group-label">' +
                    t('editorGroupExport') +
                    '</div>' +
                    '<div class="editor-group-body">' +
                    '<button class="editor-btn" id="exportDialogBtn"><i class="fas fa-download"></i> ' +
                    t('exportDialog') +
                    '</button>' +
                    '</div></div>';
                html += '</div>'; // close editor-toolbar
                html +=
                    '<div class="editor-hint">' +
                    t('editorHint') +
                    (editorDirtyFlag ? '<span class="dirty-chip">' + t('editorDirty') + '</span>' : '') +
                    '</div>';
                html += '</div>'; // close editor-head
                ctx.lyrics.forEach(function (line, idx) {
                    const isActive = idx === ctx.activeLineIndex;
                    const tags = [];
                    if (line.analysis && line.analysis.length) {
                        tags.push('<span class="tag tag-a" title="' + t('editorHasAnalysis') + '">A</span>');
                    }
                    if (L.wordSpans(line)) {
                        tags.push('<span class="tag tag-w" title="' + t('editorHasWords') + '">W</span>');
                    }
                    html +=
                        '<div class="editor-row' +
                        (isActive ? ' active' : '') +
                        '" data-index="' +
                        idx +
                        '">' +
                        '<span class="drag-handle" title="' +
                        t('dragToAdjust') +
                        '"><i class="fas fa-grip-vertical"></i></span>' +
                        '<input type="text" class="time-input" value="' +
                        L.formatTimePrecise(line.time) +
                        '" spellcheck="false">' +
                        '<button class="editor-expand" title="' +
                        t('editorEdit') +
                        '"><i class="fas fa-pen"></i></button>' +
                        '<span class="editor-text"' +
                        ctx.langAttr(line) +
                        '>' +
                        ctx.lineTextHTML(line, idx) +
                        '</span>' +
                        (tags.length ? '<span class="editor-tags">' + tags.join('') + '</span>' : '') +
                        '<button class="editor-seek" title="' +
                        t('jumpToLine') +
                        '"><i class="fas fa-play"></i></button>' +
                        '<button class="editor-del" title="' +
                        t('editorDeleteLine') +
                        '"><i class="fas fa-trash-alt"></i></button>' +
                        '</div>';
                    html +=
                        '<div class="editor-edit hidden" data-edit="' +
                        idx +
                        '">' +
                        editorEditPanelHTML(line) +
                        '</div>';
                });
            } // end if (hasLyrics): empty state shows only the hint (no toolbar, no overflow)
            // v2.8.1 fix: there was a stray extra `</div>` here (one closing
            // both the refine pane AND .view-editor), so the build pane got
            // appended OUTSIDE .view-editor — the overflow-clipped container
            // cut it off entirely, making the whole Build tab look blank.
            // Closing refine once keeps build inside .view-editor.
            html += '</div>'; // close refine pane
            html +=
                '<div class="editor-pane' +
                (activeTab === 'build' ? '' : ' hidden') +
                '" data-editor-pane="build"></div>';
            html += '</div>'; // close .view-editor
            viewContent.innerHTML = html;
            if (activeTab === 'build' && ctx.renderWorkspaceTab) ctx.renderWorkspaceTab();
            ctx.bindScrollInteractions(viewContent.querySelector('.view-editor'));
            if (ctx.activeLineIndex >= 0) ctx.scrollLyricToActive('instant');
        }

        // keep timestamps sorted while editing: clamp between neighbours
        function clampTime(idx, t) {
            t = Math.max(0, t);
            if (idx > 0) t = Math.max(t, ctx.lyrics[idx - 1].time + 0.001);
            if (idx < ctx.lyrics.length - 1) t = Math.min(t, ctx.lyrics[idx + 1].time - 0.001);
            return t;
        }

        function setLineTime(idx, t, seek) {
            if (isNaN(idx) || idx < 0 || idx >= ctx.lyrics.length) return;
            const clamped = clampTime(idx, t);
            ctx.lyrics[idx].time = clamped;
            delete ctx.lyrics[idx]._words;
            const row = viewContent.querySelector('.editor-row[data-index="' + idx + '"]');
            if (row) row.querySelector('.time-input').value = L.formatTimePrecise(clamped);
            if (seek && ctx.audio) {
                ctx.audio.currentTime = Math.max(0, clamped - ctx.offset);
                ctx.updatePlayState();
            }
        }

        function toggleEditorPanel(idx, forceShow) {
            viewContent.querySelectorAll('.editor-edit').forEach(function (p) {
                if (parseInt(p.dataset.edit, 10) === idx) {
                    const show = forceShow ? true : p.classList.contains('hidden');
                    p.classList.toggle('hidden', !show);
                } else {
                    p.classList.add('hidden');
                }
            });
        }

        function updateEditorRowText(idx) {
            const row = viewContent.querySelector('.editor-row[data-index="' + idx + '"]');
            if (row) {
                const tEl = row.querySelector('.editor-text');
                if (tEl) tEl.innerHTML = ctx.lineTextHTML(ctx.lyrics[idx], idx);
            }
        }

        async function deleteEditorLine(idx) {
            if (!(await window.__lyricexDialog.confirm(t('editorDeleteConfirm'), { danger: true }))) return;
            ctx.lyrics.splice(idx, 1);
            if (ctx.activeLineIndex >= ctx.lyrics.length) ctx.activeLineIndex = Math.max(0, ctx.lyrics.length - 1);
            markEditorDirty();
            renderEditorView();
            ctx.updateSidebarStatus();
            ctx.updateMiniBar();
        }

        function addEditorLine() {
            const last = ctx.lyrics.length ? ctx.lyrics[ctx.lyrics.length - 1].time : 0;
            ctx.lyrics.push({ time: last + 2, text: '', translation: '', note: '', analysis: [] });
            markEditorDirty();
            renderEditorView();
            ctx.setActiveLine(ctx.lyrics.length - 1, 'instant');
        }

        async function reloadEditorFile() {
            const f = fileInput.files && fileInput.files[0];
            if (!f) {
                window.__lyricexDialog.alert(t('editorNoFile'));
                return;
            }
            if (!(await window.__lyricexDialog.confirm(t('editorReloadConfirm'), { danger: true }))) return;
            ctx.handleFile(f);
        }

        function setEditorCover(file) {
            if (!file) return;
            if (ctx.coverUrl) URL.revokeObjectURL(ctx.coverUrl);
            ctx.coverUrl = URL.createObjectURL(file);
            markEditorDirty();
            renderEditorView();
        }

        function removeEditorCover() {
            if (ctx.coverUrl) {
                URL.revokeObjectURL(ctx.coverUrl);
                ctx.coverUrl = null;
            }
            markEditorDirty();
            renderEditorView();
        }

        function setEditorInstrumental(file) {
            if (!file) return;
            ctx.stopInstrumental(); // pause audition + revoke the old URL
            ctx.instrumentalUrl = URL.createObjectURL(file);
            markEditorDirty();
            renderEditorView();
        }

        function removeEditorInstrumental() {
            ctx.stopInstrumental(); // pauses instAudio + revokes + nulls instrumentalUrl
            markEditorDirty();
            renderEditorView();
        }

        function editorSeekAt(idx) {
            ctx.enableFollow();
            ctx.setActiveLine(idx, 'instant');
            if (ctx.audio) {
                ctx.audio.currentTime = Math.max(0, ctx.lyrics[idx].time - ctx.offset);
                if (!ctx.isPlaying) ctx.audio.play().catch(function () {});
            }
        }

        // Event delegation bound ONCE on viewContent, so re-renders of the
        // editor markup never need re-binding. `actions` supplies the export
        // handlers owned by app.js (kept out of this module to avoid coupling).
        function bindEditorDelegation(actions) {
            viewContent.addEventListener('click', function (e) {
                const tab = e.target.closest('.editor-tab');
                if (tab) {
                    switchEditorTab(tab.dataset.editorTab);
                    return;
                }
                const seek = e.target.closest('.editor-seek');
                if (seek) {
                    const row = seek.closest('.editor-row');
                    const idx = row ? parseInt(row.dataset.index, 10) : -1;
                    if (idx >= 0) editorSeekAt(idx);
                    return;
                }
                const del = e.target.closest('.editor-del');
                if (del) {
                    const row = del.closest('.editor-row');
                    const idx = row ? parseInt(row.dataset.index, 10) : -1;
                    if (idx >= 0) deleteEditorLine(idx);
                    return;
                }
                const expand = e.target.closest('.editor-expand');
                if (expand) {
                    const row = expand.closest('.editor-row');
                    const idx = row ? parseInt(row.dataset.index, 10) : -1;
                    if (idx >= 0) toggleEditorPanel(idx, false);
                    return;
                }
                const delWord = e.target.closest('.ee-del-word');
                if (delWord) {
                    const panel = delWord.closest('.editor-edit');
                    const idx = panel ? parseInt(panel.dataset.edit, 10) : -1;
                    const ai = parseInt(delWord.dataset.ai, 10);
                    if (idx >= 0 && ctx.lyrics[idx] && ctx.lyrics[idx].analysis && ctx.lyrics[idx].analysis[ai]) {
                        ctx.lyrics[idx].analysis.splice(ai, 1);
                        markEditorDirty();
                        panel.innerHTML = editorEditPanelHTML(ctx.lyrics[idx]);
                        updateEditorRowText(idx);
                    }
                    return;
                }
                const addWord = e.target.closest('.ee-add-word');
                if (addWord) {
                    const panel = addWord.closest('.editor-edit');
                    const idx = panel ? parseInt(panel.dataset.edit, 10) : -1;
                    if (idx >= 0 && ctx.lyrics[idx]) {
                        ctx.lyrics[idx].analysis = ctx.lyrics[idx].analysis || [];
                        ctx.lyrics[idx].analysis.push({
                            romaji: '',
                            hiragana: '',
                            kanji: '',
                            partOfSpeech: '',
                            meaning: ''
                        });
                        markEditorDirty();
                        panel.innerHTML = editorEditPanelHTML(ctx.lyrics[idx]);
                        updateEditorRowText(idx);
                    }
                    return;
                }
                if (e.target.closest('#editorAddLineBtn')) {
                    addEditorLine();
                    return;
                }
                if (e.target.closest('#editorReloadBtn')) {
                    reloadEditorFile();
                    return;
                }
                if (e.target.closest('#exportDialogBtn')) {
                    actions.openExport();
                    return;
                }
                if (e.target.closest('#importWordsBtn')) {
                    const f = document.getElementById('importWordsFile');
                    if (f) f.click();
                    return;
                }
                if (e.target.closest('#editorSeekStartBtn')) {
                    if (ctx.audio) {
                        ctx.audio.currentTime = 0;
                        ctx.updatePlayState();
                    }
                    return;
                }
                if (e.target.closest('#editorCoverBtn')) {
                    const f = document.getElementById('editorCoverFile');
                    if (f) f.click();
                    return;
                }
                if (e.target.closest('#editorCoverRemoveBtn')) {
                    removeEditorCover();
                    return;
                }
                if (e.target.closest('#editorInstBtn')) {
                    const f = document.getElementById('editorInstFile');
                    if (f) f.click();
                    return;
                }
                if (e.target.closest('#editorInstRemoveBtn')) {
                    removeEditorInstrumental();
                    return;
                }
                // row body click (not on a control/input) toggles the edit panel
                const row = e.target.closest('.editor-row');
                if (row && !e.target.closest('input')) {
                    const idx = parseInt(row.dataset.index, 10);
                    if (idx >= 0) toggleEditorPanel(idx, false);
                }
            });

            viewContent.addEventListener('input', function (e) {
                const el = e.target;
                if (el.id === 'editorOffsetRange') {
                    ctx.offset = parseInt(el.value, 10) / 1000;
                    const val = document.getElementById('editorOffsetValue');
                    if (val) val.textContent = el.value + ' ms';
                    ctx.updatePlayState();
                    ctx.updateWordHighlight();
                    return;
                }
                if (el.classList.contains('time-input')) return; // committed on change
                const panel = el.closest('.editor-edit');
                if (!panel) return;
                const idx = parseInt(panel.dataset.edit, 10);
                const line = ctx.lyrics[idx];
                if (!line) return;
                if (el.classList.contains('ee-text')) {
                    line.text = el.value;
                    delete line._words;
                    markEditorDirty();
                    updateEditorRowText(idx);
                } else if (el.classList.contains('ee-translation')) {
                    line.translation = el.value;
                    markEditorDirty();
                } else if (el.classList.contains('ee-note')) {
                    line.note = el.value;
                    markEditorDirty();
                } else if (el.classList.contains('ee-a')) {
                    const ai = parseInt(el.dataset.ai, 10);
                    const f = el.dataset.f;
                    if (line.analysis && line.analysis[ai]) {
                        line.analysis[ai][f] = el.value;
                        markEditorDirty();
                    }
                } else if (el.classList.contains('ee-w')) {
                    const wi = parseInt(el.dataset.wi, 10);
                    const f = el.dataset.f;
                    const t = L.parseTimePrecise(el.value);
                    if (line.words && line.words[wi] && !isNaN(t)) {
                        line.words[wi][f] = t;
                        delete line._words;
                        markEditorDirty();
                    }
                }
            });

            viewContent.addEventListener('change', function (e) {
                const el = e.target;
                if (el.classList.contains('time-input')) {
                    const row = el.closest('.editor-row');
                    const idx = row ? parseInt(row.dataset.index, 10) : -1;
                    if (idx < 0) return;
                    const t = L.parseTimePrecise(el.value);
                    if (isNaN(t)) {
                        el.value = L.formatTimePrecise(ctx.lyrics[idx].time);
                        return;
                    }
                    setLineTime(idx, t, true);
                    ctx.enableFollow();
                    return;
                }
                if (el.id === 'metaTitle' && ctx.songData) {
                    ctx.songData.title = el.value;
                    markEditorDirty();
                    ctx.updateSidebarStatus();
                    ctx.updateMiniBar();
                } else if (el.id === 'metaArtist' && ctx.songData) {
                    ctx.songData.artist = el.value;
                    markEditorDirty();
                    ctx.updateSidebarStatus();
                    ctx.updateMiniBar();
                } else if (el.id === 'metaAlbum' && ctx.songData) {
                    ctx.songData.album = el.value;
                    markEditorDirty();
                } else if (el.id === 'importWordsFile') {
                    importWordTimings(el.files && el.files[0]);
                    el.value = '';
                } else if (el.id === 'editorCoverFile') {
                    setEditorCover(el.files && el.files[0]);
                    el.value = '';
                } else if (el.id === 'editorInstFile') {
                    setEditorInstrumental(el.files && el.files[0]);
                    el.value = '';
                }
            });

            viewContent.addEventListener('pointerdown', function (e) {
                const handle = e.target.closest('.editor-row .drag-handle');
                if (!handle) return;
                const row = handle.closest('.editor-row');
                const idx = parseInt(row.dataset.index, 10);
                if (isNaN(idx) || idx < 0 || idx >= ctx.lyrics.length) return;
                e.preventDefault();
                handle.setPointerCapture(e.pointerId);
                const startY = e.clientY;
                const startTime = ctx.lyrics[idx].time;
                let lastSeek = 0;
                function onMove(ev) {
                    // 20ms/px, Shift for 2ms/px fine-tuning; live seek throttled
                    // to ~30fps so dragging stays responsive.
                    const d = ev.clientY - startY;
                    const scale = ev.shiftKey ? 0.002 : 0.02;
                    const now = performance.now();
                    const shouldSeek = now - lastSeek > 33;
                    if (shouldSeek) lastSeek = now;
                    setLineTime(idx, startTime + d * scale, shouldSeek);
                    ctx.setActiveLine(idx, 'none');
                }
                function onUp() {
                    handle.removeEventListener('pointermove', onMove);
                    handle.removeEventListener('pointerup', onUp);
                    handle.removeEventListener('pointercancel', onUp);
                    ctx.enableFollow();
                    ctx.updatePlayState();
                }
                handle.addEventListener('pointermove', onMove);
                handle.addEventListener('pointerup', onUp);
                handle.addEventListener('pointercancel', onUp);
            });
        }

        return {
            render: renderEditorView,
            bind: bindEditorDelegation,
            setDirty: function (v) {
                editorDirtyFlag = v;
            },
            getDirty: function () {
                return editorDirtyFlag;
            },
            getTab: function () {
                return editorTab;
            },
            switchTab: switchEditorTab
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
