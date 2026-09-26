/* LyricEx v2.6.0+ – workspace "build" pane controller.
   The editor view is a workspace: the historical timeline/export lives in the
   "refine" tab (ui/editor.js); this module owns the "build" tab — the
   from-scratch pack builder: media upload (vocal + optional instrumental),
   lyric input (LRC / NetEase JSON), AI per-word analysis workflow (copy the
   prompt → paste the JSON reply back), and v2.1 pack export.
   UI glue only: parsing/matching/prompt/package math lives in js/utils/
   (netease.js, ai-import.js, ai-prompt.js, lyric-package.js). The editor
   renders this pane's container; app.js calls render() when the tab is active.
   Invariant: the workspace keeps its own draft state (audio files, lyric
   lines, analysis) independent of ctx.lyrics until the user explicitly loads
   the draft into the app. */
(function (root) {
    'use strict';

    root.__lyricexWorkspace = function (ctx) {
        var t = ctx.t, esc = ctx.esc, L = ctx.L, U = window.__lyricexUtils;
        var viewContent = ctx.viewContent;

        // ---- draft state (survives re-renders; cleared by resetDraft) ----
        var audioFile = null;        // File (vocal)
        var instrumentalFile = null; // File | null (optional accompaniment)
        var lines = [];              // parsed lyric lines (draft)
        var analysisApplied = false; // AI analysis has been merged into lines
        var draftTitle = '';

        // ---- render ----
        function render() {
            var pane = viewContent.querySelector('.editor-pane[data-editor-pane="build"]');
            if (!pane) return;
            var h = '<div class="ws-wrap">';
            // ---- media group ----
            h += '<div class="ws-group"><div class="ws-group-title">' + t('wsMedia') + '</div>' +
                '<div class="ws-media-grid">' +
                '<div class="ws-media-card' + (audioFile ? ' has' : '') + '" data-ws-drop="audio">' +
                '<div class="ws-media-icon"><i class="fas ' + (audioFile ? 'fa-check-circle' : 'fa-microphone-alt') + '"></i></div>' +
                '<div class="ws-media-label">' + t('wsVocal') + '</div>' +
                '<div class="ws-media-name">' + (audioFile ? esc(audioFile.name) : t('wsNoFile')) + '</div>' +
                (audioFile ? '<button class="ws-media-clear" data-ws-clear="audio"><i class="fas fa-times"></i></button>' : '') +
                '<input type="file" class="ws-file-input" data-ws-file="audio" accept="audio/*" style="display:none">' +
                '</div>' +
                '<div class="ws-media-card' + (instrumentalFile ? ' has' : '') + '" data-ws-drop="inst">' +
                '<div class="ws-media-icon"><i class="fas ' + (instrumentalFile ? 'fa-check-circle' : 'fa-music') + '"></i></div>' +
                '<div class="ws-media-label">' + t('wsInst') + '</div>' +
                '<div class="ws-media-name">' + (instrumentalFile ? esc(instrumentalFile.name) : t('wsNoFile')) + '</div>' +
                (instrumentalFile ? '<button class="ws-media-clear" data-ws-clear="inst"><i class="fas fa-times"></i></button>' : '') +
                '<input type="file" class="ws-file-input" data-ws-file="inst" accept="audio/*" style="display:none">' +
                '</div>' +
                '</div>' +
                '<div class="ws-media-hint">' + t('wsInstHint') + '</div>' +
                '</div>';
            // ---- lyric input group ----
            h += '<div class="ws-group"><div class="ws-group-title">' + t('wsLyrics') + '</div>' +
                '<div class="ws-lrc-grid">' +
                '<label class="ws-lrc-box"><span>' + t('wsLrcMain') + '</span>' +
                '<textarea class="ws-lrc-input" data-ws-lrc="main" rows="6" spellcheck="false" placeholder="' + t('wsLrcPlaceholder') + '"></textarea>' +
                '<span class="ws-lrc-upload"><button class="editor-btn" data-ws-upload="main"><i class="fas fa-upload"></i> ' + t('wsUpload') + '</button>' +
                '<button type="button" class="editor-btn" data-ws-clear-lrc="main"><i class="fas fa-times"></i> ' + t('wsClear') + '</button>' +
                '<input type="file" class="ws-upload-file" data-ws-upload-file="main" accept=".lrc,.txt,text/plain" style="display:none"></span></label>' +
                '<label class="ws-lrc-box"><span>' + t('wsLrcTrans') + ' <em>' + t('wsOptional') + '</em></span>' +
                '<textarea class="ws-lrc-input" data-ws-lrc="trans" rows="6" spellcheck="false" placeholder="' + t('wsLrcPlaceholderTrans') + '"></textarea>' +
                '<span class="ws-lrc-upload"><button class="editor-btn" data-ws-upload="trans"><i class="fas fa-upload"></i> ' + t('wsUpload') + '</button>' +
                '<button type="button" class="editor-btn" data-ws-clear-lrc="trans"><i class="fas fa-times"></i> ' + t('wsClear') + '</button>' +
                '<input type="file" class="ws-upload-file" data-ws-upload-file="trans" accept=".lrc,.txt,text/plain" style="display:none"></span></label>' +
                '</div>' +
                '<div class="ws-mix-hint"><i class="fas fa-magic"></i> ' + t('wsMixHint') + '</div>' +
                '<div class="ws-netease"><span class="ws-netease-label"><i class="fas fa-cloud"></i> ' + t('wsNetease') + '</span>' +
                '<input type="text" class="ws-netease-input" data-ws-netease placeholder="' + t('wsNeteasePlaceholder') + '">' +
                '<button class="editor-btn" data-ws-parse> <i class="fas fa-cog"></i> ' + t('wsParse') + '</button>' +
                '<button class="editor-btn" data-ws-load> <i class="fas fa-arrow-right"></i> ' + t('wsLoadToApp') + '</button>' +
                '</div>' +
                '<div class="ws-status" data-ws-status>' + (lines.length ? t('wsParsedN').replace('{n}', lines.length) : '') + '</div>' +
                '</div>';
            // ---- AI analysis group (v2.7.0) ----
            h += '<div class="ws-group"><div class="ws-group-title">' + t('wsAi') + '</div>' +
                '<div class="ws-ai-row">' +
                '<label class="ws-chunk"><span>' + t('wsChunk') + '</span>' +
                '<input type="number" class="ws-chunk-input" data-ws-chunk min="0" step="1" placeholder="' + t('wsChunkPlaceholder') + '"></label>' +
                '<button class="editor-btn" data-ws-prompt><i class="fas fa-copy"></i> ' + t('wsCopyPrompt') + '</button>' +
                '</div>' +
                '<pre class="ws-prompt-preview" data-ws-prompt-preview hidden></pre>' +
                '<textarea class="ws-ai-result" data-ws-ai rows="8" spellcheck="false" placeholder="' + t('wsAiPlaceholder') + '"></textarea>' +
                '<div class="ws-ai-row">' +
                '<button type="button" class="editor-btn" data-ws-clear-ai><i class="fas fa-times"></i> ' + t('wsClear') + '</button>' +
                '<button class="editor-btn" data-ws-ai-import><i class="fas fa-file-import"></i> ' + t('wsImportAi') + '</button>' +
                '<span class="ws-ai-hint">' + t('wsAiHint') + '</span>' +
                '</div>' +
                '<div class="ws-status" data-ws-ai-status></div>' +
                '</div>';
            // ---- export group (v2.8.0) ----
            h += '<div class="ws-group"><div class="ws-group-title">' + t('wsExport') + '</div>' +
                '<div class="ws-export-row">' +
                '<button class="editor-btn" data-ws-export><i class="fas fa-archive"></i> ' + t('wsExportPack') + '</button>' +
                '<button class="editor-btn" data-ws-reset><i class="fas fa-undo-alt"></i> ' + t('wsReset') + '</button>' +
                '</div></div>';
            h += '</div>';
            pane.innerHTML = h;
            // restore textarea contents
            restoreInputs(pane);
            updateStatus();
        }

        function restoreInputs(pane) {
            var main = pane.querySelector('[data-ws-lrc="main"]');
            var trans = pane.querySelector('[data-ws-lrc="trans"]');
            var netease = pane.querySelector('[data-ws-netease]');
            var chunk = pane.querySelector('[data-ws-chunk]');
            var ai = pane.querySelector('[data-ws-ai]');
            if (main && _lrcMain) main.value = _lrcMain;
            if (trans && _lrcTrans) trans.value = _lrcTrans;
            if (netease && _neteaseText) netease.value = _neteaseText;
            if (chunk && _chunkSize) chunk.value = _chunkSize;
            if (ai && _aiResult) ai.value = _aiResult;
        }

        // textarea contents survive re-render (they are not part of draft state)
        var _lrcMain = '', _lrcTrans = '', _neteaseText = '', _chunkSize = '', _aiResult = '';

        function updateStatus() {
            var el = viewContent.querySelector('[data-ws-status]');
            if (el) el.textContent = lines.length ? t('wsParsedN').replace('{n}', lines.length) : '';
            var ai = viewContent.querySelector('[data-ws-ai-status]');
            if (ai && analysisApplied) ai.textContent = t('wsAiApplied');
        }

        // ---- parse ----
        function parseLyrics() {
            var mainEl = viewContent.querySelector('[data-ws-lrc="main"]');
            var transEl = viewContent.querySelector('[data-ws-lrc="trans"]');
            var neteaseEl = viewContent.querySelector('[data-ws-netease]');
            _lrcMain = mainEl ? mainEl.value : '';
            _lrcTrans = transEl ? transEl.value : '';
            _neteaseText = neteaseEl ? neteaseEl.value.trim() : '';
            lines = [];
            analysisApplied = false;
            try {
                if (_neteaseText) {
                    var parsed = U.parseNeteaseLyrics(JSON.parse(_neteaseText));
                    lines = parsed.lines;
                    draftTitle = parsed.title || '';
                } else if (_lrcMain.trim()) {
                    var main = L.parseLRC(_lrcMain);
                    lines = main.lines;
                    draftTitle = main.title || '';
                    if (_lrcTrans.trim()) {
                        var trans = L.parseLRC(_lrcTrans);
                        // pair translations by nearest time (same tolerance as NetEase)
                        var ti = 0;
                        lines.forEach(function (l) {
                            while (ti < trans.lines.length && trans.lines[ti].time < l.time - 0.05) ti++;
                            var cand = trans.lines[ti];
                            if (cand && Math.abs(cand.time - l.time) <= 0.05) l.translation = cand.text;
                        });
                    } else {
                        // v2.7.0: single alternating LRC (JP line + CN line sharing
                        // timestamps — the NetEase inline layout) splits into
                        // original + translation automatically. The translation
                        // box is back-filled so the user sees what was detected
                        // and can still hand-edit it before re-parsing.
                        var split = L.splitMixedLrc(lines);
                        lines = split.main;
                        if (split.split && split.trans.length) {
                            _lrcTrans = split.trans.map(function (tr) {
                                return '[' + L.formatTimePrecise(tr.time) + '] ' + tr.text;
                            }).join('\n');
                            var transBox = viewContent.querySelector('[data-ws-lrc="trans"]');
                            if (transBox) transBox.value = _lrcTrans;
                            var ti2 = 0;
                            lines.forEach(function (l) {
                                while (ti2 < split.trans.length && split.trans[ti2].time < l.time - 0.05) ti2++;
                                var cand = split.trans[ti2];
                                if (cand && Math.abs(cand.time - l.time) <= 0.05) l.translation = cand.text;
                            });
                        }
                    }
                } else {
                    setStatus(t('wsNeedLrc'), true);
                    return;
                }
                if (!lines.length) { setStatus(t('wsParseEmpty'), true); return; }
                setStatus(t('wsParsedN').replace('{n}', lines.length), false);
                updatePromptPreview();
            } catch (e) {
                setStatus(t('wsParseFail') + ': ' + (e && e.message ? e.message : e), true);
            }
        }

        function setStatus(msg, isErr) {
            var el = viewContent.querySelector('[data-ws-status]');
            if (el) { el.textContent = msg; el.classList.toggle('err', !!isErr); }
        }

        // ---- AI workflow ----
        // v2.8.3: one prompt builder feeds both 复制提示词 and the live preview,
        // so what you see in the preview is exactly what gets copied.
        function buildPromptText() {
            var chunkEl = viewContent.querySelector('[data-ws-chunk]');
            _chunkSize = chunkEl ? chunkEl.value : '';
            var chunkSize = parseInt(_chunkSize, 10) || 0;
            var prompts = U.buildAnalysisPrompts(lines, { chunkSize: chunkSize });
            return prompts.length === 1 ? prompts[0].prompt :
                prompts.map(function (p, i) { return '===== ' + t('wsPart') + ' ' + (i + 1) + '/' + prompts.length + ' =====\n' + p.prompt; }).join('\n\n');
        }

        function updatePromptPreview() {
            var el = viewContent.querySelector('[data-ws-prompt-preview]');
            if (!el) return;
            var text = lines.length ? buildPromptText() : '';
            el.textContent = text;
            el.hidden = !text;
        }

        function copyPrompt() {
            if (!lines.length) { parseLyrics(); }
            if (!lines.length) { setStatus(t('wsNeedLrc'), true); return; }
            copyText(buildPromptText());
        }

        function copyText(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    setStatus(t('wsPromptCopied'), false);
                }).catch(function () {
                    fallbackCopy(text);
                });
            } else fallbackCopy(text);
        }

        function fallbackCopy(text) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); setStatus(t('wsPromptCopied'), false); }
            catch (_) { setStatus(t('wsCopyFail'), true); }
            document.body.removeChild(ta);
        }

        function importAiResult() {
            var aiEl = viewContent.querySelector('[data-ws-ai]');
            if (!aiEl) return;
            _aiResult = aiEl.value;
            if (!lines.length) { parseLyrics(); }
            if (!lines.length) { setStatus(t('wsNeedLrc'), true); return; }
            try {
                var parsed = U.parseAiResult(_aiResult);
                var matched = U.matchAnalysisToLyrics(lines, parsed.results);
                lines = matched.lyrics;
                analysisApplied = true;
                var ai = viewContent.querySelector('[data-ws-ai-status]');
                if (ai) {
                    var msg = t('wsAiOk').replace('{n}', String(lines.length - matched.unmatched.length));
                    if (matched.unmatched.length) msg += ' ' + t('wsAiMiss').replace('{n}', String(matched.unmatched.length));
                    ai.textContent = msg;
                }
            } catch (e) {
                var ai2 = viewContent.querySelector('[data-ws-ai-status]');
                if (ai2) ai2.textContent = (e && e.message ? e.message : String(e));
            }
        }

        // ---- export (v2.8.0) ----
        function exportPack() {
            if (!audioFile) { setStatus(t('wsNeedAudio'), true); return; }
            if (!lines.length) { parseLyrics(); }
            if (!lines.length) { setStatus(t('wsNeedLrc'), true); return; }
            var manifest = U.buildManifest({
                title: draftTitle || audioFile.name.replace(/\.[^.]+$/, ''),
                artist: '', album: '',
                audioName: U.sanitizeMediaName(audioFile.name, 'audio', U.mediaExt(audioFile.name) || 'mp3'),
                instrumentalName: instrumentalFile ? U.sanitizeMediaName(instrumentalFile.name, 'inst', U.mediaExt(instrumentalFile.name) || 'mp3') : null,
                lyricsFile: 'lyrics.json',
                convertedFrom: 'workspace'
            });
            var payload = U.buildLyricsPayload(lines, 0);
            var zip = new JSZip();
            zip.file('manifest.json', JSON.stringify(manifest, null, 2));
            zip.file('lyrics.json', JSON.stringify(payload, null, 2));
            zip.file('assets/' + manifest.audioName, audioFile);
            if (instrumentalFile) zip.file('assets/' + manifest.instrumentalName, instrumentalFile);
            zip.generateAsync({ type: 'blob' }).then(function (blob) {
                ctx.downloadBlob(blob, (manifest.title || 'lyrics').replace(/[\\/:*?"<>|]/g, '_') + '.lxp.zip');
                setStatus(t('wsExported'), false);
            }).catch(function (e) { setStatus(t('wsExportFail') + ': ' + e.message, true); });
        }

        // ---- load draft into the app (both panes share ctx) ----
        function loadToApp() {
            if (!lines.length) { parseLyrics(); }
            if (!lines.length) { setStatus(t('wsNeedLrc'), true); return; }
            if (ctx.loadWorkspaceDraft) {
                ctx.loadWorkspaceDraft({ lines: lines, title: draftTitle, audioFile: audioFile, instrumentalFile: instrumentalFile });
            }
        }

        // ---- events ----
        function bind() {
            viewContent.addEventListener('click', function (e) {
                var tab = e.target.closest('.editor-tab');
                if (tab) return; // editor handles tabs
                var clear = e.target.closest('[data-ws-clear]');
                if (clear) {
                    if (clear.dataset.wsClear === 'audio') { audioFile = null; }
                    else { instrumentalFile = null; }
                    render(); return;
                }
                var lrcClear = e.target.closest('[data-ws-clear-lrc]');
                if (lrcClear) {
                    var lrcKey = lrcClear.dataset.wsClearLrc;
                    if (lrcKey === 'main') { _lrcMain = ''; }
                    else if (lrcKey === 'trans') { _lrcTrans = ''; }
                    var lrcTa = viewContent.querySelector('[data-ws-lrc="' + lrcKey + '"]');
                    if (lrcTa) lrcTa.value = '';
                    return;
                }
                if (e.target.closest('[data-ws-clear-ai]')) {
                    _aiResult = '';
                    analysisApplied = false;
                    var aiTa = viewContent.querySelector('[data-ws-ai]');
                    if (aiTa) aiTa.value = '';
                    updateStatus();
                    return;
                }
                if (e.target.closest('[data-ws-parse]')) { parseLyrics(); return; }
                if (e.target.closest('[data-ws-load]')) { loadToApp(); return; }
                if (e.target.closest('[data-ws-prompt]')) { copyPrompt(); return; }
                if (e.target.closest('[data-ws-ai-import]')) { importAiResult(); return; }
                if (e.target.closest('[data-ws-export]')) { exportPack(); return; }
                if (e.target.closest('[data-ws-reset]')) { resetDraft(); return; }
                var card = e.target.closest('.ws-media-card');
                if (card) {
                    var input = card.querySelector('.ws-file-input');
                    if (input) input.click();
                    return;
                }
                var up = e.target.closest('[data-ws-upload]');
                if (up) {
                    var uf = viewContent.querySelector('[data-ws-upload-file="' + up.dataset.wsUpload + '"]');
                    if (uf) uf.click();
                    return;
                }
            });
            viewContent.addEventListener('change', function (e) {
                var fi = e.target.closest('.ws-file-input');
                if (fi) {
                    var file = fi.files && fi.files[0];
                    if (file) {
                        if (fi.dataset.wsFile === 'audio') audioFile = file;
                        else instrumentalFile = file;
                        render();
                    }
                    fi.value = '';
                    return;
                }
                var uf = e.target.closest('.ws-upload-file');
                if (uf) {
                    var upFile = uf.files && uf.files[0];
                    if (upFile) {
                        upFile.text().then(function (text) {
                            var which = uf.dataset.wsUploadFile;
                            if (which === 'main') _lrcMain = text;
                            else _lrcTrans = text;
                            var ta = viewContent.querySelector('[data-ws-lrc="' + which + '"]');
                            if (ta) ta.value = text;
                            // v2.7.0: a single alternating LRC parses to both tracks
                            if (which === 'main' && !_lrcTrans.trim()) parseLyrics();
                            else updateStatus();
                        }).catch(function () { setStatus(t('wsParseFail'), true); });
                    }
                    uf.value = '';
                    return;
                }
            });
            // keep textarea contents on re-render
            viewContent.addEventListener('input', function (e) {
                var lrc = e.target.closest('[data-ws-lrc]');
                if (lrc) { if (lrc.dataset.wsLrc === 'main') _lrcMain = lrc.value; else _lrcTrans = lrc.value; return; }
                var ne = e.target.closest('[data-ws-netease]');
                if (ne) { _neteaseText = ne.value; return; }
                var ch = e.target.closest('[data-ws-chunk]');
                if (ch) { _chunkSize = ch.value; updatePromptPreview(); return; }
                var ai = e.target.closest('[data-ws-ai]');
                if (ai) { _aiResult = ai.value; }
            });
            // drag & drop media onto cards
            viewContent.addEventListener('dragover', function (e) {
                var card = e.target.closest('.ws-media-card');
                if (card) { e.preventDefault(); card.classList.add('drag'); }
            });
            viewContent.addEventListener('dragleave', function (e) {
                var card = e.target.closest('.ws-media-card');
                if (card) card.classList.remove('drag');
            });
            viewContent.addEventListener('drop', function (e) {
                var card = e.target.closest('.ws-media-card');
                if (!card) return;
                e.preventDefault();
                card.classList.remove('drag');
                var f = e.dataTransfer.files && e.dataTransfer.files[0];
                if (f && f.type && f.type.indexOf('audio/') === 0) {
                    if (card.dataset.wsDrop === 'audio') audioFile = f;
                    else instrumentalFile = f;
                    render();
                }
            });
        }

        function resetDraft() {
            audioFile = null; instrumentalFile = null; lines = [];
            analysisApplied = false; draftTitle = '';
            _lrcMain = ''; _lrcTrans = ''; _neteaseText = ''; _chunkSize = ''; _aiResult = '';
            render();
        }

        return { render: render, bind: bind, reset: resetDraft };
    };
})(typeof window !== 'undefined' ? window : globalThis);
