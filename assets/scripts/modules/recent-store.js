/* LyricEx v2.0.0 – recent-packages store (IndexedDB).
   Stores the opened package as a Blob + metadata so "最近打开" can re-open it
   offline with one click. Ordering/dedup/trim is delegated to js/utils/recent.js
   (pure, unit-tested); this module is only the async I/O + the cap eviction. */
(function (root) {
    'use strict';
    var DB_NAME = 'lyricex', STORE = 'recent', VERSION = 1;
    var CAP = 10;
    var dbPromise = null;
    var g = {};

    function idb() {
        return typeof indexedDB === 'undefined' ? null : indexedDB;
    }

    function open() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise(function (resolve, reject) {
            var db = idb();
            if (!db) { reject(new Error('IndexedDB unavailable')); return; }
            var req = db.open(DB_NAME, VERSION);
            req.onupgradeneeded = function () {
                if (!req.result.objectStoreNames.contains(STORE)) {
                    req.result.createObjectStore(STORE, { keyPath: 'name' });
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
        return dbPromise;
    }

    function tx(db, mode) { return db.transaction(STORE, mode).objectStore(STORE); }

    // Save an opened package (File/Blob) keyed by name, newest-first eviction.
    g.save = function (name, blob) {
        if (!blob) return Promise.resolve();
        return open().then(function (db) {
            return new Promise(function (resolve) {
                var req = tx(db, 'readwrite').put({ name: name, blob: blob, ts: Date.now(), size: blob.size || 0 });
                req.onsuccess = function () { resolve(); };
                req.onerror = function () { resolve(); }; // storage full etc. — non-fatal
            });
        }).then(function () { return g.pruneToCap(); });
    };

    // List recent entries (metadata only), newest first.
    g.list = function () {
        return open().then(function (db) {
            return new Promise(function (resolve) {
                var req = tx(db, 'readonly').getAll();
                req.onsuccess = function () { resolve(req.result || []); };
                req.onerror = function () { resolve([]); };
            });
        });
    };

    // Fetch one entry's blob by name (for re-open).
    g.get = function (name) {
        return open().then(function (db) {
            return new Promise(function (resolve) {
                var req = tx(db, 'readonly').get(name);
                req.onsuccess = function () { resolve(req.result || null); };
                req.onerror = function () { resolve(null); };
            });
        });
    };

    g.remove = function (name) {
        return open().then(function (db) {
            return new Promise(function (resolve) {
                var req = tx(db, 'readwrite').delete(name);
                req.onsuccess = function () { resolve(); };
                req.onerror = function () { resolve(); };
            });
        });
    };

    // Keep at most CAP entries, newest-first, de-duped by name.
    g.pruneToCap = function () {
        return g.list().then(function (all) {
            var keep = root.__lyricexUtils.pruneRecent(all, CAP);
            var keepNames = {};
            keep.forEach(function (e) { keepNames[e.name] = true; });
            var drops = (all || []).filter(function (e) { return !keepNames[e.name]; });
            return Promise.all(drops.map(function (e) { return g.remove(e.name); }));
        });
    };

    root.__lyricexRecent = g;
})(typeof window !== 'undefined' ? window : globalThis);
