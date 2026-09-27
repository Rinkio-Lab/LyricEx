/* LyricEx v2.9.4 – local song library view (UI). Renders into #viewContent
   when currentView === 'library' (app.js calls __lyricexLibraryUI.render()).
   Owns: folder import (showDirectoryPicker / webkitdirectory fallback), the
   list with search + facet filters + sort + scroll paging, favorite / recent /
   play-count, playlists CRUD, per-song detail / edit / delete (incl. batch),
   artist / album grouping, and playback hand-off to app.js
   (window.__lyricex.playLibrarySong).
   The example-pack overlay (manifest.json) stays separate; this view's
   "示例包" button simply opens it via window.__lyricex.openLibrary. */
(function (root) {
    'use strict';
    var LIB = root.__lyricexLibrary;
    var M = root.__lyricexMetadata;
    var t = function (k) {
        return root.__i18n && root.__i18n.t ? root.__i18n.t(k) : k;
    };
    var esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    var PAGE = 60;
    var state = {
        songs: [],
        query: '',
        filters: { artist: '', album: '', genre: '', year: '', tag: '' },
        sortKey: 'title',
        sortDir: 1,
        tab: 'all',
        activePlaylistId: null,
        loaded: PAGE,
        batchMode: false,
        selected: {},
        detailId: null
    };
    var coverUrls = {};
    var el = null; // root container of this view

    function fmtDuration(sec) {
        sec = Number(sec) || 0;
        var m = Math.floor(sec / 60),
            s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function coverUrl(song) {
        if (!song || !song.coverBlob) return '';
        if (coverUrls[song.id]) return coverUrls[song.id];
        coverUrls[song.id] = URL.createObjectURL(song.coverBlob);
        return coverUrls[song.id];
    }
    function revokeCovers() {
        Object.keys(coverUrls).forEach(function (k) {
            try {
                URL.revokeObjectURL(coverUrls[k]);
            } catch (_) {
                /* already revoked */
            }
        });
        coverUrls = {};
    }

    // ---------------- filtering / sorting ----------------
    function filtered() {
        var f = state.filters,
            out = [];
        state.songs.forEach(function (s) {
            if (state.tab === 'favorites' && !s.favorite) return;
            if (state.tab === 'recent' && !s.lastPlayedAt) return;
            if (state.query && !M.matchesQuery(s, state.query)) return;
            if (!M.matchesFilter(s, { artist: f.artist, album: f.album, genre: f.genre, year: f.year, tag: f.tag }))
                return;
            out.push(s);
        });
        out.sort(function (a, b) {
            return M.compareSongs(a, b, state.sortKey, state.sortDir);
        });
        return out;
    }

    function facetValues(key) {
        var set = {},
            out = [];
        state.songs.forEach(function (s) {
            var v = s[key];
            if (!v) return;
            if (key === 'tags') {
                (s.tags || []).forEach(function (x) {
                    set[x] = true;
                });
                return;
            }
            set[v] = true;
        });
        Object.keys(set)
            .sort(function (a, b) {
                return a.localeCompare(b, 'zh-Hans-CN');
            })
            .forEach(function (k) {
                out.push(k);
            });
        return out;
    }

    function updateFacetSelect(sel, values, emptyLabel) {
        if (!sel) return;
        var cur = sel.value || '';
        sel.innerHTML =
            '<option value="">' +
            esc(emptyLabel) +
            '</option>' +
            values
                .map(function (v) {
                    return '<option value="' + esc(v) + '">' + esc(v) + '</option>';
                })
                .join('');
        sel.value = cur;
    }

    // ---------------- render ----------------
    function render() {
        var vc = root.document.getElementById('viewContent');
        if (!vc) return;
        vc.innerHTML =
            '<div class="library-view">' +
            '<div class="library-toolbar">' +
            '<div class="library-toolbar-row">' +
            '<h2 class="view-title"><i class="fas fa-compact-disc"></i> ' +
            esc(t('libTitle')) +
            '</h2>' +
            '<div class="library-actions">' +
            '<button class="close-btn" id="libAddFolderBtn"><i class="fas fa-folder-open"></i> <span data-i18n="libAddFolder">' +
            esc(t('libAddFolder')) +
            '</span></button>' +
            '<input type="file" id="libDirInput" webkitdirectory multiple hidden />' +
            '<button class="close-btn" id="libSamplesBtn"><i class="fas fa-music"></i> <span data-i18n="libSamples">' +
            esc(t('libSamples')) +
            '</span></button>' +
            '<button class="close-btn" id="libBatchToggleBtn"><i class="fas fa-check-square"></i> <span data-i18n="libBatchMode">' +
            esc(t('libBatchMode')) +
            '</span></button>' +
            '<button class="close-btn danger-btn" id="libClearBtn" data-i18n="libClearAll">' +
            esc(t('libClearAll')) +
            '</button>' +
            '</div></div>' +
            '<div class="library-search-row">' +
            '<input type="search" id="libSearchInput" class="library-search" placeholder="' +
            esc(t('libSearchPh')) +
            '" />' +
            '<select id="libFilterArtist" class="library-filter"></select>' +
            '<select id="libFilterAlbum" class="library-filter"></select>' +
            '<select id="libFilterGenre" class="library-filter"></select>' +
            '<select id="libFilterYear" class="library-filter"></select>' +
            '<select id="libFilterTag" class="library-filter"></select>' +
            '<select id="libSortSelect" class="library-sort"></select>' +
            '<button class="close-btn" id="libSortDirBtn" title="' +
            esc(t('libSortDir')) +
            '"><i class="fas fa-sort-amount-' +
            (state.sortDir === 1 ? 'up' : 'down') +
            '"></i></button>' +
            '</div>' +
            '<div class="library-tabs" id="libTabs">' +
            ['all', 'favorites', 'recent', 'artists', 'albums', 'playlists']
                .map(function (tab) {
                    return (
                        '<button class="library-tab' +
                        (state.tab === tab ? ' active' : '') +
                        '" data-tab="' +
                        tab +
                        '" data-i18n="libTab' +
                        cap(tab) +
                        '">' +
                        esc(t('libTab' + cap(tab))) +
                        '</button>'
                    );
                })
                .join('') +
            '</div>' +
            '<div class="library-batch-bar" id="libBatchBar" hidden>' +
            '<span id="libBatchCount"></span>' +
            '<button class="close-btn danger-btn" id="libBatchDeleteBtn" data-i18n="libBatchDelete">' +
            esc(t('libBatchDelete')) +
            '</button>' +
            '<button class="close-btn" id="libBatchCancelBtn" data-i18n="libBatchCancel">' +
            esc(t('libBatchCancel')) +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="library-body" id="libBody">' +
            '<div class="library-status" id="libStatus"></div>' +
            '</div>' +
            '</div>';
        el = vc.querySelector('.library-view');
        bindToolbar(el);
        refresh();
    }

    function cap(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function bindToolbar(rootEl) {
        var search = rootEl.querySelector('#libSearchInput');
        var sortSel = rootEl.querySelector('#libSortSelect');
        var tabs = rootEl.querySelector('#libTabs');
        sortSel.innerHTML = [
            ['title', 'libSortTitle'],
            ['artist', 'libSortArtist'],
            ['duration', 'libSortDuration'],
            ['addedAt', 'libSortAdded'],
            ['playCount', 'libSortPlays']
        ]
            .map(function (pair) {
                return (
                    '<option value="' +
                    pair[0] +
                    '"' +
                    (state.sortKey === pair[0] ? ' selected' : '') +
                    '>' +
                    esc(t(pair[1])) +
                    '</option>'
                );
            })
            .join('');
        search.value = state.query;
        search.addEventListener('input', function () {
            state.query = search.value;
            state.loaded = PAGE;
            renderBody();
        });
        sortSel.addEventListener('change', function () {
            state.sortKey = sortSel.value;
            state.loaded = PAGE;
            renderBody();
        });
        rootEl.querySelector('#libSortDirBtn').addEventListener('click', function () {
            state.sortDir *= -1;
            state.loaded = PAGE;
            render();
        });
        ['#libFilterArtist', '#libFilterAlbum', '#libFilterGenre', '#libFilterYear', '#libFilterTag'].forEach(
            function (selId, i) {
                var sel = rootEl.querySelector(selId);
                var keys = ['artist', 'album', 'genre', 'year', 'tag'];
                updateFacetSelect(
                    sel,
                    facetValues(keys[i]),
                    t(['libAllArtists', 'libAllAlbums', 'libAllGenres', 'libAllYears', 'libAllTags'][i])
                );
                sel.addEventListener('change', function () {
                    state.filters[keys[i]] = sel.value;
                    state.loaded = PAGE;
                    renderBody();
                });
            }
        );
        tabs.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('.library-tab');
            if (!btn) return;
            state.tab = btn.dataset.tab;
            state.activePlaylistId = null;
            state.detailId = null;
            state.loaded = PAGE;
            render();
        });
        rootEl.querySelector('#libAddFolderBtn').addEventListener('click', importFolder);
        rootEl.querySelector('#libDirInput').addEventListener('change', function (e) {
            importFiles(e.target.files);
        });
        rootEl.querySelector('#libSamplesBtn').addEventListener('click', function () {
            if (root.__lyricex && root.__lyricex.openLibrary) root.__lyricex.openLibrary();
        });
        rootEl.querySelector('#libBatchToggleBtn').addEventListener('click', function () {
            state.batchMode = !state.batchMode;
            state.selected = {};
            render();
        });
        rootEl.querySelector('#libBatchCancelBtn').addEventListener('click', function () {
            state.batchMode = false;
            state.selected = {};
            render();
        });
        rootEl.querySelector('#libBatchDeleteBtn').addEventListener('click', function () {
            var ids = Object.keys(state.selected)
                .map(Number)
                .filter(function (id) {
                    return state.selected[id];
                });
            if (!ids.length) return;
            root.__lyricexDialog
                .confirm(t('libConfirmDelete') + '（' + ids.length + '）', { danger: true })
                .then(function (ok) {
                    if (!ok) return;
                    LIB.deleteSongs(ids).then(function () {
                        state.batchMode = false;
                        state.selected = {};
                        refresh();
                    });
                });
        });
        rootEl.querySelector('#libClearBtn').addEventListener('click', function () {
            root.__lyricexDialog.confirm(t('libConfirmClearAll'), { danger: true }).then(function (ok) {
                if (!ok) return;
                LIB.clearSongs().then(function () {
                    refresh();
                });
            });
        });
        var body = rootEl.querySelector('#libBody');
        // v3.2.1: a cover blob that fails to decode (stale/corrupt object URL)
        // swaps to the placeholder glyph — capture-phase so lazy <img> errors
        // count (inline onerror would violate the CSP script-src 'self')
        body.addEventListener(
            'error',
            function (e) {
                var img = e.target;
                if (img && img.tagName === 'IMG' && img.classList.contains('lib-cover')) {
                    var ph = root.document.createElement('div');
                    ph.className = 'lib-cover lib-cover-placeholder';
                    ph.innerHTML = '<i class="fas fa-music"></i>';
                    img.replaceWith(ph);
                }
            },
            true
        );
        body.addEventListener('scroll', function () {
            if (state.tab === 'all' || state.tab === 'favorites' || state.tab === 'recent') {
                if (body.scrollTop + body.clientHeight >= body.scrollHeight - 80) {
                    state.loaded += PAGE;
                    renderBody();
                }
            }
        });
        body.addEventListener('click', onRowClick);
        body.addEventListener('change', onRowChange);
    }

    // ---------------- body ----------------
    function renderBody() {
        if (!el) return;
        var body = el.querySelector('#libBody');
        var status = el.querySelector('#libStatus');
        if (!body) return;
        if (state.tab === 'artists' || state.tab === 'albums') {
            renderGrouped(body);
            return;
        }
        if (state.tab === 'playlists') {
            renderPlaylists(body);
            return;
        }
        var list = filtered();
        if (!list.length) {
            body.innerHTML = '<div class="library-status" id="libStatus">' + esc(t('libEmpty')) + '</div>';
            return;
        }
        var shown = list.slice(0, state.loaded);
        if (status) status.textContent = shown.length + ' / ' + list.length;
        body.innerHTML =
            '<div class="library-status" id="libStatus">' +
            esc(shown.length + ' / ' + list.length) +
            '</div>' +
            shown
                .map(function (s) {
                    return rowHTML(s);
                })
                .join('');
        renderBatchBar();
    }

    function rowHTML(s) {
        var checked = state.selected[s.id] ? ' checked' : '';
        var cover = coverUrl(s);
        var meta = [s.artist || t('libUnknownArtist'), s.album].filter(Boolean).join(' · ');
        var dur = s.duration ? fmtDuration(s.duration) : '--:--';
        var star = s.favorite
            ? ' <i class="fas fa-star lib-star on" data-action="fav" title="' + esc(t('libUnfavorite')) + '"></i>'
            : ' <i class="far fa-star lib-star" data-action="fav" title="' + esc(t('libFavorite')) + '"></i>';
        return (
            '<div class="lib-row' +
            (state.batchMode ? ' batch' : '') +
            '" data-id="' +
            s.id +
            '">' +
            (state.batchMode
                ? '<input type="checkbox" class="lib-row-check" data-action="check"' + checked + ' />'
                : '') +
            (cover
                ? '<img class="lib-cover" src="' + cover + '" alt="" loading="lazy" />'
                : '<div class="lib-cover lib-cover-placeholder"><i class="fas fa-music"></i></div>') +
            '<div class="lib-row-main"><div class="lib-row-title">' +
            esc(s.title || t('unknownSong')) +
            star +
            '</div>' +
            '<div class="lib-row-meta">' +
            esc(meta) +
            ' · ' +
            dur +
            (s.playCount ? ' · ' + s.playCount + ' ' + esc(t('libPlays')) : '') +
            (s.hasLyrics
                ? ' · <i class="fas fa-file-alt" title="' + esc(t('libHasLyrics')) + '"></i>'
                : ' · <span class="lib-no-lyrics">' + esc(t('libNoLyrics')) + '</span>') +
            '</div></div>' +
            '<div class="lib-row-actions">' +
            '<button class="close-btn lib-action" data-action="play" title="' +
            esc(t('libPlay')) +
            '"><i class="fas fa-play"></i></button>' +
            '<button class="close-btn lib-action" data-action="detail" title="' +
            esc(t('libDetail')) +
            '"><i class="fas fa-info-circle"></i></button>' +
            '<button class="close-btn lib-action" data-action="playlist" title="' +
            esc(t('libAddToPlaylist')) +
            '"><i class="fas fa-list"></i></button>' +
            '<button class="close-btn lib-action" data-action="edit" title="' +
            esc(t('editor')) +
            '"><i class="fas fa-pen"></i></button>' +
            '<button class="close-btn lib-action" data-action="delete" title="' +
            esc(t('marksDelete')) +
            '"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>'
        );
    }

    function renderBatchBar() {
        var bar = el && el.querySelector('#libBatchBar');
        if (!bar) return;
        var n = Object.keys(state.selected).filter(function (k) {
            return state.selected[k];
        }).length;
        bar.hidden = !state.batchMode;
        var count = el.querySelector('#libBatchCount');
        if (count) count.textContent = t('libSelected') + ' ' + n;
    }

    function renderGrouped(body) {
        var key = state.tab === 'artists' ? 'artist' : 'album';
        var list = filtered();
        var groups = {};
        list.forEach(function (s) {
            var g = s[key] || t('libUnknownArtist');
            (groups[g] = groups[g] || []).push(s);
        });
        var names = Object.keys(groups).sort(function (a, b) {
            return a.localeCompare(b, 'zh-Hans-CN');
        });
        if (!names.length) {
            body.innerHTML = '<div class="library-status">' + esc(t('libEmpty')) + '</div>';
            return;
        }
        var html = names
            .map(function (g) {
                return (
                    '<div class="lib-group"><div class="lib-group-head">' +
                    esc(g) +
                    ' <span class="lib-group-count">' +
                    groups[g].length +
                    '</span></div>' +
                    groups[g].map(rowHTML).join('') +
                    '</div>'
                );
            })
            .join('');
        body.innerHTML =
            '<div class="library-status">' +
            esc(names.length + ' ' + (key === 'artist' ? t('libArtistsCount') : t('libAlbumsCount'))) +
            '</div>' +
            html;
    }

    // ---------------- playlists ----------------
    function renderPlaylists(body) {
        LIB.getPlaylists().then(function (pls) {
            if (state.activePlaylistId !== null) {
                var pl = pls.find(function (p) {
                    return p.id === state.activePlaylistId;
                });
                if (!pl) {
                    state.activePlaylistId = null;
                    renderPlaylists(body);
                    return;
                }
                var songs = pl.songIds
                    .map(function (id) {
                        return state.songs.find(function (s) {
                            return s.id === id;
                        });
                    })
                    .filter(Boolean);
                body.innerHTML =
                    '<div class="library-playlist-head">' +
                    '<button class="close-btn" data-action="pl-back"><i class="fas fa-arrow-left"></i></button>' +
                    '<span class="lib-playlist-name">' +
                    esc(pl.name) +
                    '</span> ' +
                    songs.length +
                    ' ' +
                    esc(t('libSongs')) +
                    '</div>' +
                    (songs.length
                        ? songs.map(rowHTML).join('')
                        : '<div class="library-status">' + esc(t('libEmptyPlaylist')) + '</div>');
                return;
            }
            if (!pls.length) {
                body.innerHTML =
                    '<div class="library-status">' +
                    esc(t('libNoPlaylists')) +
                    '</div>' +
                    '<div class="library-center"><button class="close-btn" data-action="pl-new">' +
                    esc(t('libNewPlaylist')) +
                    '</button></div>';
                return;
            }
            body.innerHTML =
                '<div class="library-playlist-grid">' +
                pls
                    .map(function (p) {
                        return (
                            '<div class="lib-playlist-card" data-pl-id="' +
                            p.id +
                            '">' +
                            '<div class="lib-playlist-card-name">' +
                            esc(p.name) +
                            '</div>' +
                            '<div class="lib-playlist-card-meta">' +
                            p.songIds.length +
                            ' ' +
                            esc(t('libSongs')) +
                            '</div>' +
                            '<div class="lib-playlist-card-actions">' +
                            '<button class="close-btn lib-action" data-action="pl-open" title="' +
                            esc(t('libOpen')) +
                            '"><i class="fas fa-folder-open"></i></button>' +
                            '<button class="close-btn lib-action" data-action="pl-rename" title="' +
                            esc(t('libRename')) +
                            '"><i class="fas fa-pen"></i></button>' +
                            '<button class="close-btn lib-action" data-action="pl-delete" title="' +
                            esc(t('marksDelete')) +
                            '"><i class="fas fa-trash-alt"></i></button>' +
                            '</div></div>'
                        );
                    })
                    .join('') +
                '</div>' +
                '<div class="library-center"><button class="close-btn" data-action="pl-new">' +
                esc(t('libNewPlaylist')) +
                '</button></div>';
        });
    }

    // ---------------- row events ----------------
    function onRowClick(e) {
        var actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        var row = e.target.closest('.lib-row');
        var id = row ? Number(row.dataset.id) : null;
        var action = actionEl.dataset.action;
        if (action === 'play' && id != null) playSong(id);
        else if (action === 'fav' && id != null) toggleFavorite(id);
        else if (action === 'detail' && id != null) openDetail(id);
        else if (action === 'edit' && id != null) openEdit(id);
        else if (action === 'delete' && id != null) deleteOne(id);
        else if (action === 'playlist' && id != null) openPlaylistPicker(id);
        else if (action === 'pl-new') promptNewPlaylist();
        else if (action === 'pl-open') openPlaylist(Number(actionEl.closest('.lib-playlist-card').dataset.plId));
        else if (action === 'pl-rename') renamePlaylist(Number(actionEl.closest('.lib-playlist-card').dataset.plId));
        else if (action === 'pl-delete') deletePlaylist(Number(actionEl.closest('.lib-playlist-card').dataset.plId));
        else if (action === 'pl-back') {
            state.activePlaylistId = null;
            render();
        } else if (action === 'detail-back') {
            state.detailId = null;
            renderBody();
        }
    }

    function onRowChange(e) {
        if (!e.target.classList.contains('lib-row-check')) return;
        var row = e.target.closest('.lib-row');
        if (!row) return;
        state.selected[Number(row.dataset.id)] = e.target.checked;
        renderBatchBar();
    }

    function playSong(id) {
        LIB.getSong(id).then(function (rec) {
            if (!rec) return;
            if (root.__lyricex && root.__lyricex.playLibrarySong) root.__lyricex.playLibrarySong(rec);
            else LIB.recordPlay(id);
            // bump the visible count without a full refresh
            if (el) {
                var row = el.querySelector('.lib-row[data-id="' + id + '"] .lib-row-meta');
                if (row) {
                    var m = state.songs.find(function (s) {
                        return s.id === id;
                    });
                    if (m) {
                        m.playCount = (Number(m.playCount) || 0) + 1;
                        m.lastPlayedAt = Date.now();
                        var meta = [m.artist || t('libUnknownArtist'), m.album].filter(Boolean).join(' · ');
                        row.textContent =
                            meta +
                            ' · ' +
                            fmtDuration(m.duration) +
                            (m.playCount ? ' · ' + m.playCount + ' ' + t('libPlays') : '');
                    }
                }
            }
        });
    }

    function toggleFavorite(id) {
        var s = state.songs.find(function (x) {
            return x.id === id;
        });
        if (!s) return;
        LIB.updateSong(id, { favorite: !s.favorite }).then(function () {
            s.favorite = !s.favorite;
            var star = el && el.querySelector('.lib-row[data-id="' + id + '"] .lib-star');
            if (star) {
                star.classList.toggle('on', s.favorite);
                star.className = (s.favorite ? 'fas' : 'far') + ' fa-star lib-star' + (s.favorite ? ' on' : '');
                star.title = s.favorite ? t('libUnfavorite') : t('libFavorite');
            }
        });
    }

    function deleteOne(id) {
        root.__lyricexDialog.confirm(t('libConfirmDelete'), { danger: true }).then(function (ok) {
            if (!ok) return;
            LIB.deleteSongs([id]).then(function () {
                refresh();
            });
        });
    }

    // ---------------- detail ----------------
    function openDetail(id) {
        LIB.getSong(id).then(function (rec) {
            if (!rec) return;
            var pls = [];
            LIB.getPlaylists().then(function (all) {
                pls = all.filter(function (p) {
                    return p.songIds.indexOf(id) !== -1;
                });
                var cover = rec.coverBlob
                    ? '<img class="lib-detail-cover" src="' + coverUrl(rec) + '" alt="" />'
                    : '<div class="lib-cover lib-cover-placeholder lib-detail-cover"><i class="fas fa-music"></i></div>';
                var rows = [
                    [t('libFieldTitle'), rec.title],
                    [t('libFieldArtist'), rec.artist],
                    [t('libFieldAlbum'), rec.album],
                    [t('libFieldGenre'), rec.genre],
                    [t('libFieldYear'), rec.year],
                    [t('libFieldTrack'), rec.track],
                    [t('libFieldDuration'), rec.duration ? fmtDuration(rec.duration) : '--:--'],
                    [t('libFieldFormat'), rec.format === 'zip' ? 'ZIP 歌词包' : '音频'],
                    [t('libFieldPath'), rec.path],
                    [t('libFieldAdded'), new Date(rec.addedAt).toLocaleString()],
                    [t('libPlays'), String(rec.playCount || 0)]
                ]
                    .map(function (r) {
                        return (
                            '<div class="lib-detail-row"><span class="lib-detail-label">' +
                            esc(r[0]) +
                            '</span><span class="lib-detail-value">' +
                            esc(r[1] || '—') +
                            '</span></div>'
                        );
                    })
                    .join('');
                var playlists = pls.length
                    ? '<div class="lib-detail-row"><span class="lib-detail-label">' +
                      esc(t('libInPlaylists')) +
                      '</span><span class="lib-detail-value">' +
                      esc(
                          pls
                              .map(function (p) {
                                  return p.name;
                              })
                              .join('、')
                      ) +
                      '</span></div>'
                    : '';
                var lyrics = rec.lyricLines ? JSON.parse(rec.lyricLines) : [];
                var lyricPreview = lyrics.length
                    ? lyrics
                          .slice(0, 12)
                          .map(function (l) {
                              return esc(l.text || '');
                          })
                          .join('<br>')
                    : '<span class="lib-no-lyrics">' + esc(t('libNoLyrics')) + '</span>';
                if (el) {
                    var body = el.querySelector('#libBody');
                    body.innerHTML =
                        '<div class="lib-detail">' +
                        '<button class="close-btn" data-action="detail-back"><i class="fas fa-arrow-left"></i> ' +
                        esc(t('libBack')) +
                        '</button>' +
                        '<div class="lib-detail-head">' +
                        cover +
                        '<div class="lib-detail-head-meta"><div class="lib-detail-title">' +
                        esc(rec.title || t('unknownSong')) +
                        '</div>' +
                        '<div class="lib-detail-sub">' +
                        esc(rec.artist || t('libUnknownArtist')) +
                        (rec.album ? ' · ' + esc(rec.album) : '') +
                        '</div></div></div>' +
                        '<div class="lib-detail-grid">' +
                        rows +
                        playlists +
                        '</div>' +
                        '<div class="lib-detail-lyrics"><h4>' +
                        esc(t('libLyrics')) +
                        '</h4><div class="lib-detail-lyrics-body">' +
                        lyricPreview +
                        '</div></div>' +
                        '</div>';
                }
            });
        });
    }

    // ---------------- edit ----------------
    function openEdit(id) {
        var s = state.songs.find(function (x) {
            return x.id === id;
        });
        if (!s) return;
        var overlay = root.document.createElement('div');
        overlay.className = 'library-overlay open';
        overlay.innerHTML =
            '<div class="library-modal library-edit-modal">' +
            '<h4><i class="fas fa-pen"></i> ' +
            esc(t('libEditTitle')) +
            '</h4>' +
            ['title', 'artist', 'album', 'genre', 'year', 'track', 'tags']
                .map(function (f) {
                    var label = {
                        title: t('libFieldTitle'),
                        artist: t('libFieldArtist'),
                        album: t('libFieldAlbum'),
                        genre: t('libFieldGenre'),
                        year: t('libFieldYear'),
                        track: t('libFieldTrack'),
                        tags: t('libFieldTags')
                    }[f];
                    var val = f === 'tags' ? (s.tags || []).join(', ') : String(s[f] || '');
                    return (
                        '<label class="lib-edit-field"><span>' +
                        esc(label) +
                        '</span><input type="text" name="' +
                        f +
                        '" value="' +
                        esc(val) +
                        '" /></label>'
                    );
                })
                .join('') +
            '<label class="lib-edit-field lib-edit-check"><input type="checkbox" name="favorite"' +
            (s.favorite ? ' checked' : '') +
            ' /> <span>' +
            esc(t('libFavorite')) +
            '</span></label>' +
            '<div class="library-footer"><button class="close-btn dialog-primary" id="libEditSave">' +
            esc(t('dialogOk')) +
            '</button>' +
            '<button class="close-btn" id="libEditCancel">' +
            esc(t('dialogCancel')) +
            '</button></div></div>';
        root.document.body.appendChild(overlay);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
        var inputs = overlay.querySelectorAll('input[name]');
        overlay.querySelector('#libEditCancel').addEventListener('click', function () {
            overlay.remove();
        });
        overlay.querySelector('#libEditSave').addEventListener('click', function () {
            var patch = {};
            inputs.forEach(function (inp) {
                if (inp.name === 'favorite') patch.favorite = inp.checked;
                else if (inp.name === 'tags')
                    patch.tags = inp.value
                        .split(/[,，]/)
                        .map(function (x) {
                            return x.trim();
                        })
                        .filter(Boolean);
                else patch[inp.name] = inp.value.trim();
            });
            LIB.updateSong(id, patch).then(function () {
                overlay.remove();
                Object.keys(patch).forEach(function (k) {
                    s[k] = patch[k];
                });
                renderBody();
            });
        });
    }

    // ---------------- playlist picker / manage ----------------
    function openPlaylistPicker(id) {
        LIB.getPlaylists().then(function (pls) {
            var overlay = root.document.createElement('div');
            overlay.className = 'library-overlay open';
            var listHTML = pls.length
                ? pls
                      .map(function (p) {
                          var inPl = p.songIds.indexOf(id) !== -1;
                          return (
                              '<button class="lib-pl-pick' +
                              (inPl ? ' in' : '') +
                              '" data-pl="' +
                              p.id +
                              '">' +
                              esc(p.name) +
                              ' <span>' +
                              p.songIds.length +
                              ' ' +
                              esc(t('libSongs')) +
                              (inPl ? ' ✓' : '') +
                              '</span></button>'
                          );
                      })
                      .join('')
                : '<div class="library-status">' + esc(t('libNoPlaylists')) + '</div>';
            overlay.innerHTML =
                '<div class="library-modal">' +
                '<h4><i class="fas fa-list"></i> ' +
                esc(t('libAddToPlaylist')) +
                '</h4>' +
                '<div class="lib-pl-pick-list">' +
                listHTML +
                '</div>' +
                '<div class="lib-pl-new-row"><input type="text" id="libPlNewName" placeholder="' +
                esc(t('libNewPlaylist')) +
                '" /><button class="close-btn" id="libPlNewBtn">' +
                esc(t('libCreate')) +
                '</button></div>' +
                '<div class="library-footer"><button class="close-btn" id="libPlDone">' +
                esc(t('dialogOk')) +
                '</button></div></div>';
            root.document.body.appendChild(overlay);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) overlay.remove();
            });
            overlay.querySelector('#libPlDone').addEventListener('click', function () {
                overlay.remove();
            });
            overlay.querySelector('#libPlNewBtn').addEventListener('click', function () {
                var name = overlay.querySelector('#libPlNewName').value.trim();
                if (!name) return;
                LIB.createPlaylist(name).then(function (plId) {
                    LIB.playlistAdd(plId, [id]).then(function () {
                        overlay.remove();
                        refresh();
                    });
                });
            });
            overlay.querySelectorAll('.lib-pl-pick').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var plId = Number(btn.dataset.pl);
                    var pl = pls.find(function (p) {
                        return p.id === plId;
                    });
                    var next =
                        pl.songIds.indexOf(id) !== -1
                            ? pl.songIds.filter(function (x) {
                                  return x !== id;
                              })
                            : pl.songIds.concat([id]);
                    LIB.playlistAdd(plId, next).then(function () {
                        overlay.remove();
                        refresh();
                    });
                });
            });
        });
    }

    function promptNewPlaylist() {
        root.__lyricexDialog.prompt(t('libPlaylistName')).then(function (name) {
            if (!name || !name.trim()) return;
            LIB.createPlaylist(name.trim()).then(function () {
                render();
            });
        });
    }

    function openPlaylist(id) {
        state.activePlaylistId = id;
        render();
    }

    function renamePlaylist(id) {
        LIB.getPlaylists().then(function (pls) {
            var pl = pls.find(function (p) {
                return p.id === id;
            });
            if (!pl) return;
            root.__lyricexDialog.prompt(t('libPlaylistName'), pl.name).then(function (name) {
                if (!name || !name.trim() || name === pl.name) return;
                LIB.renamePlaylist(id, name.trim()).then(function () {
                    render();
                });
            });
        });
    }

    function deletePlaylist(id) {
        root.__lyricexDialog.confirm(t('libConfirmPlaylistDelete'), { danger: true }).then(function (ok) {
            if (!ok) return;
            LIB.deletePlaylist(id).then(function () {
                render();
            });
        });
    }

    // ---------------- import ----------------
    function importFolder() {
        if (root.window && root.window.showDirectoryPicker) {
            root.window
                .showDirectoryPicker({ mode: 'read' })
                .then(function (handle) {
                    return collectDir(handle, '').then(function (entries) {
                        runImport(entries);
                    });
                })
                .catch(function (err) {
                    if (err && err.name === 'AbortError') return; // user cancelled
                    // fall back to the folder input if the picker is unavailable
                    var input = el && el.querySelector('#libDirInput');
                    if (input) input.click();
                });
            return;
        }
        var input = el && el.querySelector('#libDirInput');
        if (input) input.click();
    }

    function collectDir(handle, prefix) {
        var entries = [];
        return (async function walk(dirHandle, base) {
            try {
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file') {
                        const f = await entry.getFile();
                        const path = base + '/' + f.name;
                        if (/\.(zip|mp3|flac|m4a|ogg|wav)$/i.test(f.name)) entries.push({ file: f, path: path });
                    } else if (entry.kind === 'directory') {
                        await walk(entry, base + '/' + entry.name);
                    }
                }
            } catch (_) {
                /* permission or IO error on a subtree — skip it */
            }
        })(handle, prefix).then(function () {
            return entries;
        });
    }

    function importFiles(fileList) {
        var files = Array.prototype.slice.call(fileList || []);
        var entries = files.map(function (f) {
            return { file: f, path: f.webkitRelativePath || f.name };
        });
        runImport(entries);
    }

    function runImport(entries) {
        if (!entries.length) return;
        var body = el && el.querySelector('#libBody');
        if (body) body.innerHTML = '<div class="library-status" id="libStatus">' + esc(t('libImporting')) + '</div>';
        LIB.addEntries(entries, function (p) {
            if (body) {
                var s = body.querySelector('#libStatus');
                if (s)
                    s.textContent =
                        t('libImporting') +
                        ' ' +
                        p.done +
                        '/' +
                        p.total +
                        ' · ' +
                        p.name +
                        (p.reason ? ' (' + p.reason + ')' : '');
            }
        }).then(function (res) {
            refresh().then(function () {
                root.__lyricexDialog.alert(
                    t('libImportDone') +
                        '：' +
                        t('libAdded') +
                        ' ' +
                        res.added +
                        '，' +
                        t('libSkipped') +
                        ' ' +
                        res.skipped
                );
            });
        });
    }

    // ---------------- refresh ----------------
    function refresh() {
        return LIB.listSongs().then(function (songs) {
            state.songs = songs;
            state.loaded = PAGE;
            if (el) {
                var sel = el.querySelector('#libFilterArtist');
                updateFacetSelect(sel, facetValues('artist'), t('libAllArtists'));
                updateFacetSelect(el.querySelector('#libFilterAlbum'), facetValues('album'), t('libAllAlbums'));
                updateFacetSelect(el.querySelector('#libFilterGenre'), facetValues('genre'), t('libAllGenres'));
                updateFacetSelect(el.querySelector('#libFilterYear'), facetValues('year'), t('libAllYears'));
                updateFacetSelect(el.querySelector('#libFilterTag'), facetValues('tags'), t('libAllTags'));
                // restore filter selection (values come from the selects themselves, no injection surface)
                ['artist', 'album', 'genre', 'year', 'tag'].forEach(function (k) {
                    var selEl = el.querySelector('#libFilter' + cap(k));
                    if (selEl && state.filters[k]) selEl.value = state.filters[k];
                });
                revokeCovers();
                renderBody();
            }
        });
    }

    root.__lyricexLibraryUI = { render: render, refresh: refresh };
})(typeof window !== 'undefined' ? window : globalThis);
