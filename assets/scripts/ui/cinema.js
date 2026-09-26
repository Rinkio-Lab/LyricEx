/* LyricEx v2.0.1 – cinema-mode controller.
   Owns the fullscreen "影院" overlay: open/close (which relocates the shared
   #playerControls into the overlay), the big-lyric list render, and the
   active-line highlight refresh used by app.js's setActiveLine/clearActiveClasses
   and getLyricsScrollTarget. Owns cinemaOpen.
   Data flow: app.js instantiates the factory and calls bind() once; the core
   sync loop calls refreshActive()/clearActive()/container()/isOpen() directly
   (same closure), and renderLyrics() whenever settings/locale trigger a re-render.
   Invariant: cinema and mini are mutually exclusive — openCinema() exits mini
   via ctx.isMiniOn()/ctx.exitMini() (wired post-creation in app.js).
   Test entry: boot-smoke.mjs (openCinema/closeCinema exposed on window.__lyricex). */
(function (root) {
    'use strict';

    root.__lyricexCinema = function (ctx) {
        var cinemaBtn = ctx.cinemaBtn, cinemaOverlay = ctx.cinemaOverlay, cinemaLyrics = ctx.cinemaLyrics,
            cinemaExitBtn = ctx.cinemaExitBtn, cinemaPlayerSlot = ctx.cinemaPlayerSlot, playerControls = ctx.playerControls;

        var cinemaOpen = false;

        function openCinema() {
            if (!ctx.lyrics.length) return;
            if (ctx.isMiniOn()) ctx.exitMini();
            cinemaOpen = true;
            cinemaOverlay.classList.add('open');
            cinemaPlayerSlot.appendChild(playerControls);
            ctx.updatePlayState();
            renderCinemaLyrics();
            ctx.scrollLyricToActive('instant');
            ctx.updateFollowPill();
        }

        function closeCinema() {
            cinemaOpen = false;
            cinemaOverlay.classList.remove('open');
            const main = document.querySelector('.main');
            if (main) main.appendChild(playerControls);
            ctx.updatePlayState();
            ctx.scrollLyricToActive('instant');
            ctx.updateFollowPill();
        }

        function renderCinemaLyrics() {
            if (!ctx.lyrics.length) return;
            let html = '';
            ctx.lyrics.forEach(function (line, idx) {
                const isActive = idx === ctx.activeLineIndex;
                const isNear = !isActive && Math.abs(idx - ctx.activeLineIndex) <= 2;
                html += '<div class="cinema-line' +
                    (isActive ? ' active' : '') +
                    (isNear ? ' near' : '') +
                    '" data-index="' + idx + '"' + ctx.langAttr(line) + '>' +
                    '<span class="cinema-text">' + ctx.lineTextHTML(line, idx) + '</span>' +
                    ctx.subLineHTML(line) +
                    '</div>';
            });
            cinemaLyrics.innerHTML = html;

            cinemaLyrics.querySelectorAll('.cinema-line').forEach(function (el) {
                el.addEventListener('click', function () {
                    const idx = parseInt(this.dataset.index);
                    if (isNaN(idx)) return;
                    ctx.enableFollow();
                    ctx.setActiveLine(idx, 'instant');
                    if (ctx.audio) {
                        ctx.audio.currentTime = Math.max(0, ctx.lyrics[idx].time - ctx.offset);
                        if (!ctx.isPlaying) ctx.audio.play().catch(function () {});
                    }
                });
            });
        }

        // Toggle .active/.near on the .cinema-line list (called by setActiveLine).
        function refreshActive(idx) {
            cinemaLyrics.querySelectorAll('.cinema-line').forEach(function (el, i) {
                el.classList.toggle('active', i === idx);
                el.classList.toggle('near', Math.abs(i - idx) <= 2 && i !== idx);
            });
        }

        // Remove .active/.near from the .cinema-line list (called by clearActiveClasses).
        function clearActive() {
            cinemaLyrics.querySelectorAll('.cinema-line').forEach(function (el) {
                el.classList.remove('active', 'near');
            });
        }

        function bind() {
            cinemaBtn.addEventListener('click', openCinema);
            cinemaExitBtn.addEventListener('click', closeCinema);
            ctx.bindScrollInteractions(cinemaLyrics);
        }

        return {
            open: openCinema,
            close: closeCinema,
            renderLyrics: renderCinemaLyrics,
            refreshActive: refreshActive,
            clearActive: clearActive,
            container: function () { return cinemaLyrics; },
            isOpen: function () { return cinemaOpen; },
            bind: bind
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
