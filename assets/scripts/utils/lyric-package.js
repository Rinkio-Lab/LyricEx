/* LyricEx v2.6.0 – lyric-package assembler (format v2.1). Pure; no DOM.
   Centralizes building the manifest + lyrics.json payload that BOTH the editor
   export and the workspace "build package" flow write, so the format spec
   lives in one place. version stays 2 (v2.1 = optional additive fields only;
   v2.0 loaders ignore them — see FORMAT.md).
   Nothing here touches JSZip or the network: callers fetch the audio blobs
   themselves and feed them to their own zip writer. */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};

    var AUDIO_EXTS = ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'];

    // Sanitize a user-supplied file name to a safe zip entry name
    // (basename only, no path traversal, ASCII-ish-safe, keep extension).
    u.sanitizeMediaName = function (name, fallback, ext) {
        var base = String(name == null ? '' : name).split(/[\\/]/).pop();
        base = (base || '').replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff\u3040-\u30ff]/g, '_').trim();
        if (!base) base = fallback;
        // force the canonical extension when the caller knows the media type
        if (ext) base = base.replace(/\.[^.]+$/, '') + '.' + ext;
        return base;
    };

    // Extracts the real extension from a media entry name (lowercased), or ''.
    u.mediaExt = function (name) {
        var m = /\.([a-z0-9]{2,5})$/i.exec(String(name || ''));
        if (!m) return '';
        var e = m[1].toLowerCase();
        return AUDIO_EXTS.indexOf(e) !== -1 ? e : '';
    };

    // Bake the global offset into line times (export semantics: offset applied
    // once at export, config.lyricOffset written as 0 so it never double-applies).
    u.bakeLyricTimes = function (lyrics, offset) {
        offset = Number(offset) || 0;
        return lyrics.map(function (l) {
            var c = Object.assign({}, l);
            c.time = Math.round((l.time - offset) * 1000) / 1000;
            return c;
        });
    };

    // Build a v2.1 manifest object. opts:
    //   title, artist, album, lyricsFile, audioName, instrumentalName, coverName,
    //   convertedFrom, analysisModel
    // audioName/instrumentalName/coverName are the ZIP ENTRY names (sanitized);
    // they're recorded verbatim so a loader can re-find them case-insensitively.
    u.buildManifest = function (opts) {
        opts = opts || {};
        var manifest = {
            format: 'lyricex-package',
            version: 2,
            title: opts.title || 'unknown',
            artist: opts.artist || '',
            album: opts.album || '',
            audio: opts.audioName ? 'assets/' + opts.audioName : null,
            instrumental: opts.instrumentalName ? 'assets/' + opts.instrumentalName : null,
            cover: opts.coverName ? 'assets/' + opts.coverName : null,
            lyricsFile: opts.lyricsFile || 'lyrics.json',
            config: { lyricOffset: 0 },
            convertedFrom: opts.convertedFrom || null
        };
        // v2.1 additive fields (optional; old loaders ignore)
        if (opts.audioName) manifest.audioFileName = opts.audioName;
        if (opts.instrumentalName) manifest.instrumentalFileName = opts.instrumentalName;
        if (opts.analysisModel) manifest.config.analysisModel = opts.analysisModel;
        return manifest;
    };

    // Full lyrics.json payload (v2): { lyrics: bakedLines }
    u.buildLyricsPayload = function (lyrics, offset) {
        return { lyrics: u.bakeLyricTimes(lyrics, offset) };
    };
})(typeof window !== 'undefined' ? window : globalThis);
