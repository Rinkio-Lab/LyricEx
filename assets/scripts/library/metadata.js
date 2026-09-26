/* LyricEx v2.9.4 – library metadata helpers (pure, unit-testable).
   ID3v2.2/2.3/2.4 text + APIC frame parsing, a coarse MP3 duration estimate
   (CBR, first-frame scan), normalization + dedupe keys, and search / filter /
   sort / facet helpers for the local song library.
   Browser-only concerns (zip extraction via JSZip, IndexedDB) live in
   library-db.js; this file has no DOM or async I/O. */
(function (root) {
    'use strict';

    function norm(s) {
        return String(s == null ? '' : s).toLowerCase().trim();
    }

    // Decode an ID3 text frame payload: leading byte selects the charset
    // (0 = ISO-8859-1, 1 = UTF-16 with BOM, 2 = UTF-16BE, 3 = UTF-8).
    function decodeText(bytes, offset) {
        if (offset >= bytes.length) return '';
        const enc = bytes[offset];
        const body = bytes.subarray(offset + 1);
        if (enc === 1 || enc === 2) {
            let raw = body;
            if (body.length >= 2 && ((body[0] === 0xff && body[1] === 0xfe) ||
                (body[0] === 0xfe && body[1] === 0xff))) raw = body.subarray(2);
            try {
                return new TextDecoder(enc === 2 ? 'utf-16be' : 'utf-16le').decode(raw).split('\u0000').join('');
            } catch (_) { return ''; }
        }
        if (enc === 3) {
            try { return new TextDecoder('utf-8').decode(body).split('\u0000').join(''); }
            catch (_) { return ''; }
        }
        // enc 0: ISO-8859-1 → keep code points (Latin-1 is a single-byte map)
        let s = '';
        for (let i = 0; i < body.length; i++) s += String.fromCharCode(body[i]);
        return s;
    }

    // ID3v2 sync-safe integer (4 bytes, 7 bits each)
    function syncSafe(u8, off) {
        return ((u8[off] & 0x7f) << 21) | ((u8[off + 1] & 0x7f) << 14) |
            ((u8[off + 2] & 0x7f) << 7) | (u8[off + 3] & 0x7f);
    }

    // APIC frame layout: [enc 1b][mime null-term][pictureType 1b][desc null-term][image]
    function apicMime(frame) {
        let i = 1;
        while (i < frame.length && frame[i] !== 0) i++;
        let s = '';
        for (let j = 1; j < i; j++) s += String.fromCharCode(frame[j]);
        return s;
    }
    function apicDataStart(frame) {
        let i = 1;
        while (i < frame.length && frame[i] !== 0) i++;
        i++; // picture type
        while (i < frame.length && frame[i] !== 0) i++;
        return i + 1;
    }

    // Parse an ID3v2 tag buffer → metadata (empty object when not an ID3 tag).
    function parseId3(u8) {
        if (!u8 || u8.length < 10) return {};
        if (u8[0] !== 0x49 || u8[1] !== 0x44 || u8[2] !== 0x33) return {}; // 'ID3'
        const ver = u8[3];
        const tagSize = syncSafe(u8, 6);
        const end = Math.min(u8.length, 10 + tagSize);
        const out = {};
        let p = 10;
        while (p + 10 <= end) {
            const id = String.fromCharCode(u8[p], u8[p + 1], u8[p + 2], u8[p + 3]);
            const size = ver === 4 ? syncSafe(u8, p + 4) :
                ((u8[p + 4] << 24) | (u8[p + 5] << 16) | (u8[p + 6] << 8) | u8[p + 7]) >>> 0;
            p += 10;
            if (p + size > end) break;
            const frame = u8.subarray(p, p + size);
            p += size;
            if (id === 'TIT2') out.title = decodeText(frame, 0);
            else if (id === 'TPE1') out.artist = decodeText(frame, 0);
            else if (id === 'TALB') out.album = decodeText(frame, 0);
            else if (id === 'TCON') out.genre = decodeText(frame, 0);
            else if (id === 'TYER' || id === 'TDRC') out.year = decodeText(frame, 0).slice(0, 4);
            else if (id === 'TRCK') out.track = decodeText(frame, 0);
            else if (id === 'TLEN') {
                const n = parseInt(decodeText(frame, 0), 10);
                if (n) out.durationMs = n;
            } else if (id === 'APIC') {
                const mime = apicMime(frame);
                const dataStart = apicDataStart(frame);
                if (dataStart < frame.length) out.cover = { type: mime, data: frame.subarray(dataStart) };
            }
        }
        return out;
    }

    // Coarse MP3 duration estimate: find the first valid MPEG frame header
    // (sync 0xFFEx) and divide file size by its bitrate. CBR assumption only;
    // VBR (Xing/Info header) and streaming sizes are skipped → null.
    // ponytail: estimate only, replaced by audio.duration once the song plays.
    function estimateMp3Duration(u8) {
        // MPEG1 Layer III bitrate table (kbps) by bitrate index
        const rates = [null, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, null];
        const limit = Math.min(u8.length, 65536);
        for (let i = 0; i + 4 <= limit; i++) {
            if (u8[i] === 0xff && (u8[i + 1] & 0xe0) === 0xe0) {
                const brIdx = (u8[i + 2] >> 4) & 0x0f;
                const srIdx = (u8[i + 2] >> 2) & 0x03;
                const kbps = rates[brIdx];
                if (!kbps || srIdx === 3) continue;
                const secs = u8.length * 8 / (kbps * 1000);
                return (secs > 0 && secs < 7200) ? secs : null;
            }
        }
        return null;
    }

    // Dedupe keys: same file (relative path + size) vs same song (title + artist).
    function fileKey(path, size) { return norm(path) + '|' + (Number(size) || 0); }
    function songKey(title, artist) { return norm(title) + '|' + norm(artist); }

    // Full-text search across title / artist / album / genre / tags / lyrics.
    function matchesQuery(song, q) {
        const needle = norm(q);
        if (!needle) return true;
        const hay = [song.title, song.artist, song.album, song.genre, (song.tags || []).join(' '), song.lyricsText]
            .map(norm).join(' ');
        return hay.indexOf(needle) !== -1;
    }

    // Facet filter: artist / album / genre / year / tag, plus favorite / recent flags.
    function matchesFilter(song, f) {
        if (!f) return true;
        if (f.favorite && !song.favorite) return false;
        if (f.recent && !song.lastPlayedAt) return false;
        const eq = function (a, b) {
            return b === undefined || b === '' || a === b || norm(a) === norm(b);
        };
        if (!eq(song.artist, f.artist)) return false;
        if (!eq(song.album, f.album)) return false;
        if (!eq(song.genre, f.genre)) return false;
        if (!eq(String(song.year || ''), String(f.year || ''))) return false;
        if (f.tag && !(song.tags || []).some(function (t) { return norm(t) === norm(f.tag); })) return false;
        return true;
    }

    // Sort by key (title|artist|duration|addedAt|playCount), dir = 1 asc / -1 desc.
    function compareSongs(a, b, key, dir) {
        dir = dir || 1;
        let r;
        if (key === 'duration' || key === 'addedAt' || key === 'playCount') {
            r = (Number(a[key]) || 0) - (Number(b[key]) || 0);
        } else {
            r = String(a[key] == null ? '' : a[key]).localeCompare(
                String(b[key] == null ? '' : b[key]), 'zh-Hans-CN', { sensitivity: 'base' });
        }
        return r * dir;
    }

    // Facet value lists (sorted, de-duped) for the filter dropdowns.
    function facets(songs) {
        const out = { artists: {}, albums: {}, genres: {}, years: {}, tags: {} };
        songs.forEach(function (s) {
            if (s.artist) out.artists[s.artist] = true;
            if (s.album) out.albums[s.album] = true;
            if (s.genre) out.genres[s.genre] = true;
            if (s.year) out.years[String(s.year)] = true;
            (s.tags || []).forEach(function (t) { out.tags[t] = true; });
        });
        const sorted = function (obj) {
            return Object.keys(obj).sort(function (a, b) { return a.localeCompare(b, 'zh-Hans-CN'); });
        };
        return {
            artists: sorted(out.artists), albums: sorted(out.albums),
            genres: sorted(out.genres), years: sorted(out.years), tags: sorted(out.tags)
        };
    }

    root.__lyricexMetadata = {
        norm: norm, decodeText: decodeText, parseId3: parseId3,
        estimateMp3Duration: estimateMp3Duration,
        fileKey: fileKey, songKey: songKey,
        matchesQuery: matchesQuery, matchesFilter: matchesFilter,
        compareSongs: compareSongs, facets: facets
    };
})(typeof window !== 'undefined' ? window : globalThis);
