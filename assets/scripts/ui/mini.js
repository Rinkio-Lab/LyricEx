/* LyricEx v2.0.1 – mini-mode (floating bar) controller.
   Owns the compact floating player bar: enter/exit, the live title/line/progress
   refresh, the seek/toggle buttons, and the drag-to-move behavior. Owns miniOn.
   Data flow: app.js instantiates the factory and calls bind() once; the hot
   refresh path updateBar() is called from app.js on every playback state change
   (setActiveLine / updatePlayState / loadAudioFromUrl / locale change).
   Invariant: mini and cinema are mutually exclusive — enterMini() closes cinema
   via ctx.isCinemaOpen()/ctx.closeCinema() (wired post-creation in app.js).
   Test entry: boot-smoke.mjs (window.__lyricex.toggleMini is exercised after
   loading a sample). */
(function (root) {
    'use strict';

    root.__lyricexMini = function (ctx) {
        var t = ctx.t,
            L = ctx.L;
        var miniBtn = ctx.miniBtn,
            miniBar = ctx.miniBar,
            miniDrag = ctx.miniDrag,
            miniInfo = ctx.miniInfo,
            miniTitle = ctx.miniTitle,
            miniLine = ctx.miniLine,
            miniPlayBtn = ctx.miniPlayBtn,
            miniPlayIcon = ctx.miniPlayIcon,
            miniPrevBtn = ctx.miniPrevBtn,
            miniNextBtn = ctx.miniNextBtn,
            miniProgress = ctx.miniProgress,
            miniProgressFill = ctx.miniProgressFill,
            miniExpandBtn = ctx.miniExpandBtn;

        var miniOn = false;

        function toggleMini() {
            if (miniOn) exitMini();
            else enterMini();
        }

        function enterMini() {
            if (!ctx.lyrics.length) return;
            if (ctx.isCinemaOpen()) ctx.closeCinema();
            miniOn = true;
            ctx.app.classList.add('mini-mode');
            miniBar.style.display = 'flex';
            updateMiniBar();
            ctx.updateFollowPill();
        }

        function exitMini() {
            miniOn = false;
            ctx.app.classList.remove('mini-mode');
            miniBar.style.display = 'none';
            ctx.updateFollowPill();
            ctx.scrollLyricToActive('instant');
        }

        function updateMiniBar() {
            if (!miniOn) return;
            const title = ctx.songData ? ctx.songData.title || t('unknownSong') : '\u2013';
            miniTitle.textContent =
                ctx.songData && ctx.songData.artist ? title + ' \u00b7 ' + ctx.songData.artist : title;
            const activeLine =
                ctx.activeLineIndex >= 0 && ctx.activeLineIndex < ctx.lyrics.length
                    ? ctx.lyrics[ctx.activeLineIndex]
                    : null;
            const miniText = activeLine ? activeLine.text : t('notLoaded');
            miniLine.textContent = miniText;
            // v2.2.0: explicit per-line lang wins over the heuristic (matches
            // app.js langAttr) — a full-kanji Japanese line stays Japanese here too.
            const lang = activeLine && activeLine.lang;
            if (lang === 'zh' || lang === 'ja' || lang === 'en') miniLine.dataset.lang = lang;
            else if (L.isChinese(miniText)) miniLine.dataset.lang = 'zh';
            else delete miniLine.dataset.lang;
            const pct =
                ctx.audio && ctx.audio.duration ? Math.min(100, (ctx.getCurrentTime() / ctx.audio.duration) * 100) : 0;
            miniProgressFill.style.width = pct + '%';
            miniPlayIcon.innerHTML = ctx.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }

        function bindMiniEvents() {
            miniBtn.addEventListener('click', toggleMini);
            miniPlayBtn.addEventListener('click', ctx.togglePlay);
            miniPrevBtn.addEventListener('click', ctx.prevLyric);
            miniNextBtn.addEventListener('click', ctx.nextLyric);
            miniExpandBtn.addEventListener('click', exitMini);
            miniInfo.addEventListener('click', function () {
                if (ctx.activeLineIndex < 0 || ctx.activeLineIndex >= ctx.lyrics.length) return;
                ctx.enableFollow();
                ctx.scrollLyricToActive('instant');
                if (ctx.audio) {
                    ctx.audio.currentTime = Math.max(0, ctx.lyrics[ctx.activeLineIndex].time - ctx.offset);
                    if (!ctx.isPlaying) ctx.audio.play().catch(function () {});
                }
            });
            miniProgress.addEventListener('click', function (e) {
                if (!ctx.audio || !ctx.audio.duration) return;
                const rect = miniProgress.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                ctx.audio.currentTime = x * ctx.audio.duration;
                ctx.enableFollow(); // mini bar click = explicit navigation
                ctx.updatePlayState();
            });
            // dragging
            let dragState = null;
            miniDrag.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                dragState = { x: e.clientX, y: e.clientY, left: miniBar.offsetLeft, top: miniBar.offsetTop };
                miniBar.classList.add('dragging');
                miniDrag.setPointerCapture(e.pointerId);
            });
            miniDrag.addEventListener('pointermove', function (e) {
                if (!dragState) return;
                const maxX = Math.max(8, window.innerWidth - miniBar.offsetWidth - 8);
                const maxY = Math.max(8, window.innerHeight - miniBar.offsetHeight - 8);
                miniBar.style.left = Math.min(maxX, Math.max(8, dragState.left + e.clientX - dragState.x)) + 'px';
                miniBar.style.top = Math.min(maxY, Math.max(8, dragState.top + e.clientY - dragState.y)) + 'px';
                miniBar.style.right = 'auto';
                miniBar.style.bottom = 'auto';
            });
            ['pointerup', 'pointercancel'].forEach(function (evt) {
                miniDrag.addEventListener(evt, function () {
                    dragState = null;
                    miniBar.classList.remove('dragging');
                });
            });
        }

        return {
            toggle: toggleMini,
            enter: enterMini,
            exit: exitMini,
            updateBar: updateMiniBar,
            isOn: function () {
                return miniOn;
            },
            bind: bindMiniEvents
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
