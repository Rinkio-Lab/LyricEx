/* LyricEx v2.0.0 – lyrics-video export UI controller.
   Owns the "导出歌词视频" overlay and the per-frame canvas painting (study
   table + lyric block + watermark). The recording itself lives in
   js/modules/video.js; this module only owns the overlay state and the frame
   renderer. Factory parameter is `appCtx` (not `ctx`) because the canvas-2D
   draw helpers below use `ctx` for the graphics context.
   Data flow: app.js instantiates the factory and calls bind() once; the editor
   toolbar opens it via bind(actions).openVideo. Frame renderer reads
   lyrics/songData/offset through appCtx so a reload is always reflected.
   Test entry: manual (needs MediaRecorder + captureStream; no DOM shim covers it). */
(function (root) {
    'use strict';

    root.__lyricexVideoExport = function (appCtx) {
        var t = appCtx.t;
        var videoOverlay = appCtx.videoOverlay,
            videoStatus = appCtx.videoStatus,
            videoProgressFill = appCtx.videoProgressFill,
            videoStartBtn = appCtx.videoStartBtn,
            videoCancelBtn = appCtx.videoCancelBtn;

        var videoRecording = false;
        var videoHandle = null;
        var videoCanvas = null;
        var videoDiscard = false;

        function openVideoOverlay() {
            if (!appCtx.lyrics.length) return;
            if (!window.__lyricexVideo.supported()) {
                window.__lyricexDialog.alert(t('videoUnsupported'));
                return;
            }
            if (!appCtx.audio) {
                window.__lyricexDialog.alert(t('pleaseUpload'));
                return;
            }
            videoOverlay.classList.add('open');
            videoStatus.textContent = '';
            videoProgressFill.style.width = '0%';
            videoStartBtn.disabled = false;
            videoStartBtn.textContent = t('videoStart');
            videoCancelBtn.textContent = t('close');
        }

        function closeVideoOverlay() {
            if (videoRecording && videoHandle) {
                videoDiscard = true;
                videoHandle.stop();
            } else videoOverlay.classList.remove('open');
        }

        // Wrap text into lines that fit maxWidth. Char-level greedy wrap: correct
        // for CJK (no spaces) and acceptable for latin; the old word-split version
        // let an over-long CJK line through unchanged (horizontal overflow).
        function wrapLines(g, text, maxWidth) {
            const s = String(text || '');
            if (!s) return [];
            const lines = [];
            let cur = '';
            for (let i = 0; i < s.length; i++) {
                const test = cur + s[i];
                if (cur && g.measureText(test).width > maxWidth) {
                    lines.push(cur);
                    cur = s[i];
                } else cur = test;
            }
            if (cur) lines.push(cur);
            return lines;
        }

        function ellipsize(ls, max) {
            if (ls.length <= max) return ls;
            ls = ls.slice(0, max);
            ls[max - 1] = ls[max - 1].slice(0, -1) + '\u2026';
            return ls;
        }

        // Draw the study-table as a real grid (header = word surface, rows =
        // romaji/hiragana/kanji/pos/meaning) for a line onto the video canvas.
        // Returns the y just below the table so the caller can keep drawing.
        function drawVideoStudyTable(g, line, x, y, width) {
            const accent = getComputedStyle(appCtx.app).getPropertyValue('--accent').trim() || '#8a7a6a';
            if (!line.analysis || !line.analysis.length) {
                g.fillStyle = '#8a827a';
                g.font = '22px "Noto Sans SC", "PingFang SC", sans-serif';
                g.fillText('(' + t('noAnalysisMeta') + ')', x, y);
                return y + 36;
            }
            const rows = [
                { key: 'romaji', label: t('romaji') },
                { key: 'hiragana', label: t('hiragana') },
                { key: 'kanji', label: t('kanji') },
                { key: 'partOfSpeech', label: t('pos') },
                { key: 'meaning', label: t('meaning') }
            ];
            const items = line.analysis.slice(0, 5);
            const labelW = 118,
                gap = 8,
                pad = 10;
            const colW = Math.max(56, Math.floor((width - labelW - gap) / items.length));
            const headerH = 34,
                rowH = 40;
            const grid = 'rgba(0,0,0,0.14)',
                text = '#1e1a16';
            const cellFont = '19px "M PLUS Rounded 1c", "Noto Sans SC", sans-serif';
            const headFont = '19px "Noto Sans SC", "PingFang SC", sans-serif';

            function fit(s, font, color, maxLines) {
                g.font = font;
                g.fillStyle = color;
                const ls = wrapLines(g, String(s == null || s === '' ? '\u2014' : s), colW - 2 * pad);
                if (ls.length > maxLines) {
                    ls.length = maxLines;
                    ls[maxLines - 1] = ls[maxLines - 1].slice(0, -1) + '\u2026';
                }
                return ls;
            }

            // panel background + header band
            g.fillStyle = 'rgba(0,0,0,0.035)';
            g.fillRect(x, y, width, headerH + rows.length * rowH);
            g.fillStyle = accent;
            g.fillRect(x, y, width, headerH);
            for (let c = 0; c < items.length; c++) {
                const surf = items[c].kanji || items[c].hiragana || '\u2014';
                const cx = x + labelW + gap + c * colW;
                g.textAlign = 'center';
                g.fillText(fit(surf, headFont, '#ffffff', 1)[0] || '', cx + colW / 2, y + 8);
            }
            g.textAlign = 'left';

            // data rows
            for (let r = 0; r < rows.length; r++) {
                const ry = y + headerH + r * rowH;
                const row = rows[r];
                g.fillStyle = accent;
                g.font = '20px "Noto Sans SC", "PingFang SC", sans-serif';
                g.fillText(row.label, x + 8, ry + 9);
                for (let c = 0; c < items.length; c++) {
                    const ls = fit(items[c][row.key], cellFont, text, 2);
                    const cx = x + labelW + gap + c * colW;
                    for (let li = 0; li < ls.length; li++) g.fillText(ls[li], cx + pad, ry + 7 + li * 21);
                }
                g.strokeStyle = grid;
                g.lineWidth = 1;
                g.beginPath();
                g.moveTo(x, ry + rowH - 0.5);
                g.lineTo(x + width, ry + rowH - 0.5);
                g.stroke();
            }
            // vertical rule after the label column
            g.strokeStyle = grid;
            g.beginPath();
            g.moveTo(x + labelW, y);
            g.lineTo(x + labelW, y + headerH + rows.length * rowH);
            g.stroke();

            return y + headerH + rows.length * rowH;
        }

        // Draw one video frame (study-table lyric video). `g` is the 2D context,
        // `rawTime` the audio time WITHOUT the offset (findLyricIndex adds it).
        function drawVideoFrame(g, rawTime) {
            const W = videoCanvas.width,
                H = videoCanvas.height;
            const bg = getComputedStyle(appCtx.app).getPropertyValue('--bg-primary').trim() || '#f6f4f0';
            const accent = getComputedStyle(appCtx.app).getPropertyValue('--accent').trim() || '#8a7a6a';
            g.textAlign = 'left';
            g.textBaseline = 'top';
            g.fillStyle = bg;
            g.fillRect(0, 0, W, H);
            const idx = appCtx.findLyricIndex(rawTime + appCtx.offset);
            // header
            g.fillStyle = '#8a827a';
            g.font = '24px "Noto Sans SC", "PingFang SC", sans-serif';
            const head = appCtx.songData
                ? (appCtx.songData.title || '') + (appCtx.songData.artist ? '  \u00b7  ' + appCtx.songData.artist : '')
                : '';
            g.fillText(head || '\u2013', 80, 52);
            if (idx < 0) return;
            const line = appCtx.lyrics[idx];
            const contentW = W - 224; // 112px gutters on both sides
            // accent bar + wrapped lyric (up to 3 lines, no overflow)
            g.font = '44px "M PLUS Rounded 1c", "Noto Sans SC", sans-serif';
            const lyricLines = ellipsize(wrapLines(g, line.text || '', contentW), 3);
            g.fillStyle = accent;
            g.fillRect(80, 116, 10, lyricLines.length * 58);
            g.fillStyle = '#1e1a16';
            let cy = 124;
            lyricLines.forEach(function (l) {
                g.fillText(l, 112, cy);
                cy += 58;
            });
            // wrapped translation (up to 2 lines)
            let ty = cy + 6;
            if (line.translation) {
                g.fillStyle = '#5a524a';
                g.font = '26px "Noto Sans SC", "PingFang SC", sans-serif';
                ellipsize(wrapLines(g, line.translation, contentW), 2).forEach(function (l) {
                    g.fillText(l, 112, ty);
                    ty += 36;
                });
            }
            // study table below the lyric block
            drawVideoStudyTable(g, line, 112, ty + 12, contentW);
            // powered-by watermark
            g.fillStyle = '#b0a898';
            g.font = '15px "Noto Sans SC", sans-serif';
            g.textAlign = 'right';
            g.fillText('Powered by LyricEx', W - 56, H - 44);
            g.textAlign = 'left';
        }

        function startVideoExport() {
            if (videoRecording || !appCtx.audio) return;
            videoCanvas = document.createElement('canvas');
            videoCanvas.width = 1280;
            videoCanvas.height = 720;
            videoCanvas.style.position = 'fixed';
            videoCanvas.style.left = '-10000px';
            videoCanvas.style.top = '0';
            videoCanvas.style.width = '1280px';
            videoCanvas.style.height = '720px';
            document.body.appendChild(videoCanvas);
            videoRecording = true;
            videoDiscard = false;
            videoStartBtn.disabled = true;
            videoStartBtn.textContent = t('videoStop');
            videoCancelBtn.textContent = t('videoCancel');
            videoStatus.textContent = t('videoRecording');
            drawVideoFrame(videoCanvas.getContext('2d'), 0);
            videoHandle = window.__lyricexVideo.start({
                audio: appCtx.audio,
                canvas: videoCanvas,
                draw: drawVideoFrame,
                onProgress: function (p) {
                    videoProgressFill.style.width = p * 100 + '%';
                },
                onDone: function (blob) {
                    videoRecording = false;
                    videoHandle = null;
                    if (videoCanvas) {
                        videoCanvas.remove();
                        videoCanvas = null;
                    }
                    videoStartBtn.disabled = false;
                    videoStartBtn.textContent = t('videoStart');
                    videoCancelBtn.textContent = t('close');
                    videoProgressFill.style.width = '100%';
                    if (videoDiscard) {
                        videoStatus.textContent = t('videoCancelled');
                        videoDiscard = false;
                    } else {
                        appCtx.downloadBlob(blob, appCtx.safePackageName() + '.webm');
                        videoStatus.textContent = t('videoDone');
                    }
                    videoOverlay.classList.remove('open');
                },
                onError: function (err) {
                    videoRecording = false;
                    videoHandle = null;
                    if (videoCanvas) {
                        videoCanvas.remove();
                        videoCanvas = null;
                    }
                    videoStartBtn.disabled = false;
                    videoStartBtn.textContent = t('videoStart');
                    videoCancelBtn.textContent = t('close');
                    videoStatus.textContent = t('videoFailed') + ': ' + (err && err.message ? err.message : err);
                    console.error('video export error', err);
                }
            });
        }

        function onVideoStartBtn() {
            if (videoRecording) {
                if (videoHandle) videoHandle.stop();
            } else startVideoExport();
        }

        function bind() {
            videoStartBtn.addEventListener('click', onVideoStartBtn);
            videoCancelBtn.addEventListener('click', closeVideoOverlay);
            videoOverlay.addEventListener('click', function (e) {
                if (e.target === videoOverlay) closeVideoOverlay();
            });
        }

        return {
            open: openVideoOverlay,
            close: closeVideoOverlay,
            bind: bind,
            start: startVideoExport
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
