/* LyricEx v2.9.4 – local song library (IndexedDB + import pipeline).
   Stores songs (audio blob + metadata + lyrics text/lines), playlists and a
   meta store. Import: addEntries() consumes [{ file, path }] (folder picker /
   webkitdirectory produce these), extracts metadata via __lyricexMetadata +
   JSZip (zip lyric packs) or plain ID3 (bare audio), dedupes by file and by
   song, and writes in bulk with a progress callback.
   List operations return metadata WITHOUT the audio blob; getSong(id) fetches
   the full record (blob included) for playback. */
(function (root) {
    'use strict';
    var DB_NAME = 'lyricex-library',
        VERSION = 1;
    var SONGS = 'songs',
        PLAYLISTS = 'playlists',
        META = 'meta';
    var g = {};
    var dbPromise = null;

    function idb() {
        return typeof indexedDB === 'undefined' ? null : indexedDB;
    }

    function open() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise(function (resolve, reject) {
            var db = idb();
            if (!db) {
                reject(new Error('IndexedDB unavailable'));
                return;
            }
            var req = db.open(DB_NAME, VERSION);
            req.onupgradeneeded = function () {
                if (!req.result.objectStoreNames.contains(SONGS))
                    req.result.createObjectStore(SONGS, { keyPath: 'id', autoIncrement: true });
                if (!req.result.objectStoreNames.contains(PLAYLISTS))
                    req.result.createObjectStore(PLAYLISTS, { keyPath: 'id', autoIncrement: true });
                if (!req.result.objectStoreNames.contains(META)) req.result.createObjectStore(META, { keyPath: 'key' });
            };
            req.onsuccess = function () {
                resolve(req.result);
            };
            req.onerror = function () {
                reject(req.error);
            };
        });
        return dbPromise;
    }

    function store(db, name, mode) {
        return db.transaction(name, mode).objectStore(name);
    }

    function reqP(req) {
        return new Promise(function (resolve, reject) {
            req.onsuccess = function () {
                resolve(req.result);
            };
            req.onerror = function () {
                reject(req.error);
            };
        });
    }

    // Strip the heavy audio blob out of a record for list payloads.
    function slim(rec) {
        if (!rec) return rec;
        var out = {};
        Object.keys(rec).forEach(function (k) {
            if (k !== 'audioBlob') out[k] = rec[k];
        });
        return out;
    }

    // ---------------- songs ----------------
    g.addSongs = function (records) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(SONGS, 'readwrite');
                var ids = [];
                records.forEach(function (r) {
                    var req = tx.objectStore(SONGS).add(r);
                    req.onsuccess = function () {
                        ids.push(req.result);
                    };
                });
                tx.oncomplete = function () {
                    resolve(ids);
                };
                tx.onerror = function () {
                    reject(tx.error);
                };
            });
        });
    };

    g.listSongs = function () {
        return open().then(function (db) {
            return reqP(store(db, SONGS, 'readonly').getAll()).then(function (all) {
                return (all || []).map(slim);
            });
        });
    };

    g.getSong = function (id) {
        return open().then(function (db) {
            return reqP(store(db, SONGS, 'readonly').get(id));
        });
    };

    g.updateSong = function (id, patch) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var s = store(db, SONGS, 'readwrite');
                var getReq = s.get(id);
                getReq.onsuccess = function () {
                    var rec = getReq.result;
                    if (!rec) {
                        resolve(false);
                        return;
                    }
                    Object.keys(patch || {}).forEach(function (k) {
                        rec[k] = patch[k];
                    });
                    var putReq = s.put(rec);
                    putReq.onsuccess = function () {
                        resolve(true);
                    };
                    putReq.onerror = function () {
                        reject(putReq.error);
                    };
                };
                getReq.onerror = function () {
                    reject(getReq.error);
                };
            });
        });
    };

    g.deleteSongs = function (ids) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var s = store(db, SONGS, 'readwrite');
                ids.forEach(function (id) {
                    s.delete(id);
                });
                s.transaction.oncomplete = function () {
                    resolve();
                };
                s.transaction.onerror = function () {
                    reject(s.transaction.error);
                };
            });
        });
    };

    g.recordPlay = function (id) {
        return open().then(function (db) {
            return new Promise(function (resolve) {
                var s = store(db, SONGS, 'readwrite');
                var getReq = s.get(id);
                getReq.onsuccess = function () {
                    var rec = getReq.result;
                    if (!rec) {
                        resolve();
                        return;
                    }
                    rec.playCount = (Number(rec.playCount) || 0) + 1;
                    rec.lastPlayedAt = Date.now();
                    s.put(rec);
                    s.transaction.oncomplete = function () {
                        resolve();
                    };
                    s.transaction.onerror = function () {
                        resolve();
                    };
                };
                getReq.onerror = function () {
                    resolve();
                };
            });
        });
    };

    g.clearSongs = function () {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(SONGS, 'readwrite');
                tx.objectStore(SONGS).clear();
                tx.oncomplete = function () {
                    resolve();
                };
                tx.onerror = function () {
                    reject(tx.error);
                };
            });
        });
    };

    // ---------------- playlists ----------------
    g.getPlaylists = function () {
        return open().then(function (db) {
            return reqP(store(db, PLAYLISTS, 'readonly').getAll());
        });
    };

    g.createPlaylist = function (name) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var now = Date.now();
                var req = store(db, PLAYLISTS, 'readwrite').add({
                    name: name,
                    songIds: [],
                    createdAt: now,
                    updatedAt: now
                });
                req.onsuccess = function () {
                    resolve(req.result);
                };
                req.onerror = function () {
                    reject(req.error);
                };
            });
        });
    };

    g.renamePlaylist = function (id, name) {
        return g.updatePlaylist(id, { name: name });
    };

    g.deletePlaylist = function (id) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var req = store(db, PLAYLISTS, 'readwrite').delete(id);
                req.onsuccess = function () {
                    resolve();
                };
                req.onerror = function () {
                    reject(req.error);
                };
            });
        });
    };

    g.playlistAdd = function (id, songIds) {
        return g.updatePlaylist(id, { songIds: songIds });
    };

    g.updatePlaylist = function (id, patch) {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var s = store(db, PLAYLISTS, 'readwrite');
                var getReq = s.get(id);
                getReq.onsuccess = function () {
                    var rec = getReq.result;
                    if (!rec) {
                        resolve(false);
                        return;
                    }
                    Object.keys(patch || {}).forEach(function (k) {
                        rec[k] = patch[k];
                    });
                    rec.updatedAt = Date.now();
                    var putReq = s.put(rec);
                    putReq.onsuccess = function () {
                        resolve(true);
                    };
                    putReq.onerror = function () {
                        reject(putReq.error);
                    };
                };
                getReq.onerror = function () {
                    reject(getReq.error);
                };
            });
        });
    };

    // ---------------- import pipeline ----------------
    // Extract a song record from one zip lyric pack (JSZip must be loaded).
    async function fromZip(file) {
        var JSZip = root.JSZip;
        if (!JSZip) return null;
        var zip = await JSZip.loadAsync(file);
        var audioEntry = null,
            coverEntry = null,
            manifestEntry = null,
            legacyJsonEntry = null,
            lrcEntry = null;
        Object.keys(zip.files).forEach(function (name) {
            var entry = zip.files[name];
            if (entry.dir) return;
            var lower = name.toLowerCase();
            if (lower.endsWith('.mp3')) {
                if (!/inst|off.?vocal|karaoke|伴奏|instrumental/i.test(name) && !audioEntry) audioEntry = entry;
            } else if (/(\.jpg|\.jpeg|\.png|\.webp)$/i.test(name) && !coverEntry) coverEntry = entry;
            else if (lower === 'manifest.json') manifestEntry = entry;
            else if (lower.endsWith('song.json') && !legacyJsonEntry) legacyJsonEntry = entry;
            else if (lower.endsWith('.lrc') && !lrcEntry) lrcEntry = entry;
        });
        var audioBlob = audioEntry ? await audioEntry.async('blob') : null;
        var coverBlob = coverEntry ? await coverEntry.async('blob') : null;
        var manifestText = manifestEntry ? await manifestEntry.async('text') : null;
        var legacyText = legacyJsonEntry ? await legacyJsonEntry.async('text') : null;
        var lrcText = lrcEntry ? await lrcEntry.async('text') : null;
        var title = '',
            artist = '',
            album = '',
            lyrics = [],
            lyricOffset = 0,
            sourceFormat = '';
        if (manifestText) {
            try {
                var manifest = JSON.parse(manifestText);
                var lyricsName = manifest.lyricsFile || '';
                var lyricsEntry = lyricsName ? zip.files[lyricsName] : null;
                if (!lyricsEntry) {
                    var jsonName = Object.keys(zip.files).find(function (n) {
                        return (
                            !zip.files[n].dir &&
                            n.toLowerCase().endsWith('.json') &&
                            n.toLowerCase() !== 'manifest.json'
                        );
                    });
                    lyricsEntry = jsonName ? zip.files[jsonName] : null;
                }
                var lyricsData = null;
                if (lyricsEntry) lyricsData = JSON.parse(await lyricsEntry.async('text'));
                title = manifest.title || '';
                artist = manifest.artist || '';
                album = manifest.album || '';
                lyrics = (lyricsData && lyricsData.lyrics) || [];
                lyricOffset = Number(manifest.config && manifest.config.lyricOffset) || 0;
                sourceFormat = 'lyricex-package';
            } catch (_) {
                /* malformed manifest → treat as unknown */
            }
        } else if (legacyText) {
            try {
                var legacy = JSON.parse(legacyText);
                title = legacy.title || '';
                lyrics = legacy.lyrics || [];
                lyricOffset = Number(legacy.config && legacy.config.lyricOffset) || 0;
                sourceFormat = 'legacy';
            } catch (_) {
                /* ignore */
            }
        } else if (lrcText && root.__lyricexUtils && root.__lyricexUtils.parseLRC) {
            try {
                var p = root.__lyricexUtils.parseLRC(lrcText);
                title = p.title || '';
                artist = p.artist || '';
                lyrics = p.lines || [];
                sourceFormat = 'lrc';
            } catch (_) {
                /* ignore */
            }
        }
        return {
            title: title || file.name.replace(/\.zip$/i, '').trim(),
            artist: artist,
            album: album,
            lyrics: lyrics,
            lyricOffset: lyricOffset,
            audioBlob: audioBlob,
            coverBlob: coverBlob,
            sourceFormat: sourceFormat
        };
    }

    // Build a song record from a bare audio file via ID3 (+ MP3 duration estimate).
    function fromAudio(file) {
        return file.arrayBuffer().then(function (buf) {
            var u8 = new Uint8Array(buf);
            var meta = root.__lyricexMetadata.parseId3(u8);
            var duration = meta.durationMs ? meta.durationMs / 1000 : null;
            if (!duration && /\.mp3$/i.test(file.name)) duration = root.__lyricexMetadata.estimateMp3Duration(u8);
            var coverBlob = null,
                coverType = '';
            if (meta.cover && meta.cover.data && meta.cover.data.length) {
                coverType = meta.cover.type || 'image/jpeg';
                coverBlob = new Blob([meta.cover.data], { type: coverType });
            }
            return {
                title: meta.title || file.name.replace(/\.[^.]+$/, '').trim(),
                artist: meta.artist || '',
                album: meta.album || '',
                genre: meta.genre || '',
                year: meta.year || '',
                track: meta.track || '',
                duration: duration,
                audioBlob: file,
                coverBlob: coverBlob,
                coverType: coverType,
                sourceFormat: ''
            };
        });
    }

    // addEntries([{ file, path }]) → extract, dedupe, store; onProgress({done,total,name,added,skipped,reason}).
    g.addEntries = function (entries, onProgress) {
        (root.__lyricexLog || { info: function () {} }).info('library-db', 'importing', entries.length, 'entries');
        return g.listSongs().then(function (existing) {
            var fileKeys = {},
                songKeys = {};
            existing.forEach(function (s) {
                if (s.dedupeFile) fileKeys[s.dedupeFile] = true;
                if (s.dedupeSong) songKeys[s.dedupeSong] = true;
            });
            var added = 0,
                skipped = 0,
                total = entries.length,
                done = 0;
            var records = [];
            var M = root.__lyricexMetadata;
            function progress(name, reason) {
                done++;
                if (reason) skipped++;
                else added++;
                if (onProgress)
                    onProgress({
                        done: done,
                        total: total,
                        name: name,
                        added: added,
                        skipped: skipped,
                        reason: reason || null
                    });
            }
            var chain = Promise.resolve();
            entries.forEach(function (entry) {
                chain = chain.then(function () {
                    var file = entry.file,
                        path = entry.path || file.name || '';
                    var lower = (file.name || '').toLowerCase();
                    var extractor = lower.endsWith('.zip')
                        ? fromZip(file)
                        : /\.(mp3|flac|m4a|ogg|wav)$/i.test(lower)
                          ? fromAudio(file)
                          : Promise.resolve(null);
                    return extractor
                        .then(function (part) {
                            if (!part) {
                                progress(file.name, 'unsupported');
                                return;
                            }
                            var fk = M.fileKey(path, file.size);
                            var sk = M.songKey(part.title, part.artist);
                            if (fileKeys[fk] || songKeys[sk]) {
                                progress(file.name, 'duplicate');
                                return;
                            }
                            fileKeys[fk] = true;
                            songKeys[sk] = true;
                            var lines = part.lyrics || [];
                            var lyricsText = lines
                                .map(function (l) {
                                    return l.text || '';
                                })
                                .join('\n');
                            records.push({
                                title: part.title || '',
                                artist: part.artist || '',
                                album: part.album || '',
                                genre: part.genre || '',
                                year: part.year || '',
                                track: part.track || '',
                                duration: part.duration != null ? Number(part.duration) : null,
                                format: lower.endsWith('.zip') ? 'zip' : 'audio',
                                fileName: file.name,
                                path: path,
                                fileSize: file.size,
                                coverType: part.coverType || '',
                                coverBlob: part.coverBlob || null,
                                audioBlob: part.audioBlob || file,
                                audioType: part.audioBlob
                                    ? part.audioBlob.type || 'audio/mpeg'
                                    : file.type || 'audio/mpeg',
                                lyricsText: lyricsText,
                                lyricLines: JSON.stringify(lines),
                                lyricOffset: part.lyricOffset || 0,
                                hasLyrics: lines.length > 0,
                                sourceFormat: part.sourceFormat || '',
                                dedupeFile: fk,
                                dedupeSong: sk,
                                addedAt: Date.now(),
                                playCount: 0,
                                lastPlayedAt: null,
                                favorite: false,
                                tags: []
                            });
                            progress(file.name, null);
                        })
                        .catch(function (err) {
                            (root.__lyricexLog || { error: function () {} }).error(
                                'library-db',
                                'import entry failed',
                                entry.path,
                                err && err.message
                            );
                            progress(file.name, 'error');
                        });
                });
            });
            return chain.then(function () {
                if (!records.length) return { addedIds: [], added: 0, skipped: skipped, total: total };
                return g.addSongs(records).then(function (ids) {
                    return { addedIds: ids, added: ids.length, skipped: skipped, total: total };
                });
            });
        });
    };

    root.__lyricexLibrary = g;
})(typeof window !== 'undefined' ? window : globalThis);
