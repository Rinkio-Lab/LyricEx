/* LyricEx v2.0.1 – lyrics search overlay controller.
   Owns the "歌词搜索" overlay: index rebuild, result rendering, keyboard
   selection, and jump-to-line. Pure UI glue over js/utils/search.js (which does
   the matching); owns searchIndex/searchSel/searchOpen.
   Data flow: app.js instantiates the factory with ctx and calls bind() once;
   handleKeydown drives it via open()/close()/select()/jump()/isOpen().
   Test entry: boot-smoke.mjs exercises switchView only — search needs manual
   testing or a DOM shim (not present), so it is kept out of the smoke tests. */
(function (root) {
    'use strict';

    root.__lyricexSearch = function (ctx) {
        var t = ctx.t;
        var searchOverlay = ctx.searchOverlay,
            searchInput = ctx.searchInput,
            searchResults = ctx.searchResults,
            searchCount = ctx.searchCount;

        var searchIndex = [];
        var searchSel = -1;
        var searchOpen = false;

        function rebuildSearchIndex() {
            searchIndex = window.__lyricexUtils.buildSearchIndex(ctx.lyrics);
        }

        function openSearch() {
            if (!ctx.lyrics.length) return;
            rebuildSearchIndex();
            searchOpen = true;
            searchOverlay.classList.add('open');
            searchInput.value = '';
            searchSel = -1;
            searchCount.textContent = '';
            renderSearchResults('');
            setTimeout(function () {
                try {
                    searchInput.focus();
                } catch (_) {
                    /* noop */
                }
            }, 0);
        }

        function closeSearch() {
            searchOpen = false;
            searchOverlay.classList.remove('open');
        }

        function renderSearchResults(query) {
            const hits = window.__lyricexUtils.searchLyrics(searchIndex, query);
            searchSel = hits.length ? 0 : -1;
            searchCount.textContent = hits.length ? String(hits.length) : '';
            if (!hits.length) {
                searchResults.innerHTML = '<div class="search-empty">' + t('searchNoResults') + '</div>';
                return;
            }
            let html = '';
            hits.forEach(function (h, i) {
                const line = ctx.lyrics[h.lineIndex];
                const tr = line.translation ? window.__lyricexUtils.highlight(line.translation, query) : '';
                html +=
                    '<div class="search-result' +
                    (i === 0 ? ' selected' : '') +
                    '" data-index="' +
                    h.lineIndex +
                    '">' +
                    '<span class="sr-line">' +
                    window.__lyricexUtils.highlight(line.text || '', query) +
                    '</span>' +
                    (tr ? '<span class="sr-trans">' + tr + '</span>' : '') +
                    '</div>';
            });
            searchResults.innerHTML = html;
        }

        function searchSelect(delta) {
            const items = searchResults.querySelectorAll('.search-result');
            if (!items.length) return;
            searchSel = Math.max(0, Math.min(items.length - 1, searchSel + delta));
            items.forEach(function (el, i) {
                el.classList.toggle('selected', i === searchSel);
            });
            const el = items[searchSel];
            if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
        }

        function searchJump() {
            const items = searchResults.querySelectorAll('.search-result');
            if (!items.length || searchSel < 0 || searchSel >= items.length) return;
            const idx = parseInt(items[searchSel].dataset.index, 10);
            if (isNaN(idx)) return;
            closeSearch();
            ctx.enableFollow();
            ctx.setActiveLine(idx, 'instant');
            if (ctx.audio) {
                ctx.audio.currentTime = Math.max(0, ctx.lyrics[idx].time - ctx.offset);
                if (!ctx.isPlaying) ctx.audio.play().catch(function () {});
            } else if (ctx.audioUrl) {
                ctx.loadAudioFromUrl(ctx.audioUrl);
                setTimeout(function () {
                    if (ctx.audio) {
                        ctx.audio.currentTime = Math.max(0, ctx.lyrics[idx].time - ctx.offset);
                        ctx.setActiveLine(idx, 'instant');
                        ctx.audio.play().catch(function () {});
                    }
                }, 300);
            }
        }

        function bind() {
            searchInput.addEventListener('input', function () {
                renderSearchResults(searchInput.value);
            });
            searchOverlay.addEventListener('click', function (e) {
                if (e.target === searchOverlay) closeSearch();
            });
        }

        return {
            open: openSearch,
            close: closeSearch,
            select: searchSelect,
            jump: searchJump,
            render: renderSearchResults,
            isOpen: function () {
                return searchOpen;
            },
            bind: bind
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
